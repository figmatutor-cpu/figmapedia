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

    return Response.json({
      revalidated: true,
      tags: ["search-index", "section-data"],
      timestamp: Date.now(),
    });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
