import { unstable_cache } from "next/cache";
import { fetchAllEntries, fetchAllFromDatabase } from "@/lib/notion";
import {
  mapNotionPageToEntry,
  entryToSearchIndexItem,
  mapPromptPage,
  mapKioskPage,
  mapArticlePage,
  mapUxuiTermPage,
  mapShortcutPage,
  mapPluginPage,
} from "@/lib/notion-mapper";
import { SECTION_DB_IDS } from "@/lib/section-databases";
import type { SearchIndex } from "@/types";

export const getCachedSearchIndex = unstable_cache(
  async (): Promise<SearchIndex> => {
    // Fetch main DB + all section DBs in parallel
    const [
      mainPages,
      promptPages,
      kioskPages,
      articlePages,
      blogPages,
      termPages,
      macPages,
      winPages,
      pluginPages,
    ] = await Promise.all([
      fetchAllEntries(),
      fetchAllFromDatabase(SECTION_DB_IDS.prompt),
      fetchAllFromDatabase(SECTION_DB_IDS.kiosk),
      fetchAllFromDatabase(SECTION_DB_IDS.uxuiArticles),
      fetchAllFromDatabase(SECTION_DB_IDS.techBlogs),
      fetchAllFromDatabase(SECTION_DB_IDS.uxuiTerms),
      fetchAllFromDatabase(SECTION_DB_IDS.macShortcuts),
      fetchAllFromDatabase(SECTION_DB_IDS.winShortcuts),
      fetchAllFromDatabase(SECTION_DB_IDS.plugins),
    ]);

    // Map main entries
    const mainItems = mainPages
      .map(mapNotionPageToEntry)
      .map(entryToSearchIndexItem)
      .map((item) => ({ ...item, section: "피그마 Q&A" }));

    // Map section entries with section tags (for AI search context)
    const sectionItems = [
      ...promptPages.map(mapPromptPage).map((item) => ({ ...item, section: "프롬프트" })),
      ...kioskPages.map(mapKioskPage).map((item) => ({ ...item, section: "키오스크" })),
      ...articlePages.map(mapArticlePage).map((item) => ({ ...item, section: "UXUI 아티클" })),
      ...blogPages.map(mapArticlePage).map((item) => ({ ...item, section: "기술 블로그" })),
      ...termPages.map(mapUxuiTermPage).map((item) => ({ ...item, section: "UXUI 용어" })),
      ...macPages.map(mapShortcutPage).map((item) => ({ ...item, section: "Mac 단축키" })),
      ...winPages.map(mapShortcutPage).map((item) => ({ ...item, section: "Win 단축키" })),
      ...pluginPages.map(mapPluginPage).map((item) => ({ ...item, section: "플러그인" })),
    ];

    // Merge all items, dedup by id
    const idSet = new Set<string>();
    const items = [...mainItems, ...sectionItems].filter((item) => {
      if (idSet.has(item.id)) return false;
      idSet.add(item.id);
      return true;
    });

    return {
      items,
      generatedAt: new Date().toISOString(),
      totalCount: items.length,
    };
  },
  ["search-index"],
  { revalidate: 300, tags: ["search-index"] }
);
