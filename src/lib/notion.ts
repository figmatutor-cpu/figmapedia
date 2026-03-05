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

/** children을 재귀적으로 fetch해야 하는 블록 타입 */
const NESTED_BLOCK_TYPES = new Set([
  "toggle",
  "callout",
  "quote",
  "column_list",
  "column",
  "bulleted_list_item",
  "numbered_list_item",
  "synced_block",
  "table",
  "heading_1",
  "heading_2",
  "heading_3",
]);

async function fetchBlockChildren(blockId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response: any = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  // has_children인 블록은 재귀적으로 children fetch
  await Promise.all(
    blocks.map(async (block) => {
      if (block.has_children && NESTED_BLOCK_TYPES.has(block.type)) {
        block.__children = await fetchBlockChildren(block.id);
      }
    })
  );

  return blocks;
}

export async function fetchPageBlocks(pageId: string) {
  return fetchBlockChildren(pageId);
}

/** 페이지 블록에서 첫 번째 이미지 URL을 추출 (커버 없는 페이지의 썸네일 fallback용) */
export async function fetchFirstImageUrl(pageId: string): Promise<string | undefined> {
  try {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    // 1단계: 최상위 블록에서 이미지 검색
    for (const block of response.results) {
      if (block.type === "image") {
        const data = block.image;
        if (data?.type === "file") return data.file?.url;
        if (data?.type === "external") return data.external?.url;
      }
    }

    // 2단계: 중첩 블록(column_list, column, toggle 등) 안에서 이미지 검색
    const NESTED_TYPES = ["column_list", "column", "synced_block", "toggle", "callout"];
    for (const block of response.results) {
      if (!NESTED_TYPES.includes(block.type) || !block.has_children) continue;
      try {
        const children: any = await notion.blocks.children.list({
          block_id: block.id,
          page_size: 50,
        });
        for (const child of children.results) {
          if (child.type === "image") {
            const data = child.image;
            if (data?.type === "file") return data.file?.url;
            if (data?.type === "external") return data.external?.url;
          }
          // column_list → column → image (3단계)
          if (NESTED_TYPES.includes(child.type) && child.has_children) {
            const grandchildren: any = await notion.blocks.children.list({
              block_id: child.id,
              page_size: 20,
            });
            for (const gc of grandchildren.results) {
              if (gc.type === "image") {
                const data = gc.image;
                if (data?.type === "file") return data.file?.url;
                if (data?.type === "external") return data.external?.url;
              }
            }
          }
        }
      } catch { /* 중첩 블록 실패 시 다음으로 */ }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/** 페이지 첫 5블록에서 텍스트 추출 (AI 검색 컨텍스트 스니펫용) */
export async function fetchPageTextSnippet(pageId: string, maxChars = 500): Promise<string> {
  try {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 5,
    });
    const textTypes = ["paragraph", "heading_1", "heading_2", "heading_3",
                       "bulleted_list_item", "numbered_list_item", "quote", "callout"];
    return response.results
      .filter((b: any) => textTypes.includes(b.type))
      .map((b: any) => b[b.type]?.rich_text?.map((t: any) => t.plain_text).join("") ?? "")
      .filter(Boolean)
      .join(" ")
      .slice(0, maxChars);
  } catch {
    return "";
  }
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

