import "dotenv/config";
import { Client } from "@notionhq/client";
import { createClient } from "@supabase/supabase-js";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const missingIds = [
  "270fdea8-0034-8046-b8fa-d5854da91f21",
  "27dfdea8-0034-80ee-8d05-cbfb77bb7a55",
  "295fdea8-0034-80b8-996f-fd903a4db451",
  "2aefdea8-0034-8062-bb36-e5e8e46e639c",
  "2b5fdea8-0034-8036-8ff4-e8f6abe4234b",
  "2cbfdea8-0034-801b-b4fb-d7e86b80f739",
  "2cbfdea8-0034-80a0-aa73-f602e0073dff",
  "2f1fdea8-0034-8044-8e35-da7c8ba317cd",
  "2fbfdea8-0034-80e1-8c1d-e0605fae490b",
];

for (const pageId of missingIds) {
  console.log(`\n--- ${pageId} ---`);
  try {
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    const types = blocks.results.map((b) => b.type);
    const imageBlocks = blocks.results.filter((b) => b.type === "image");
    console.log(
      `  Block count: ${blocks.results.length}, has_more: ${blocks.has_more}`,
    );
    console.log(`  Block types: ${[...new Set(types)].join(", ")}`);
    console.log(`  Image blocks: ${imageBlocks.length}`);

    // 중첩 블록 확인 (column_list, synced_block 등)
    const nestedTypes = [
      "column_list",
      "column",
      "synced_block",
      "toggle",
      "callout",
    ];
    const nested = blocks.results.filter((b) => nestedTypes.includes(b.type));
    if (nested.length > 0) {
      console.log(
        `  Nested containers: ${nested.map((b) => b.type).join(", ")}`,
      );
      // 첫 번째 중첩 블록 안에서 이미지 검색
      for (const nb of nested.slice(0, 3)) {
        try {
          const children = await notion.blocks.children.list({
            block_id: nb.id,
            page_size: 50,
          });
          const childImages = children.results.filter(
            (b) => b.type === "image",
          );
          const childNested = children.results.filter((b) =>
            nestedTypes.includes(b.type),
          );
          console.log(
            `    -> ${nb.type} (${nb.id.slice(0, 8)}): ${children.results.length} children, ${childImages.length} images`,
          );
          // column_list 안에 column 안에 이미지
          for (const cn of childNested.slice(0, 3)) {
            const grandchildren = await notion.blocks.children.list({
              block_id: cn.id,
              page_size: 50,
            });
            const gcImages = grandchildren.results.filter(
              (b) => b.type === "image",
            );
            console.log(
              `      -> ${cn.type} (${cn.id.slice(0, 8)}): ${grandchildren.results.length} children, ${gcImages.length} images`,
            );
          }
        } catch (e) {
          console.log(`    -> Error: ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}
