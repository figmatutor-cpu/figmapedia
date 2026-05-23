import dotenv from "dotenv";
import { readFileSync } from "fs";
dotenv.config({ path: ".env.local" });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const MAIN_DB_ID = process.env.NOTION_DATABASE_ID;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function queryNotionDB(dbId, body = {}, retries = 5) {
  for (let i = 0; i < retries; i++) {
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
      },
    );
    if (res.status === 429) {
      console.log(`  Rate limited, waiting ${5 * (i + 1)}s...`);
      await sleep(5000 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(`Notion API error ${res.status}`);
    return res.json();
  }
  throw new Error("Rate limit exceeded after retries");
}

async function fetchAllIds(dbId) {
  const ids = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await queryNotionDB(dbId, body);
    for (const page of res.results) ids.push(page.id);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return ids;
}

const SECTION_DB_IDS = {
  prompt: "287fdea8-0034-81e6-87b8-ce36c9329d55",
  kiosk: "78378389-9edb-4721-9763-1d38d8881654",
  uxuiArticles: "f3eab373-ff92-4bb8-8e99-6a89c8373f60",
  techBlogs: "7c751f06-80b9-4a72-b769-b1d20a843691",
  uxuiTerms: "c042287e-f2d1-4ee6-bac9-062e5fc338a4",
  macShortcuts: "11a4cfa7-90a1-4291-aa1c-646286b7b53d",
  winShortcuts: "df06f1d5-fca8-45bb-873f-c52ba79dd5bb",
  plugins: "ddc8b180-7f6c-439a-ac53-3f51868d34db",
  figmaGlossary: "3fe4b917-e6fb-4f0d-8e25-32fcf30c56c1",
};

// Parse CSV
const csv = readFileSync("테이블2.csv", "utf-8");
const csvIds = new Set();
for (const line of csv.split("\n").slice(1)) {
  const match = line.match(/entry\/([a-f0-9-]+)/);
  if (match) csvIds.add(match[1]);
}

console.log(`CSV에 있는 entry URL 수: ${csvIds.size}`);

(async () => {
  // Fetch all DB IDs
  const allIds = new Map();

  console.log("\n=== Notion DB별 페이지 수 ===");
  const mainIds = await fetchAllIds(MAIN_DB_ID);
  console.log(`메인 Q&A: ${mainIds.length}개`);
  mainIds.forEach((id) => allIds.set(id, "메인 Q&A"));

  for (const [key, dbId] of Object.entries(SECTION_DB_IDS)) {
    const ids = await fetchAllIds(dbId);
    console.log(`${key}: ${ids.length}개`);
    ids.forEach((id) => allIds.set(id, key));
  }

  console.log(`\n전체 Notion 페이지 수: ${allIds.size}`);

  // Cross-reference
  const inCsvNotInNotion = [];
  const inCsvAndInNotion = [];
  for (const csvId of csvIds) {
    if (allIds.has(csvId)) {
      inCsvAndInNotion.push({ id: csvId, db: allIds.get(csvId) });
    } else {
      inCsvNotInNotion.push(csvId);
    }
  }

  const inNotionNotInCsv = [];
  for (const [notionId, db] of allIds) {
    if (!csvIds.has(notionId)) {
      inNotionNotInCsv.push({ id: notionId, db });
    }
  }

  console.log(`\n=== 대조 결과 ===`);
  console.log(`CSV에 있고 Notion에도 있음: ${inCsvAndInNotion.length}개`);
  console.log(`CSV에 있지만 Notion에 없음: ${inCsvNotInNotion.length}개`);
  console.log(`Notion에 있지만 CSV에 없음: ${inNotionNotInCsv.length}개`);

  // DB별 분포
  const dbCounts = {};
  for (const { db } of inCsvAndInNotion) {
    dbCounts[db] = (dbCounts[db] || 0) + 1;
  }
  console.log(`\n=== CSV 미색인 페이지의 DB별 분포 ===`);
  for (const [db, count] of Object.entries(dbCounts).sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(`  ${db}: ${count}개`);
  }

  if (inCsvNotInNotion.length > 0) {
    console.log(`\n=== CSV에 있지만 Notion에 없는 ID (삭제된 페이지?) ===`);
    for (const id of inCsvNotInNotion.slice(0, 10)) {
      console.log(`  ${id}`);
    }
    if (inCsvNotInNotion.length > 10)
      console.log(`  ... 외 ${inCsvNotInNotion.length - 10}개`);
  }
})();
