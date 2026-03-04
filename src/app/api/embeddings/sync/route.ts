import { NextRequest } from "next/server";
import { getCachedSearchIndex } from "@/lib/search-index-cache";
import { fetchPageFullText } from "@/lib/notion-text";
import {
  embedDocument,
  buildEmbeddingText,
  upsertEmbedding,
  deleteEmbedding,
  getAllEmbeddingIds,
} from "@/lib/embeddings";

const CONCURRENCY = 5;

/**
 * POST /api/embeddings/sync
 * 증분 동기화: 검색 인덱스 vs Supabase를 비교하여 신규/변경/삭제 항목만 처리.
 * revalidate webhook에서 fire-and-forget으로 호출됨.
 *
 * Authorization: Bearer <REVALIDATION_SECRET>
 */
export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token !== process.env.REVALIDATION_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. 최신 검색 인덱스 가져오기
    const index = await getCachedSearchIndex();
    const notionItems = index.items;
    const notionMap = new Map(notionItems.map((item) => [item.id, item]));

    // 2. Supabase 기존 임베딩 ID + lastEditedTime 가져오기
    const existingEmbeddings = await getAllEmbeddingIds();
    const existingMap = new Map(
      existingEmbeddings.map((e) => [e.id, e.lastEditedTime])
    );

    // 3. Diff 계산
    const toUpsert: typeof notionItems = [];
    const toDelete: string[] = [];

    for (const item of notionItems) {
      const existingTime = existingMap.get(item.id);
      if (!existingTime) {
        // 새 항목
        toUpsert.push(item);
      } else if (
        item.lastEditedTime &&
        new Date(item.lastEditedTime).getTime() !==
          new Date(existingTime).getTime()
      ) {
        // 변경된 항목
        toUpsert.push(item);
      }
    }

    for (const existing of existingEmbeddings) {
      if (!notionMap.has(existing.id)) {
        toDelete.push(existing.id);
      }
    }

    // 변경 없으면 빠르게 반환
    if (toUpsert.length === 0 && toDelete.length === 0) {
      return Response.json({
        synced: 0,
        deleted: 0,
        errors: 0,
        duration: Date.now() - start,
        message: "No changes detected",
      });
    }

    // 4. 신규/변경 항목 임베딩
    let synced = 0;
    let errors = 0;

    for (let i = 0; i < toUpsert.length; i += CONCURRENCY) {
      const chunk = toUpsert.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        chunk.map(async (item) => {
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
        if (r.status === "fulfilled") synced++;
        else {
          errors++;
          console.error("Sync upsert failed:", r.reason);
        }
      }
    }

    // 5. 삭제된 항목 제거
    let deleted = 0;
    for (const id of toDelete) {
      try {
        await deleteEmbedding(id);
        deleted++;
      } catch (err) {
        errors++;
        console.error("Sync delete failed:", err);
      }
    }

    return Response.json({
      synced,
      deleted,
      errors,
      duration: Date.now() - start,
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return Response.json(
      { error: "Sync failed", duration: Date.now() - start },
      { status: 500 }
    );
  }
}
