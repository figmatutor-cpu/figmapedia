import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import {
  embedDocument,
  buildEmbeddingText,
  upsertEmbedding,
} from "@/lib/embeddings";
import { NextRequest } from "next/server";
import type { SearchIndexItem } from "@/types";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ── GET: 게시글 목록 (페이지네이션) ── */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const category = searchParams.get("category");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("community_posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "전체") {
    query = query.eq("category", category);
  }

  const { data: posts, count, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // 각 게시글의 댓글 수 조회
  const postIds = (posts ?? []).map((p) => p.id);
  let commentCounts: Record<string, number> = {};

  if (postIds.length > 0) {
    const { data: counts } = await supabase
      .from("community_comments")
      .select("post_id")
      .in("post_id", postIds);

    if (counts) {
      for (const c of counts) {
        commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
      }
    }
  }

  const postsWithCounts = (posts ?? []).map(({ password_hash: _ph, ...p }) => ({
    ...p,
    comment_count: commentCounts[p.id] || 0,
  }));

  return Response.json({
    posts: postsWithCounts,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

/* ── POST: 게시글 작성 ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, title, content, category, password } = body;

    if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
      return Response.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
    }
    if (nickname.trim().length > 20) {
      return Response.json({ error: "닉네임은 20자 이내로 입력해주세요." }, { status: 400 });
    }
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return Response.json({ error: "제목을 입력해주세요." }, { status: 400 });
    }
    if (title.trim().length > 200) {
      return Response.json({ error: "제목은 200자 이내로 입력해주세요." }, { status: 400 });
    }
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return Response.json({ error: "내용을 입력해주세요." }, { status: 400 });
    }
    if (content.trim().length < 30) {
      return Response.json({ error: "내용은 최소 30자 이상 입력해주세요." }, { status: 400 });
    }
    if (content.trim().length > 10000) {
      return Response.json({ error: "내용은 10000자 이내로 입력해주세요." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.trim().length < 4) {
      return Response.json({ error: "비밀번호는 4자 이상 입력해주세요." }, { status: 400 });
    }

    const password_hash = await hashPassword(password.trim());

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        nickname: nickname.trim(),
        title: title.trim(),
        content: (content ?? "").trim(),
        category: category?.trim() || "일반",
        password_hash,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const { password_hash: _ph, ...safePost } = data;

    // 검색 인덱스 캐시 즉시 갱신
    revalidateTag("search-index", "max");

    // fire-and-forget: 벡터 임베딩 생성 (AI 검색용)
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
        })
      )
      .catch(() => {});

    return Response.json({ post: safePost }, { status: 201 });
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
