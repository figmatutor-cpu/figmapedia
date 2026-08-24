import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

/**
 * On-demand revalidation endpoint.
 * Accepts secret via query param (?secret=xxx) or JSON body ({ secret: "xxx" }).
 * Notion Automation webhook should use the query param approach:
 *   POST https://<domain>/api/revalidate?secret=<REVALIDATION_SECRET>
 */
export async function POST(request: NextRequest) {
  try {
    // Accept secret from query param (for Notion webhook) or JSON body
    let secret = request.nextUrl.searchParams.get("secret");

    if (!secret) {
      try {
        const body = await request.json();
        secret = body.secret ?? null;
      } catch {
        // Body may not be JSON (Notion sends its own payload)
      }
    }

    if (secret !== process.env.REVALIDATION_SECRET) {
      return Response.json({ error: "Invalid secret" }, { status: 401 });
    }

    // Revalidate all cache tags (Next.js 16: second arg required)
    revalidateTag("search-index", "max");
    revalidateTag("section-data", "max");
    // AI 리포트 목록(reports.json)은 Vercel Data Cache에 남아 배포로 갱신되지 않는다.
    // 이 태그가 없으면 새 호가 목록에 뜨기까지 revalidate 600초를 기다려야 한다.
    revalidateTag("ai-report", "max");

    // 임베딩 동기화 트리거 (fire-and-forget)
    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ).trim();
    const syncHeaders = {
      Authorization: `Bearer ${process.env.REVALIDATION_SECRET}`,
      "Content-Type": "application/json",
    };
    fetch(`${baseUrl}/api/embeddings/sync`, {
      method: "POST",
      headers: syncHeaders,
    }).catch(() => {});

    // 썸네일 동기화 트리거 (fire-and-forget)
    fetch(`${baseUrl}/api/thumbnails/sync`, {
      method: "POST",
      headers: syncHeaders,
    }).catch(() => {});

    return Response.json({
      revalidated: true,
      tags: ["search-index", "section-data"],
      syncs: ["embeddings", "thumbnails"],
      timestamp: Date.now(),
    });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
