import { NextResponse, type NextRequest } from "next/server";
import { getTopicsByWeek } from "@/lib/supabase/topics";

function isValidWeek(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ week: string }> },
) {
  const { week } = await params;
  if (!isValidWeek(week)) {
    return NextResponse.json(
      { error: "week must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const data = await getTopicsByWeek(week);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
