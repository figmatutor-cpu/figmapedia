import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as adminDb } from "@/lib/supabase";
import { revalidateTag, unstable_cache } from "next/cache";
import { deleteEmbedding } from "@/lib/embeddings";
import { NextRequest } from "next/server";
import { readRoleFromJwt } from "@/types/member";

/* ── 캐시된 게시글 상세 + 댓글 조회 (공개) ── */
const getCachedPostDetail = unstable_cache(
  async (id: string) => {
    const [{ data: post, error: postError }, { data: comments }] =
      await Promise.all([
        adminDb.from("community_posts").select("*").eq("id", id).single(),
        adminDb
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
      ({ password_hash: _cph, ...c }) => c,
    );

    return {
      post: { ...safePost, comment_count: safeComments.length },
      comments: safeComments,
    };
  },
  ["community-post-detail"],
  { revalidate: 60, tags: ["community-posts"] },
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await getCachedPostDetail(id);

  if (!data) {
    return Response.json(
      { error: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return Response.json(data);
}

/* ── DELETE: 게시글 삭제 (본인 또는 admin) ── */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: post } = await adminDb
    .from("community_posts")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (!post) {
    return Response.json(
      { error: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const isAdmin = readRoleFromJwt(user.app_metadata) === "admin";
  const isOwner = post.user_id === user.id;
  if (!isOwner && !isAdmin) {
    return Response.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }

  await adminDb.from("community_comments").delete().eq("post_id", id);
  const { error } = await adminDb.from("community_posts").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidateTag("community-posts", "max");
  revalidateTag("search-index", "max");
  deleteEmbedding(`community-${id}`).catch(() => {});

  return Response.json({ success: true });
}
