import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as adminDb } from "@/lib/supabase";
import { confirmPayment, type TossPaymentResponse } from "@/lib/toss/client";
import {
  isPlanType,
  priceOf,
  nextBillingDates,
  type PlanType,
} from "@/lib/payments/plans";
import { assertSameOrigin } from "@/lib/payments/origin";

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
    obj.paymentKey.length > 0 &&
    typeof obj.orderId === "string" &&
    obj.orderId.length > 0 &&
    typeof obj.amount === "number" &&
    Number.isInteger(obj.amount) &&
    obj.amount > 0 &&
    isPlanType(obj.planType)
  );
}

/**
 * Toss raw response에서 감사/UX에 필요한 필드만 추출.
 * 카드번호 등 PII 또는 내부 코드는 저장하지 않는다.
 */
function pickSafeRawResponse(toss: TossPaymentResponse) {
  return {
    paymentKey: toss.paymentKey,
    orderId: toss.orderId,
    orderName: toss.orderName,
    status: toss.status,
    method: toss.method,
    totalAmount: toss.totalAmount,
    balanceAmount: toss.balanceAmount,
    approvedAt: toss.approvedAt,
    receipt: toss.receipt?.url ? { url: toss.receipt.url } : null,
    card: toss.card?.issuerCode ? { issuerCode: toss.card.issuerCode } : null,
  };
}

export async function POST(request: NextRequest) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

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
  const { paymentKey, orderId, amount: clientAmount, planType } = body;

  // 1) 서버 진실 소스로부터 amount 결정. 클라이언트 amount는 비교 검증용.
  const serverAmount = priceOf(planType);
  if (clientAmount !== serverAmount) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  // 2) orders 매칭 — orderId가 본인 것이고, plan/amount가 일치하고, 아직 pending인지 확인.
  const { data: order, error: orderError } = await adminDb
    .from("orders")
    .select("user_id, plan_type, amount, status, expires_at")
    .eq("order_id", orderId)
    .maybeSingle();
  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (
    order.user_id !== user.id ||
    order.plan_type !== planType ||
    order.amount !== serverAmount
  ) {
    return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
  }
  if (order.status === "confirmed") {
    // 멱등성: 이미 처리된 주문이면 멤버 정보 다시 안 건드리고 ok 응답.
    const { data: existing } = await adminDb
      .from("payments")
      .select("receipt_url")
      .eq("toss_order_id", orderId)
      .maybeSingle();
    return NextResponse.json({
      ok: true,
      planType,
      idempotent: true,
      receipt_url: existing?.receipt_url ?? null,
    });
  }
  if (order.status !== "pending") {
    return NextResponse.json(
      { error: `Order is ${order.status}` },
      { status: 409 },
    );
  }
  if (new Date(order.expires_at).getTime() < Date.now()) {
    await adminDb
      .from("orders")
      .update({ status: "expired" })
      .eq("order_id", orderId)
      .eq("status", "pending");
    return NextResponse.json({ error: "Order expired" }, { status: 410 });
  }

  // 3) Toss confirm — Toss가 amount/orderId 일치 검증을 한 번 더 해줌.
  let tossResult: TossPaymentResponse;
  try {
    tossResult = await confirmPayment({
      paymentKey,
      orderId,
      amount: serverAmount,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `결제 확인 실패: ${message}` },
      { status: 502 },
    );
  }

  // 4) Toss 응답 cross-check (defense in depth)
  if (
    tossResult.orderId !== orderId ||
    tossResult.totalAmount !== serverAmount
  ) {
    return NextResponse.json(
      { error: "Toss response mismatch" },
      { status: 502 },
    );
  }

  // 5) payments insert. payment_key unique 위반(23505)은 멱등성 OK로 간주.
  const safeRaw = pickSafeRawResponse(tossResult);
  const { error: paymentError } = await adminDb.from("payments").insert({
    user_id: user.id,
    toss_payment_key: paymentKey,
    toss_order_id: orderId,
    plan_type: planType,
    amount: serverAmount,
    status: tossResult.status === "DONE" ? "done" : tossResult.status,
    paid_at: tossResult.approvedAt ?? new Date().toISOString(),
    receipt_url: tossResult.receipt?.url ?? null,
    raw_response: safeRaw,
  });
  if (paymentError && paymentError.code !== "23505") {
    return NextResponse.json({ error: "결제 기록 저장 실패" }, { status: 500 });
  }

  // 6) order를 confirmed로 마킹 (pending → confirmed 한 번만)
  const { data: confirmedOrder, error: orderUpdateError } = await adminDb
    .from("orders")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .eq("status", "pending")
    .select("order_id")
    .maybeSingle();
  if (orderUpdateError) {
    return NextResponse.json({ error: "주문 확정 실패" }, { status: 500 });
  }
  if (!confirmedOrder) {
    // 동시 요청에서 다른 쪽이 먼저 confirmed로 바꾼 경우 — 멱등 응답.
    return NextResponse.json({
      ok: true,
      planType,
      idempotent: true,
      receipt_url: tossResult.receipt?.url ?? null,
    });
  }

  // 7) members 업데이트. members.role 변경 → custom_access_token_hook이
  //    다음 access token 발급 시 app_metadata.role을 자동 주입.
  //    클라이언트는 응답 후 refreshSession() 호출(이미 success flow에서 처리).
  const { next_billing_at, expires_at } = nextBillingDates(planType);
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
    return NextResponse.json({ error: "멤버 승급 실패" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    planType,
    next_billing_at,
    expires_at,
    receipt_url: tossResult.receipt?.url ?? null,
  });
}
