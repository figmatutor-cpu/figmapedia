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
      .map(entryToSearchIndexItem);

    // Map section entries (each mapper already returns SearchIndexItem)
    const sectionItems = [
      ...promptPages.map(mapPromptPage),
      ...kioskPages.map(mapKioskPage),
      ...articlePages.map(mapArticlePage),
      ...blogPages.map(mapArticlePage),
      ...termPages.map(mapUxuiTermPage),
      ...macPages.map(mapShortcutPage),
      ...winPages.map(mapShortcutPage),
      ...pluginPages.map(mapPluginPage),
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
