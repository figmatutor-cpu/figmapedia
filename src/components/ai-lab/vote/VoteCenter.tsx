"use client";

import { useCallback, useEffect, useState } from "react";
import { useMember } from "@/lib/auth/use-member";
import type { CurrentTopicsResponse } from "@/types/topic";
import { TopicCard } from "./TopicCard";
import { VoteCTA } from "./VoteCTA";

interface VoteCenterProps {
  initialData: CurrentTopicsResponse;
}

export function VoteCenter({ initialData }: VoteCenterProps) {
  const { user, isLoading: authLoading } = useMember();
  const [data, setData] = useState<CurrentTopicsResponse>(initialData);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/topics/current", { cache: "no-store" });
      if (res.ok) {
        const next = (await res.json()) as CurrentTopicsResponse;
        setData(next);
      }
    } catch {
      // 무시 — 다음 액션에서 재시도
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function handleSelect(topicId: string) {
    if (!user) {
      window.location.href = `/auth/login?next=${encodeURIComponent("/ai-lab/vote")}`;
      return;
    }
    if (data.is_closed) return;
    setError(null);
    setPendingId(topicId);
    try {
      const method = data.my_vote_topic_id === topicId ? "DELETE" : "POST";
      const res = await fetch(`/api/topics/${topicId}/vote`, { method });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPendingId(null);
    }
  }

  const { topics, my_vote_topic_id, total_votes, is_closed } = data;

  if (topics.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-8 text-center">
        <p className="text-sm text-gray-400">
          이번 주 후보 주제가 곧 등록됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {topics.map((t) => (
          <TopicCard
            key={t.id}
            topic={t}
            totalVotes={total_votes}
            selected={my_vote_topic_id === t.id}
            disabled={is_closed || authLoading}
            pending={pendingId === t.id}
            showStatusBadge={is_closed}
            onSelect={() => handleSelect(t.id)}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {is_closed && <VoteCTA variant="closed" />}
      {!is_closed && !user && !authLoading && <VoteCTA variant="login" />}

      {!is_closed && user && my_vote_topic_id && (
        <p className="text-xxs text-gray-500">
          같은 후보를 다시 누르면 표가 취소됩니다. 다른 후보를 클릭하면 표가
          자동으로 변경됩니다.
        </p>
      )}
    </div>
  );
}
