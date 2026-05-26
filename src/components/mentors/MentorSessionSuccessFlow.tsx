"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Props {
  paymentKey?: string;
  orderId?: string;
  amount?: number;
  mentorId?: string;
}

type FlowState =
  | { kind: "missing" }
  | { kind: "confirming" }
  | {
      kind: "done";
      bookingId: string;
      platformFee?: number;
      mentorPayout?: number;
      receiptUrl?: string | null;
    }
  | { kind: "error"; message: string };

interface ConfirmResponse {
  ok?: boolean;
  kind?: "membership" | "mentor_session";
  bookingId?: string;
  platform_fee_amount?: number;
  mentor_payout_amount?: number;
  receipt_url?: string | null;
  idempotent?: boolean;
  error?: string;
}

export function MentorSessionSuccessFlow({
  paymentKey,
  orderId,
  amount,
  mentorId,
}: Props) {
  const initial: FlowState =
    paymentKey && orderId && amount
      ? { kind: "confirming" }
      : { kind: "missing" };
  const [state, setState] = useState<FlowState>(initial);
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (state.kind !== "confirming" || confirmedRef.current) return;
    confirmedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const data = (await res.json().catch(() => ({}))) as ConfirmResponse;
        if (!res.ok || !data.ok) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        if (data.kind !== "mentor_session" || !data.bookingId) {
          throw new Error("응답 형식이 예상과 다릅니다");
        }

        setState({
          kind: "done",
          bookingId: data.bookingId,
          platformFee: data.platform_fee_amount,
          mentorPayout: data.mentor_payout_amount,
          receiptUrl: data.receipt_url ?? null,
        });
      } catch (e) {
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      }
    })();
  }, [state.kind, paymentKey, orderId, amount]);

  if (state.kind === "missing") {
    return (
      <div className="rounded-xl border border-border-1 bg-glass-1 p-8 text-center">
        <h1 className="text-h2 font-semibold text-fg-1">
          결제 정보가 없습니다
        </h1>
        <p className="mt-3 text-meta text-fg-3">
          올바른 결제 흐름을 통해 접근해주세요.
        </p>
        <Link
          href="/mentors"
          className="mt-6 inline-block rounded-full border border-border-1 bg-glass-2 px-5 py-2 text-meta text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
        >
          멘토 목록으로
        </Link>
      </div>
    );
  }

  if (state.kind === "confirming") {
    return (
      <div className="rounded-xl border border-border-1 bg-glass-1 p-8 text-center">
        <h1 className="text-h2 font-semibold text-fg-1">결제 확인 중…</h1>
        <p className="mt-3 text-meta text-fg-3">
          토스 결제 결과를 확인하고 있습니다. 이 페이지를 닫지 말아주세요.
        </p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="rounded-xl border border-border-1 bg-glass-1 p-8 text-center">
        <h1 className="text-h2 font-semibold text-fg-1">
          결제 확정에 실패했습니다
        </h1>
        <p className="mt-3 break-words text-meta text-fg-3">{state.message}</p>
        <p className="mt-3 text-xxs text-fg-4">
          이미 결제는 완료됐을 수 있습니다. 운영자에게 문의해 주세요.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {mentorId && (
            <Link
              href={`/mentors/${mentorId}`}
              className="rounded-full border border-border-1 bg-glass-2 px-5 py-2 text-meta text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
            >
              멘토 페이지로
            </Link>
          )}
          <Link
            href="/mentors"
            className="rounded-full border border-border-1 bg-glass-2 px-5 py-2 text-meta text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
          >
            멘토 목록
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-blue/30 bg-brand-blue/10 p-8 text-center">
      <h1 className="text-h2 font-semibold text-fg-1">
        세션 신청이 완료됐어요
      </h1>
      <p className="mt-3 text-body text-fg-2">
        멘토에게 알림이 전달되었고, 일정 확정 후 안내드립니다.
      </p>
      {state.receiptUrl && (
        <a
          href={state.receiptUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-meta text-brand-blue-light underline-offset-4 hover:underline"
        >
          영수증 보기
        </a>
      )}
      <div className="mt-6 flex justify-center gap-2">
        {mentorId && (
          <Link
            href={`/mentors/${mentorId}`}
            className="rounded-full border border-border-1 bg-glass-2 px-5 py-2 text-meta text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
          >
            멘토 페이지
          </Link>
        )}
        <Link
          href="/mypage"
          className="rounded-full bg-brand-blue px-5 py-2 text-meta text-fg-1 transition hover:opacity-90"
        >
          내 예약 보기
        </Link>
      </div>
    </div>
  );
}
