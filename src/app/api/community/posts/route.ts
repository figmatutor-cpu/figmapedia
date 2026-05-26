import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as adminDb } from "@/lib/supabase";
import { revalidateTag, unstable_cache } from "next/cache";
import {
  embedDocument,
  buildEmbeddingText,
  upsertEmbedding,
} from "@/lib/embeddings";
import { NextRequest } from "next/server";
import type { SearchIndexItem } from "@/types";

/* ── 캐시된 게시글 목록 조회 (공개) ── */
const getCachedPosts = unstable_cache(
  async (page: number, limit: number, category: string | null) => {
    const offset = (page - 1) * limit;

    let query = adminDb
      .from("community_posts")
      .select("*", { count: "exact" })
      .order("is_pinned", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== "전체") {
      query = query.eq("category", category);
    }

    const { data: posts, count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const postIds = (posts ?? []).map((p) => p.id);
    const commentCounts: Record<string, number> = {};

    if (postIds.length > 0) {
      const { data: comments } = await adminDb
        .from("community_comments")
        .select("post_id, id", { count: "exact", head: false })
        .in("post_id", postIds);

      if (comments) {
        for (const c of comments) {
          commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
        }
      }
    }

    const postsWithCounts = (posts ?? []).map(
      ({ password_hash: _ph, ...p }) => ({
        ...p,
        comment_count: commentCounts[p.id] || 0,
      }),
    );

    return {
      posts: postsWithCounts,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  },
  ["community-posts"],
  { revalidate: 60, tags: ["community-posts"] },
);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit")) || 20),
  );
  const category = searchParams.get("category");

  try {
    const data = await getCachedPosts(page, limit, category);
    return Response.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}

/* ── POST: 게시글 작성 (로그인 필수) ── */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const nickname =
    typeof body.nickname === "string" ? body.nickname.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const category =
    typeof body.category === "string" && body.category.trim().length > 0
      ? body.category.trim()
      : "일반";

  if (!nickname) {
    return Response.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
  }
  if (nickname.length > 20) {
    return Response.json(
      { error: "닉네임은 20자 이내로 입력해주세요." },
      { status: 400 },
    );
  }
  if (!title) {
    return Response.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }
  if (title.length > 200) {
    return Response.json(
      { error: "제목은 200자 이내로 입력해주세요." },
      { status: 400 },
    );
  }
  if (content.length < 30) {
    return Response.json(
      { error: "내용은 최소 30자 이상 입력해주세요." },
      { status: 400 },
    );
  }
  if (content.length > 10000) {
    return Response.json(
      { error: "내용은 10000자 이내로 입력해주세요." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      nickname,
      title,
      content,
      category,
    })
    .select()
    .single();

  if (error || !data) {
    return Response.json(
      { error: error?.message ?? "게시글 저장 실패" },
      { status: 500 },
    );
  }

  const { password_hash: _ph, ...safePost } = data;

  revalidateTag("community-posts", "max");
  revalidateTag("search-index", "max");

  const item: SearchIndexItem = {
    id: `community-${data.id}`,
    title: data.title,
    categories: [data.category],
    author: data.nickname,
    link: null,
    publishedDate: data.created_at,
    section: "커뮤니티",
  };
  const embeddingText = buildEmbeddingText(item, data.content ?? "");
  embedDocument(embeddingText)
    .then((embedding) =>
      upsertEmbedding({
        id: item.id,
        section: "커뮤니티",
        title: data.title,
        categories: [data.category],
        fullText: data.content ?? "",
        embedding,
        lastEditedTime: data.created_at,
      }),
    )
    .catch(() => {});

  return Response.json({ post: safePost }, { status: 201 });
}
