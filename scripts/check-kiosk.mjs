import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const KIOSK_DB = "78378389-9edb-4721-9763-1d38d8881654";
const NOTION_API_KEY = process.env.NOTION_API_KEY;

// Notion에서 키오스크 전체 fetch
let pages = [];
let cursor;
do {
  const body = cursor ? { start_cursor: cursor } : {};
  const res = await fetch(
    `https://api.notion.com/v1/databases/${KIOSK_DB}/query`,
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
  const data = await res.json();
  pages.push(...data.results);
  cursor = data.has_more ? data.next_cursor : null;
} while (cursor);

console.log("Total kiosk pages:", pages.length);

let withCover = 0,
  withoutCover = 0;
for (const p of pages) {
  if (p.cover) withCover++;
  else withoutCover++;
}
console.log("With cover:", withCover, "/ Without cover:", withoutCover);

// Supabase 캐시 확인
const kioskIds = pages.map((p) => p.id);
const { data: cached } = await supabase
  .from("page_thumbnails")
  .select("page_id, source_type")
  .in("page_id", kioskIds);
console.log("Cached in Supabase:", (cached || []).length);

const cachedSet = new Set((cached || []).map((r) => r.page_id));
const missing = kioskIds.filter((id) => !cachedSet.has(id));
console.log("Missing from Supabase:", missing.length);

const types = {};
(cached || []).forEach((r) => {
  types[r.source_type] = (types[r.source_type] || 0) + 1;
});
console.log("Cached types:", JSON.stringify(types));

// 누락된 페이지 상세
if (missing.length > 0) {
  console.log("\n--- Missing pages (first 10) ---");
  for (const id of missing.slice(0, 10)) {
    const p = pages.find((pg) => pg.id === id);
    const title =
      p?.properties?.["키오스크명"]?.title?.map((t) => t.plain_text).join("") ||
      "(no title)";
    console.log(`  ${id} | cover=${p?.cover?.type || "none"} | ${title}`);
  }
}
