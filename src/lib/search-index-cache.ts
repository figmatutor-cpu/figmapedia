import { unstable_cache } from "next/cache";
import { fetchAllEntries } from "@/lib/notion";
import {
  mapNotionPageToEntry,
  entryToSearchIndexItem,
} from "@/lib/notion-mapper";
import type { SearchIndex } from "@/types";

export const getCachedSearchIndex = unstable_cache(
  async (): Promise<SearchIndex> => {
    const pages = await fetchAllEntries();
    const entries = pages.map(mapNotionPageToEntry);
    const items = entries.map(entryToSearchIndexItem);

    return {
      items,
      generatedAt: new Date().toISOString(),
      totalCount: items.length,
    };
  },
  ["search-index"],
  { revalidate: 300, tags: ["search-index"] }
);
