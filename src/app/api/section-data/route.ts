import { unstable_cache } from "next/cache";
import { fetchAllFromDatabase } from "@/lib/notion";
import {
  mapPromptPage,
  mapKioskPage,
  mapArticlePage,
  mapUxuiTermPage,
  mapShortcutPage,
  mapPluginPage,
} from "@/lib/notion-mapper";
import { SECTION_DB_IDS } from "@/lib/section-databases";
import type { SearchIndexItem } from "@/types";

type SectionKey =
  | "prompt"
  | "kiosk"
  | "uxui-articles"
  | "uxui-blogs"
  | "uxui-terms"
  | "mac-shortcuts"
  | "win-shortcuts"
  | "plugins";

const getCachedSectionData = unstable_cache(
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
    ] = await Promise.all([
      fetchAllFromDatabase(SECTION_DB_IDS.prompt),
      fetchAllFromDatabase(SECTION_DB_IDS.kiosk),
      fetchAllFromDatabase(SECTION_DB_IDS.uxuiArticles),
      fetchAllFromDatabase(SECTION_DB_IDS.techBlogs),
      fetchAllFromDatabase(SECTION_DB_IDS.uxuiTerms),
      fetchAllFromDatabase(SECTION_DB_IDS.macShortcuts),
      fetchAllFromDatabase(SECTION_DB_IDS.winShortcuts),
      fetchAllFromDatabase(SECTION_DB_IDS.plugins),
    ]);

    return {
      prompt: promptPages.map(mapPromptPage),
      kiosk: kioskPages.map(mapKioskPage),
      "uxui-articles": articlePages.map(mapArticlePage),
      "uxui-blogs": blogPages.map(mapArticlePage),
      "uxui-terms": termPages.map(mapUxuiTermPage),
      "mac-shortcuts": macPages.map(mapShortcutPage),
      "win-shortcuts": winPages.map(mapShortcutPage),
      plugins: pluginPages.map(mapPluginPage),
    };
  },
  ["section-data"],
  { revalidate: 60, tags: ["section-data"] }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") as SectionKey | null;

    const allData = await getCachedSectionData();

    if (section && section in allData) {
      return Response.json(
        { items: allData[section] },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    // Return all sections
    return Response.json(allData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Failed to fetch section data:", error);
    return Response.json(
      { error: "Failed to fetch section data" },
      { status: 500 }
    );
  }
}
