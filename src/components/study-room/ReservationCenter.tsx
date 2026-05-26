"use client";

import { useEffect, useState } from "react";
import {
  STATUS_LABELS,
  TIME_SLOT_LABELS,
  TIME_SLOTS,
  type Reservation,
  type TimeSlot,
} from "@/types/reservation";

function todayString() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function tomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function slotShortLabel(slot: TimeSlot) {
  return TIME_SLOT_LABELS[slot].split(" ")[0];
}

export function ReservationCenter() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [date, setDate] = useState(tomorrowString());
  const [slot, setSlot] = useState<TimeSlot>("morning");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadReservations() {
    setLoadError(null);
    try {
      const res = await fetch("/api/study-reservations", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { reservations: Reservation[] };
      setReservations(data.reservations);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/study-reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reserved_at: date,
          time_slot: slot,
          note: note || undefined,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      setNote("");
      await loadReservations();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    if (!window.confirm("예약을 취소하시겠습니까?")) return;
    const res = await fetch(`/api/study-reservations/${id}`, {
      method: "DELETE",
    });
    if (res.ok) await loadReservations();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-border-1 bg-glass-1 p-6 md:p-8"
      >
        <h2 className="text-body-lg font-semibold text-fg-1">새 예약 신청</h2>

        <label className="block">
          <span className="text-meta text-fg-3">날짜</span>
          <input
            type="date"
            required
            min={todayString()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-3 text-body text-fg-1 focus:border-border-3 focus:outline-none"
          />
        </label>

        <div>
          <span className="text-meta text-fg-3">시간대</span>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={`rounded-lg border px-3 py-2.5 text-meta transition ${
                  slot === s
                    ? "border-brand-blue/50 bg-brand-blue/20 text-fg-1"
                    : "border-border-1 bg-glass-1 text-fg-2 hover:border-border-2 hover:bg-glass-2"
                }`}
              >
                {slotShortLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-meta text-fg-3">사용 목적 (선택)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 4명 디자인 스터디"
            rows={3}
            maxLength={500}
            className="mt-1 w-full resize-none rounded-lg border border-border-1 bg-glass-1 px-4 py-3 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
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
          className="w-full rounded-full bg-brand-blue px-6 py-3 text-body font-medium text-fg-1 transition hover:bg-brand-blue-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "신청 중..." : "예약 신청"}
        </button>

        <p className="text-xxs text-fg-4">
          예약은 운영자 확인 후 확정됩니다. 확정되면 알림을 드립니다.
        </p>
      </form>

      <div className="rounded-xl border border-border-1 bg-glass-1 p-6 md:p-8">
        <h2 className="text-body-lg font-semibold text-fg-1">내 예약 현황</h2>

        {loadError && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-status-danger/10 p-3 text-meta text-red-300">
            예약을 불러오지 못했습니다: {loadError}
          </div>
        )}

        {reservations === null && !loadError && (
          <p className="mt-4 text-meta text-fg-4">불러오는 중...</p>
        )}

        {reservations !== null && reservations.length === 0 && (
          <p className="mt-4 text-meta text-fg-4">아직 예약 내역이 없습니다.</p>
        )}

        {reservations !== null && reservations.length > 0 && (
          <ul className="mt-4 space-y-3">
            {reservations.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-border-1 bg-glass-1 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-body text-fg-1">
                      {r.reserved_at} · {slotShortLabel(r.time_slot)}
                    </div>
                    <div className="mt-1 text-xxs text-fg-4">
                      {TIME_SLOT_LABELS[r.time_slot]}
                    </div>
                    {r.note && (
                      <p className="mt-2 line-clamp-2 text-meta text-fg-3">
                        {r.note}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xxs ${
                      r.status === "confirmed"
                        ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                        : r.status === "cancelled"
                          ? "border border-border-1 bg-glass-1 text-fg-4"
                          : "border border-yellow-500/30 bg-status-warning/15 text-yellow-300"
                    }`}
                  >
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
                {r.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => handleCancel(r.id)}
                    className="mt-3 text-xxs text-fg-4 transition hover:text-fg-2"
                  >
                    예약 취소
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
