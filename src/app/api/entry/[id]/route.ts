import { fetchEntryById, fetchPageBlocks } from "@/lib/notion";
import { mapNotionPageToEntry, mapNotionBlock } from "@/lib/notion-mapper";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const page = await fetchEntryById(id);
    if (!page) {
      return Response.json(
        { error: "페이지를 찾을 수 없습니다." },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const entry = mapNotionPageToEntry(page);
    const rawBlocks = await fetchPageBlocks(page.id);
    const blocks = rawBlocks.map(mapNotionBlock);

    return Response.json(
      { entry, blocks },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Entry API failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: "페이지 로드에 실패했습니다.", detail: message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
