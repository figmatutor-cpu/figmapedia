import { NextRequest } from "next/server";
import { fetchAllFromDatabase } from "@/lib/notion";
import { extractFileUrl } from "@/lib/notion-mapper";
import { SECTION_DB_IDS } from "@/lib/section-databases";
import { resolveAndCacheThumbnail } from "@/lib/thumbnail-cache";

const DEFAULT_BATCH_SIZE = 30;
const CONCURRENCY = 3;

/** 썸네일이 필요한 섹션 DB ID 목록 (단축키 제외) */
const THUMBNAIL_DB_IDS = [
  SECTION_DB_IDS.prompt,
  SECTION_DB_IDS.kiosk,
  SECTION_DB_IDS.uxuiArticles,
  SECTION_DB_IDS.techBlogs,
  SECTION_DB_IDS.uxuiTerms,
  SECTION_DB_IDS.plugins,
];

/**
 * POST /api/thumbnails/seed
 * 초기 전체 썸네일 캐싱 (배치 단위).
 * Notion 커버/블록 이미지를 resolve하여 Supabase에 영구 저장.
 *
 * Authorization: Bearer <REVALIDATION_SECRET>
 * Body: { batchSize?: number, offset?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token !== process.env.REVALIDATION_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const batchSize = body.batchSize ?? DEFAULT_BATCH_SIZE;
    const offset = body.offset ?? 0;

    // 모든 섹션 DB에서 Notion raw 페이지 fetch
    const allDbPages = await Promise.all(
      THUMBNAIL_DB_IDS.map((dbId) => fetchAllFromDatabase(dbId)),
    );
    const allPages = allDbPages.flat();

    // 메인 Q&A DB도 포함
    const mainPages = await fetchAllFromDatabase(
      process.env.NOTION_DATABASE_ID!,
    );
    const combined = [...allPages, ...mainPages];

    // 중복 제거 (page.id 기준)
    const seen = new Set<string>();
    const uniquePages = combined.filter((page) => {
      if (seen.has(page.id)) return false;
      seen.add(page.id);
      return true;
    });

    const batch = uniquePages.slice(offset, offset + batchSize);

    let processed = 0;
    let errors = 0;

    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      const chunk = batch.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        chunk.map(async (page) => {
          const coverUrl = extractFileUrl(page.cover);
          const coverType = page.cover?.type as
            | "file"
            | "external"
            | undefined;
          // 외부 링크 프로퍼티는 DB마다 이름이 다를 수 있음
          const link =
            page.properties?.["링크"]?.url ??
            page.properties?.["link"]?.url ??
            null;

          await resolveAndCacheThumbnail({
            pageId: page.id,
            coverUrl,
            coverType,
            link,
            lastEditedTime: page.last_edited_time ?? null,
          });
        }),
      );

      for (const r of results) {
        if (r.status === "fulfilled") processed++;
        else {
          errors++;
          console.error("Thumbnail seed failed:", r.reason);
        }
      }
    }

    const nextOffset = offset + batchSize;
    const remaining = Math.max(0, uniquePages.length - nextOffset);

    return Response.json({
      processed,
      errors,
      remaining,
      nextOffset: remaining > 0 ? nextOffset : null,
      total: uniquePages.length,
    });
  } catch (error) {
    console.error("Thumbnail seed failed:", error);
    return Response.json({ error: "Seed failed" }, { status: 500 });
  }
}
