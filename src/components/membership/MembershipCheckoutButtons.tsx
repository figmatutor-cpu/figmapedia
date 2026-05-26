"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ANONYMOUS, requestCardPayment } from "@/lib/payments/toss-browser";
import type { PlanType } from "@/lib/payments/plans";

interface PrepareResponse {
  orderId: string;
  amount: number;
  orderName: string;
  planType: PlanType;
}

type Status = "idle" | "loading" | "redirecting";

export function MembershipCheckoutButtons() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(planType: PlanType) {
    if (status !== "idle") return;
    setError(null);
    setStatus("loading");

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/auth/login?next=${encodeURIComponent("/membership")}`);
        return;
      }

      const prepareRes = await fetch("/api/payments/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });
      const prepareData = (await prepareRes.json().catch(() => ({}))) as
        | PrepareResponse
        | { error?: string };
      if (!prepareRes.ok || !("orderId" in prepareData)) {
        throw new Error(
          ("error" in prepareData && prepareData.error) ||
            `결제 준비 실패 (HTTP ${prepareRes.status})`,
        );
      }

      setStatus("redirecting");
      const successUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/membership/success?planType=${planType}`
          : `/membership/success?planType=${planType}`;
      const failUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/membership?reason=payment_failed`
          : `/membership?reason=payment_failed`;

      await requestCardPayment({
        customerKey: user.id || ANONYMOUS,
        orderId: prepareData.orderId,
        orderName: prepareData.orderName,
        amount: prepareData.amount,
        successUrl,
        failUrl,
        customerEmail: user.email ?? undefined,
      });
    } catch (e) {
      setStatus("idle");
      const message = e instanceof Error ? e.message : String(e);
      // Toss SDK 가 사용자 취소 시 throw 하는 경우 메시지에 'USER_CANCEL' 포함
      if (message.includes("USER_CANCEL") || message.includes("취소")) {
        return;
      }
      setError(message);
    }
  }

  const disabled = status !== "idle";

  return (
    <div className="mt-6 space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => startCheckout("monthly")}
          className="rounded-xl border border-border-1 bg-glass-2 p-5 text-left transition hover:border-border-2 hover:bg-glass-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="text-meta text-fg-3">월간</div>
          <div className="mt-1 text-body-lg font-semibold text-fg-1">
            5,900원 결제하기
          </div>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => startCheckout("annual")}
          className="rounded-xl border border-brand-blue/40 bg-brand-blue/10 p-5 text-left transition hover:border-brand-blue/60 hover:bg-brand-blue/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="text-meta text-brand-blue-light">연간 · 31% 할인</div>
          <div className="mt-1 text-body-lg font-semibold text-fg-1">
            49,000원 결제하기
          </div>
        </button>
      </div>
      {status === "loading" && (
        <p className="text-meta text-fg-3">결제창을 준비 중입니다…</p>
      )}
      {status === "redirecting" && (
        <p className="text-meta text-fg-3">Toss 결제창으로 이동합니다…</p>
      )}
      {error && (
        <p className="rounded-lg border border-border-1 bg-glass-1 p-3 text-meta text-fg-2">
          {error}
        </p>
      )}
    </div>
  );
}
