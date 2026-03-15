import fs from "fs";
import path from "path";
import { unstable_cache } from "next/cache";
import { fetchAllFromDatabase } from "@/lib/notion";
import {
  mapPromptPage,
  mapKioskPage,
  mapArticlePage,
  mapUxuiTermPage,
  mapShortcutPage,
  mapPluginPage,
  mapFigmaGlossaryPage,
} from "@/lib/notion-mapper";
import { SECTION_DB_IDS } from "@/lib/section-databases";
import { getPageThumbnails, isNotionS3Url } from "@/lib/thumbnail-cache";
import type { SearchIndexItem } from "@/types";

/* ── 키오스크 로컬 이미지 매핑 (빌드타임) ── */
/** NFC 정규화 + trim (macOS NFD ↔ Notion NFC 차이 해소) */
const norm = (s: string) => s.normalize("NFC").trim();

const kioskImageMap = new Map<string, string>();
try {
  const dir = path.join(process.cwd(), "public", "kiosk");
  for (const file of fs.readdirSync(dir)) {
    if (!file.toLowerCase().endsWith(".jpg")) continue;
    // "노랑강정 1.jpg" → "노랑강정", "미토요.jpg" → "미토요"
    const baseName = norm(file.replace(/(\s+\d+)?\.jpg$/i, ""));
    if (!kioskImageMap.has(baseName)) {
      kioskImageMap.set(baseName, `/kiosk/${norm(file)}`);
    }
  }
} catch {
  /* public/kiosk 폴더 없으면 무시 */
}

/** 공백·특수문자·스마트따옴표 제거 후 소문자 정규화 */
const strip = (s: string) => norm(s).replace(/[\s\-()·''\u2018\u2019\u201C\u201D"""/.]/g, "").toLowerCase();

/** 키오스크 제목 → 로컬 이미지 경로 매칭 */
function findKioskImage(title: string): string | undefined {
  const t = norm(title);
  // 1) 정확 매치
  if (kioskImageMap.has(t)) return kioskImageMap.get(t);
  // 2) 상호 포함 매치 (긴 쪽 우선)
  let bestMatch: string | undefined;
  let bestLen = 0;
  for (const [name, imgPath] of kioskImageMap) {
    if (t.includes(name) || name.includes(t)) {
      if (name.length > bestLen) { bestLen = name.length; bestMatch = imgPath; }
    }
  }
  if (bestMatch) return bestMatch;
  // 3) 특수문자/공백 제거 후 포함 매치
  const tStrip = strip(title);
  for (const [name, imgPath] of kioskImageMap) {
    const nStrip = strip(name);
    if (tStrip.includes(nStrip) || nStrip.includes(tStrip)) {
      if (name.length > bestLen) { bestLen = name.length; bestMatch = imgPath; }
    }
  }
  if (bestMatch) return bestMatch;
  // 4) 첫 핵심 키워드 매치 (제목의 앞부분이 파일명에 포함되는지)
  //    "신한은행 시니어 고객 맞춤형 ATM" → "신한은행" 으로 매칭
  const words = t.split(/[\s\-()]+/).filter(Boolean);
  for (let len = Math.min(words.length, 3); len >= 1; len--) {
    const prefix = words.slice(0, len).join(" ");
    for (const [name, imgPath] of kioskImageMap) {
      if (name.startsWith(prefix)) {
        if (name.length > bestLen) { bestLen = name.length; bestMatch = imgPath; }
      }
    }
    if (bestMatch) return bestMatch;
  }
  return bestMatch;
}

export type SectionKey =
  | "prompt"
  | "kiosk"
  | "uxui-articles"
  | "uxui-blogs"
  | "uxui-terms"
  | "mac-shortcuts"
  | "win-shortcuts"
  | "plugins"
  | "figma-glossary";

export const getCachedSectionData = unstable_cache(
  async (): Promise<Record<SectionKey, SearchIndexItem[]>> => {
    const [
      promptPages,
      kioskPages,
      articlePages,
      blogPages,
      termPages,
      macPages,
      winPages,
      pluginPages,
      glossaryPages,
    ] = await Promise.all([
      fetchAllFromDatabase(SECTION_DB_IDS.prompt),
      fetchAllFromDatabase(SECTION_DB_IDS.kiosk),
      fetchAllFromDatabase(SECTION_DB_IDS.uxuiArticles),
      fetchAllFromDatabase(SECTION_DB_IDS.techBlogs),
      fetchAllFromDatabase(SECTION_DB_IDS.uxuiTerms),
      fetchAllFromDatabase(SECTION_DB_IDS.macShortcuts),
      fetchAllFromDatabase(SECTION_DB_IDS.winShortcuts),
      fetchAllFromDatabase(SECTION_DB_IDS.plugins),
      fetchAllFromDatabase(SECTION_DB_IDS.figmaGlossary),
    ]);

    // 모든 섹션 map
    const mappedPrompt = promptPages.map(mapPromptPage);
    const mappedKiosk = kioskPages.map(mapKioskPage);
    const mappedArticles = articlePages.map(mapArticlePage);
    const mappedBlogs = blogPages.map(mapArticlePage);
    const mappedTerms = termPages.map(mapUxuiTermPage);
    const mappedPlugins = pluginPages.map(mapPluginPage);
    const mappedGlossary = glossaryPages.map(mapFigmaGlossaryPage);

    // 썸네일이 필요한 전체 아이템 ID 수집
    const thumbnailSections = [
      ...mappedPrompt,
      ...mappedKiosk,
      ...mappedArticles,
      ...mappedBlogs,
      ...mappedTerms,
      ...mappedPlugins,
    ];
    const allIds = thumbnailSections.map((item) => item.id);

    // Supabase에서 배치 조회 (단일 쿼리, ~50ms)
    let thumbnailMap = new Map<string, string>();
    try {
      thumbnailMap = await getPageThumbnails(allIds);
    } catch (err) {
      console.error("Supabase thumbnail lookup failed, continuing without:", err);
    }

    // Supabase 캐시된 썸네일 적용
    function applyThumbnails(items: SearchIndexItem[]): SearchIndexItem[] {
      return items.map((item) => {
        // 이미 외부 URL 커버가 있으면 유지
        if (item.thumbnail && !isNotionS3Url(item.thumbnail)) return item;
        const cached = thumbnailMap.get(item.id);
        if (cached) return { ...item, thumbnail: cached };
        // S3 URL은 만료 가능하지만, 제거하면 fallback도 불가한 항목이 있으므로 유지
        return item;
      });
    }

    // 키오스크: 로컬 이미지 우선 적용 → Supabase fallback
    const kioskWithLocalImages = mappedKiosk.map((item) => {
      const localImg = findKioskImage(item.title);
      return localImg ? { ...item, thumbnail: localImg } : item;
    });

    return {
      prompt: applyThumbnails(mappedPrompt),
      kiosk: kioskWithLocalImages,
      "uxui-articles": applyThumbnails(mappedArticles),
      "uxui-blogs": applyThumbnails(mappedBlogs),
      "uxui-terms": applyThumbnails(mappedTerms),
      "mac-shortcuts": macPages.map(mapShortcutPage),
      "win-shortcuts": winPages.map(mapShortcutPage),
      plugins: applyThumbnails(mappedPlugins),
      "figma-glossary": mappedGlossary,
    };
  },
  ["section-data"],
  { revalidate: 600, tags: ["section-data"] },
);
