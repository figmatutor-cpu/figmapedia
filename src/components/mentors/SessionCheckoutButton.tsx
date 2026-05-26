"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ANONYMOUS, requestCardPayment } from "@/lib/payments/toss-browser";

interface Props {
  sessionId: string;
  mentorId: string;
  /** session UI 에 이미 표시되는 가격. 위변조 검증은 서버 amount 기준 */
  displayPrice: number;
}

interface BookResponse {
  orderId: string;
  amount: number;
  orderName: string;
  bookingId: string;
}

type Status = "idle" | "loading" | "redirecting";

export function SessionCheckoutButton({
  sessionId,
  mentorId,
  displayPrice,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (status !== "idle") return;
    setError(null);
    setStatus("loading");

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/auth/login?next=${encodeURIComponent(`/mentors/${mentorId}`)}`,
        );
        return;
      }
      if (user.id === mentorId) {
        setStatus("idle");
        setError("본인 세션은 신청할 수 없습니다.");
        return;
      }

      const bookRes = await fetch(`/api/mentor-sessions/${sessionId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const bookData = (await bookRes.json().catch(() => ({}))) as
        | BookResponse
        | { error?: string };
      if (!bookRes.ok || !("orderId" in bookData)) {
        throw new Error(
          ("error" in bookData && bookData.error) ||
            `세션 예약 실패 (HTTP ${bookRes.status})`,
        );
      }

      setStatus("redirecting");
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const successUrl = `${origin}/mentors/sessions/success?mentorId=${encodeURIComponent(mentorId)}`;
      const failUrl = `${origin}/mentors/${encodeURIComponent(mentorId)}?reason=payment_failed`;

      await requestCardPayment({
        customerKey: user.id || ANONYMOUS,
        orderId: bookData.orderId,
        orderName: bookData.orderName,
        amount: bookData.amount,
        successUrl,
        failUrl,
        customerEmail: user.email ?? undefined,
      });
    } catch (e) {
      setStatus("idle");
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("USER_CANCEL") || message.includes("취소")) {
        return;
      }
      setError(message);
    }
  }

  const disabled = status !== "idle";
  const label =
    status === "loading"
      ? "예약 준비 중…"
      : status === "redirecting"
        ? "결제창으로 이동…"
        : `${displayPrice.toLocaleString("ko-KR")}원 신청하기`;

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={startCheckout}
        className="w-full rounded-lg border border-brand-blue/40 bg-brand-blue/10 px-4 py-2.5 text-meta font-semibold text-brand-blue-light transition hover:border-brand-blue/60 hover:bg-brand-blue/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      {error && (
        <p className="rounded-lg border border-border-1 bg-glass-1 p-2.5 text-xxs text-fg-2">
          {error}
        </p>
      )}
    </div>
  );
}
