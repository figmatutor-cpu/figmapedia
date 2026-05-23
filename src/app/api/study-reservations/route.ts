import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isPaidRole, readRoleFromJwt } from "@/types/member";
import { TIME_SLOTS, type TimeSlot } from "@/types/reservation";

async function requireMember() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false as const,
      error: { status: 401, message: "Unauthorized" },
    };
  }
  const role = readRoleFromJwt(user.app_metadata);
  if (!isPaidRole(role)) {
    return {
      ok: false as const,
      error: { status: 403, message: "Member only" },
    };
  }
  return { ok: true as const, supabase, user };
}

function isValidTimeSlot(v: unknown): v is TimeSlot {
  return typeof v === "string" && (TIME_SLOTS as string[]).includes(v);
}

function isValidDate(v: unknown): v is string {
  if (typeof v !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

export async function GET() {
  const result = await requireMember();
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.status },
    );
  }
  const { supabase, user } = result;

  const { data, error } = await supabase
    .from("study_reservations")
    .select("id, user_id, reserved_at, time_slot, status, note, created_at")
    .eq("user_id", user.id)
    .order("reserved_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { reservations: data ?? [] },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const result = await requireMember();
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.status },
    );
  }
  const { supabase, user } = result;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { reserved_at, time_slot, note } = body as Record<string, unknown>;

  if (!isValidDate(reserved_at)) {
    return NextResponse.json(
      { error: "reserved_at must be YYYY-MM-DD" },
      { status: 400 },
    );
  }
  if (!isValidTimeSlot(time_slot)) {
    return NextResponse.json({ error: "Invalid time_slot" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${reserved_at}T00:00:00`);
  if (target.getTime() < today.getTime()) {
    return NextResponse.json(
      { error: "예약은 오늘 이후 날짜만 가능합니다" },
      { status: 400 },
    );
  }

  const noteValue =
    typeof note === "string" && note.trim().length > 0
      ? note.trim().slice(0, 500)
      : null;

  const { data, error } = await supabase
    .from("study_reservations")
    .insert({
      user_id: user.id,
      reserved_at,
      time_slot,
      status: "pending",
      note: noteValue,
    })
    .select("id, user_id, reserved_at, time_slot, status, note, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "해당 시간대는 이미 예약되어 있습니다" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reservation: data }, { status: 201 });
}
