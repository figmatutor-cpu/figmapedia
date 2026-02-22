import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();

    if (secret !== process.env.REVALIDATION_SECRET) {
      return Response.json({ error: "Invalid secret" }, { status: 401 });
    }

    revalidateTag("search-index", "default");
    return Response.json({ revalidated: true, timestamp: Date.now() });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
