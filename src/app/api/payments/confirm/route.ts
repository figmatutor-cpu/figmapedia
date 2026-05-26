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
import { calcFee } from "@/lib/payments/fees";
import { assertSameOrigin } from "@/lib/payments/origin";

/**
 * Toss confirm 흐름. orders.kind 로 membership / mentor_session 분기.
 *
 * 클라이언트는 paymentKey / orderId / amount 만 보내면 됨.
 * (기존 멤버십 클라이언트가 planType 도 보내지만 서버는 orders 에서 결정 → 무시)
 */

interface ConfirmBody {
  paymentKey: string;
  orderId: string;
  amount: number;
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
    obj.amount > 0
  );
}

interface OrderRow {
  user_id: string;
  kind: "membership" | "mentor_session";
  plan_type: PlanType | null;
  amount: number;
  status: "pending" | "confirmed" | "cancelled" | "expired";
  expires_at: string;
  mentor_session_booking_id: string | null;
}

interface BookingRow {
  id: string;
  session_id: string;
  mentor_id: string;
  amount: number;
  fee_rate: number;
  status: string;
  mentor_sessions: { price: number } | { price: number }[] | null;
}

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

async function markOrderConfirmed(orderId: string): Promise<boolean> {
  const { data, error } = await adminDb
    .from("orders")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .eq("status", "pending")
    .select("order_id")
    .maybeSingle();
  if (error) return false;
  return data !== null;
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
      { error: "paymentKey, orderId, amount required" },
      { status: 400 },
    );
  }
  const { paymentKey, orderId, amount: clientAmount } = body;

  // 1) orders 조회 — 서버 진실 소스. kind / amount / 상태 모두 여기서 결정.
  const { data: order, error: orderError } = await adminDb
    .from("orders")
    .select(
      "user_id, kind, plan_type, amount, status, expires_at, mentor_session_booking_id",
    )
    .eq("order_id", orderId)
    .maybeSingle<OrderRow>();
  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.user_id !== user.id) {
    return NextResponse.json(
      { error: "Order owner mismatch" },
      { status: 403 },
    );
  }

  // 2) amount 검증 — 클라이언트 위변조 차단
  const serverAmount = order.amount;
  if (clientAmount !== serverAmount) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }
  if (order.kind === "membership") {
    if (!order.plan_type || !isPlanType(order.plan_type)) {
      return NextResponse.json(
        { error: "Order missing plan_type" },
        { status: 500 },
      );
    }
    // 더블 체크: orders.amount 가 plans.ts 와 일치
    if (serverAmount !== priceOf(order.plan_type)) {
      return NextResponse.json(
        { error: "Order amount drifted from plan price" },
        { status: 500 },
      );
    }
  }

  // 3) 멱등성 / 만료 처리 (공통)
  if (order.status === "confirmed") {
    const { data: existing } = await adminDb
      .from("payments")
      .select("receipt_url")
      .eq("toss_order_id", orderId)
      .maybeSingle();
    return NextResponse.json({
      ok: true,
      kind: order.kind,
      planType: order.plan_type,
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

  // 4) Toss confirm
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
  if (
    tossResult.orderId !== orderId ||
    tossResult.totalAmount !== serverAmount
  ) {
    return NextResponse.json(
      { error: "Toss response mismatch" },
      { status: 502 },
    );
  }

  const safeRaw = pickSafeRawResponse(tossResult);

  // 5) 분기 처리
  if (order.kind === "membership") {
    return await finalizeMembership({
      userId: user.id,
      orderId,
      paymentKey,
      planType: order.plan_type as PlanType,
      amount: serverAmount,
      tossResult,
      safeRaw,
    });
  }

  return await finalizeMentorSession({
    userId: user.id,
    orderId,
    paymentKey,
    bookingId: order.mentor_session_booking_id,
    amount: serverAmount,
    tossResult,
  });
}

interface FinalizeMembershipArgs {
  userId: string;
  orderId: string;
  paymentKey: string;
  planType: PlanType;
  amount: number;
  tossResult: TossPaymentResponse;
  safeRaw: ReturnType<typeof pickSafeRawResponse>;
}

async function finalizeMembership(args: FinalizeMembershipArgs) {
  const { userId, orderId, paymentKey, planType, amount, tossResult, safeRaw } =
    args;

  const { error: paymentError } = await adminDb.from("payments").insert({
    user_id: userId,
    toss_payment_key: paymentKey,
    toss_order_id: orderId,
    plan_type: planType,
    amount,
    status: tossResult.status === "DONE" ? "done" : tossResult.status,
    paid_at: tossResult.approvedAt ?? new Date().toISOString(),
    receipt_url: tossResult.receipt?.url ?? null,
    raw_response: safeRaw,
  });
  if (paymentError && paymentError.code !== "23505") {
    return NextResponse.json({ error: "결제 기록 저장 실패" }, { status: 500 });
  }

  const confirmedNow = await markOrderConfirmed(orderId);
  if (!confirmedNow) {
    return NextResponse.json({
      ok: true,
      kind: "membership" as const,
      planType,
      idempotent: true,
      receipt_url: tossResult.receipt?.url ?? null,
    });
  }

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
    .eq("id", userId);
  if (memberError) {
    return NextResponse.json({ error: "멤버 승급 실패" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    kind: "membership" as const,
    planType,
    next_billing_at,
    expires_at,
    receipt_url: tossResult.receipt?.url ?? null,
  });
}

interface FinalizeMentorSessionArgs {
  userId: string;
  orderId: string;
  paymentKey: string;
  bookingId: string | null;
  amount: number;
  tossResult: TossPaymentResponse;
}

async function finalizeMentorSession(args: FinalizeMentorSessionArgs) {
  const { userId, orderId, paymentKey, bookingId, amount, tossResult } = args;

  if (!bookingId) {
    return NextResponse.json(
      { error: "Order missing mentor_session_booking_id" },
      { status: 500 },
    );
  }

  // booking + session 가격 cross-check (drift 방지)
  const { data: booking, error: bookingError } = await adminDb
    .from("mentor_session_bookings")
    .select(
      "id, session_id, mentor_id, amount, fee_rate, status, mentor_sessions(price)",
    )
    .eq("id", bookingId)
    .eq("user_id", userId)
    .maybeSingle<BookingRow>();
  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  const sessionPrice = Array.isArray(booking.mentor_sessions)
    ? (booking.mentor_sessions[0]?.price ?? null)
    : (booking.mentor_sessions?.price ?? null);
  if (sessionPrice === null) {
    return NextResponse.json(
      { error: "Mentor session price unavailable" },
      { status: 500 },
    );
  }
  if (booking.amount !== amount || sessionPrice !== amount) {
    return NextResponse.json(
      { error: "Booking amount mismatch" },
      { status: 400 },
    );
  }

  // booking 이 이미 paid 면 멱등 응답
  if (booking.status === "paid" || booking.status === "completed") {
    return NextResponse.json({
      ok: true,
      kind: "mentor_session" as const,
      bookingId,
      idempotent: true,
      receipt_url: tossResult.receipt?.url ?? null,
    });
  }
  if (booking.status !== "pending_payment") {
    return NextResponse.json(
      { error: `Booking is ${booking.status}` },
      { status: 409 },
    );
  }

  const fee = calcFee(amount, booking.fee_rate);

  const { error: bookingUpdateError } = await adminDb
    .from("mentor_session_bookings")
    .update({
      status: "paid",
      toss_payment_key: paymentKey,
      platform_fee_amount: fee.platform_fee_amount,
      mentor_payout_amount: fee.mentor_payout_amount,
    })
    .eq("id", bookingId)
    .eq("status", "pending_payment");
  if (bookingUpdateError) {
    return NextResponse.json({ error: "예약 확정 실패" }, { status: 500 });
  }

  const confirmedNow = await markOrderConfirmed(orderId);
  if (!confirmedNow) {
    return NextResponse.json({
      ok: true,
      kind: "mentor_session" as const,
      bookingId,
      idempotent: true,
      receipt_url: tossResult.receipt?.url ?? null,
    });
  }

  return NextResponse.json({
    ok: true,
    kind: "mentor_session" as const,
    bookingId,
    platform_fee_amount: fee.platform_fee_amount,
    mentor_payout_amount: fee.mentor_payout_amount,
    receipt_url: tossResult.receipt?.url ?? null,
  });
}
