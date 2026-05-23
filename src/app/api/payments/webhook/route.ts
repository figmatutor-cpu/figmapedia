import { NextResponse, type NextRequest } from "next/server";
import { supabase as adminDb } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/toss/client";

/**
 * 토스페이먼츠 webhook 수신 — Phase 1 stub
 *
 * 가맹 콘솔에서 등록할 webhook URL:
 *   {SITE_URL}/api/payments/webhook
 *
 * 처리할 이벤트:
 *   - PAYMENT_DONE              결제 완료 (단건)
 *   - PAYMENT_CANCELED          결제 취소
 *   - CANCEL_STATUS_CHANGED     환불 상태 변경
 *   - BILLING_AUTH_PAYMENT      정기결제 자동 결제 (월간)
 *   - BILLING_PAYMENT_FAILED    정기결제 실패
 *
 * Phase 1엔 confirm route(POST /api/payments/confirm)에서 직접 처리하므로
 * webhook은 보조 안전망 + 정기결제 자동 처리용. 가맹/빌링 키 받은 뒤
 * verifyWebhookSignature 구현 + 이벤트별 처리 추가.
 */

interface TossWebhookPayload {
  eventType?: string;
  data?: {
    paymentKey?: string;
    orderId?: string;
    status?: string;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("tosspayments-webhook-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[toss/webhook] signature verification failed or stub");
    if (process.env.TOSS_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: TossWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as TossWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.eventType ?? "UNKNOWN";
  console.log("[toss/webhook] event:", eventType, payload.data?.orderId);

  switch (eventType) {
    case "PAYMENT_DONE":
      break;

    case "PAYMENT_CANCELED":
    case "CANCEL_STATUS_CHANGED": {
      const orderId = payload.data?.orderId;
      if (orderId) {
        await adminDb
          .from("payments")
          .update({ status: "cancelled" })
          .eq("toss_order_id", orderId);
      }
      break;
    }

    case "BILLING_AUTH_PAYMENT":
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
      console.log("[toss/webhook] unhandled event:", eventType);
  }

  return NextResponse.json({ received: true });
}
