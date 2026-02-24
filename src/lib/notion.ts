import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

async function queryNotionDB(
  dbId: string,
  body: Record<string, unknown> = {}
) {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${dbId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `Notion API error ${res.status}: ${error.message ?? res.statusText}`
    );
  }

  return res.json();
}

async function queryDatabase(body: Record<string, unknown> = {}) {
  return queryNotionDB(DATABASE_ID, body);
}

export async function fetchAllEntries() {
  const results: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const body: Record<string, unknown> = {
      sorts: [{ property: "글 작성일", direction: "descending" }],
      page_size: 100,
    };
    if (cursor) body.start_cursor = cursor;

    const response = await queryDatabase(body);

    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return results;
}

/** Fetch all pages from any Notion database by ID */
export async function fetchAllFromDatabase(dbId: string) {
  const results: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const response = await queryNotionDB(dbId, body);
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return results;
}

export async function fetchEntryById(pageId: string) {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
}

export async function fetchPageBlocks(pageId: string) {
  const blocks: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });

    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
}

/** 페이지 블록에서 첫 번째 이미지 URL을 추출 (커버 없는 페이지의 썸네일 fallback용) */
export async function fetchFirstImageUrl(pageId: string): Promise<string | undefined> {
  try {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    for (const block of response.results) {
      if (block.type === "image") {
        const data = block.image;
        if (data?.type === "file") return data.file?.url;
        if (data?.type === "external") return data.external?.url;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * 커버 없는 항목들에 첫 이미지 fallback 적용
 * Notion 속도 제한(3 req/sec) 준수를 위해 동시 요청 제한
 */
export async function fillMissingThumbnails<T extends { id: string; thumbnail?: string }>(
  items: T[],
  concurrency = 3,
): Promise<T[]> {
  const needsFetch = items.filter((item) => !item.thumbnail);
  if (needsFetch.length === 0) return items;

  const thumbnailMap = new Map<string, string>();

  // 동시 요청 제한하며 병렬 처리
  for (let i = 0; i < needsFetch.length; i += concurrency) {
    const batch = needsFetch.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (item) => {
        const url = await fetchFirstImageUrl(item.id);
        return { id: item.id, url };
      })
    );
    for (const r of results) {
      if (r.url) thumbnailMap.set(r.id, r.url);
    }
  }

  return items.map((item) =>
    !item.thumbnail && thumbnailMap.has(item.id)
      ? { ...item, thumbnail: thumbnailMap.get(item.id) }
      : item
  );
}

/** 외부 URL에서 og:image 메타태그 추출 */
export async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "bot" },
      signal: AbortSignal.timeout(3000),
      redirect: "follow",
    });
    if (!res.ok) return undefined;

    const html = await res.text();
    // og:image — property가 content 앞 또는 뒤에 올 수 있음
    const match =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    return match?.[1] || undefined;
  } catch {
    return undefined;
  }
}

/**
 * 커버 없는 항목 중 link가 있는 항목에 OG 이미지를 썸네일로 적용
 * 외부 사이트 요청이므로 동시 요청 제한으로 안정성 확보
 */
export async function fillOgThumbnails<T extends { id: string; link?: string | null; thumbnail?: string }>(
  items: T[],
  concurrency = 3,
): Promise<T[]> {
  const needsFetch = items.filter((item) => !item.thumbnail && item.link);
  if (needsFetch.length === 0) return items;

  const thumbnailMap = new Map<string, string>();

  for (let i = 0; i < needsFetch.length; i += concurrency) {
    const batch = needsFetch.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (item) => {
        const url = await fetchOgImage(item.link!);
        return { id: item.id, url };
      })
    );
    for (const r of results) {
      if (r.url) thumbnailMap.set(r.id, r.url);
    }
  }

  return items.map((item) =>
    !item.thumbnail && thumbnailMap.has(item.id)
      ? { ...item, thumbnail: thumbnailMap.get(item.id) }
      : item
  );
}
