import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabase as adminDb } from "@/lib/supabase";

const VALID_STATUSES = ["candidate", "winner", "archived", "rejected"] as const;
type TopicStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(v: unknown): v is TopicStatus {
  return (
    typeof v === "string" && (VALID_STATUSES as readonly string[]).includes(v)
  );
}

function isValidTimestamp(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
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
  const { status, title, description, voting_closes_at } = body as Record<
    string,
    unknown
  >;

  const update: Record<string, unknown> = {};
  if (status !== undefined) {
    if (!isValidStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = status;
  }
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    update.title = title.trim();
  }
  if (description !== undefined) {
    update.description =
      typeof description === "string" && description.trim().length > 0
        ? description.trim()
        : null;
  }
  if (voting_closes_at !== undefined) {
    if (!isValidTimestamp(voting_closes_at)) {
      return NextResponse.json(
        { error: "Invalid voting_closes_at" },
        { status: 400 },
      );
    }
    update.voting_closes_at = voting_closes_at;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await adminDb
    .from("experiment_topics")
    .select("id, week, status")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await adminDb
    .from("experiment_topics")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (update.status === "winner") {
    const { error: archiveError } = await adminDb
      .from("experiment_topics")
      .update({ status: "archived" })
      .eq("week", existing.week)
      .eq("status", "candidate")
      .neq("id", id);
    if (archiveError) {
      console.error("[admin/topics] auto-archive failed", archiveError);
    }
  }

  return NextResponse.json({ topic: data });
}

export async function DELETE(
  _request: NextRequest,
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

  const { error } = await adminDb
    .from("experiment_topics")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
