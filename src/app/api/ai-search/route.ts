import { genAI, GEMINI_MODEL } from "@/lib/gemini";
import { getCachedSearchIndex } from "@/lib/search-index-cache";
import { embedQuery, searchSimilar } from "@/lib/embeddings";
import { getGlossaryContext } from "@/lib/figma-glossary";
import type { AISearchResponse } from "@/types";

/* ── Response cache: same query → cached result for 5 min ── */
const CACHE_TTL = 5 * 60 * 1000;
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
  if (responseCache.size > 200) {
    const now = Date.now();
    for (const [key, val] of responseCache) {
      if (now > val.expiresAt) responseCache.delete(key);
    }
  }
  responseCache.set(query, { data, expiresAt: Date.now() + CACHE_TTL });
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

    // Step 1: 쿼리를 벡터 임베딩으로 변환
    const queryEmbedding = await embedQuery(trimmedQuery);

    // Step 2: Supabase에서 벡터 유사도 검색 (상위 20개)
    const matches = await searchSimilar(queryEmbedding, 20);

    // Step 3: 검색된 문서의 전문 텍스트로 Gemini 프롬프트 구성
    const entrySummary = matches
      .map((m) => {
        const base = `${m.id}|${m.section}|${m.title}|${m.categories.join(",")}|유사도:${m.similarity.toFixed(2)}`;
        return m.fullText
          ? `${base}\n  내용: ${m.fullText.slice(0, 2000)}`
          : base;
      })
      .join("\n");

    // 용어집 컨텍스트 로드 (한→영, 영→한 매핑)
    let glossarySection = "";
    try {
      const glossary = getGlossaryContext();
      glossarySection = `
=== Figma 용어집 (영문 = 한글) ===
아래 용어집을 참고하여 검색어의 한국어/영어 변환을 이해하세요.
예: "오토 레이아웃" = "Auto layout", "컴포넌트" = "Components"
${glossary}
`;
    } catch {
      // 용어집 로드 실패 시 무시
    }

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
- 피그마 레시피북: 피그마 실무 튜토리얼 (아이콘, 오토 레이아웃, 컴포넌트 등)
- Figma 용어집: 피그마 영문-한글 용어 매핑
${glossarySection}
아래 항목은 벡터 유사도 검색으로 선별된 후보입니다. 각 항목의 실제 내용을 바탕으로 검색어에 대한 정확한 요약과 관련 항목을 선별해주세요.
각 항목은 "ID|섹션|제목|카테고리|유사도" 형식이며, 대부분 실제 페이지 내용이 포함되어 있습니다.

고려사항:
1. 내용 스니펫을 적극 활용하여 검색어와의 실질적 관련성 판단
2. 제목과 카테고리의 키워드 매칭
3. 개념적 관련성 (예: "디자인 시스템" → "컴포넌트", "베리어블")
4. 한국어↔영어 용어 매핑 적극 활용 (예: "오토 레이아웃" = "Auto layout", "자동 레이아웃")
5. 유사도 점수가 높은 항목 우선, 단 내용 관련성이 더 중요

아래 JSON 형식으로만 응답. 다른 텍스트 없이 JSON만:
{"summary": "검색어에 대한 핵심 요약 (한국어, 2~4문장)", "ids": ["id1", "id2"]}

- summary: 관련 항목들의 실제 내용을 취합하여 검색어에 대해 구체적으로 요약
- ids: 관련성 순으로 최대 20개. 관련 없으면 빈 배열 []

=== 항목 목록 ===
${entrySummary}

=== 검색어 ===
${trimmedQuery}`;

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        // @ts-expect-error -- thinkingConfig is supported by Gemini 2.5 but not yet in SDK types
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    // Gemini 호출 (1회 재시도)
    let responseText: string;
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text().trim();
    } catch (firstErr) {
      console.warn("Gemini first attempt failed, retrying:", firstErr);
      const result = await model.generateContent(prompt);
      responseText = result.response.text().trim();
    }

    let matchedIds: string[];
    let summary: string | undefined;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        summary = typeof parsed.summary === "string" ? parsed.summary : undefined;
        matchedIds = Array.isArray(parsed.ids) ? parsed.ids : [];
      } else if (Array.isArray(parsed)) {
        matchedIds = parsed;
      } else {
        matchedIds = [];
      }
    } catch {
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

    // Map IDs back to full SearchIndexItem (thumbnail, link 등 포함)
    const index = await getCachedSearchIndex();
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

    setCachedResponse(trimmedQuery, responseData);

    return Response.json(responseData);
  } catch (error) {
    console.error("AI search failed:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: "AI 검색에 실패했습니다.", detail: message },
      { status: 500 }
    );
  }
}
