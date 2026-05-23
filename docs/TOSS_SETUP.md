# 토스페이먼츠 연동 셋업 (W3 가맹 승인 후)

## 환경변수 (`.env.local`에 추가)

```bash
# 클라이언트 키 — 결제 위젯에서 사용 (브라우저 노출 OK)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxxxxxxxxxxxxxx

# 시크릿 키 — 서버 전용. NEXT_PUBLIC_ 절대 금지
TOSS_SECRET_KEY=test_sk_xxxxxxxxxxxxxxxx

# webhook signature 검증용
TOSS_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
```

테스트 키는 토스 콘솔 → 상점 → 개발자센터 → API 키. 운영 키는 가맹 심사 통과 후 동일 위치.

## 가맹 신청 시 체크 항목

| 항목            | 설명                                                                          |
| --------------- | ----------------------------------------------------------------------------- |
| 일반결제        | 단건 결제용 (연간 49,000원 사용)                                              |
| 자동결제 (빌링) | 정기결제용 (월간 5,900원 사용). 별도 심사 필요                                |
| webhook URL     | `https://figmapediarenewal.vercel.app/api/payments/webhook`                   |
| successUrl      | `https://figmapediarenewal.vercel.app/membership/success` (위젯 호출 시 전달) |
| failUrl         | `https://figmapediarenewal.vercel.app/membership?status=fail`                 |

## 구현된 파일 (Phase 1 stub)

| 경로                                                  | 역할                                                    |
| ----------------------------------------------------- | ------------------------------------------------------- |
| `src/lib/toss/client.ts`                              | confirm/cancel 서버 헬퍼 + webhook signature 검증 자리  |
| `src/app/api/payments/confirm/route.ts`               | POST — 결제 confirm + payments INSERT + members 승급    |
| `src/app/api/payments/webhook/route.ts`               | POST — webhook 이벤트 분기 (signature 검증 자리 포함)   |
| `src/app/membership/success/page.tsx`                 | 결제 직후 페이지 (middleware 보호)                      |
| `src/components/membership/MembershipSuccessFlow.tsx` | 클라이언트 — confirm POST + 세션 refresh + Discord 안내 |

## 가맹 승인 후 해야 할 일

1. **`.env.local`에 위 3개 키 추가** + dev 서버 재시작
2. **`src/lib/toss/client.ts`의 `verifyWebhookSignature` 구현**
   - 토스 문서: HMAC-SHA256(secret, rawBody) 비교
3. **`src/app/membership/page.tsx` 결제 위젯 통합**
   - `@tosspayments/tosspayments-sdk`의 `loadTossPayments` 사용
   - 월간(빌링) / 연간(단건) 분기 처리
   - successUrl로 `/membership/success?paymentKey=...&orderId=...&amount=...&planType=...` 전달
4. **월간 정기결제 cron 추가**
   - Supabase Cron 또는 Vercel Cron
   - 매일 `next_billing_at <= now()` AND `subscription_status='active'` 멤버 조회
   - 빌링 API로 자동 결제 → 성공 시 `next_billing_at += 1 month`, 실패 시 `subscription_status='past_due'`
5. **연간 만료 cron 추가**
   - 매일 `expires_at < now()` AND `plan_type='annual'` AND `role='member'` 조회 → `role='free'`
6. **terms/privacy 보강**
   - 정기결제 안내, 자동 갱신, 청약 철회권, 결제 위탁(토스페이먼츠 처리 위탁)
7. **테스트**
   - 토스 테스트 카드로 월간/연간 각각 1회 결제
   - 환불 1건 webhook 수신 확인
   - 정기결제 자동 결제 시뮬레이션 (cron 수동 트리거)

## 흐름 다이어그램

```
[/membership] 결제 버튼
       ↓ widget.requestPayment()
[토스 결제창]
       ↓ 결제 성공
[브라우저] → successUrl 리다이렉트
       ↓ /membership/success?paymentKey=&orderId=&amount=&planType=
[MembershipSuccessFlow] useEffect
       ↓ POST /api/payments/confirm
[/api/payments/confirm]
       ↓ confirmPayment (토스 API)
       ↓ payments INSERT
       ↓ members UPDATE (role='member')
       ↓ 응답 { ok, planType, next_billing_at }
[클라이언트] supabase.auth.refreshSession() → JWT에 role 반영
       ↓ UI 완료 상태 + Discord 입장 안내
```

## 정기결제 (월간) 별도 흐름

월간은 단건 confirm 외에 빌링키 발급도 필요. Phase 1 confirm route는 단건만 처리. 빌링키 발급 흐름은 가맹 승인 후 별도 구현 (`/api/payments/billing-auth`).

## 비상 대응

- **confirm은 성공했는데 멤버 승급이 안 된 경우**: payments 테이블에 row는 있고 members.role이 'free'인 케이스. 운영자가 `/admin/members`에서 수동으로 role='member' 변경 또는 Supabase SQL Editor에서 일괄 처리.
- **webhook이 안 도착하는 경우**: 토스 콘솔에서 webhook 재전송 또는 confirm route만으로 충분한지 검토 (대부분 confirm route가 1차 처리).
- **환불 요청**: 운영자가 cancelPayment 호출 + members.subscription_status='cancelled'.

## 출시 후 모니터링

- Supabase Dashboard → Table Editor → `payments` 테이블 일일 row 증가 확인
- 토스 콘솔 → 거래 내역 vs payments 테이블 일치 여부 (매주 reconciliation)
- `/admin` 대시보드 — 유료 회원 수 변화 모니터링
