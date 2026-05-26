"use client";

import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

/**
 * Toss SDK v2 wrapper — 멤버십/멘토 세션 결제 진입을 공통화.
 *
 * - clientKey 는 NEXT_PUBLIC_TOSS_CLIENT_KEY 환경변수에서 로드.
 *   값이 없으면 throw → 호출부에서 사용자 친화 메시지 표시.
 * - customerKey 는 로그인 user.id (비로그인 결제는 ANONYMOUS).
 * - 결제 메서드는 "CARD" 만 기본 노출 (가상계좌/계좌이체 등 별도 확장).
 */

export interface RequestPaymentArgs {
  customerKey: string | typeof ANONYMOUS;
  orderId: string;
  orderName: string;
  amount: number;
  successUrl: string;
  failUrl: string;
  customerEmail?: string;
}

function getClientKey(): string {
  const key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!key) {
    throw new Error(
      "Toss 결제가 아직 설정되지 않았습니다. (NEXT_PUBLIC_TOSS_CLIENT_KEY 누락)",
    );
  }
  return key;
}

export async function requestCardPayment(
  args: RequestPaymentArgs,
): Promise<void> {
  const clientKey = getClientKey();
  const tossPayments = await loadTossPayments(clientKey);
  const payment = tossPayments.payment({ customerKey: args.customerKey });

  await payment.requestPayment({
    method: "CARD",
    amount: {
      currency: "KRW",
      value: args.amount,
    },
    orderId: args.orderId,
    orderName: args.orderName,
    successUrl: args.successUrl,
    failUrl: args.failUrl,
    customerEmail: args.customerEmail,
    card: {
      useEscrow: false,
      flowMode: "DEFAULT",
      useCardPoint: false,
      useAppCardOnly: false,
    },
  });
}

export { ANONYMOUS };
