"use client";

import { useCallback, useEffect, useState } from "react";

type Role = "free" | "member" | "admin";

interface MemberRow {
  id: string;
  email: string | null;
  role: Role;
  plan_type: "monthly" | "annual" | null;
  subscription_status: string | null;
  subscribed_at: string | null;
  next_billing_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  discord_id: string | null;
  created_at: string;
  auth_created_at: string | null;
}

const ROLE_LABEL: Record<Role, string> = {
  free: "무료",
  member: "멤버",
  admin: "운영자",
};

const ROLE_BADGE: Record<Role, string> = {
  free: "border-border-1 bg-glass-1 text-gray-400",
  member: "border-brand-blue/40 bg-brand-blue/15 text-brand-blue-light",
  admin: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
};

function formatDate(v: string | null): string {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleDateString("ko-KR");
  } catch {
    return v;
  }
}

export function MemberAdminPanel() {
  const [members, setMembers] = useState<MemberRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filterRole, setFilterRole] = useState<"" | Role>("");
  const [query, setQuery] = useState("");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (filterRole) params.set("role", filterRole);
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(
        `/api/admin/members${params.toString() ? `?${params.toString()}` : ""}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { members: MemberRow[] };
      setMembers(data.members);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    }
  }, [filterRole, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function patchMember(
    id: string,
    body: Record<string, unknown>,
    confirmMessage?: string,
  ) {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setPendingActionId(id);
    setActionNote(null);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await res.json().catch(() => ({}))) as {
        sessions_invalidated?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(result.error ?? `HTTP ${res.status}`);
      }
      if (body.role !== undefined) {
        setActionNote(
          result.sessions_invalidated
            ? "역할 변경됨. 해당 멤버의 세션이 무효화되어 다음 요청 시 재로그인이 필요합니다."
            : "역할 변경됨. 세션 즉시 무효화에 실패 — 토큰 만료(최대 1시간) 후 자동 적용됩니다.",
        );
      }
      await load();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border-1 bg-glass-1 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-xs text-gray-400">검색 (이메일)</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이메일 일부"
              className="mt-1 w-64 rounded-lg border border-border-1 bg-glass-1 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-border-3 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-400">역할 필터</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as "" | Role)}
              className="mt-1 rounded-lg border border-border-1 bg-glass-1 px-3 py-2 text-sm text-white focus:border-border-3 focus:outline-none"
            >
              <option value="">전체</option>
              <option value="free">무료</option>
              <option value="member">멤버</option>
              <option value="admin">운영자</option>
            </select>
          </label>
          <button
            type="button"
            onClick={load}
            className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-sm text-gray-200 transition hover:border-border-2 hover:bg-glass-2"
          >
            새로고침
          </button>
        </div>
      </section>

      {actionNote && (
        <div className="rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-3 text-xs text-brand-blue-light">
          {actionNote}
        </div>
      )}

      {loadError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {loadError}
        </div>
      )}

      {members === null && !loadError && (
        <p className="text-xs text-gray-500">불러오는 중...</p>
      )}

      {members?.length === 0 && (
        <p className="text-xs text-gray-500">조건에 맞는 회원이 없습니다.</p>
      )}

      {members && members.length > 0 && (
        <ul className="space-y-3">
          {members.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-border-1 bg-glass-1 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xxs ${ROLE_BADGE[m.role]}`}
                    >
                      {ROLE_LABEL[m.role]}
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      {m.email ?? "(이메일 없음)"}
                    </h3>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1 text-xxs text-gray-500 md:grid-cols-2">
                    <span>
                      가입: {formatDate(m.auth_created_at ?? m.created_at)}
                    </span>
                    <span>플랜: {m.plan_type ?? "-"}</span>
                    <span>구독: {m.subscription_status ?? "-"}</span>
                    <span>
                      만료/다음결제:{" "}
                      {formatDate(m.expires_at ?? m.next_billing_at)}
                    </span>
                    <span>해지일: {formatDate(m.cancelled_at)}</span>
                    <span>
                      Discord:{" "}
                      <code className="text-gray-400">
                        {m.discord_id ?? "-"}
                      </code>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xxs text-gray-500">역할 변경:</span>
                {(["free", "member", "admin"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      patchMember(
                        m.id,
                        { role: r },
                        `${m.email ?? m.id}의 역할을 ${ROLE_LABEL[r]}(으)로 변경하시겠습니까? 해당 멤버는 다음 요청 시 재로그인이 필요합니다.`,
                      )
                    }
                    disabled={pendingActionId === m.id || m.role === r}
                    className={`rounded-full border px-3 py-1.5 text-xxs font-medium transition disabled:opacity-50 ${
                      m.role === r
                        ? "border-border-1 bg-glass-1 text-white"
                        : "border-border-1 bg-transparent text-gray-300 hover:bg-glass-2"
                    }`}
                  >
                    {ROLE_LABEL[r]}
                  </button>
                ))}

                <span className="mx-2 h-4 w-px bg-glass-3" aria-hidden />

                <button
                  type="button"
                  onClick={() =>
                    patchMember(
                      m.id,
                      { cancel_subscription: true },
                      `${m.email ?? m.id}의 구독을 강제 해지하시겠습니까? subscription_status가 'cancelled'로 변경됩니다.`,
                    )
                  }
                  disabled={
                    pendingActionId === m.id ||
                    m.subscription_status === "cancelled"
                  }
                  className="rounded-full border border-red-500/30 bg-transparent px-3 py-1.5 text-xxs text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  강제 해지
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
