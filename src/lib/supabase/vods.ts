import { createSupabaseServerClient } from "./server";

export interface VodMeta {
  id: string;
  youtube_id: string;
  title: string;
  recorded_at: string;
  experiment_id: string | null;
  duration_seconds: number | null;
}

export async function getPublishedVods(limit = 20): Promise<VodMeta[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vods")
    .select(
      "id, youtube_id, title, recorded_at, experiment_id, duration_seconds",
    )
    .eq("is_published", true)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[vods] fetch failed", error);
    return [];
  }
  return data ?? [];
}

export async function getVodById(id: string): Promise<VodMeta | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vods")
    .select(
      "id, youtube_id, title, recorded_at, experiment_id, duration_seconds",
    )
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("[vods] fetch by id failed", error);
    return null;
  }
  return data;
}
