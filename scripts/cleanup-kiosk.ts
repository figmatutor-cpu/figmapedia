import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  // Storage 정리
  const { data: files } = await supabase.storage
    .from("thumbnails")
    .list("kiosk");
  if (files && files.length > 0) {
    const paths = files.map((f) => "kiosk/" + f.name);
    await supabase.storage.from("thumbnails").remove(paths);
    console.log("Storage 삭제:", paths.length, "개");
  }

  // DB 정리
  const { data, error } = await supabase
    .from("page_thumbnails")
    .delete()
    .like("storage_path", "kiosk/%")
    .select("page_id");
  console.log("DB 삭제:", data?.length ?? 0, "개", error?.message ?? "");
}

main().catch(console.error);
