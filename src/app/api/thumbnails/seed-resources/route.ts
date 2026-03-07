import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { FIGMA_RESOURCES, getResourcePageId } from "@/lib/resource-data";
import { fetchOgImage } from "@/lib/notion";

const CONCURRENCY = 5;

/**
 * POST /api/thumbnails/seed-resources
 * 전체 피그마 리소스 썸네일을 Supabase Storage에 일괄 캐싱.
 * - YouTube/Figma Community: 기존 thumbnail 필드에서 다운로드
 * - template(thumbnail 없음): OG 스크래핑 후 업로드
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

    // 1. Generate pageIds for all resources
    const resources = FIGMA_RESOURCES.map((r) => ({
      ...r,
      pageId: getResourcePageId(r),
    }));

    // 2. Batch check which ones already exist in Supabase
    const allIds = resources.map((r) => r.pageId);
    const existingIds = new Set<string>();

    for (let i = 0; i < allIds.length; i += 200) {
      const chunk = allIds.slice(i, i + 200);
      const { data } = await supabase
        .from("page_thumbnails")
        .select("page_id")
        .in("page_id", chunk);
      for (const row of data ?? []) {
        existingIds.add(row.page_id);
      }
    }

    // 3. Filter to only missing ones
    const missing = resources.filter((r) => !existingIds.has(r.pageId));

    let processed = 0;
    const skipped = existingIds.size;
    let errors = 0;
    const errorDetails: string[] = [];

    // 4. Process missing items in chunks
    for (let i = 0; i < missing.length; i += CONCURRENCY) {
      const chunk = missing.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        chunk.map(async (item) => {
          // Resolve thumbnail URL
          let thumbnailUrl = item.thumbnail;

          if (!thumbnailUrl) {
            // OG scrape for items without thumbnail (template)
            thumbnailUrl = (await fetchOgImage(item.url)) ?? undefined;
            if (!thumbnailUrl) {
              throw new Error(`No OG image found: ${item.url}`);
            }
          }

          // Download image
          const response = await fetch(thumbnailUrl, {
            signal: AbortSignal.timeout(10_000),
          });
          if (!response.ok) {
            throw new Error(`Download failed (${response.status}): ${thumbnailUrl}`);
          }

          const contentType =
            response.headers.get("content-type") ?? "image/jpeg";
          const ext = contentType.includes("png") ? "png" : "jpg";
          const buffer = Buffer.from(await response.arrayBuffer());
          const storagePath = `${item.pageId}.${ext}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("thumbnails")
            .upload(storagePath, buffer, { contentType, upsert: true });
          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("thumbnails")
            .getPublicUrl(storagePath);

          // Save to DB
          const { error: dbError } = await supabase
            .from("page_thumbnails")
            .upsert(
              {
                page_id: item.pageId,
                thumbnail_url: urlData.publicUrl,
                source_type: "cover_external",
                storage_path: storagePath,
                last_edited_time: null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "page_id" },
            );
          if (dbError) {
            throw new Error(`DB upsert failed: ${dbError.message}`);
          }
        }),
      );

      for (const r of results) {
        if (r.status === "fulfilled") {
          processed++;
        } else {
          errors++;
          errorDetails.push(String(r.reason));
          console.error("Resource thumbnail seed failed:", r.reason);
        }
      }
    }

    return Response.json({
      total: FIGMA_RESOURCES.length,
      skipped,
      missing: missing.length,
      processed,
      errors,
      ...(errorDetails.length > 0 && { errorDetails: errorDetails.slice(0, 10) }),
    });
  } catch (error) {
    console.error("Resource thumbnail seed failed:", error);
    return Response.json({ error: "Seed failed" }, { status: 500 });
  }
}
