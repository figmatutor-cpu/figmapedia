/**
 * 토스페이먼츠 서버 측 헬퍼 (Phase 1 — stub)
 *
 * 환경변수 (가맹 승인 후 채울 자리):
 *   - TOSS_SECRET_KEY        — 시크릿 키 (서버 전용, NEXT_PUBLIC 금지)
 *   - NEXT_PUBLIC_TOSS_CLIENT_KEY — 클라이언트 키 (위젯용)
 *   - TOSS_WEBHOOK_SECRET    — 웹훅 signature 검증용
 *
 * 가맹 승인 전엔 ENV가 없어 호출 시 명시적 에러를 던집니다. 라우트 자체는
 * 401/500으로 응답하지만 결제 시도 자체가 안 되므로 안전.
 */

const TOSS_API_BASE = "https://api.tosspayments.com";

function getSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) {
    throw new Error(
      "TOSS_SECRET_KEY is not configured. 가맹 승인 후 환경변수를 채워주세요.",
    );
  }
  return key;
}

function basicAuth(): string {
  const key = getSecretKey();
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  totalAmount: number;
  balanceAmount: number;
  method: string;
  approvedAt: string;
  receipt?: { url?: string };
  card?: { issuerCode?: string; number?: string };
  [key: string]: unknown;
}

export async function confirmPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossPaymentResponse> {
  const res = await fetch(`${TOSS_API_BASE}/v1/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      (json.message as string | undefined) ??
      `Toss confirm failed: ${res.status}`;
    throw new Error(message);
  }
  return json as TossPaymentResponse;
}

export async function cancelPayment(params: {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
}): Promise<TossPaymentResponse> {
  const res = await fetch(
    `${TOSS_API_BASE}/v1/payments/${encodeURIComponent(params.paymentKey)}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: basicAuth(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cancelReason: params.cancelReason,
        ...(params.cancelAmount !== undefined && {
          cancelAmount: params.cancelAmount,
        }),
      }),
      cache: "no-store",
    },
  );
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      (json.message as string | undefined) ??
      `Toss cancel failed: ${res.status}`;
    throw new Error(message);
  }
  return json as TossPaymentResponse;
}

/**
 * 토스 webhook signature 검증 (헤더 `TossPayments-Webhook-Signature`).
 * Phase 1 stub — 실제 알고리즘(HMAC-SHA256)은 가맹 콘솔에서 시크릿 받은 뒤 구현.
 */
export function verifyWebhookSignature(
  _payload: string,
  _signature: string,
): boolean {
  const secret = process.env.TOSS_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(
      "[toss/webhook] TOSS_WEBHOOK_SECRET not set. Phase 1 stub returns false.",
    );
    return false;
  }
  return false;
}
