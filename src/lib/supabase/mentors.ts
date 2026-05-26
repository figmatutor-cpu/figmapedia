import { createSupabaseServerClient } from "./server";
import type {
  CareerEntry,
  Mentor,
  MentorReview,
  MentorSession,
  MentorWithStats,
} from "@/types/mentor";

interface MemberRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  mentor_title: string | null;
  mentor_intro: string | null;
  specialties: string[] | null;
  career: unknown;
  live_count: number | null;
  archive_count: number | null;
}

interface StatsRow {
  mentor_id: string;
  completed_sessions: number | null;
  review_count: number | null;
  avg_rating: number | string | null;
  upcoming_sessions: number | null;
}

function parseCareer(raw: unknown): CareerEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (v): v is Record<string, unknown> => typeof v === "object" && v !== null,
    )
    .map((v) => ({
      title: String(v.title ?? ""),
      company: String(v.company ?? ""),
      period: String(v.period ?? ""),
    }))
    .filter((c) => c.title || c.company);
}

function toMentor(row: MemberRow): Mentor {
  return {
    id: row.id,
    display_name: row.display_name ?? "이름 미입력 멘토",
    avatar_url: row.avatar_url,
    mentor_title: row.mentor_title,
    mentor_intro: row.mentor_intro,
    specialties: row.specialties ?? [],
    career: parseCareer(row.career),
    live_count: row.live_count ?? 0,
    archive_count: row.archive_count ?? 0,
  };
}

function mergeStats(mentor: Mentor, stats?: StatsRow): MentorWithStats {
  const rating =
    typeof stats?.avg_rating === "string"
      ? Number(stats.avg_rating)
      : (stats?.avg_rating ?? 0);
  return {
    ...mentor,
    completed_sessions: stats?.completed_sessions ?? 0,
    review_count: stats?.review_count ?? 0,
    avg_rating: Number.isFinite(rating) ? Number(rating) : 0,
    upcoming_sessions: stats?.upcoming_sessions ?? 0,
  };
}

export async function getActiveMentors(): Promise<MentorWithStats[]> {
  const supabase = await createSupabaseServerClient();
  try {
    const [membersRes, statsRes] = await Promise.all([
      supabase
        .from("mentor_public_profiles")
        .select(
          "id, display_name, avatar_url, mentor_title, mentor_intro, specialties, career, live_count, archive_count",
        )
        .order("display_name", { ascending: true }),
      supabase.from("mentor_stats").select("*"),
    ]);
    if (membersRes.error) throw membersRes.error;
    const stats = new Map<string, StatsRow>(
      ((statsRes.data ?? []) as StatsRow[]).map((s) => [s.mentor_id, s]),
    );
    return (membersRes.data ?? []).map((m) =>
      mergeStats(toMentor(m as MemberRow), stats.get(m.id)),
    );
  } catch (e) {
    console.warn("[mentors] table not ready — run migration 0004", e);
    return [];
  }
}

export async function getMentorById(
  id: string,
): Promise<MentorWithStats | null> {
  const supabase = await createSupabaseServerClient();
  try {
    const [memberRes, statsRes] = await Promise.all([
      supabase
        .from("mentor_public_profiles")
        .select(
          "id, display_name, avatar_url, mentor_title, mentor_intro, specialties, career, live_count, archive_count",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("mentor_stats")
        .select("*")
        .eq("mentor_id", id)
        .maybeSingle(),
    ]);
    if (memberRes.error || !memberRes.data) return null;
    const row = memberRes.data as MemberRow;
    return mergeStats(toMentor(row), (statsRes.data as StatsRow) ?? undefined);
  } catch (e) {
    console.warn("[mentors] fetch failed", e);
    return null;
  }
}

export async function getMentorSessions(
  mentorId: string,
): Promise<MentorSession[]> {
  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase
      .from("mentor_sessions")
      .select("*")
      .eq("mentor_id", mentorId)
      .eq("status", "open")
      .order("price", { ascending: true });
    if (error) throw error;
    return (data ?? []) as MentorSession[];
  } catch {
    return [];
  }
}

export interface MentorPayoutMonth {
  month: string;
  paid_count: number;
  gross_amount: number;
  platform_fee_total: number;
  mentor_payout_total: number;
}

export interface MentorOwnSession {
  id: string;
  type: "mentoring" | "workshop" | "study";
  title: string;
  price: number;
  max_participants: number;
  status: "open" | "closed" | "completed" | "cancelled";
  created_at: string;
}

export interface MentorIncomingBooking {
  id: string;
  user_id: string;
  amount: number;
  platform_fee_amount: number;
  mentor_payout_amount: number;
  status: string;
  scheduled_at: string | null;
  created_at: string;
}

export async function getMyMentorPayouts(): Promise<MentorPayoutMonth[]> {
  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase
      .from("mentor_payout_summary")
      .select(
        "month, paid_count, gross_amount, platform_fee_total, mentor_payout_total",
      )
      .order("month", { ascending: false });
    if (error) throw error;
    return (data ?? []) as MentorPayoutMonth[];
  } catch {
    return [];
  }
}

export async function getMyMentorSessions(
  mentorId: string,
): Promise<MentorOwnSession[]> {
  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase
      .from("mentor_sessions")
      .select("id, type, title, price, max_participants, status, created_at")
      .eq("mentor_id", mentorId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as MentorOwnSession[];
  } catch {
    return [];
  }
}

export async function getMyIncomingBookings(
  mentorId: string,
  limit = 20,
): Promise<MentorIncomingBooking[]> {
  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase
      .from("mentor_session_bookings")
      .select(
        "id, user_id, amount, platform_fee_amount, mentor_payout_amount, status, scheduled_at, created_at",
      )
      .eq("mentor_id", mentorId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as MentorIncomingBooking[];
  } catch {
    return [];
  }
}

export async function getMentorReviews(
  mentorId: string,
  limit = 5,
): Promise<MentorReview[]> {
  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase
      .from("mentor_reviews")
      .select("id, mentor_id, user_id, rating, comment, created_at")
      .eq("mentor_id", mentorId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as MentorReview[];
  } catch {
    return [];
  }
}
