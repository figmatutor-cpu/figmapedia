import { createSupabaseServerClient } from "./server";
import type {
  CurrentTopicsResponse,
  Topic,
  TopicWithVotes,
  WeekTopicsResponse,
} from "@/types/topic";

interface TopicRow extends Topic {
  topic_vote_counts: { votes: number } | { votes: number }[] | null;
}

function extractVotes(row: TopicRow): number {
  const v = row.topic_vote_counts;
  if (!v) return 0;
  if (Array.isArray(v)) return v[0]?.votes ?? 0;
  return v.votes ?? 0;
}

function mergeVotes(row: TopicRow): TopicWithVotes {
  const { topic_vote_counts: _unused, ...rest } = row;
  return { ...rest, votes: extractVotes(row) };
}

export async function lazyCloseExpiredVoting(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("close_expired_topic_voting");
  if (error) console.error("[topics] lazy close failed", error);
}

async function fetchActiveWeek(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("experiment_topics")
    .select("week")
    .in("status", ["candidate", "winner"])
    .order("week", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[topics] active week fetch failed", error);
    return null;
  }
  return data?.week ?? null;
}

export async function getCurrentTopics(): Promise<CurrentTopicsResponse> {
  await lazyCloseExpiredVoting();

  const week = await fetchActiveWeek();
  if (!week) {
    return {
      week: null,
      voting_closes_at: null,
      is_closed: false,
      topics: [],
      my_vote_topic_id: null,
      total_votes: 0,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: topicRows, error } = await supabase
    .from("experiment_topics")
    .select(
      `id, week, title, description, status, voting_closes_at,
       created_by, submitted_by, created_at, updated_at,
       topic_vote_counts ( votes )`,
    )
    .eq("week", week)
    .in("status", ["candidate", "winner", "archived"])
    .order("created_at", { ascending: true });

  if (error || !topicRows) {
    console.error("[topics] current topics fetch failed", error);
    return {
      week,
      voting_closes_at: null,
      is_closed: false,
      topics: [],
      my_vote_topic_id: null,
      total_votes: 0,
    };
  }

  const topics = (topicRows as TopicRow[]).map(mergeVotes);
  const total_votes = topics.reduce((sum, t) => sum + t.votes, 0);
  const voting_closes_at = topics[0]?.voting_closes_at ?? null;
  const is_closed = topics.every(
    (t) => t.status === "winner" || t.status === "archived",
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let my_vote_topic_id: string | null = null;
  if (user) {
    const { data: voteRow } = await supabase
      .from("experiment_topic_votes")
      .select("topic_id")
      .eq("user_id", user.id)
      .eq("week", week)
      .maybeSingle();
    my_vote_topic_id = voteRow?.topic_id ?? null;
  }

  return {
    week,
    voting_closes_at,
    is_closed,
    topics,
    my_vote_topic_id,
    total_votes,
  };
}

export async function getTopicsByWeek(
  week: string,
): Promise<WeekTopicsResponse | null> {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("experiment_topics")
    .select(
      `id, week, title, description, status, voting_closes_at,
       created_by, submitted_by, created_at, updated_at,
       topic_vote_counts ( votes )`,
    )
    .eq("week", week)
    .in("status", ["candidate", "winner", "archived"])
    .order("created_at", { ascending: true });

  if (error || !rows || rows.length === 0) return null;

  const topics = (rows as TopicRow[]).map(mergeVotes);
  const total_votes = topics.reduce((sum, t) => sum + t.votes, 0);
  const is_closed = topics.every(
    (t) => t.status === "winner" || t.status === "archived",
  );

  return { week, topics, total_votes, is_closed };
}
