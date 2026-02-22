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
