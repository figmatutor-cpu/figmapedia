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

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
  }

  const { data, error } = await adminDb
    .from("vods")
    .select(
      "id, youtube_id, title, recorded_at, experiment_id, duration_seconds, is_published, created_at",
    )
    .order("recorded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { vods: data ?? [] },
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
  const {
    youtube_id,
    title,
    recorded_at,
    experiment_id,
    duration_seconds,
    is_published,
  } = body as Record<string, unknown>;

  if (typeof youtube_id !== "string" || !YOUTUBE_ID_RE.test(youtube_id)) {
    return NextResponse.json(
      { error: "youtube_id는 11자리 영문/숫자/_/- 형식이어야 합니다" },
      { status: 400 },
    );
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!isValidDate(recorded_at)) {
    return NextResponse.json(
      { error: "recorded_at must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const insertData: Record<string, unknown> = {
    youtube_id,
    title: title.trim(),
    recorded_at,
    is_published: is_published === false ? false : true,
  };
  if (typeof experiment_id === "string" && experiment_id.length > 0) {
    insertData.experiment_id = experiment_id;
  }
  if (typeof duration_seconds === "number" && duration_seconds > 0) {
    insertData.duration_seconds = Math.floor(duration_seconds);
  }

  const { data, error } = await adminDb
    .from("vods")
    .insert(insertData)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ vod: data }, { status: 201 });
}
