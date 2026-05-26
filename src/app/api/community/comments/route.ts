import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as adminDb } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

/* ── POST: 댓글 작성 (로그인 필수) ── */
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

  const post_id = typeof body.post_id === "string" ? body.post_id : "";
  const nickname =
    typeof body.nickname === "string" ? body.nickname.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!post_id) {
    return Response.json({ error: "잘못된 게시글입니다." }, { status: 400 });
  }
  if (!nickname) {
    return Response.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
  }
  if (nickname.length > 20) {
    return Response.json(
      { error: "닉네임은 20자 이내로 입력해주세요." },
      { status: 400 },
    );
  }
  if (!content) {
    return Response.json(
      { error: "댓글 내용을 입력해주세요." },
      { status: 400 },
    );
  }
  if (content.length > 2000) {
    return Response.json(
      { error: "댓글은 2000자 이내로 입력해주세요." },
      { status: 400 },
    );
  }

  const { data: post } = await adminDb
    .from("community_posts")
    .select("id")
    .eq("id", post_id)
    .maybeSingle();
  if (!post) {
    return Response.json(
      { error: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { data, error } = await supabase
    .from("community_comments")
    .insert({
      post_id,
      user_id: user.id,
      nickname,
      content,
    })
    .select()
    .single();

  if (error || !data) {
    return Response.json(
      { error: error?.message ?? "댓글 저장 실패" },
      { status: 500 },
    );
  }

  const { password_hash: _ph, ...safeComment } = data;

  revalidateTag("community-posts", "max");

  return Response.json({ comment: safeComment }, { status: 201 });
}
