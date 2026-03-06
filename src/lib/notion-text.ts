import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const TEXT_BLOCK_TYPES = [
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list_item",
  "numbered_list_item",
  "quote",
  "callout",
  "code",
  "toggle",
  "to_do",
];

function extractRichText(richTextArray: any[]): string {
  return richTextArray?.map((t: any) => t.plain_text).join("") ?? "";
}

function extractBlockText(block: any): string {
  const type = block.type;
  const data = block[type];
  if (!data?.rich_text) return "";
  return extractRichText(data.rich_text);
}

const HEADING_PREFIXES: Record<string, string> = {
  heading_1: "# ",
  heading_2: "## ",
  heading_3: "### ",
};

/**
 * 블록 타입에 따라 구조화된 텍스트를 반환.
 * 헤딩은 마크다운 prefix 추가, 리스트는 "- " prefix.
 */
function extractStructuredBlockText(block: any): string {
  const type = block.type;
  const text = extractBlockText(block);
  if (!text) return "";

  const headingPrefix = HEADING_PREFIXES[type];
  if (headingPrefix) return `\n${headingPrefix}${text}`;
  if (type === "bulleted_list_item" || type === "to_do") return `- ${text}`;
  if (type === "numbered_list_item") return `- ${text}`;
  return text;
}

/**
 * Notion 페이지의 전체 텍스트를 추출 (임베딩용).
 * 기존 fetchPageTextSnippet의 확장 버전:
 * - 전체 블록 페이지네이션 (page_size: 100)
 * - 더 많은 블록 타입 지원
 * - maxChars 기본값 6000자
 */
export async function fetchPageFullText(
  pageId: string,
  maxChars = 6000
): Promise<string> {
  try {
    const parts: string[] = [];
    let cursor: string | undefined = undefined;
    let totalChars = 0;

    do {
      const response: any = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      for (const block of response.results) {
        if (totalChars >= maxChars) break;

        if (TEXT_BLOCK_TYPES.includes(block.type)) {
          const text = extractStructuredBlockText(block);
          if (text) {
            parts.push(text);
            totalChars += text.length;
          }
        }
      }

      if (totalChars >= maxChars) break;
      cursor = response.has_more
        ? response.next_cursor ?? undefined
        : undefined;
    } while (cursor);

    return parts.join("\n").slice(0, maxChars);
  } catch {
    return "";
  }
}
