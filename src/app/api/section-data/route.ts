import { getCachedSectionData, type SectionKey } from "@/lib/section-data-cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") as SectionKey | null;

    const allData = await getCachedSectionData();

    if (section && section in allData) {
      return Response.json(
        { items: allData[section] },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Return all sections
    return Response.json(allData, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to fetch section data:", error);
    return Response.json(
      { error: "Failed to fetch section data" },
      { status: 500 }
    );
  }
}
