import { NextResponse } from "next/server";
import { getCurrentTopics } from "@/lib/supabase/topics";

export async function GET() {
  const data = await getCurrentTopics();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
