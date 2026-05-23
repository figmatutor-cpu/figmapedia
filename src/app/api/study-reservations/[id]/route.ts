import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isPaidRole, readRoleFromJwt } from "@/types/member";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = readRoleFromJwt(user.app_metadata);
  if (!isPaidRole(role)) {
    return NextResponse.json({ error: "Member only" }, { status: 403 });
  }

  const { id } = await params;

  const { data: existing, error: fetchError } = await supabase
    .from("study_reservations")
    .select("id, user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (existing.status === "cancelled") {
    return NextResponse.json({ reservation: existing }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("study_reservations")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, user_id, reserved_at, time_slot, status, note, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reservation: data });
}
