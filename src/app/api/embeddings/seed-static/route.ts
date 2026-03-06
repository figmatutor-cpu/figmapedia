import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { embedDocument, upsertEmbedding } from "@/lib/embeddings";
import { getGlossaryContext } from "@/lib/figma-glossary";
import { FIGMA_RESOURCES } from "@/lib/resource-data";

const STATIC_PREFIX = "static-";

/**
 * POST /api/embeddings/seed-static
 * 정적 파일(레시피북 MD, 용어집 CSV)을 벡터 임베딩으로 Supabase에 저장.
 * Notion sync에서 삭제되지 않도록 "static-" prefix ID 사용.
 *
 * Authorization: Bearer <REVALIDATION_SECRET>
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token !== process.env.REVALIDATION_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let processed = 0;
    let errors = 0;

    // 1. 레시피북 MD — 이미지 제거 후 #### 섹션 단위로 청크 분할
    try {
      const mdPath = join(process.cwd(), "[1_3]피그마 레시피북 .md");
      const raw = readFileSync(mdPath, "utf-8");

      // base64 이미지 참조 제거
      const text = raw
        .replace(/\[image\d+\]:\s*<data:image[^>]*>/g, "")
        .replace(/!\[\]\[image\d+\]/g, "")
        .trim();

      // #### 헤더 기준으로 분할
      const chunks: { title: string; content: string }[] = [];
      const sectionRegex = /####\s+\*\*([^*]+)\*\*/g;
      let match;
      const positions: { title: string; start: number }[] = [];

      while ((match = sectionRegex.exec(text)) !== null) {
        positions.push({ title: match[1].trim(), start: match.index });
      }

      if (positions.length === 0) {
        // 섹션이 없으면 전체를 하나의 청크로
        chunks.push({ title: "피그마 레시피북", content: text });
      } else {
        // ## 메인 제목 + 첫 섹션 앞부분
        const introTitle =
          text.match(/##\s+\*\*([^*]+)\*\*/)?.[1]?.trim() ??
          "피그마 레시피북 소개";
        const introContent = text.slice(0, positions[0].start).trim();
        if (introContent.length > 50) {
          chunks.push({ title: introTitle, content: introContent });
        }

        // 각 #### 섹션
        for (let i = 0; i < positions.length; i++) {
          const end =
            i < positions.length - 1 ? positions[i + 1].start : text.length;
          const content = text.slice(positions[i].start, end).trim();
          if (content.length > 50) {
            chunks.push({ title: positions[i].title, content });
          }
        }
      }

      // 각 청크를 임베딩
      for (let i = 0; i < chunks.length; i++) {
        try {
          const chunk = chunks[i];
          const embeddingText = `피그마 레시피북 | ${chunk.title} | ${chunk.content.slice(0, 6000)}`;
          const embedding = await embedDocument(embeddingText);

          await upsertEmbedding({
            id: `${STATIC_PREFIX}recipe-${i}`,
            section: "피그마 레시피북",
            title: chunk.title,
            categories: ["피그마", "튜토리얼", "레시피북"],
            fullText: chunk.content.slice(0, 6000),
            embedding,
            lastEditedTime: new Date().toISOString(),
          });
          processed++;
        } catch (err) {
          errors++;
          console.error(`Recipe chunk ${i} failed:`, err);
        }
      }
    } catch (err) {
      errors++;
      console.error("Recipe book processing failed:", err);
    }

    // 2. 용어집 CSV — 전체를 하나의 임베딩으로 저장 (검색 컨텍스트용)
    try {
      const glossaryText = getGlossaryContext();
      const embeddingText = `Figma 용어집 (영문-한글 매핑) | ${glossaryText.slice(0, 6000)}`;
      const embedding = await embedDocument(embeddingText);

      await upsertEmbedding({
        id: `${STATIC_PREFIX}glossary`,
        section: "Figma 용어집",
        title: "Figma 영문-한글 용어 매핑",
        categories: ["용어집", "피그마", "번역"],
        fullText: glossaryText.slice(0, 6000),
        embedding,
        lastEditedTime: new Date().toISOString(),
      });
      processed++;
    } catch (err) {
      errors++;
      console.error("Glossary embedding failed:", err);
    }

    // 3. 피그마 리소스 — 각 리소스를 개별 임베딩으로 저장
    // search-index-cache.ts의 ID 형식(resource-{i})과 일치시켜 AI 검색 결과 매핑
    const CATEGORY_LABELS: Record<string, string> = {
      template: "템플릿",
      class: "수업자료",
      live: "주간 라이브",
      atoz: "Figma A to Z",
    };

    for (let i = 0; i < FIGMA_RESOURCES.length; i++) {
      try {
        const r = FIGMA_RESOURCES[i];
        const categoryLabel = CATEGORY_LABELS[r.category] ?? r.category;
        const embeddingText = `피그마 리소스 | ${categoryLabel} | ${r.title} | 피그마 디자인 도구 학습 자료, Figma Community 리소스`;
        const embedding = await embedDocument(embeddingText);

        await upsertEmbedding({
          id: `resource-${i}`,
          section: "피그마 리소스",
          title: r.title,
          categories: [categoryLabel],
          fullText: `${categoryLabel}: ${r.title}`,
          embedding,
          lastEditedTime: new Date().toISOString(),
        });
        processed++;
      } catch (err) {
        errors++;
        console.error(`Resource ${i} embedding failed:`, err);
      }
    }

    return Response.json({ processed, errors });
  } catch (error) {
    console.error("Seed-static failed:", error);
    return Response.json({ error: "Seed-static failed" }, { status: 500 });
  }
}
