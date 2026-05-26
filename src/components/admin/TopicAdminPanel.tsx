"use client";

import { useCallback, useEffect, useState } from "react";

const STATUS_LABEL: Record<string, string> = {
  candidate: "후보",
  winner: "선정",
  archived: "보관",
  rejected: "반려",
};

const STATUS_BADGE: Record<string, string> = {
  candidate: "border-brand-blue/40 bg-brand-blue/15 text-brand-blue-light",
  winner: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  archived: "border-border-1 bg-glass-1 text-fg-3",
  rejected: "border-red-500/30 bg-status-danger/10 text-red-300",
};

interface TopicRow {
  id: string;
  week: string;
  title: string;
  description: string | null;
  status: "candidate" | "winner" | "archived" | "rejected";
  voting_closes_at: string;
  created_at: string;
  topic_vote_counts: { votes: number } | { votes: number }[] | null;
}

function extractVotes(row: TopicRow): number {
  const v = row.topic_vote_counts;
  if (!v) return 0;
  if (Array.isArray(v)) return v[0]?.votes ?? 0;
  return v.votes ?? 0;
}

function nextTuesday18KST(): string {
  const now = new Date();
  const day = now.getDay();
  const daysUntilTue = (2 - day + 7) % 7 || 7;
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntilTue);
  target.setHours(18, 0, 0, 0);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T18:00`;
}

function defaultMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

export function TopicAdminPanel() {
  const [topics, setTopics] = useState<TopicRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [week, setWeek] = useState(defaultMonday());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState(nextTuesday18KST());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/topics", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { topics: TopicRow[] };
      setTopics(data.topics);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const closesIso = new Date(closesAt).toISOString();
      const res = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week,
          title,
          description: description || undefined,
          voting_closes_at: closesIso,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      setTitle("");
      setDescription("");
      await load();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id: string, status: TopicRow["status"]) {
    if (
      status === "winner" &&
      !window.confirm(
        "이 주제를 winner로 마킹하면 같은 주차의 다른 candidate는 자동으로 archived 처리됩니다. 계속할까요?",
      )
    )
      return;
    setPendingActionId(id);
    try {
      const res = await fetch(`/api/admin/topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 주제를 삭제할까요? 관련 표도 함께 삭제됩니다."))
      return;
    setPendingActionId(id);
    try {
      const res = await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-border-1 bg-glass-1 p-6"
      >
        <h2 className="text-body-lg font-semibold text-fg-1">새 후보 등록</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-meta text-fg-3">주차 (월요일 권장)</span>
            <input
              type="date"
              required
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-body text-fg-1 focus:border-border-3 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-meta text-fg-3">투표 마감 시각</span>
            <input
              type="datetime-local"
              required
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-body text-fg-1 focus:border-border-3 focus:outline-none"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-meta text-fg-3">제목</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: Claude로 와이어프레임 그리기"
            className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-meta text-fg-3">설명 (선택)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="이 주제에서 어떤 실험을 할지 짧게..."
            className="mt-1 w-full resize-none rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
          />
        </label>

        {submitError && (
          <div className="rounded-lg border border-red-500/30 bg-status-danger/10 p-3 text-meta text-red-300">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-blue px-5 py-2.5 text-body font-medium text-fg-1 transition hover:bg-brand-blue-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-body-lg font-semibold text-fg-1">전체 주제</h2>

        {loadError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-status-danger/10 p-3 text-meta text-red-300">
            {loadError}
          </div>
        )}

        {topics === null && !loadError && (
          <p className="text-meta text-fg-4">불러오는 중...</p>
        )}

        {topics?.length === 0 && (
          <p className="text-meta text-fg-4">등록된 주제가 없습니다.</p>
        )}

        {topics && topics.length > 0 && (
          <ul className="space-y-3">
            {topics.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-border-1 bg-glass-1 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xxs text-fg-4">
                      <span>{t.week} 주차</span>
                      <span aria-hidden>·</span>
                      <span>
                        마감{" "}
                        {new Date(t.voting_closes_at).toLocaleString("ko-KR")}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{extractVotes(t)}표</span>
                    </div>
                    <h3 className="mt-2 text-body-lg font-semibold text-fg-1">
                      {t.title}
                    </h3>
                    {t.description && (
                      <p className="mt-1 text-body text-fg-3">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xxs ${STATUS_BADGE[t.status]}`}
                  >
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {t.status === "candidate" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(t.id, "winner")}
                        disabled={pendingActionId === t.id}
                        className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xxs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        winner로 마킹
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(t.id, "archived")}
                        disabled={pendingActionId === t.id}
                        className="rounded-full border border-border-1 bg-glass-1 px-3 py-1.5 text-xxs font-medium text-fg-2 transition hover:bg-glass-2 disabled:opacity-50"
                      >
                        archive
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(t.id, "rejected")}
                        disabled={pendingActionId === t.id}
                        className="rounded-full border border-red-500/30 bg-status-danger/10 px-3 py-1.5 text-xxs font-medium text-red-300 transition hover:bg-status-danger/20 disabled:opacity-50"
                      >
                        reject
                      </button>
                    </>
                  )}
                  {t.status !== "candidate" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(t.id, "candidate")}
                      disabled={pendingActionId === t.id}
                      className="rounded-full border border-border-1 bg-glass-1 px-3 py-1.5 text-xxs font-medium text-fg-2 transition hover:bg-glass-2 disabled:opacity-50"
                    >
                      candidate로 복귀
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={pendingActionId === t.id}
                    className="rounded-full border border-red-500/30 bg-transparent px-3 py-1.5 text-xxs text-red-300 transition hover:bg-status-danger/10 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
