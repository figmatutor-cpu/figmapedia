export type TopicStatus = "candidate" | "winner" | "archived" | "rejected";

export interface Topic {
  id: string;
  week: string;
  title: string;
  description: string | null;
  status: TopicStatus;
  voting_closes_at: string;
  created_by: string | null;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TopicWithVotes extends Topic {
  votes: number;
}

export interface CurrentTopicsResponse {
  week: string | null;
  voting_closes_at: string | null;
  is_closed: boolean;
  topics: TopicWithVotes[];
  my_vote_topic_id: string | null;
  total_votes: number;
}

export interface WeekTopicsResponse {
  week: string;
  topics: TopicWithVotes[];
  total_votes: number;
  is_closed: boolean;
}
