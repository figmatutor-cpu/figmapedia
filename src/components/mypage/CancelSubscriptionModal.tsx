"use client";

import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  planType: "monthly" | "annual" | null;
  renewLabel: string;
  renewDate: string | null;
}

const REASONS = [
  "비용 부담",
  "콘텐츠가 기대와 다름",
  "참여할 시간 부족",
  "다른 서비스로 이동",
  "기타",
];

export function CancelSubscriptionModal({
  open,
  onClose,
  onConfirmed,
  planType,
  renewLabel,
  renewDate,
}: Props) {
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason(REASONS[0]);
      setDetail("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/mypage/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, detail: detail.trim() || undefined }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      onConfirmed();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/60 p-4"
    >
      <div className="w-full max-w-md rounded-xl border border-border-1 bg-glass-overlay p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-h3 font-semibold text-fg-1">
          구독을 취소하시겠습니까?
        </h3>
        <p className="mt-2 text-body leading-6 text-fg-2">
          취소하면 현재 회차의 혜택은 {renewDate ?? "기간 만료"}까지 유지되며,
          그 이후 자동 결제가 중단됩니다.
          {planType === "annual"
            ? " 연간 결제 환불은 일할 계산되며 별도 문의가 필요합니다."
            : ""}
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-meta text-fg-3">취소 사유</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-1 bg-glass-1 px-3 py-2.5 text-body text-fg-1 focus:border-border-3 focus:outline-none"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-meta text-fg-3">추가 의견 (선택)</span>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="어떤 점이 아쉬웠는지 알려주세요"
              className="mt-1 w-full resize-none rounded-lg border border-border-1 bg-glass-1 px-3 py-2.5 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-status-danger/10 p-3 text-meta text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-body text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
          >
            돌아가기
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-full bg-status-danger/80 px-4 py-2 text-body font-medium text-fg-1 transition hover:bg-status-danger disabled:opacity-50"
          >
            {submitting ? "처리 중..." : "계속 취소하기"}
          </button>
        </div>

        <p className="mt-4 text-xxs text-fg-4">
          {renewLabel}: {renewDate ?? "-"}
        </p>
      </div>
    </div>
  );
}
