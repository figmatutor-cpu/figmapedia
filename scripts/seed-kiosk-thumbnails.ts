/**
 * 로컬 /public/kiosk/*.jpg 이미지를 Supabase Storage에 업로드하고
 * page_thumbnails 테이블에 키오스크 페이지 ID와 매핑하는 스크립트.
 *
 * 사용법: npx tsx scripts/seed-kiosk-thumbnails.ts
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

/* ── 환경 변수 ── */
import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const KIOSK_DB_ID = "78378389-9edb-4721-9763-1d38d8881654";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── 매칭 유틸 (section-data-cache.ts와 동일) ── */
const norm = (s: string) => s.normalize("NFC").trim();
const strip = (s: string) =>
  norm(s)
    .replace(/[\s\-()·''\u2018\u2019\u201C\u201D"""/.]/g, "")
    .toLowerCase();

interface KioskLocalFile {
  baseName: string;
  filePath: string; // 절대 경로
  fileName: string; // 원본 파일명
}

/* ── 1. 로컬 파일 스캔 ── */
function scanLocalFiles(): KioskLocalFile[] {
  const dir = path.join(process.cwd(), "public", "kiosk");
  const files: KioskLocalFile[] = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.toLowerCase().endsWith(".jpg")) continue;
    const baseName = norm(file.replace(/(\s+\d+)?\.jpg$/i, ""));
    files.push({
      baseName,
      filePath: path.join(dir, file),
      fileName: file,
    });
  }
  return files;
}

/* ── 2. Notion에서 키오스크 페이지 목록 가져오기 ── */
async function fetchKioskPages(): Promise<
  { id: string; title: string; lastEditedTime: string }[]
> {
  const pages: { id: string; title: string; lastEditedTime: string }[] = [];
  let startCursor: string | undefined;

  do {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${KIOSK_DB_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_cursor: startCursor,
          page_size: 100,
        }),
      },
    );
    const data = await res.json();

    for (const page of data.results) {
      const titleProp =
        page.properties?.["키오스크명"] ??
        page.properties?.["이름"] ??
        page.properties?.["Name"];
      const title =
        titleProp?.title?.map((t: any) => t.plain_text).join("") ?? "";
      pages.push({
        id: page.id,
        title: norm(title),
        lastEditedTime: page.last_edited_time,
      });
    }
    startCursor = data.has_more ? data.next_cursor : undefined;
  } while (startCursor);

  return pages;
}

/* ── 3. 제목 → 로컬 파일 매칭 (4단계) ── */
function findMatch(
  title: string,
  localFiles: KioskLocalFile[],
): KioskLocalFile | undefined {
  const t = norm(title);

  // 1) 정확 매치
  const exact = localFiles.find((f) => f.baseName === t);
  if (exact) return exact;

  // 2) 상호 포함 매치 (긴 쪽 우선)
  let best: KioskLocalFile | undefined;
  let bestLen = 0;
  for (const f of localFiles) {
    if (t.includes(f.baseName) || f.baseName.includes(t)) {
      if (f.baseName.length > bestLen) {
        bestLen = f.baseName.length;
        best = f;
      }
    }
  }
  if (best) return best;

  // 3) 특수문자/공백 제거 후 포함 매치
  const tStrip = strip(title);
  for (const f of localFiles) {
    const nStrip = strip(f.baseName);
    if (tStrip.includes(nStrip) || nStrip.includes(tStrip)) {
      if (f.baseName.length > bestLen) {
        bestLen = f.baseName.length;
        best = f;
      }
    }
  }
  if (best) return best;

  // 4) 첫 키워드 매치
  const words = t.split(/[\s\-()]+/).filter(Boolean);
  for (let len = Math.min(words.length, 3); len >= 1; len--) {
    const prefix = words.slice(0, len).join(" ");
    for (const f of localFiles) {
      if (f.baseName.startsWith(prefix)) {
        if (f.baseName.length > bestLen) {
          bestLen = f.baseName.length;
          best = f;
        }
      }
    }
    if (best) return best;
  }

  return undefined;
}

/* ── 4. Supabase Storage 업로드 + DB 저장 ── */
async function uploadToSupabase(
  pageId: string,
  localFile: KioskLocalFile,
  lastEditedTime: string,
): Promise<string> {
  const buffer = fs.readFileSync(localFile.filePath);
  const storagePath = `kiosk/${pageId}.jpg`;

  // Storage 업로드
  const { error: uploadError } = await supabase.storage
    .from("thumbnails")
    .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // Public URL
  const { data: urlData } = supabase.storage
    .from("thumbnails")
    .getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  // DB upsert
  const { error: dbError } = await supabase.from("page_thumbnails").upsert(
    {
      page_id: pageId,
      thumbnail_url: publicUrl,
      source_type: "cover_file",
      storage_path: storagePath,
      last_edited_time: lastEditedTime,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_id" },
  );
  if (dbError) throw new Error(`DB upsert failed: ${dbError.message}`);

  return publicUrl;
}

/* ── Main ── */
async function main() {
  console.log("🔍 로컬 키오스크 이미지 스캔...");
  const localFiles = scanLocalFiles();
  console.log(`  ${localFiles.length}개 파일 발견\n`);

  console.log("📥 Notion 키오스크 페이지 목록 가져오기...");
  const pages = await fetchKioskPages();
  console.log(`  ${pages.length}개 페이지\n`);

  console.log("🔗 매칭 & 업로드 시작...\n");

  let uploaded = 0;
  let skipped = 0;
  let noMatch = 0;
  const unmatched: string[] = [];

  for (const page of pages) {
    const match = findMatch(page.title, localFiles);
    if (!match) {
      noMatch++;
      unmatched.push(page.title);
      console.log(`  ❌ 매칭 실패: "${page.title}"`);
      continue;
    }

    try {
      const url = await uploadToSupabase(
        page.id,
        match,
        page.lastEditedTime,
      );
      uploaded++;
      console.log(
        `  ✅ ${page.title} → ${match.fileName} → 업로드 완료`,
      );
    } catch (err: any) {
      console.error(`  ⚠️ ${page.title}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ 업로드: ${uploaded}`);
  console.log(`❌ 매칭 실패: ${noMatch}`);
  console.log(`⚠️ 에러: ${skipped}`);

  if (unmatched.length > 0) {
    console.log(`\n매칭 실패 목록:`);
    unmatched.forEach((t) => console.log(`  - ${t}`));
  }
}

main().catch(console.error);
