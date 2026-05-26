import { BillingHistoryTable } from "@/components/mypage/BillingHistoryTable";
import { BillingPanel } from "@/components/mypage/BillingPanel";
import { requireMember } from "@/lib/auth/require-member";

export const dynamic = "force-dynamic";

interface MemberBilling {
  plan_type: "monthly" | "annual" | null;
  subscription_status: string | null;
  subscribed_at: string | null;
  next_billing_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
}

interface PaymentRow {
  id: string;
  toss_order_id: string;
  plan_type: "monthly" | "annual";
  amount: number;
  status: string;
  paid_at: string;
  receipt_url: string | null;
}

export default async function MyPageBilling() {
  const { supabase, user } = await requireMember();

  const { data: memberRow } = await supabase
    .from("members")
    .select(
      "plan_type, subscription_status, subscribed_at, next_billing_at, expires_at, cancelled_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  const { data: paymentsRaw } = await supabase
    .from("payments")
    .select(
      "id, toss_order_id, plan_type, amount, status, paid_at, receipt_url",
    )
    .eq("user_id", user.id)
    .order("paid_at", { ascending: false })
    .limit(10);

  const member: MemberBilling = memberRow ?? {
    plan_type: null,
    subscription_status: null,
    subscribed_at: null,
    next_billing_at: null,
    expires_at: null,
    cancelled_at: null,
  };
  const payments: PaymentRow[] = paymentsRaw ?? [];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-h3-lg font-semibold text-fg-1">구독 관리</h2>
        <p className="mt-1 text-body text-fg-3">
          현재 플랜과 결제 수단을 확인하고, 자동 갱신을 조절하거나 구독을 취소할
          수 있습니다.
        </p>
      </header>

      <BillingPanel member={member} />

      <section>
        <h3 className="mb-4 text-body font-semibold text-fg-1">청구 내역</h3>
        <BillingHistoryTable payments={payments} />
        <p className="mt-3 text-xxs text-fg-4">
          최근 10건만 표시됩니다. 전체 내역은 yiseo@figmatutor.info로
          문의해주세요.
        </p>
      </section>
    </div>
  );
}
