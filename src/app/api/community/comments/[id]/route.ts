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

/* ── DELETE: 댓글 삭제 (비밀번호 확인) ── */
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

    const { data: comment } = await supabase
      .from("community_comments")
      .select("password_hash")
      .eq("id", id)
      .single();

    if (!comment) {
      return Response.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    if (!comment.password_hash) {
      return Response.json({ error: "이 댓글은 삭제할 수 없습니다." }, { status: 403 });
    }

    const inputHash = await hashPassword(password.trim());
    if (inputHash !== comment.password_hash) {
      return Response.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
    }

    const { error } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
