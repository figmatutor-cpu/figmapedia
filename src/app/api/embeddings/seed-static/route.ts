import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { embedDocument, upsertEmbedding } from "@/lib/embeddings";
import { getGlossaryContext } from "@/lib/figma-glossary";
import { FIGMA_RESOURCES } from "@/lib/resource-data";

const STATIC_PREFIX = "static-";
const CONCURRENCY = 5;
const RESOURCE_BATCH = 50;

const CATEGORY_LABELS: Record<string, string> = {
  template: "템플릿",
  class: "수업자료",
  live: "주간 라이브",
  atoz: "Figma A to Z",
};

/**
 * POST /api/embeddings/seed-static
 * 정적 파일(레시피북 MD, 용어집 CSV, 피그마 리소스)을 벡터 임베딩으로 Supabase에 저장.
 *
 * Body: { offset?: number } — 리소스 시작 인덱스 (페이지네이션)
 *   offset=0 (기본): 레시피북 + 용어집 + 리소스 0~49
 *   offset=50: 리소스 50~99
 *   offset=100: 리소스 100~149
 *   offset=150: 리소스 150~182
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

    const { offset = 0 } = await request.json().catch(() => ({}));

    let processed = 0;
    let errors = 0;

    // offset=0일 때만 레시피북/용어집 처리
    if (offset === 0) {
      // 1. 레시피북 MD — 이미지 제거 후 #### 섹션 단위로 청크 분할
      try {
        const mdPath = join(process.cwd(), "[1_3]피그마 레시피북 .md");
        const raw = readFileSync(mdPath, "utf-8");

        const text = raw
          .replace(/\[image\d+\]:\s*<data:image[^>]*>/g, "")
          .replace(/!\[\]\[image\d+\]/g, "")
          .trim();

        const chunks: { title: string; content: string }[] = [];
        const sectionRegex = /####\s+\*\*([^*]+)\*\*/g;
        let match;
        const positions: { title: string; start: number }[] = [];

        while ((match = sectionRegex.exec(text)) !== null) {
          positions.push({ title: match[1].trim(), start: match.index });
        }

        if (positions.length === 0) {
          chunks.push({ title: "피그마 레시피북", content: text });
        } else {
          const introTitle =
            text.match(/##\s+\*\*([^*]+)\*\*/)?.[1]?.trim() ??
            "피그마 레시피북 소개";
          const introContent = text.slice(0, positions[0].start).trim();
          if (introContent.length > 50) {
            chunks.push({ title: introTitle, content: introContent });
          }

          for (let i = 0; i < positions.length; i++) {
            const end =
              i < positions.length - 1 ? positions[i + 1].start : text.length;
            const content = text.slice(positions[i].start, end).trim();
            if (content.length > 50) {
              chunks.push({ title: positions[i].title, content });
            }
          }
        }

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

      // 2. 용어집 CSV
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
    }

    // 3. 피그마 리소스 — offset부터 RESOURCE_BATCH개씩, concurrency 5로 병렬 처리
    const batchEnd = Math.min(offset + RESOURCE_BATCH, FIGMA_RESOURCES.length);

    for (let i = offset; i < batchEnd; i += CONCURRENCY) {
      const chunk = FIGMA_RESOURCES.slice(
        i,
        Math.min(i + CONCURRENCY, batchEnd),
      );

      const results = await Promise.allSettled(
        chunk.map(async (r, j) => {
          const idx = i + j;
          const categoryLabel = CATEGORY_LABELS[r.category] ?? r.category;
          const embeddingText = `피그마 리소스 | ${categoryLabel} | ${r.title} | 피그마 디자인 도구 학습 자료, Figma Community 리소스`;
          const embedding = await embedDocument(embeddingText);

          await upsertEmbedding({
            id: `resource-${idx}`,
            section: "피그마 리소스",
            title: r.title,
            categories: [categoryLabel],
            fullText: `${categoryLabel}: ${r.title}`,
            embedding,
            lastEditedTime: new Date().toISOString(),
          });
        }),
      );

      for (const r of results) {
        if (r.status === "fulfilled") processed++;
        else {
          errors++;
          console.error("Resource embedding failed:", r.reason);
        }
      }
    }

    const remaining = FIGMA_RESOURCES.length - batchEnd;

    return Response.json({
      processed,
      errors,
      offset,
      nextOffset: remaining > 0 ? batchEnd : null,
      remaining,
      total: FIGMA_RESOURCES.length,
    });
  } catch (error) {
    console.error("Seed-static failed:", error);
    return Response.json({ error: "Seed-static failed" }, { status: 500 });
  }
}
