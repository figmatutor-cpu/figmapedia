import { NextRequest } from "next/server";
import { getCachedSearchIndex } from "@/lib/search-index-cache";
import {
  resolveAndCacheThumbnail,
  getAllThumbnailIds,
  deleteThumbnail,
} from "@/lib/thumbnail-cache";
import { extractFileUrl } from "@/lib/notion-mapper";
import { fetchEntryById } from "@/lib/notion";

const CONCURRENCY = 3;

/**
 * POST /api/thumbnails/sync
 * 증분 동기화: 검색 인덱스 vs page_thumbnails 비교하여 신규/변경/삭제만 처리.
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

    // 1. 최신 검색 인덱스
    const index = await getCachedSearchIndex();
    const notionItems = index.items;
    const notionMap = new Map(notionItems.map((item) => [item.id, item]));

    // 2. Supabase 기존 썸네일
    const existingThumbnails = await getAllThumbnailIds();
    const existingMap = new Map(
      existingThumbnails.map((e) => [e.pageId, e.lastEditedTime]),
    );

    // 3. Diff 계산
    const toUpsert: typeof notionItems = [];
    const toDelete: string[] = [];

    for (const item of notionItems) {
      const existingTime = existingMap.get(item.id);
      if (!existingTime) {
        toUpsert.push(item);
      } else if (
        item.lastEditedTime &&
        new Date(item.lastEditedTime).getTime() !==
          new Date(existingTime).getTime()
      ) {
        toUpsert.push(item);
      }
    }

    for (const existing of existingThumbnails) {
      if (!notionMap.has(existing.pageId)) {
        toDelete.push(existing.pageId);
      }
    }

    if (toUpsert.length === 0 && toDelete.length === 0) {
      return Response.json({
        synced: 0,
        deleted: 0,
        errors: 0,
        duration: Date.now() - start,
        message: "No changes detected",
      });
    }

    // 4. 신규/변경 항목 처리
    let synced = 0;
    let errors = 0;

    for (let i = 0; i < toUpsert.length; i += CONCURRENCY) {
      const chunk = toUpsert.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        chunk.map(async (item) => {
          // Notion에서 페이지 조회하여 cover type 확인
          let coverUrl: string | undefined;
          let coverType: "file" | "external" | undefined;

          try {
            const page = await fetchEntryById(item.id);
            if (page) {
              coverUrl = extractFileUrl((page as any).cover);
              coverType = (page as any).cover?.type as
                | "file"
                | "external"
                | undefined;
            }
          } catch {
            // Notion API 실패 시 cover 정보 없이 진행
          }

          await resolveAndCacheThumbnail({
            pageId: item.id,
            coverUrl,
            coverType,
            link: item.link,
            lastEditedTime: item.lastEditedTime ?? null,
          });
        }),
      );

      for (const r of results) {
        if (r.status === "fulfilled") synced++;
        else {
          errors++;
          console.error("Thumbnail sync failed:", r.reason);
        }
      }
    }

    // 5. 삭제된 항목 제거
    let deleted = 0;
    for (const pageId of toDelete) {
      try {
        await deleteThumbnail(pageId);
        deleted++;
      } catch (err) {
        errors++;
        console.error("Thumbnail delete failed:", err);
      }
    }

    return Response.json({
      synced,
      deleted,
      errors,
      duration: Date.now() - start,
    });
  } catch (error) {
    console.error("Thumbnail sync failed:", error);
    return Response.json(
      { error: "Sync failed", duration: Date.now() - start },
      { status: 500 },
    );
  }
}
