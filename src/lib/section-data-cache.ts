import { unstable_cache } from "next/cache";
import { fetchAllFromDatabase, fetchOgImage, fetchFirstImageUrl } from "@/lib/notion";
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

export type SectionKey =
  | "prompt"
  | "kiosk"
  | "uxui-articles"
  | "uxui-blogs"
  | "uxui-terms"
  | "mac-shortcuts"
  | "win-shortcuts"
  | "plugins";

/** N개씩 배치로 비동기 처리 (Notion API rate limit 보호) */
async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number,
): Promise<void> {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const item = items[i++];
      await fn(item);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
}

/**
 * thumbnail 없는 아이템들을 서버에서 미리 resolve (클라이언트 fallback 요청 제거)
 * - item.link 있으면 OG 이미지 먼저 시도
 * - 없거나 실패하면 Notion 페이지 블록 첫 이미지 시도
 * - 각 단계 1.5초 타임아웃, concurrency로 Notion rate limit 보호
 * - 전체 enrichment는 GLOBAL_TIMEOUT_MS 안에 완료되어야 함 (초과 시 그때까지 처리된 것만 사용)
 */
async function enrichWithThumbnails(
  items: SearchIndexItem[],
  concurrency: number,
): Promise<SearchIndexItem[]> {
  const needsFetch = items.filter((item) => !item.thumbnail);
  if (needsFetch.length === 0) return items;

  const resolved = new Map<string, string>();
  const PER_ITEM_TIMEOUT_MS = 1500;
  const GLOBAL_TIMEOUT_MS = 5000;

  function withTimeout(p: Promise<string | undefined>): Promise<string | undefined> {
    return Promise.race([
      p,
      new Promise<undefined>((r) => setTimeout(() => r(undefined), PER_ITEM_TIMEOUT_MS)),
    ]);
  }

  // 전체 enrichment에 글로벌 타임아웃 적용 — 초과 시 그때까지 resolve된 것만 사용
  await Promise.race([
    runWithConcurrency(
      needsFetch,
      async (item) => {
        try {
          let url: string | undefined;
          if (item.link) {
            url = await withTimeout(fetchOgImage(item.link));
          }
          if (!url) {
            url = await withTimeout(fetchFirstImageUrl(item.id));
          }
          if (url) resolved.set(item.id, url);
        } catch {
          /* 실패하면 thumbnail 없이 진행 */
        }
      },
      concurrency,
    ),
    new Promise<void>((resolve) => setTimeout(resolve, GLOBAL_TIMEOUT_MS)),
  ]);

  return items.map((item) => {
    if (item.thumbnail) return item;
    const url = resolved.get(item.id);
    return url ? { ...item, thumbnail: url } : item;
  });
}

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

    // thumbnail이 있는 섹션만 enrich (썸네일 레이아웃 사용)
    // 외부 링크 아티클(concurrency 10): Notion API 무관, OG 스크래핑
    // 내부 Notion 페이지(concurrency 3): Notion API rate limit 고려
    const [
      enrichedPrompt,
      enrichedKiosk,
      enrichedArticles,
      enrichedBlogs,
      enrichedPlugins,
    ] = await Promise.all([
      enrichWithThumbnails(promptPages.map(mapPromptPage), 3),
      enrichWithThumbnails(kioskPages.map(mapKioskPage), 3),
      enrichWithThumbnails(articlePages.map(mapArticlePage), 10),
      enrichWithThumbnails(blogPages.map(mapArticlePage), 10),
      enrichWithThumbnails(pluginPages.map(mapPluginPage), 10),
    ]);

    return {
      prompt: enrichedPrompt,
      kiosk: enrichedKiosk,
      "uxui-articles": enrichedArticles,
      "uxui-blogs": enrichedBlogs,
      "uxui-terms": termPages.map(mapUxuiTermPage),
      "mac-shortcuts": macPages.map(mapShortcutPage),
      "win-shortcuts": winPages.map(mapShortcutPage),
      plugins: enrichedPlugins,
    };
  },
  ["section-data"],
  { revalidate: 600, tags: ["section-data"] },
);
