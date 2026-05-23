import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data, error } = await supabase
  .from("community_posts")
  .select("id, title, is_pinned, pin_label")
  .ilike("title", "%피그마 피디아 운영 가이드%");

if (error) {
  console.error("검색 에러:", error);
  process.exit(1);
}
console.log("검색 결과:", JSON.stringify(data, null, 2));

if (!data || data.length === 0) {
  console.log("게시글을 찾을 수 없습니다.");
  process.exit(1);
}

const postId = data[0].id;
const { data: updated, error: updateErr } = await supabase
  .from("community_posts")
  .update({ is_pinned: true, pin_label: "공지" })
  .eq("id", postId)
  .select("id, title, is_pinned, pin_label")
  .single();

if (updateErr) {
  console.error("업데이트 에러:", updateErr);
  process.exit(1);
}
console.log("업데이트 완료:", JSON.stringify(updated, null, 2));
