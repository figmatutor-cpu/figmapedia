import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as adminDb } from "@/lib/supabase";
import { assertSameOrigin } from "@/lib/payments/origin";
import { SESSION_TYPE_LABEL } from "@/types/mentor";

/**
 * 멘토 세션 결제 시작.
 *
 * 흐름:
 *   1) 로그인 사용자가 본인의 booking 을 만든다 (status=pending_payment, amount=price, fee=0)
 *   2) 결제 추적용 orders row 생성 (kind='mentor_session', mentor_session_booking_id 연결)
 *   3) 클라이언트는 응답의 orderId/amount 로 Toss SDK requestPayment 호출
 *
 * 수수료는 confirm 시점에 계산해서 booking 에 채운다 (calcFee).
 */

interface SessionRow {
  id: string;
  mentor_id: string;
  type: "mentoring" | "workshop" | "study";
  title: string;
  price: number;
  max_participants: number;
  status: "open" | "closed" | "completed" | "cancelled";
}

function makeOrderId(): string {
  return `ms_${Date.now()}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const { id: sessionId } = await context.params;
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: session, error: sessionError } = await adminDb
    .from("mentor_sessions")
    .select("id, mentor_id, type, title, price, max_participants, status")
    .eq("id", sessionId)
    .maybeSingle<SessionRow>();
  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status !== "open") {
    return NextResponse.json(
      { error: `Session is ${session.status}` },
      { status: 409 },
    );
  }
  if (session.mentor_id === user.id) {
    return NextResponse.json(
      { error: "본인 세션은 신청할 수 없습니다" },
      { status: 400 },
    );
  }
  if (session.price <= 0) {
    return NextResponse.json(
      { error: "무료 세션은 결제 흐름을 거치지 않습니다" },
      { status: 400 },
    );
  }

  const amount = session.price;
  const orderId = makeOrderId();

  const { data: booking, error: bookingError } = await adminDb
    .from("mentor_session_bookings")
    .insert({
      session_id: session.id,
      mentor_id: session.mentor_id,
      user_id: user.id,
      toss_order_id: orderId,
      amount,
      status: "pending_payment",
    })
    .select("id")
    .maybeSingle<{ id: string }>();
  if (bookingError || !booking) {
    return NextResponse.json({ error: "예약 생성 실패" }, { status: 500 });
  }

  const { error: orderError } = await adminDb.from("orders").insert({
    order_id: orderId,
    user_id: user.id,
    kind: "mentor_session",
    mentor_session_booking_id: booking.id,
    amount,
    status: "pending",
  });
  if (orderError) {
    return NextResponse.json({ error: "결제 주문 생성 실패" }, { status: 500 });
  }

  return NextResponse.json({
    orderId,
    amount,
    bookingId: booking.id,
    orderName: `${SESSION_TYPE_LABEL[session.type]} · ${session.title}`.slice(
      0,
      100,
    ),
  });
}
