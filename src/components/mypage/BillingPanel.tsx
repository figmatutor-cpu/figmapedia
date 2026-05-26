"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CancelSubscriptionModal } from "./CancelSubscriptionModal";

interface MemberBilling {
  plan_type: "monthly" | "annual" | null;
  subscription_status: string | null;
  subscribed_at: string | null;
  next_billing_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
}

interface Props {
  member: MemberBilling;
}

function fmtDate(v: string | null): string {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleDateString("ko-KR");
  } catch {
    return v;
  }
}

export function BillingPanel({ member }: Props) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [renewToggling, setRenewToggling] = useState(false);
  const [paymentToggling, setPaymentToggling] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autoRenewOn = member.subscription_status === "active";
  const renewLabel = member.plan_type === "annual" ? "만료일" : "다음 결제일";
  const renewDate =
    member.plan_type === "annual" ? member.expires_at : member.next_billing_at;
  const planLabel =
    member.plan_type === "annual"
      ? "연간 멤버십"
      : member.plan_type === "monthly"
        ? "월간 멤버십"
        : "구독 없음";
  const monthlyPrice =
    member.plan_type === "annual" ? "₩49,000 / 년" : "₩5,900 / 월";

  async function toggleAutoRenew() {
    if (!member.plan_type) return;
    setRenewToggling(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/mypage/billing/auto-renew", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !autoRenewOn }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      setNote(
        autoRenewOn
          ? "자동 갱신이 꺼졌습니다. 현재 회차 만료 후 결제가 중단됩니다."
          : "자동 갱신이 켜졌습니다.",
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRenewToggling(false);
    }
  }

  async function changePaymentMethod() {
    setPaymentToggling(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/mypage/billing/payment-method", {
        method: "PATCH",
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
        widget_url?: string | null;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setNote(
        data.message ??
          "결제 수단 변경 요청이 접수되었습니다. 토스 가맹 승인 후 위젯에서 진행할 수 있습니다.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPaymentToggling(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
        <h2 className="text-body-lg font-semibold text-fg-1">현재 구독</h2>
        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
          <div>
            <div className="text-meta text-fg-4">플랜</div>
            <div className="mt-1 text-body-lg font-semibold text-fg-1">
              {planLabel}
            </div>
            {member.plan_type && (
              <div className="mt-1 text-meta text-fg-3">{monthlyPrice}</div>
            )}
          </div>
          <div>
            <div className="text-meta text-fg-4">{renewLabel}</div>
            <div className="mt-1 text-body text-fg-2">{fmtDate(renewDate)}</div>
          </div>
          <div>
            <div className="text-meta text-fg-4">상태</div>
            <div className="mt-1 text-body text-fg-2">
              {member.subscription_status ?? "구독 안 함"}
              {member.cancelled_at && (
                <span className="ml-2 text-xxs text-fg-4">
                  ({fmtDate(member.cancelled_at)} 취소)
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-body-lg font-semibold text-fg-1">자동 갱신</h2>
            <p className="mt-2 text-meta text-fg-3">
              {autoRenewOn
                ? "다음 결제일에 자동으로 결제됩니다."
                : "현재 회차 만료 후 결제가 중단됩니다."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAutoRenew}
            disabled={renewToggling || !member.plan_type}
            className={`rounded-full border px-4 py-2 text-meta font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              autoRenewOn
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                : "border-border-1 bg-glass-1 text-fg-2 hover:border-border-2 hover:bg-glass-3"
            }`}
          >
            {renewToggling ? "처리 중..." : autoRenewOn ? "ON" : "OFF"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-body-lg font-semibold text-fg-1">결제 수단</h2>
            <p className="mt-2 text-meta text-fg-3">
              현재 결제 정보는 토스페이먼츠에 안전하게 보관됩니다. 카드 변경은
              위젯을 통해 진행됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={changePaymentMethod}
            disabled={paymentToggling}
            className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-meta text-fg-2 transition hover:border-border-2 hover:bg-glass-3 disabled:opacity-50"
          >
            결제 수단 변경
          </button>
        </div>
      </section>

      {member.plan_type && (
        <section className="rounded-xl border border-red-500/20 bg-status-danger/5 p-6 md:p-8">
          <h2 className="text-body-lg font-semibold text-fg-1">구독 취소</h2>
          <p className="mt-2 text-meta leading-6 text-fg-3">
            취소하면 현재 회차의 혜택은 {fmtDate(renewDate)}까지 유지됩니다.
            취소 후에도 30일간 데이터는 보관됩니다.
          </p>
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            disabled={member.subscription_status === "cancelled"}
            className="mt-4 rounded-full border border-red-500/30 bg-transparent px-4 py-2 text-meta text-red-300 transition hover:bg-status-danger/10 disabled:opacity-50"
          >
            {member.subscription_status === "cancelled"
              ? "이미 취소됨"
              : "구독 취소하기"}
          </button>
        </section>
      )}

      {note && (
        <div className="rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-3 text-meta text-brand-blue-light">
          {note}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-status-danger/10 p-3 text-meta text-red-300">
          {error}
        </div>
      )}

      <CancelSubscriptionModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirmed={() => {
          setCancelOpen(false);
          setNote("구독이 취소되었습니다.");
          router.refresh();
        }}
        planType={member.plan_type}
        renewLabel={renewLabel}
        renewDate={fmtDate(renewDate)}
      />
    </div>
  );
}
