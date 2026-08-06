import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";
import { getPublishedIssue, issueCommentKey } from "@/lib/ai-report";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** ?issue=1 → 1 (유효하지 않으면 null) */
function parseIssue(value: string | null): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

/* ── GET: 호별 댓글 목록 ── */
export async function GET(request: NextRequest) {
  const issue = parseIssue(request.nextUrl.searchParams.get("issue"));
  if (issue === null) {
    return Response.json({ error: "잘못된 호수입니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("community_comments")
    .select("id, post_id, nickname, content, created_at")
    .eq("post_id", issueCommentKey(issue))
    .order("created_at", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ comments: data ?? [] });
}

/* ── POST: 댓글 작성 ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issue: rawIssue, nickname, content, password } = body;

    const issue = parseIssue(String(rawIssue));
    if (issue === null) {
      return Response.json({ error: "잘못된 호수입니다." }, { status: 400 });
    }

    // 발행되지 않은 호에는 댓글을 달 수 없다
    const report = await getPublishedIssue(issue);
    if (!report) {
      return Response.json(
        { error: "리포트를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (
      !nickname ||
      typeof nickname !== "string" ||
      nickname.trim().length === 0
    ) {
      return Response.json(
        { error: "닉네임을 입력해주세요." },
        { status: 400 },
      );
    }
    if (nickname.trim().length > 20) {
      return Response.json(
        { error: "닉네임은 20자 이내로 입력해주세요." },
        { status: 400 },
      );
    }
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return Response.json(
        { error: "댓글 내용을 입력해주세요." },
        { status: 400 },
      );
    }
    if (content.trim().length > 2000) {
      return Response.json(
        { error: "댓글은 2000자 이내로 입력해주세요." },
        { status: 400 },
      );
    }
    if (
      !password ||
      typeof password !== "string" ||
      password.trim().length < 4
    ) {
      return Response.json(
        { error: "비밀번호는 4자 이상 입력해주세요." },
        { status: 400 },
      );
    }

    const password_hash = await hashPassword(password.trim());

    const { data, error } = await supabase
      .from("community_comments")
      .insert({
        post_id: issueCommentKey(issue),
        nickname: nickname.trim(),
        content: content.trim(),
        password_hash,
      })
      .select("id, post_id, nickname, content, created_at")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ comment: data }, { status: 201 });
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
