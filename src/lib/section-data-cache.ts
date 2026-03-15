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

    return {
      prompt: applyThumbnails(mappedPrompt),
      kiosk: applyThumbnails(mappedKiosk),
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
