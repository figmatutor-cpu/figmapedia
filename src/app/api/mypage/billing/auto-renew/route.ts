import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const { enabled } = body as Record<string, unknown>;
  if (typeof enabled !== "boolean") {
    return NextResponse.json(
      { error: "enabled must be boolean" },
      { status: 400 },
    );
  }

  const { data: member, error: fetchError } = await supabase
    .from("members")
    .select("plan_type")
    .eq("id", user.id)
    .maybeSingle();
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!member?.plan_type) {
    return NextResponse.json(
      { error: "활성 구독이 없습니다" },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = enabled
    ? { subscription_status: "active", cancelled_at: null }
    : {
        subscription_status: "cancelled",
        cancelled_at: new Date().toISOString(),
      };

  const { error: updateError } = await supabase
    .from("members")
    .update(update)
    .eq("id", user.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, enabled });
}
