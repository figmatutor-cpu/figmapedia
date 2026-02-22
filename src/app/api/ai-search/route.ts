import { genAI, GEMINI_MODEL } from "@/lib/gemini";
import { getCachedSearchIndex } from "@/lib/search-index-cache";

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

    const index = await getCachedSearchIndex();

    const entrySummary = JSON.stringify(
      index.items.map((item) => ({
        id: item.id,
        title: item.title,
        categories: item.categories,
        author: item.author,
      }))
    );

    const prompt = `당신은 Figmapedia의 검색 어시스턴트입니다. Figmapedia는 피그마(Figma) 디자인 도구에 관한 한국어 지식 베이스입니다.

사용자의 자연어 검색 쿼리를 분석하고, 아래 항목 목록에서 의미적으로 관련된 항목을 찾아주세요.

검색 시 고려사항:
1. 제목의 직접적인 키워드 매칭
2. 카테고리 관련성 (예: "정렬하는 법" → "오토 레이아웃" 카테고리)
3. 개념적 관련성 (예: "디자인 시스템" → "컴포넌트", "베리어블" 관련)
4. 한국어 유의어와 줄임말 (예: "오토레이아웃" = "오토 레이아웃", "컴포" = "컴포넌트")

결과를 관련성 순으로 정렬하여 JSON 배열로 반환하세요.
최대 20개까지만 반환하세요.
관련 항목이 없으면 빈 배열 []을 반환하세요.

반드시 아래 형식으로만 응답하세요 (다른 텍스트 없이 JSON 배열만):
["id1", "id2", "id3"]

=== 항목 목록 ===
${entrySummary}

=== 사용자 검색어 ===
${query.trim()}`;

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
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

    const results = matchedIds
      .filter((id) => index.items.some((item) => item.id === id))
      .map((id) => index.items.find((item) => item.id === id)!);

    return Response.json({
      results,
      query: query.trim(),
      isAIResult: true,
    });
  } catch (error) {
    console.error("AI search failed:", error);
    return Response.json(
      { error: "AI 검색에 실패했습니다." },
      { status: 500 }
    );
  }
}
