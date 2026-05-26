/**
 * 멤버십 플랜 가격/기간 단일 진실 소스.
 *
 * 클라이언트(membership 결제 페이지)와 서버(/api/payments/*) 양쪽에서 import.
 * 가격 결정은 항상 이 상수를 통해서만 — 클라이언트가 보낸 amount는
 * 비교 검증용으로만 사용하고 confirm/insert에 직접 쓰지 않는다.
 */

export type PlanType = "monthly" | "annual";

export const PLAN_TYPES: ReadonlyArray<PlanType> = ["monthly", "annual"];

export const PLAN_PRICES: Readonly<Record<PlanType, number>> = {
  monthly: 5900,
  annual: 49000,
};

export const PLAN_LABELS: Readonly<Record<PlanType, string>> = {
  monthly: "월간",
  annual: "연간",
};

export function isPlanType(v: unknown): v is PlanType {
  return v === "monthly" || v === "annual";
}

export function priceOf(planType: PlanType): number {
  return PLAN_PRICES[planType];
}

export function nextBillingDates(
  planType: PlanType,
  from: Date = new Date(),
): {
  next_billing_at: string | null;
  expires_at: string | null;
} {
  if (planType === "monthly") {
    const next = new Date(from);
    next.setMonth(next.getMonth() + 1);
    return { next_billing_at: next.toISOString(), expires_at: null };
  }
  const next = new Date(from);
  next.setFullYear(next.getFullYear() + 1);
  return { next_billing_at: null, expires_at: next.toISOString() };
}
