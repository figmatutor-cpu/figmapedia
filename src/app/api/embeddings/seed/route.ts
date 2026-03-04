import { NextRequest } from "next/server";
import { getCachedSearchIndex } from "@/lib/search-index-cache";
import { fetchPageFullText } from "@/lib/notion-text";
import {
  embedDocument,
  buildEmbeddingText,
  upsertEmbedding,
} from "@/lib/embeddings";

const DEFAULT_BATCH_SIZE = 50;

/**
 * POST /api/embeddings/seed
 * 초기 전체 임베딩 생성 (배치 단위).
 * Vercel 60초 타임아웃 대응을 위해 offset/batchSize로 분할 처리.
 *
 * Authorization: Bearer <REVALIDATION_SECRET>
 * Body: { batchSize?: number, offset?: number }
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token !== process.env.REVALIDATION_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const batchSize = body.batchSize ?? DEFAULT_BATCH_SIZE;
    const offset = body.offset ?? 0;

    const index = await getCachedSearchIndex();
    const allItems = index.items;
    const batch = allItems.slice(offset, offset + batchSize);

    let processed = 0;
    let errors = 0;

    // 동시성 제한: 5개씩 처리
    const CONCURRENCY = 5;
    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      const chunk = batch.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        chunk.map(async (item) => {
          // 외부 링크 항목은 블록 내용이 없으므로 제목+메타데이터만 사용
          let fullText = "";
          if (!item.link) {
            fullText = await Promise.race([
              fetchPageFullText(item.id),
              new Promise<string>((resolve) =>
                setTimeout(() => resolve(""), 3000)
              ),
            ]);
          }

          const text = buildEmbeddingText(item, fullText);
          const embedding = await embedDocument(text);

          await upsertEmbedding({
            id: item.id,
            section: item.section ?? "",
            title: item.title,
            categories: item.categories,
            fullText,
            embedding,
            lastEditedTime: item.lastEditedTime ?? new Date().toISOString(),
          });
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") processed++;
        else {
          errors++;
          console.error("Seed item failed:", r.reason);
        }
      }
    }

    const nextOffset = offset + batchSize;
    const remaining = Math.max(0, allItems.length - nextOffset);

    return Response.json({
      processed,
      errors,
      remaining,
      nextOffset: remaining > 0 ? nextOffset : null,
      total: allItems.length,
    });
  } catch (error) {
    console.error("Seed failed:", error);
    return Response.json(
      { error: "Seed failed" },
      { status: 500 }
    );
  }
}
