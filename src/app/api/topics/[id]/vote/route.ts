import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAuth() {
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
  return { ok: true as const, supabase, user };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
  }
  const { supabase, user } = auth;
  const { id: topicId } = await params;

  const { data: topic, error: topicError } = await supabase
    .from("experiment_topics")
    .select("id, week, status, voting_closes_at")
    .eq("id", topicId)
    .maybeSingle();

  if (topicError) {
    return NextResponse.json({ error: topicError.message }, { status: 500 });
  }
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }
  if (topic.status !== "candidate") {
    return NextResponse.json(
      { error: "투표가 마감된 주제입니다" },
      { status: 409 },
    );
  }
  if (new Date(topic.voting_closes_at).getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "투표 마감 시각이 지났습니다" },
      { status: 409 },
    );
  }

  const { error: deleteError } = await supabase
    .from("experiment_topic_votes")
    .delete()
    .eq("user_id", user.id)
    .eq("week", topic.week);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { error: insertError } = await supabase
    .from("experiment_topic_votes")
    .insert({
      topic_id: topicId,
      user_id: user.id,
      week: topic.week,
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(
    { topic_id: topicId, week: topic.week },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
  }
  const { supabase, user } = auth;
  const { id: topicId } = await params;

  const { data: topic } = await supabase
    .from("experiment_topics")
    .select("status")
    .eq("id", topicId)
    .maybeSingle();
  if (topic && topic.status !== "candidate") {
    return NextResponse.json(
      { error: "마감된 주제의 표는 취소할 수 없습니다" },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("experiment_topic_votes")
    .delete()
    .eq("topic_id", topicId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
