import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabase as adminDb } from "@/lib/supabase";

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function isValidDate(v: unknown): v is string {
  if (typeof v !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00`);
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
  const {
    title,
    youtube_id,
    recorded_at,
    duration_seconds,
    is_published,
    experiment_id,
  } = body as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    update.title = title.trim();
  }
  if (youtube_id !== undefined) {
    if (typeof youtube_id !== "string" || !YOUTUBE_ID_RE.test(youtube_id)) {
      return NextResponse.json(
        { error: "Invalid youtube_id" },
        { status: 400 },
      );
    }
    update.youtube_id = youtube_id;
  }
  if (recorded_at !== undefined) {
    if (!isValidDate(recorded_at)) {
      return NextResponse.json(
        { error: "recorded_at must be YYYY-MM-DD" },
        { status: 400 },
      );
    }
    update.recorded_at = recorded_at;
  }
  if (duration_seconds !== undefined) {
    if (typeof duration_seconds !== "number" || duration_seconds < 0) {
      return NextResponse.json(
        { error: "Invalid duration_seconds" },
        { status: 400 },
      );
    }
    update.duration_seconds = Math.floor(duration_seconds);
  }
  if (is_published !== undefined) {
    if (typeof is_published !== "boolean") {
      return NextResponse.json(
        { error: "is_published must be boolean" },
        { status: 400 },
      );
    }
    update.is_published = is_published;
  }
  if (experiment_id !== undefined) {
    update.experiment_id =
      typeof experiment_id === "string" && experiment_id.length > 0
        ? experiment_id
        : null;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await adminDb
    .from("vods")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ vod: data });
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

  const { error } = await adminDb.from("vods").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
