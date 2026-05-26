import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as adminDb } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { readRoleFromJwt } from "@/types/member";

/* ── DELETE: 댓글 삭제 (본인 또는 admin) ── */
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

  const { data: comment } = await adminDb
    .from("community_comments")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (!comment) {
    return Response.json(
      { error: "댓글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const isAdmin = readRoleFromJwt(user.app_metadata) === "admin";
  const isOwner = comment.user_id === user.id;
  if (!isOwner && !isAdmin) {
    return Response.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await adminDb
    .from("community_comments")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidateTag("community-posts", "max");

  return Response.json({ success: true });
}
