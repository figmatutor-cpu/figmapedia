import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as adminDb } from "@/lib/supabase";
import { isPlanType, priceOf, type PlanType } from "@/lib/payments/plans";
import { assertSameOrigin } from "@/lib/payments/origin";

/**
 * 결제 시작 — 서버가 orderId/amount를 발급해 orders에 pending row 저장.
 * 클라이언트는 응답의 orderId/amount를 그대로 Toss SDK requestPayment에 넘긴다.
 *
 * 이렇게 해야 confirm 단계에서 (orderId, user_id, plan_type, amount) 매칭으로
 * 위변조를 차단할 수 있다.
 */

interface PrepareBody {
  planType: PlanType;
}

function isValidBody(v: unknown): v is PrepareBody {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return isPlanType(obj.planType);
}

function makeOrderId(): string {
  // Toss orderId: 6~64자, 영문/숫자/-/_ 만 허용
  return `fp_${Date.now()}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
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
      { error: "planType required (monthly | annual)" },
      { status: 400 },
    );
  }

  const { planType } = body;
  const amount = priceOf(planType);
  const orderId = makeOrderId();

  const { error: insertError } = await adminDb.from("orders").insert({
    order_id: orderId,
    user_id: user.id,
    plan_type: planType,
    amount,
    status: "pending",
  });
  if (insertError) {
    return NextResponse.json({ error: "결제 주문 생성 실패" }, { status: 500 });
  }

  return NextResponse.json({
    orderId,
    amount,
    planType,
    orderName:
      planType === "annual"
        ? "디자이너의 AI 실험실 — 연간 멤버십"
        : "디자이너의 AI 실험실 — 월간 멤버십",
  });
}
