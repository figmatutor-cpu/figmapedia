import { unstable_cache } from "next/cache";
import { fetchAllFromDatabase, fillMissingThumbnails } from "@/lib/notion";
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

    // 매핑 후 커버 없는 항목에 첫 이미지 fallback 적용
    // 단축키 DB는 썸네일 불필요 → fallback 제외
    const [prompt, kiosk, uxuiArticles, uxuiBlogs, uxuiTerms, plugins] =
      await Promise.all([
        fillMissingThumbnails(promptPages.map(mapPromptPage)),
        fillMissingThumbnails(kioskPages.map(mapKioskPage)),
        fillMissingThumbnails(articlePages.map(mapArticlePage)),
        fillMissingThumbnails(blogPages.map(mapArticlePage)),
        fillMissingThumbnails(termPages.map(mapUxuiTermPage)),
        fillMissingThumbnails(pluginPages.map(mapPluginPage)),
      ]);

    return {
      prompt,
      kiosk,
      "uxui-articles": uxuiArticles,
      "uxui-blogs": uxuiBlogs,
      "uxui-terms": uxuiTerms,
      "mac-shortcuts": macPages.map(mapShortcutPage),
      "win-shortcuts": winPages.map(mapShortcutPage),
      plugins,
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
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Return all sections
    return Response.json(allData, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
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
