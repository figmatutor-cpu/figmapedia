/**
 * Figma Community 썸네일을 Supabase Storage에 업로드하는 스크립트.
 *
 * resource-data.ts의 기존 thumbnail URL (s3-figma-hubfile-images CDN)에서
 * 브라우저 UA로 직접 다운로드 → Supabase Storage에 업로드.
 *
 * Usage: set -a && source .env.local && set +a && npx tsx scripts/seed-community-thumbnails.ts
 */

import { createClient } from "@supabase/supabase-js";
import { FIGMA_RESOURCES } from "../src/lib/resource-data";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const CONCURRENCY = 5;
const DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function processItem(item: (typeof FIGMA_RESOURCES)[number]) {
  const fileId = item.url.match(/community\/file\/(\d+)/)?.[1];
  if (!fileId) return null;

  const pageId = `fc-${fileId}`;
  const storagePath = `${pageId}.png`;

  // Check if already cached
  const { data: existing } = await supabase
    .from("page_thumbnails")
    .select("page_id, thumbnail_url")
    .eq("page_id", pageId)
    .single();

  if (existing) {
    console.log(`  [SKIP] Already cached: ${pageId}`);
    return existing.thumbnail_url;
  }

  if (!item.thumbnail) {
    console.warn(`  [SKIP] No thumbnail URL: ${item.title}`);
    return null;
  }

  // Download from CDN with browser UA
  console.log(`  [DOWNLOAD] ${pageId}`);
  const res = await fetch(item.thumbnail, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    console.error(`  [ERROR] Download failed ${res.status}: ${pageId}`);
    return null;
  }

  const contentType = res.headers.get("content-type") ?? "image/png";
  const buffer = Buffer.from(await res.arrayBuffer());

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("thumbnails")
    .upload(storagePath, buffer, { contentType, upsert: true });
  if (uploadError) {
    console.error(`  [ERROR] Upload failed: ${uploadError.message}`);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("thumbnails")
    .getPublicUrl(storagePath);

  // Save to DB
  const { error: dbError } = await supabase.from("page_thumbnails").upsert(
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
  if (dbError) {
    console.error(`  [ERROR] DB upsert failed: ${dbError.message}`);
    return null;
  }

  console.log(`  [OK] ${pageId}`);
  return urlData.publicUrl;
}

async function main() {
  console.log("=== Figma Community Thumbnail Seed ===\n");

  const communityItems = FIGMA_RESOURCES.filter(
    (r) =>
      r.category === "class" &&
      r.url.includes("figma.com/community/file/") &&
      r.thumbnail,
  );

  console.log(`Found ${communityItems.length} community files to process.\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < communityItems.length; i += CONCURRENCY) {
    const chunk = communityItems.slice(i, i + CONCURRENCY);

    const results = await Promise.allSettled(chunk.map(processItem));

    for (const r of results) {
      if (r.status === "fulfilled") {
        if (r.value) processed++;
        else skipped++;
      } else {
        errors++;
        console.error("  [FAIL]", r.reason);
      }
    }

    if (i + CONCURRENCY < communityItems.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`Processed: ${processed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${communityItems.length}`);

  // Output all Supabase URLs for verification
  const { data: allRows } = await supabase
    .from("page_thumbnails")
    .select("page_id, thumbnail_url")
    .like("page_id", "fc-%");

  console.log(`\nSupabase DB has ${allRows?.length ?? 0} fc-* rows total.`);
}

main().catch(console.error);
