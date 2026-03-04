import { TaskType } from "@google/generative-ai";
import { genAI, EMBEDDING_MODEL } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import type { SearchIndexItem, EmbeddingMatch } from "@/types";

/* ── Embedding Generation ── */

const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

async function embedText(text: string, taskType: TaskType): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType,
  });
  return result.embedding.values;
}

export async function embedQuery(text: string): Promise<number[]> {
  return embedText(text, TaskType.RETRIEVAL_QUERY);
}

export async function embedDocument(text: string): Promise<number[]> {
  return embedText(text, TaskType.RETRIEVAL_DOCUMENT);
}

/**
 * 임베딩에 사용할 텍스트 조합.
 * "섹션 | 제목 | 카테고리 | 본문" 형태로 구성하여
 * 임베딩 모델이 문맥을 이해할 수 있도록 함.
 */
const MAX_EMBEDDING_CHARS = 8000;

export function buildEmbeddingText(
  item: SearchIndexItem,
  fullText: string
): string {
  const parts = [
    item.section ?? "",
    item.title,
    item.categories.join(", "),
    item.shortcut ?? "",
    fullText,
  ].filter(Boolean);

  return parts.join(" | ").slice(0, MAX_EMBEDDING_CHARS);
}

/* ── Supabase Operations ── */

export async function upsertEmbedding(data: {
  id: string;
  section: string;
  title: string;
  categories: string[];
  fullText: string;
  embedding: number[];
  lastEditedTime: string;
}): Promise<void> {
  const { error } = await supabase.from("embeddings").upsert(
    {
      id: data.id,
      section: data.section,
      title: data.title,
      categories: data.categories,
      full_text: data.fullText,
      embedding: JSON.stringify(data.embedding),
      last_edited_time: data.lastEditedTime,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
}

export async function deleteEmbedding(id: string): Promise<void> {
  const { error } = await supabase.from("embeddings").delete().eq("id", id);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
}

export async function searchSimilar(
  queryEmbedding: number[],
  matchCount = 20
): Promise<EmbeddingMatch[]> {
  const { data, error } = await supabase.rpc("match_embeddings", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: matchCount,
    similarity_threshold: 0.3,
  });

  if (error) throw new Error(`Supabase search failed: ${error.message}`);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    section: row.section,
    title: row.title,
    categories: row.categories ?? [],
    fullText: row.full_text ?? "",
    similarity: row.similarity,
  }));
}

export async function getAllEmbeddingIds(): Promise<
  { id: string; lastEditedTime: string }[]
> {
  const { data, error } = await supabase
    .from("embeddings")
    .select("id, last_edited_time");

  if (error) throw new Error(`Supabase query failed: ${error.message}`);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    lastEditedTime: row.last_edited_time,
  }));
}
