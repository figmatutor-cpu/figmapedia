import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as adminDb } from "@/lib/supabase";
import { confirmPayment } from "@/lib/toss/client";

const VALID_PLANS = ["monthly", "annual"] as const;
type PlanType = (typeof VALID_PLANS)[number];

interface ConfirmBody {
  paymentKey: string;
  orderId: string;
  amount: number;
  planType: PlanType;
}

function isValidBody(v: unknown): v is ConfirmBody {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.paymentKey === "string" &&
    typeof obj.orderId === "string" &&
    typeof obj.amount === "number" &&
    obj.amount > 0 &&
    typeof obj.planType === "string" &&
    (VALID_PLANS as readonly string[]).includes(obj.planType)
  );
}

function nextBillingAt(planType: PlanType): {
  next_billing_at: string | null;
  expires_at: string | null;
} {
  const now = new Date();
  if (planType === "monthly") {
    const next = new Date(now);
    next.setMonth(next.getMonth() + 1);
    return { next_billing_at: next.toISOString(), expires_at: null };
  }
  const next = new Date(now);
  next.setFullYear(next.getFullYear() + 1);
  return { next_billing_at: null, expires_at: next.toISOString() };
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "paymentKey, orderId, amount, planType required" },
      { status: 400 },
    );
  }
  const { paymentKey, orderId, amount, planType } = body;

  let tossResult;
  try {
    tossResult = await confirmPayment({ paymentKey, orderId, amount });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `결제 확인 실패: ${message}` },
      { status: 502 },
    );
  }

  const { error: paymentError } = await adminDb.from("payments").insert({
    user_id: user.id,
    toss_payment_key: paymentKey,
    toss_order_id: orderId,
    plan_type: planType,
    amount,
    status: tossResult.status === "DONE" ? "done" : tossResult.status,
    paid_at: tossResult.approvedAt ?? new Date().toISOString(),
    receipt_url: tossResult.receipt?.url ?? null,
    raw_response: tossResult,
  });
  if (paymentError && paymentError.code !== "23505") {
    return NextResponse.json(
      { error: `결제 기록 저장 실패: ${paymentError.message}` },
      { status: 500 },
    );
  }

  const { next_billing_at, expires_at } = nextBillingAt(planType);
  const { error: memberError } = await adminDb
    .from("members")
    .update({
      role: "member",
      plan_type: planType,
      subscription_status: "active",
      subscribed_at: new Date().toISOString(),
      next_billing_at,
      expires_at,
      cancelled_at: null,
    })
    .eq("id", user.id);
  if (memberError) {
    return NextResponse.json(
      { error: `멤버 승급 실패: ${memberError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    planType,
    next_billing_at,
    expires_at,
    receipt_url: tossResult.receipt?.url ?? null,
  });
}
