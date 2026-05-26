"use client";

import { useState } from "react";

interface Props {
  initialDiscordId: string | null;
}

export function DiscordLinkPanel({ initialDiscordId }: Props) {
  const [discordId, setDiscordId] = useState(initialDiscordId ?? "");
  const [editing, setEditing] = useState(initialDiscordId === null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const inviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "#";

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSavedNote(null);
    try {
      const res = await fetch("/api/mypage/discord-id", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discord_id: discordId.trim() || null }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      setEditing(false);
      setSavedNote(
        "저장되었습니다. 운영자가 Discord 역할을 부여하면 자동으로 반영됩니다.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-body-lg font-semibold text-fg-1">Discord 연동</h3>
          <p className="mt-1 text-meta text-fg-3">
            Discord ID를 등록하면 운영자가 멤버 채널 권한을 부여합니다.
          </p>
        </div>
        <a
          href={inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-meta font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
        >
          Discord 서버 입장
        </a>
      </div>

      <div className="mt-5">
        {editing ? (
          <div className="space-y-3">
            <label className="block">
              <span className="text-meta text-fg-3">
                Discord 사용자명 (예: figmapedia#1234 또는 username)
              </span>
              <input
                type="text"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="figmapedia#1234"
                className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-brand-blue px-4 py-2 text-meta font-medium text-fg-1 transition hover:bg-brand-blue-accent disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              {initialDiscordId !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setDiscordId(initialDiscordId ?? "");
                    setEditing(false);
                    setError(null);
                  }}
                  disabled={saving}
                  className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-meta text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
                >
                  취소
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <code className="rounded-lg border border-border-1 bg-glass-1 px-3 py-2 text-body text-fg-2">
              {discordId || "(등록 안 됨)"}
            </code>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-meta text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
            >
              변경
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-status-danger/10 p-3 text-meta text-red-300">
            {error}
          </div>
        )}
        {savedNote && (
          <p className="mt-3 text-meta text-emerald-300">{savedNote}</p>
        )}
      </div>
    </section>
  );
}
