import Fuse, { type IFuseOptions } from "fuse.js";
import { genAI, GEMINI_MODEL } from "@/lib/gemini";
import { getCachedSearchIndex } from "@/lib/search-index-cache";
import type { SearchIndexItem, AISearchResponse } from "@/types";

/* ── Response cache: same query → cached result for 5 min ── */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const responseCache = new Map<
  string,
  { data: AISearchResponse; expiresAt: number }
>();

function getCachedResponse(query: string): AISearchResponse | null {
  const entry = responseCache.get(query);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(query);
    return null;
  }
  return entry.data;
}

function setCachedResponse(query: string, data: AISearchResponse) {
  // Evict old entries if cache grows too large
  if (responseCache.size > 200) {
    const now = Date.now();
    for (const [key, val] of responseCache) {
      if (now > val.expiresAt) responseCache.delete(key);
    }
  }
  responseCache.set(query, { data, expiresAt: Date.now() + CACHE_TTL });
}

/* ── Fuse.js pre-filter: narrow down candidates before sending to Gemini ── */
const PRE_FILTER_LIMIT = 80;

const FUSE_OPTIONS: IFuseOptions<SearchIndexItem> = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "categories", weight: 0.25 },
    { name: "section", weight: 0.15 },
    { name: "author", weight: 0.1 },
  ],
  threshold: 0.5, // Lenient to capture cross-section results
  distance: 300,
  minMatchCharLength: 1,
  includeScore: true,
};

function preFilterItems(
  items: SearchIndexItem[],
  query: string
): SearchIndexItem[] {
  const fuse = new Fuse(items, FUSE_OPTIONS);
  const results = fuse.search(query, { limit: PRE_FILTER_LIMIT });
  return results.map((r) => r.item);
}

/* ── API Route ── */
export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json(
        { error: "검색어를 입력해주세요." },
        { status: 400 }
      );
    }

    if (query.length > 200) {
      return Response.json(
        { error: "검색어가 너무 깁니다." },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();

    // Check response cache first
    const cached = getCachedResponse(trimmedQuery);
    if (cached) {
      return Response.json(cached);
    }

    const index = await getCachedSearchIndex();

    // Step 1: Pre-filter with Fuse.js to narrow candidates
    const candidates = preFilterItems(index.items, trimmedQuery);

    // If Fuse found very few results, proportional sampling from each section
    let itemsForAI: SearchIndexItem[];
    if (candidates.length >= 5) {
      itemsForAI = candidates;
    } else {
      const sections = new Map<string, SearchIndexItem[]>();
      for (const item of index.items) {
        const sec = item.section ?? "기타";
        if (!sections.has(sec)) sections.set(sec, []);
        sections.get(sec)!.push(item);
      }
      const perSection = Math.max(5, Math.floor(PRE_FILTER_LIMIT / sections.size));
      itemsForAI = [...sections.values()].flatMap((items) =>
        items.slice(0, perSection)
      );
    }

    // Step 2: Build compact summary for Gemini (section|title|categories)
    const entrySummary = itemsForAI
      .map((item) => `${item.id}|${item.section ?? ""}|${item.title}|${item.categories.join(",")}`)
      .join("\n");

    const prompt = `당신은 Figmapedia의 검색 어시스턴트입니다. 디자인, IT, UX/UI 관련 한국어 지식 베이스에서 관련 항목을 찾아주세요.

이 지식 베이스는 다음 섹션으로 구성됩니다:
- 피그마 Q&A: 피그마 디자인 도구 실무 질문/답변
- 프롬프트: AI 이미지/텍스트 생성 프롬프트
- 키오스크: 키오스크 UI/UX 스크린샷 및 분석
- UXUI 아티클: UX/UI 디자인 학습 아티클
- 기술 블로그: 기술 및 디자인 블로그 글
- UXUI 용어: UX/UI 용어 정리
- Mac/Win 단축키: 피그마 키보드 단축키
- 플러그인: 유용한 피그마 플러그인

아래 항목 목록에서 검색어와 의미적으로 관련된 항목의 ID를 찾고, 검색어에 대한 핵심 요약도 작성해주세요.
각 항목은 "ID|섹션|제목|카테고리" 형식입니다.

고려사항:
1. 제목 키워드 매칭
2. 섹션 및 카테고리 관련성
3. 개념적 관련성 (예: "디자인 시스템" → "컴포넌트", "베리어블")
4. 한국어 유의어/줄임말 (예: "컴포" = "컴포넌트")

아래 JSON 형식으로만 응답. 다른 텍스트 없이 JSON만:
{"summary": "검색어에 대한 핵심 요약 (한국어, 1~3문장, 간결하게)", "ids": ["id1", "id2"]}

- summary: 검색어가 무엇인지, 어떤 맥락에서 사용되는지 핵심만 요약
- ids: 관련성 순으로 최대 20개. 관련 없으면 빈 배열 []

=== 항목 목록 ===
${entrySummary}

=== 검색어 ===
${trimmedQuery}`;

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        // Disable thinking/reasoning to speed up response (this is a simple matching task)
        // @ts-expect-error -- thinkingConfig is supported by Gemini 2.5 but not yet in SDK types
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let matchedIds: string[];
    let summary: string | undefined;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        // New format: { summary, ids }
        summary = typeof parsed.summary === "string" ? parsed.summary : undefined;
        matchedIds = Array.isArray(parsed.ids) ? parsed.ids : [];
      } else if (Array.isArray(parsed)) {
        // Legacy fallback: ["id1", "id2"]
        matchedIds = parsed;
      } else {
        matchedIds = [];
      }
    } catch {
      // Try to extract JSON object or array from response
      const objMatch = responseText.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try {
          const parsed = JSON.parse(objMatch[0]);
          summary = typeof parsed.summary === "string" ? parsed.summary : undefined;
          matchedIds = Array.isArray(parsed.ids) ? parsed.ids : [];
        } catch {
          const arrMatch = responseText.match(/\[[\s\S]*?\]/);
          matchedIds = arrMatch ? JSON.parse(arrMatch[0]) : [];
        }
      } else {
        const arrMatch = responseText.match(/\[[\s\S]*?\]/);
        matchedIds = arrMatch ? JSON.parse(arrMatch[0]) : [];
      }
    }

    if (!Array.isArray(matchedIds)) {
      matchedIds = [];
    }

    // Map IDs back to full items (look up from full index, not just candidates)
    const indexMap = new Map(index.items.map((item) => [item.id, item]));
    const results = matchedIds
      .filter((id) => indexMap.has(id))
      .map((id) => indexMap.get(id)!);

    const responseData: AISearchResponse = {
      results,
      query: trimmedQuery,
      isAIResult: true,
      summary,
    };

    // Cache the response
    setCachedResponse(trimmedQuery, responseData);

    return Response.json(responseData);
  } catch (error) {
    console.error("AI search failed:", error);
    return Response.json(
      { error: "AI 검색에 실패했습니다." },
      { status: 500 }
    );
  }
}
