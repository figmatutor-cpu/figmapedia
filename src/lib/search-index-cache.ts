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
  mapFigmaGlossaryPage,
} from "@/lib/notion-mapper";
import { SECTION_DB_IDS } from "@/lib/section-databases";
import { FIGMA_RESOURCES } from "@/lib/resource-data";
import { getGlossaryExpansions } from "@/lib/figma-glossary";
import { getPublishedIssues, formatIssueLabel } from "@/lib/ai-report";
import type { SearchIndex, SearchIndexItem } from "@/types";

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
      glossaryPages,
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
      fetchAllFromDatabase(SECTION_DB_IDS.figmaGlossary),
    ]);

    // Map main entries
    const mainItems = mainPages
      .map(mapNotionPageToEntry)
      .map(entryToSearchIndexItem)
      .map((item) => ({ ...item, section: "피그마 Q&A" }));

    // Map section entries with section tags (for AI search context)
    const sectionItems = [
      ...promptPages
        .map(mapPromptPage)
        .map((item) => ({ ...item, section: "프롬프트" })),
      ...kioskPages
        .map(mapKioskPage)
        .map((item) => ({ ...item, section: "키오스크" })),
      ...articlePages
        .map(mapArticlePage)
        .map((item) => ({ ...item, section: "UXUI 아티클" })),
      ...blogPages
        .map(mapArticlePage)
        .map((item) => ({ ...item, section: "기술 블로그" })),
      ...termPages
        .map(mapUxuiTermPage)
        .map((item) => ({ ...item, section: "UXUI 용어" })),
      ...macPages
        .map(mapShortcutPage)
        .map((item) => ({ ...item, section: "Mac 단축키" })),
      ...winPages
        .map(mapShortcutPage)
        .map((item) => ({ ...item, section: "Win 단축키" })),
      ...pluginPages
        .map(mapPluginPage)
        .map((item) => ({ ...item, section: "플러그인" })),
      ...glossaryPages
        .map(mapFigmaGlossaryPage)
        .map((item) => ({ ...item, section: "피그마 용어" })),
    ];

    // AI리포트 뉴스레터 — 발행일이 지난 호만 (reports.json 기준)
    let reportItems: SearchIndexItem[] = [];
    try {
      const reports = await getPublishedIssues();
      reportItems = reports.map((r) => ({
        id: `ai-report-${r.issue}`,
        // "1호"로도 검색되게 라벨을 제목에 포함
        title: `${formatIssueLabel(r.issue)} · ${r.title}`,
        categories: ["AI리포트"],
        author: "허들링 클럽",
        link: null,
        publishedDate: r.publishedAt,
        section: "AI리포트",
        lastEditedTime: r.publishedAt,
      }));
    } catch {
      // 리포트 앱 미배포 등 — AI리포트 없이 진행
    }

    // Map figma resources to search index items
    const resourceItems: SearchIndexItem[] = FIGMA_RESOURCES.map((r, i) => ({
      id: `resource-${i}`,
      title: r.title,
      categories:
        r.category === "template"
          ? ["추천 리소스"]
          : r.category === "live"
            ? ["주간 라이브"]
            : r.category === "atoz"
              ? ["Figma A to Z"]
              : ["피그마 리소스"],
      author: "",
      link: r.url,
      publishedDate: null,
      section: "피그마 리소스",
    }));

    // Merge all items, dedup by id
    const idSet = new Set<string>();
    const merged = [
      ...mainItems,
      ...sectionItems,
      ...resourceItems,
      ...reportItems,
    ].filter((item) => {
      if (idSet.has(item.id)) return false;
      idSet.add(item.id);
      return true;
    });

    // Enrich with glossary keywords for bilingual Fuse.js search
    const items = merged.map((item) => {
      const text = `${item.title} ${item.categories.join(" ")}`;
      const expansions = getGlossaryExpansions(text);
      if (expansions.length > 0) {
        return { ...item, glossaryKeywords: expansions.join(" ") };
      }
      return item;
    });

    return {
      items,
      generatedAt: new Date().toISOString(),
      totalCount: items.length,
    };
  },
  ["search-index"],
  { revalidate: 300, tags: ["search-index"] },
);
