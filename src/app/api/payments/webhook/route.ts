import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { supabase as adminDb } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/toss/client";

/**
 * 토스페이먼츠 webhook 수신
 *
 * 가맹 콘솔에서 등록할 webhook URL:
 *   {SITE_URL}/api/payments/webhook
 *
 * 보안 정책:
 *   - 서명 검증 fail-closed (secret 미설정/검증 실패 → 401)
 *   - event_id 기반 dedup (없으면 eventType|orderId|paymentKey 조합 해시)
 *   - 모든 이벤트 raw payload는 webhook_events 테이블에 보존
 *
 * 처리 이벤트:
 *   - PAYMENT_DONE              결제 완료 (보조 안전망 — confirm 라우트가 우선 처리)
 *   - PAYMENT_CANCELED          결제 취소 → role 강등
 *   - CANCEL_STATUS_CHANGED     환불 상태 변경
 *   - BILLING_AUTH_PAYMENT      정기결제 자동 결제 (월간) — TODO Phase 2
 *   - BILLING_PAYMENT_FAILED    정기결제 실패 → past_due
 */

interface TossWebhookPayload {
  eventType?: string;
  eventId?: string;
  data?: {
    paymentKey?: string;
    orderId?: string;
    status?: string;
    [key: string]: unknown;
  };
}

function dedupKeyFor(payload: TossWebhookPayload, rawBody: string): string {
  if (payload.eventId) return `event:${payload.eventId}`;
  const eventType = payload.eventType ?? "UNKNOWN";
  const orderId = payload.data?.orderId ?? "";
  const paymentKey = payload.data?.paymentKey ?? "";
  // 본문 해시도 섞어 같은 (eventType, order, pay) 조합의 다른 변경도 분리.
  const bodyHash = createHash("sha256")
    .update(rawBody)
    .digest("hex")
    .slice(0, 16);
  return `hash:${eventType}:${orderId}:${paymentKey}:${bodyHash}`;
}

async function downgradeMemberByOrderId(orderId: string) {
  const { data: payment } = await adminDb
    .from("payments")
    .select("user_id")
    .eq("toss_order_id", orderId)
    .maybeSingle();
  if (!payment?.user_id) return;

  await adminDb
    .from("members")
    .update({
      role: "free",
      subscription_status: "cancelled",
      cancelled_at: new Date().toISOString(),
      next_billing_at: null,
    })
    .eq("id", payment.user_id);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("tosspayments-webhook-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: TossWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as TossWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.eventType ?? "UNKNOWN";
  const dedupKey = dedupKeyFor(payload, rawBody);

  // dedup: 같은 dedup_key가 이미 있으면 중복 → 처리하지 않고 200 응답.
  const { error: dedupError } = await adminDb.from("webhook_events").insert({
    dedup_key: dedupKey,
    event_type: eventType,
    order_id: payload.data?.orderId ?? null,
    payment_key: payload.data?.paymentKey ?? null,
    raw_payload: payload as unknown as Record<string, unknown>,
  });
  if (dedupError) {
    if (dedupError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json(
      { error: "Webhook persistence failed" },
      { status: 500 },
    );
  }

  switch (eventType) {
    case "PAYMENT_DONE":
      // confirm 라우트가 우선 처리. webhook은 보조 안전망.
      break;

    case "PAYMENT_CANCELED":
    case "CANCEL_STATUS_CHANGED": {
      const orderId = payload.data?.orderId;
      if (orderId) {
        await adminDb
          .from("payments")
          .update({ status: "cancelled" })
          .eq("toss_order_id", orderId);
        await downgradeMemberByOrderId(orderId);
      }
      break;
    }

    case "BILLING_AUTH_PAYMENT":
      // TODO Phase 2 — 빌링키 기반 정기결제 갱신 처리
      break;

    case "BILLING_PAYMENT_FAILED": {
      const orderId = payload.data?.orderId;
      if (orderId) {
        const { data: payment } = await adminDb
          .from("payments")
          .select("user_id")
          .eq("toss_order_id", orderId)
          .maybeSingle();
        if (payment?.user_id) {
          await adminDb
            .from("members")
            .update({ subscription_status: "past_due" })
            .eq("id", payment.user_id);
        }
      }
      break;
    }

    default:
      // 알 수 없는 이벤트도 webhook_events에는 이미 저장됨.
      break;
  }

  return NextResponse.json({ received: true });
}
