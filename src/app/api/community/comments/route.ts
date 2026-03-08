import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ── POST: 댓글 작성 ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, nickname, content, password } = body;

    if (!post_id || typeof post_id !== "string") {
      return Response.json({ error: "잘못된 게시글입니다." }, { status: 400 });
    }
    if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
      return Response.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
    }
    if (nickname.trim().length > 20) {
      return Response.json({ error: "닉네임은 20자 이내로 입력해주세요." }, { status: 400 });
    }
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return Response.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
    }
    if (content.trim().length > 2000) {
      return Response.json({ error: "댓글은 2000자 이내로 입력해주세요." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.trim().length < 4) {
      return Response.json({ error: "비밀번호는 4자 이상 입력해주세요." }, { status: 400 });
    }

    // 게시글 존재 확인
    const { data: post } = await supabase
      .from("community_posts")
      .select("id")
      .eq("id", post_id)
      .single();

    if (!post) {
      return Response.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    const password_hash = await hashPassword(password.trim());

    const { data, error } = await supabase
      .from("community_comments")
      .insert({
        post_id,
        nickname: nickname.trim(),
        content: content.trim(),
        password_hash,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ comment: data }, { status: 201 });
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
