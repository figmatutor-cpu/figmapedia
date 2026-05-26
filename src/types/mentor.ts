export type MentorStatus = "candidate" | "active" | "inactive";
export type SessionType = "mentoring" | "workshop" | "study";
export type SessionStatus = "open" | "closed" | "completed" | "cancelled";

export interface CareerEntry {
  title: string;
  company: string;
  period: string;
}

export interface Mentor {
  id: string;
  display_name: string;
  avatar_url: string | null;
  mentor_title: string | null;
  mentor_intro: string | null;
  specialties: string[];
  career: CareerEntry[];
  live_count: number;
  archive_count: number;
}

export interface MentorWithStats extends Mentor {
  completed_sessions: number;
  review_count: number;
  avg_rating: number;
  upcoming_sessions: number;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  type: SessionType;
  title: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  max_participants: number;
  toss_payment_link: string | null;
  schedule_text: string | null;
  status: SessionStatus;
}

export interface MentorReview {
  id: string;
  mentor_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string | null;
}

export const SESSION_TYPE_LABEL: Record<SessionType, string> = {
  mentoring: "1:1 멘토링",
  workshop: "워크샵",
  study: "스터디 그룹",
};
