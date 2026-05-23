import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabase as adminDb } from "@/lib/supabase";

function isValidDate(v: unknown): v is string {
  if (typeof v !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

function isValidTimestamp(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
  }

  const status = request.nextUrl.searchParams.get("status");

  let query = adminDb
    .from("experiment_topics")
    .select(
      `id, week, title, description, status, voting_closes_at,
       created_by, submitted_by, created_at, updated_at,
       topic_vote_counts ( votes )`,
    )
    .order("week", { ascending: false })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { topics: data ?? [] },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
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
  const { week, title, description, voting_closes_at } = body as Record<
    string,
    unknown
  >;

  if (!isValidDate(week)) {
    return NextResponse.json(
      { error: "week must be YYYY-MM-DD" },
      { status: 400 },
    );
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!isValidTimestamp(voting_closes_at)) {
    return NextResponse.json(
      { error: "voting_closes_at must be ISO timestamp" },
      { status: 400 },
    );
  }

  const desc =
    typeof description === "string" && description.trim().length > 0
      ? description.trim()
      : null;

  const { data, error } = await adminDb
    .from("experiment_topics")
    .insert({
      week,
      title: title.trim(),
      description: desc,
      voting_closes_at,
      status: "candidate",
      created_by: auth.user.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ topic: data }, { status: 201 });
}
