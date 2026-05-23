import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabase as adminDb } from "@/lib/supabase";

const VALID_ROLES = ["free", "member", "admin"] as const;
type MemberRole = (typeof VALID_ROLES)[number];

const VALID_SUB_STATUSES = ["active", "cancelled", "past_due"] as const;
type SubStatus = (typeof VALID_SUB_STATUSES)[number];

function isValidRole(v: unknown): v is MemberRole {
  return (
    typeof v === "string" && (VALID_ROLES as readonly string[]).includes(v)
  );
}
function isValidSubStatus(v: unknown): v is SubStatus {
  return (
    typeof v === "string" &&
    (VALID_SUB_STATUSES as readonly string[]).includes(v)
  );
}

async function invalidateUserSessions(userId: string): Promise<boolean> {
  try {
    const { error } = await adminDb
      .schema("auth")
      .from("sessions")
      .delete()
      .eq("user_id", userId);
    if (error) {
      console.warn("[admin/members] session invalidate failed", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[admin/members] session invalidate threw", e);
    return false;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { role, subscription_status, discord_id, cancel_subscription } =
    body as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  let needsSessionInvalidate = false;

  if (role !== undefined) {
    if (!isValidRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (id === auth.user.id && role !== "admin") {
      return NextResponse.json(
        { error: "본인 role은 admin에서 강등할 수 없습니다" },
        { status: 400 },
      );
    }
    update.role = role;
    needsSessionInvalidate = true;
  }

  if (subscription_status !== undefined) {
    if (subscription_status === null) {
      update.subscription_status = null;
    } else if (!isValidSubStatus(subscription_status)) {
      return NextResponse.json(
        { error: "Invalid subscription_status" },
        { status: 400 },
      );
    } else {
      update.subscription_status = subscription_status;
    }
  }

  if (discord_id !== undefined) {
    update.discord_id =
      typeof discord_id === "string" && discord_id.trim().length > 0
        ? discord_id.trim()
        : null;
  }

  if (cancel_subscription === true) {
    update.subscription_status = "cancelled";
    update.cancelled_at = new Date().toISOString();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await adminDb
    .from("members")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sessions_invalidated = false;
  if (needsSessionInvalidate) {
    sessions_invalidated = await invalidateUserSessions(id);
  }

  return NextResponse.json({ member: data, sessions_invalidated });
}
