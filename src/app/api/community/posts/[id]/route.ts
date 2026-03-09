import { supabase } from "@/lib/supabase";
import { revalidateTag, unstable_cache } from "next/cache";
import { deleteEmbedding } from "@/lib/embeddings";
import { NextRequest } from "next/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ── 캐시된 게시글 상세 + 댓글 조회 ── */
const getCachedPostDetail = unstable_cache(
  async (id: string) => {
    const [{ data: post, error: postError }, { data: comments }] =
      await Promise.all([
        supabase
          .from("community_posts")
          .select("*")
          .eq("id", id)
          .single(),
        supabase
          .from("community_comments")
          .select("*")
          .eq("post_id", id)
          .order("created_at", { ascending: true }),
      ]);

    if (postError || !post) {
      return null;
    }

    const { password_hash: _ph, ...safePost } = post;
    const safeComments = (comments ?? []).map(
      ({ password_hash: _cph, ...c }) => c
    );

    return {
      post: { ...safePost, comment_count: safeComments.length },
      comments: safeComments,
    };
  },
  ["community-post-detail"],
  { revalidate: 60, tags: ["community-posts"] },
);

/* ── GET: 게시글 상세 + 댓글 ── */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getCachedPostDetail(id);

  if (!data) {
    return Response.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  return Response.json(data);
}

/* ── DELETE: 게시글 삭제 (비밀번호 확인) ── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return Response.json({ error: "비밀번호를 입력해주세요." }, { status: 400 });
    }

    const { data: post } = await supabase
      .from("community_posts")
      .select("password_hash")
      .eq("id", id)
      .single();

    if (!post) {
      return Response.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }
    if (!post.password_hash) {
      return Response.json({ error: "이 게시글은 삭제할 수 없습니다." }, { status: 403 });
    }

    const inputHash = await hashPassword(password.trim());
    if (inputHash !== post.password_hash) {
      return Response.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
    }

    // 댓글 먼저 삭제 후 게시글 삭제
    await supabase.from("community_comments").delete().eq("post_id", id);
    const { error } = await supabase.from("community_posts").delete().eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // 캐시 갱신 + 임베딩 제거
    revalidateTag("community-posts", "max");
    revalidateTag("search-index", "max");
    deleteEmbedding(`community-${id}`).catch(() => {});

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
