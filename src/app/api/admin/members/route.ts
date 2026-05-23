import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabase as adminDb } from "@/lib/supabase";

const VALID_ROLES = ["free", "member", "admin"] as const;

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
  }

  const url = request.nextUrl;
  const role = url.searchParams.get("role");
  const q = url.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? 50), 1),
    200,
  );

  let query = adminDb
    .from("members")
    .select(
      `id, role, plan_type, subscription_status, subscribed_at,
       next_billing_at, expires_at, cancelled_at, discord_id,
       created_at, updated_at`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (role && (VALID_ROLES as readonly string[]).includes(role)) {
    query = query.eq("role", role);
  }

  const { data: members, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!members) {
    return NextResponse.json({ members: [] });
  }

  const ids = members.map((m) => m.id);
  let emails: Record<string, { email: string | null; created_at: string }> = {};
  if (ids.length > 0) {
    const { data: usersData, error: usersError } = await adminDb
      .schema("auth")
      .from("users")
      .select("id, email, created_at")
      .in("id", ids);
    if (!usersError && usersData) {
      emails = Object.fromEntries(
        usersData.map((u) => [
          u.id,
          { email: u.email, created_at: u.created_at },
        ]),
      );
    }
  }

  let rows = members.map((m) => ({
    ...m,
    email: emails[m.id]?.email ?? null,
    auth_created_at: emails[m.id]?.created_at ?? null,
  }));

  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((r) => r.email?.toLowerCase().includes(needle));
  }

  return NextResponse.json(
    { members: rows, count: rows.length },
    { headers: { "Cache-Control": "no-store" } },
  );
}
