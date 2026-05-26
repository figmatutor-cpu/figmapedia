import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_LEN = 64;

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { discord_id } = body as Record<string, unknown>;

  let normalized: string | null = null;
  if (typeof discord_id === "string" && discord_id.trim().length > 0) {
    const v = discord_id.trim();
    if (v.length > MAX_LEN) {
      return NextResponse.json(
        { error: `discord_id는 ${MAX_LEN}자 이하여야 합니다` },
        { status: 400 },
      );
    }
    normalized = v;
  } else if (discord_id !== null) {
    return NextResponse.json(
      { error: "discord_id must be string or null" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("members")
    .update({ discord_id: normalized })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, discord_id: normalized });
}
