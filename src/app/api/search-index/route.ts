import { getCachedSearchIndex } from "@/lib/search-index-cache";

export async function GET() {
  try {
    const index = await getCachedSearchIndex();
    return Response.json(index, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to fetch search index:", error);
    return Response.json(
      { error: "Failed to fetch search index" },
      { status: 500 }
    );
  }
}
