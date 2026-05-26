/**
 * 멘토 세션 결제 수수료 분리 계산.
 *
 * 회계 규칙:
 *   - 입력은 항상 원(KRW) 단위 정수
 *   - 수수료는 amount * rate 를 내림(floor)으로 계산 → 멘토 정산이 1원 손해보지 않도록
 *   - mentor_payout = amount - platform_fee (항상 정수)
 *   - 결과적으로 platform_fee + mentor_payout = amount 가 보장됨
 *
 * 같은 행이 mentor_session_bookings 의 CHECK 제약(0007 마이그레이션)을 만족.
 */

export const DEFAULT_FEE_RATE = 0.1;

export interface FeeBreakdown {
  amount: number;
  fee_rate: number;
  platform_fee_amount: number;
  mentor_payout_amount: number;
}

export function calcFee(
  amount: number,
  rate: number = DEFAULT_FEE_RATE,
): FeeBreakdown {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(
      `calcFee: amount must be a non-negative integer (got ${amount})`,
    );
  }
  if (rate < 0 || rate > 1) {
    throw new Error(`calcFee: rate must be in [0, 1] (got ${rate})`);
  }
  const platform_fee_amount = Math.floor(amount * rate);
  const mentor_payout_amount = amount - platform_fee_amount;
  return {
    amount,
    fee_rate: rate,
    platform_fee_amount,
    mentor_payout_amount,
  };
}
