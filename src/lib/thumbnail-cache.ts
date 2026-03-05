import { supabase } from "@/lib/supabase";
import { fetchOgImage, fetchFirstImageUrl } from "@/lib/notion";

/* ── Types ── */

type SourceType =
  | "cover_external"
  | "cover_file"
  | "og_image"
  | "block_file"
  | "block_external";

/* ── Helpers ── */

/** Notion S3 URL인지 판별 (만료되는 URL → Storage 업로드 필요) */
export function isNotionS3Url(url: string): boolean {
  return (
    url.includes("prod-files-secure.s3") ||
    url.includes("s3.us-west-2.amazonaws.com") ||
    url.includes("s3.amazonaws.com")
  );
}

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/* ── 1. Batch Lookup ── */

/**
 * 여러 page_id의 썸네일을 한번에 조회.
 * Supabase .in() 은 최대 ~300개까지 안전하므로 청크 분할.
 */
export async function getPageThumbnails(
  pageIds: string[],
): Promise<Map<string, string>> {
  if (pageIds.length === 0) return new Map();

  const map = new Map<string, string>();
  const CHUNK = 200;

  for (let i = 0; i < pageIds.length; i += CHUNK) {
    const chunk = pageIds.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("page_thumbnails")
      .select("page_id, thumbnail_url")
      .in("page_id", chunk);

    if (error) throw new Error(`Thumbnail lookup failed: ${error.message}`);
    for (const row of data ?? []) {
      map.set(row.page_id, row.thumbnail_url);
    }
  }

  return map;
}

/* ── 2. Upload to Storage + Upsert DB ── */

async function uploadAndSaveThumbnail(params: {
  pageId: string;
  imageUrl: string;
  sourceType: SourceType;
  lastEditedTime: string | null;
}): Promise<string> {
  // 1) 이미지 다운로드 (5초 타임아웃)
  const response = await fetch(params.imageUrl, {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());

  // 2) Storage 경로 결정
  const ext = EXT_MAP[contentType.split(";")[0].trim()] ?? "jpg";
  const storagePath = `${params.pageId}.${ext}`;

  // 3) Storage 업로드 (upsert: 기존 파일 덮어쓰기)
  const { error: uploadError } = await supabase.storage
    .from("thumbnails")
    .upload(storagePath, buffer, { contentType, upsert: true });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // 4) Public URL 생성
  const { data: urlData } = supabase.storage
    .from("thumbnails")
    .getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  // 5) DB upsert
  const { error: dbError } = await supabase.from("page_thumbnails").upsert(
    {
      page_id: params.pageId,
      thumbnail_url: publicUrl,
      source_type: params.sourceType,
      storage_path: storagePath,
      last_edited_time: params.lastEditedTime,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_id" },
  );
  if (dbError) throw new Error(`DB upsert failed: ${dbError.message}`);

  return publicUrl;
}

/* ── 3. Save External URL (no upload) ── */

async function saveExternalThumbnail(params: {
  pageId: string;
  thumbnailUrl: string;
  sourceType: SourceType;
  lastEditedTime: string | null;
}): Promise<void> {
  const { error } = await supabase.from("page_thumbnails").upsert(
    {
      page_id: params.pageId,
      thumbnail_url: params.thumbnailUrl,
      source_type: params.sourceType,
      storage_path: null,
      last_edited_time: params.lastEditedTime,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_id" },
  );
  if (error) throw new Error(`DB upsert failed: ${error.message}`);
}

/* ── 4. Resolve + Cache (단일 페이지) ── */

/**
 * 단일 페이지의 썸네일을 resolve하고 Supabase에 저장.
 * cover → OG → block first image 순서로 시도.
 * S3 URL이면 Storage 업로드, 외부 URL이면 그대로 저장.
 */
export async function resolveAndCacheThumbnail(params: {
  pageId: string;
  coverUrl?: string;
  coverType?: "file" | "external";
  link?: string | null;
  lastEditedTime: string | null;
}): Promise<string | null> {
  const { pageId, coverUrl, coverType, link, lastEditedTime } = params;

  // 1) Notion 커버 이미지
  if (coverUrl) {
    if (coverType === "file" || isNotionS3Url(coverUrl)) {
      return uploadAndSaveThumbnail({
        pageId,
        imageUrl: coverUrl,
        sourceType: "cover_file",
        lastEditedTime,
      });
    }
    // 외부 URL 커버
    await saveExternalThumbnail({
      pageId,
      thumbnailUrl: coverUrl,
      sourceType: "cover_external",
      lastEditedTime,
    });
    return coverUrl;
  }

  // 2) 외부 링크 OG 이미지
  if (link) {
    const ogUrl = await fetchOgImage(link);
    if (ogUrl) {
      await saveExternalThumbnail({
        pageId,
        thumbnailUrl: ogUrl,
        sourceType: "og_image",
        lastEditedTime,
      });
      return ogUrl;
    }
  }

  // 3) Notion 페이지 블록 첫 이미지
  const blockUrl = await fetchFirstImageUrl(pageId);
  if (blockUrl) {
    if (isNotionS3Url(blockUrl)) {
      return uploadAndSaveThumbnail({
        pageId,
        imageUrl: blockUrl,
        sourceType: "block_file",
        lastEditedTime,
      });
    }
    await saveExternalThumbnail({
      pageId,
      thumbnailUrl: blockUrl,
      sourceType: "block_external",
      lastEditedTime,
    });
    return blockUrl;
  }

  return null;
}

/* ── 5. Get All IDs (for diff sync) ── */

export async function getAllThumbnailIds(): Promise<
  { pageId: string; lastEditedTime: string | null }[]
> {
  const { data, error } = await supabase
    .from("page_thumbnails")
    .select("page_id, last_edited_time");

  if (error) throw new Error(`Thumbnail query failed: ${error.message}`);

  return (data ?? []).map((row: any) => ({
    pageId: row.page_id,
    lastEditedTime: row.last_edited_time,
  }));
}

/* ── 6. Delete ── */

export async function deleteThumbnail(pageId: string): Promise<void> {
  // Storage 파일 조회 후 삭제
  const { data } = await supabase
    .from("page_thumbnails")
    .select("storage_path")
    .eq("page_id", pageId)
    .single();

  if (data?.storage_path) {
    await supabase.storage
      .from("thumbnails")
      .remove([data.storage_path]);
  }

  await supabase.from("page_thumbnails").delete().eq("page_id", pageId);
}
