"use client";

import { useCallback, useEffect, useState } from "react";

interface VodRow {
  id: string;
  youtube_id: string;
  title: string;
  recorded_at: string;
  experiment_id: string | null;
  duration_seconds: number | null;
  is_published: boolean;
  created_at: string;
}

function todayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "-";
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}시간 ${m % 60}분` : `${m}분`;
}

export function VodAdminPanel() {
  const [vods, setVods] = useState<VodRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [recordedAt, setRecordedAt] = useState(todayString());
  const [duration, setDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/vods", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { vods: VodRow[] };
      setVods(data.vods);
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
      const body: Record<string, unknown> = {
        title,
        youtube_id: youtubeId.trim(),
        recorded_at: recordedAt,
      };
      const durationNum = Number(duration);
      if (duration && Number.isFinite(durationNum) && durationNum > 0) {
        body.duration_seconds = durationNum;
      }
      const res = await fetch("/api/admin/vods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      setTitle("");
      setYoutubeId("");
      setDuration("");
      await load();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(id: string, isPublished: boolean) {
    setPendingActionId(id);
    try {
      const res = await fetch(`/api/admin/vods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !isPublished }),
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
    if (!window.confirm("이 VOD를 삭제할까요?")) return;
    setPendingActionId(id);
    try {
      const res = await fetch(`/api/admin/vods/${id}`, { method: "DELETE" });
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
        <h2 className="text-base font-semibold text-white">새 VOD 등록</h2>

        <label className="block">
          <span className="text-xs text-gray-400">제목</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: Week 22 라이브 — Claude 와이어프레임"
            className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-border-3 focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs text-gray-400">
              YouTube 영상 ID (11자리)
            </span>
            <input
              type="text"
              required
              pattern="[A-Za-z0-9_-]{11}"
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              placeholder="예: dQw4w9WgXcQ"
              className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 font-mono text-sm text-white placeholder:text-gray-600 focus:border-border-3 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-400">녹화일</span>
            <input
              type="date"
              required
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-sm text-white focus:border-border-3 focus:outline-none"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-gray-400">영상 길이 (초, 선택)</span>
          <input
            type="number"
            min="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="예: 3600"
            className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-border-3 focus:outline-none md:max-w-xs"
          />
        </label>

        {submitError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-base font-semibold text-white">전체 VOD</h2>

        {loadError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {loadError}
          </div>
        )}

        {vods === null && !loadError && (
          <p className="text-xs text-gray-500">불러오는 중...</p>
        )}

        {vods?.length === 0 && (
          <p className="text-xs text-gray-500">등록된 VOD가 없습니다.</p>
        )}

        {vods && vods.length > 0 && (
          <ul className="space-y-3">
            {vods.map((v) => (
              <li
                key={v.id}
                className="rounded-xl border border-border-1 bg-glass-1 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xxs text-gray-500">
                      <span>{v.recorded_at}</span>
                      <span aria-hidden>·</span>
                      <span>{formatDuration(v.duration_seconds)}</span>
                      <span aria-hidden>·</span>
                      <code className="rounded bg-glass-1 px-1.5 py-0.5 font-mono text-[10px] text-brand-blue-light">
                        {v.youtube_id}
                      </code>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-white">
                      {v.title}
                    </h3>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xxs ${
                      v.is_published
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border-border-1 bg-glass-1 text-gray-400"
                    }`}
                  >
                    {v.is_published ? "공개" : "비공개"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(v.id, v.is_published)}
                    disabled={pendingActionId === v.id}
                    className="rounded-full border border-border-1 bg-glass-1 px-3 py-1.5 text-xxs font-medium text-gray-300 transition hover:bg-glass-2 disabled:opacity-50"
                  >
                    {v.is_published ? "비공개로 전환" : "공개로 전환"}
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${encodeURIComponent(v.youtube_id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-border-1 bg-glass-1 px-3 py-1.5 text-xxs font-medium text-gray-300 transition hover:bg-glass-2"
                  >
                    YouTube에서 보기 →
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    disabled={pendingActionId === v.id}
                    className="rounded-full border border-red-500/30 bg-transparent px-3 py-1.5 text-xxs text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
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
