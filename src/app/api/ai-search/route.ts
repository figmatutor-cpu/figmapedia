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
const PRE_FILTER_LIMIT = 50;

const FUSE_OPTIONS: IFuseOptions<SearchIndexItem> = {
  keys: [
    { name: "title", weight: 0.55 },
    { name: "categories", weight: 0.35 },
    { name: "author", weight: 0.1 },
  ],
  threshold: 0.45, // More lenient than client-side to avoid missing relevant items
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

    // If Fuse found very few results, include all items as fallback
    const itemsForAI =
      candidates.length >= 5 ? candidates : index.items.slice(0, PRE_FILTER_LIMIT);

    // Step 2: Build compact summary for Gemini (no author, compact categories)
    const entrySummary = itemsForAI
      .map((item) => `${item.id}|${item.title}|${item.categories.join(",")}`)
      .join("\n");

    const prompt = `당신은 Figmapedia의 검색 어시스턴트입니다. 피그마(Figma) 디자인 도구에 관한 한국어 지식 베이스에서 관련 항목을 찾아주세요.

아래 항목 목록에서 검색어와 의미적으로 관련된 항목의 ID를 찾아주세요.
각 항목은 "ID|제목|카테고리" 형식입니다.

고려사항:
1. 제목 키워드 매칭
2. 카테고리 관련성 (예: "정렬" → "오토 레이아웃")
3. 개념적 관련성 (예: "디자인 시스템" → "컴포넌트", "베리어블")
4. 한국어 유의어/줄임말 (예: "컴포" = "컴포넌트")

관련성 순 JSON 배열로 최대 20개 반환. 관련 없으면 [].
다른 텍스트 없이 JSON 배열만 응답:
["id1", "id2"]

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
    try {
      matchedIds = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\[[\s\S]*?\]/);
      matchedIds = match ? JSON.parse(match[0]) : [];
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
