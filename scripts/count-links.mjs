import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const MAIN_DB_ID = process.env.NOTION_DATABASE_ID;

async function queryNotionDB(dbId, body = {}) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Notion API error ${res.status}`);
  return res.json();
}

async function getBlockCount(pageId) {
  const res = await fetch(
    `https://api.notion.com/v1/blocks/${pageId}/children?page_size=1`,
    {
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
      },
    },
  );
  if (!res.ok) return -1;
  const data = await res.json();
  return data.results.length;
}

async function countLinks(dbId, dbName, linkProp, titleProp) {
  let total = 0,
    withLink = 0,
    blankWithLink = 0;
  const linkEntries = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await queryNotionDB(dbId, body);
    for (const page of res.results) {
      total++;
      const url = page.properties[linkProp]?.url;
      if (url) {
        withLink++;
        const blockCount = await getBlockCount(page.id);
        const hasContent = blockCount > 0;
        if (!hasContent) blankWithLink++;
        const tp = page.properties[titleProp]?.title || [];
        const title = tp.map((t) => t.plain_text).join("");
        linkEntries.push({ title, link: url, hasContent });
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return { dbName, total, withLink, blankWithLink, linkEntries };
}

(async () => {
  const results = [];
  results.push(
    await countLinks(
      "f3eab373-ff92-4bb8-8e99-6a89c8373f60",
      "UXUI 아티클",
      "링크",
      "제목",
    ),
  );
  results.push(
    await countLinks(
      "7c751f06-80b9-4a72-b769-b1d20a843691",
      "기술&디자인 블로그",
      "링크",
      "제목",
    ),
  );
  results.push(await countLinks(MAIN_DB_ID, "메인 Q&A", "링크", "글 제목 "));

  for (const r of results) {
    console.log(`\n=== ${r.dbName} ===`);
    console.log(
      `전체: ${r.total}개 | 링크 있음: ${r.withLink}개 | 링크있고 본문없음: ${r.blankWithLink}개`,
    );
    if (r.linkEntries.length > 0) {
      console.log("\n링크가 있는 항목:");
      for (const e of r.linkEntries) {
        const status = e.hasContent ? "✅본문있음" : "❌본문없음";
        console.log(`  ${status} | ${e.title} | ${e.link}`);
      }
    }
  }
})();
