import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { FIGMA_RESOURCES } from "@/lib/resource-data";

const CONCURRENCY = 5;

/**
 * POST /api/thumbnails/seed-community
 * Figma Community 썸네일을 Supabase Storage에 캐싱.
 * category=class && thumbnail 필드가 있는 리소스만 처리.
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

    const items = FIGMA_RESOURCES.filter(
      (r) => r.category === "class" && r.thumbnail,
    );

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < items.length; i += CONCURRENCY) {
      const chunk = items.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        chunk.map(async (item) => {
          const fileId = item.url.match(/community\/file\/(\d+)/)?.[1];
          if (!fileId) throw new Error(`Invalid URL: ${item.url}`);

          const pageId = `fc-${fileId}`;
          const storagePath = `${pageId}.png`;

          // Check if already cached
          const { data: existing } = await supabase
            .from("page_thumbnails")
            .select("page_id")
            .eq("page_id", pageId)
            .single();

          if (existing) {
            skipped++;
            return;
          }

          // Download from Figma S3
          const response = await fetch(item.thumbnail!, {
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok)
            throw new Error(`Download failed: ${response.status}`);

          const contentType =
            response.headers.get("content-type") ?? "image/png";
          const buffer = Buffer.from(await response.arrayBuffer());

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("thumbnails")
            .upload(storagePath, buffer, {
              contentType,
              upsert: true,
            });
          if (uploadError)
            throw new Error(`Upload failed: ${uploadError.message}`);

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("thumbnails")
            .getPublicUrl(storagePath);

          // Save to DB
          const { error: dbError } = await supabase
            .from("page_thumbnails")
            .upsert(
              {
                page_id: pageId,
                thumbnail_url: urlData.publicUrl,
                source_type: "cover_external",
                storage_path: storagePath,
                last_edited_time: null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "page_id" },
            );
          if (dbError)
            throw new Error(`DB upsert failed: ${dbError.message}`);
        }),
      );

      for (const r of results) {
        if (r.status === "fulfilled") processed++;
        else {
          errors++;
          console.error("Community thumbnail seed failed:", r.reason);
        }
      }
    }

    return Response.json({
      processed,
      skipped,
      errors,
      total: items.length,
    });
  } catch (error) {
    console.error("Community thumbnail seed failed:", error);
    return Response.json({ error: "Seed failed" }, { status: 500 });
  }
}
