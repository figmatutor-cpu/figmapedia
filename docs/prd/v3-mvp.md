# PRD v3 — Figmapedia × AI 실험실 MVP

**디자이너의 AI 실험실 (Designer's AI Lab)** — figmapedia.com 통합 MVP

> 2026년 5월 | v3.0 (Phase 1 MVP 확정안)
> 이전 버전: [PRD_v2_Figmapedia통합.md](./PRD_v2_Figmapedia통합.md) · [브랜드전략\_디자이너의AI실험실\_v4.md](./브랜드전략_디자이너의AI실험실_v4.md)

---

## 1. v2 → v3 변경 요약

검증 우선 MVP 정신에 따라 **스코프를 1/3로 축소**하고, **현실적 결제 PG**로 교체했습니다.

| 항목              | v2                   | v3                                     | 이유                                      |
| :---------------- | :------------------- | :------------------------------------- | :---------------------------------------- |
| 전체 일정         | 8주 풀스코프         | **Phase 1 (6~8주) + Phase 2/3 분리**   | 1인/소수팀 현실성                         |
| 결제 PG           | Stripe               | **토스페이먼츠**                       | Stripe는 한국 사업자 정기결제 정식 미지원 |
| 가격              | 월 4,900 / 연 49,000 | **월 5,900 / 연 49,000** (연 31% 할인) | 사용자 결정                               |
| 멘토 시스템       | M1~M7 전체 포함      | **Phase 3로 이연**                     | 멘토 승급 조건상 12주 이전 가동 불가능    |
| 마이페이지        | Phase 1              | **Phase 2로 이연**                     | PG 포털로 우회 가능                       |
| 아카이브 검색     | Phase 1              | **Phase 2로 이연**                     | 콘텐츠 누적 후 의미 발생                  |
| VOD               | Vimeo OTT (월 1~3만) | **YouTube Live Unlisted → VOD**        | 비용 0원, 자동 변환                       |
| 자동화            | Zapier               | **Supabase Edge Function**             | SPOF 제거, 안정성                         |
| 콘텐츠 저장       | Notion DB            | **Supabase(메타) + MDX(본문)**         | 버전관리 + SEO                            |
| 스터디 공간       | 없음                 | **신규: 오프라인 + 온라인 예약 안내**  | 사용자 추가 요구                          |
| Discord 봇 자동화 | Phase 1              | **Phase 2로 이연 (수동 운영)**         | 베타 30명까지 수동이 빠름                 |

---

## 2. 제품 개요

| 항목        | 내용                                                          |
| :---------- | :------------------------------------------------------------ |
| 제품명      | **디자이너의 AI 실험실** (figmapedia.com/ai-lab)              |
| 브랜드 컨셉 | "투표하고, 실험하고, 공유하고, 발표하는 순환 커뮤니티"        |
| 핵심 루프   | 무료 콘텐츠(figmapedia) → 실험실(투표/실험/발표) → 멤버 전환  |
| 타겟        | 주니어~미드레벨 디자이너 (1~5년차)                            |
| 수익 모델   | 월 5,900원 멤버십 (단일 요금제)                               |
| 기술 스택   | Next.js 16 + Supabase + 토스페이먼츠 + YouTube Live + Discord |

---

## 3. Phase 1 스코프 (확정)

### 3-1. 검증할 가설

**"기존 figmapedia 트래픽에서 월 5,900원 유료 멤버가 실제로 나오는가?"**

→ 베타 30명 / 유료 전환 5~10명이 최소 검증 기준. 미달 시 Phase 2 진행 보류.

### 3-2. 페이지 맵

| URL                            | 상태 | 인증 유형         | 핵심 요소                                 |
| :----------------------------- | :--- | :---------------- | :---------------------------------------- |
| `/`                            | 수정 | A (공개)          | AI 실험실 섹션 + 가입 CTA 추가            |
| `/prompt-pedia`                | 수정 | A (공개)          | 각 프롬프트 하단 전환 CTA 추가            |
| `/ai-lab`                      | 신규 | A (공개)          | 이번주 주제 + 리포트 리스트 + 라이브 일정 |
| `/ai-lab/[slug]`               | 신규 | **B (부분 공개)** | 리포트 상세 — 비회원 30% / 멤버 100%      |
| `/ai-lab/live`                 | 신규 | A (공개)          | YouTube Live 임베드 + 다음 라이브 일정    |
| `/ai-lab/vod/[id]`             | 신규 | **C (멤버 전용)** | YouTube Unlisted 영상                     |
| `/membership`                  | 신규 | A (공개)          | 결제 페이지 (월/연 선택)                  |
| `/study-room`                  | 신규 | **C (멤버 전용)** | 오프라인 공간 안내 + 예약 폼 + 예약 현황  |
| `/auth/login` `/auth/callback` | 신규 | A                 | Supabase Auth                             |
| `/membership/success`          | 신규 | C                 | 결제 성공 + 세션 refresh                  |

### 3-3. 페이지 유형 분류 (인증/캐싱 전략)

| 유형                   | 정의               | 처리                             |
| :--------------------- | :----------------- | :------------------------------- |
| **A. 완전 공개**       | SEO 페이지         | ISR/SSG, middleware 통과 안 함   |
| **B. 부분 공개**       | 30%/100% 본문 분기 | SSG 30% + 클라이언트 fetch로 70% |
| **C. 멤버 전용**       | 결제자만 접근      | middleware로 보호, no-cache      |
| **D. 메타데이터 공개** | 예: 라이브 일정    | ISR (수정 빈도 낮음)             |

### 3-4. 제외된 기능 (Phase 2/3로 이연)

- /mentors, /mentors/[id]
- /mypage (대시보드)
- /ai-lab/archive (검색)
- Discord 봇 자동화
- 멘토 승급 시스템
- 멘토 유료 세션
- 뱃지 자동 부여
- 베스트 투표 자동 집계
- Stibee 뉴스레터 자동화
- Zapier

---

## 4. 기술 스택

| 영역                | 선택                                    | 비고         |
| :------------------ | :-------------------------------------- | :----------- |
| 프론트엔드          | Next.js 16.1 + React 19 + TypeScript 5  | AS-IS        |
| 스타일              | Tailwind CSS 4 + CSS custom properties  | AS-IS        |
| DB + Auth + Storage | **Supabase**                            | AS-IS (확장) |
| 결제                | **토스페이먼츠** (월간=빌링, 연간=단건) | 신규         |
| 라이브 + VOD        | **YouTube Live** (Unlisted 다시보기)    | 신규         |
| 커뮤니티            | Discord (수동 운영)                     | 신규         |
| 콘텐츠 본문         | **MDX** (`content/experiments/*.mdx`)   | 신규         |
| 콘텐츠 메타         | Supabase `experiments` 테이블           | 신규         |
| 캐시                | `unstable_cache` + ISR (기존 유지)      | AS-IS        |
| 자동화              | Supabase Edge Function (webhook 처리)   | 신규         |

**예상 월 운영비**: 0 ~ 5만원 (Vercel Hobby + Supabase Free + 도메인)

---

## 5. DB 스키마 (Phase 1)

기존 figmapedia Supabase 테이블은 유지하고 아래만 추가합니다. 상세 SQL은 [supabase/migrations/0001_init_members.sql](./supabase/migrations/0001_init_members.sql) 참조.

### 5-1. `members`

| 컬럼                    | 타입                          | 설명                          |
| :---------------------- | :---------------------------- | :---------------------------- |
| id                      | uuid (PK, FK → auth.users.id) | Supabase Auth 연결            |
| role                    | enum (free/member/admin)      | 권한 등급 (mentor는 Phase 3)  |
| plan_type               | enum (monthly/annual)         | nullable                      |
| toss_billing_key        | text                          | 월간 정기결제 빌링키          |
| toss_customer_key       | text                          | 토스 고객 식별자              |
| subscription_status     | text                          | active / cancelled / past_due |
| subscribed_at           | timestamptz                   | 최초 결제일                   |
| next_billing_at         | timestamptz                   | 다음 결제일 (월간만)          |
| expires_at              | timestamptz                   | 연간 만료일                   |
| cancelled_at            | timestamptz                   | 해지일                        |
| discord_id              | text                          | 수동 입력 (Phase 1)           |
| created_at / updated_at | timestamptz                   |                               |

### 5-2. `experiments` (메타데이터)

| 컬럼         | 타입                             | 설명                        |
| :----------- | :------------------------------- | :-------------------------- |
| id           | uuid (PK)                        |                             |
| slug         | text unique                      | URL용 (`/ai-lab/[slug]`)    |
| mdx_path     | text                             | 본문 파일 경로              |
| title        | text                             |                             |
| week         | date                             | 실험 주차                   |
| tool_name    | text                             | Claude, Cursor, Figma AI 등 |
| summary      | text                             | 30% 공개 요약               |
| tags         | text[]                           |                             |
| author_id    | uuid (FK → members.id, nullable) | Phase 1에서는 운영자가 작성 |
| is_published | boolean                          |                             |
| published_at | timestamptz                      |                             |

### 5-3. `payments`

| 컬럼             | 타입                   | 설명                        |
| :--------------- | :--------------------- | :-------------------------- |
| id               | uuid (PK)              |                             |
| user_id          | uuid (FK → members.id) |                             |
| toss_payment_key | text                   | 토스 결제 식별자            |
| toss_order_id    | text unique            |                             |
| plan_type        | enum (monthly/annual)  |                             |
| amount           | int                    | 5900 또는 49000             |
| status           | text                   | done / cancelled / refunded |
| paid_at          | timestamptz            |                             |
| receipt_url      | text                   | 토스 영수증                 |

### 5-4. `study_reservations`

| 컬럼        | 타입                               | 설명                                           |
| :---------- | :--------------------------------- | :--------------------------------------------- |
| id          | uuid (PK)                          |                                                |
| user_id     | uuid (FK → members.id)             |                                                |
| reserved_at | date                               | 사용 날짜                                      |
| time_slot   | text                               | morning / afternoon / evening (Phase 1 단순화) |
| status      | enum (pending/confirmed/cancelled) | 운영자 확정 워크플로우                         |
| note        | text                               | 사용 목적                                      |
| created_at  | timestamptz                        |                                                |

### 5-5. `vods`

| 컬럼             | 타입                                 | 설명                     |
| :--------------- | :----------------------------------- | :----------------------- |
| id               | uuid (PK)                            |                          |
| youtube_id       | text                                 | YouTube Unlisted 영상 ID |
| title            | text                                 |                          |
| recorded_at      | date                                 | 라이브 날짜              |
| experiment_id    | uuid (FK → experiments.id, nullable) | 연결 리포트              |
| duration_seconds | int                                  |                          |

---

## 6. 결제 흐름

### 6-1. 월간 정기결제 (토스 빌링)

```
1. 사용자 /membership에서 "월 5,900원" 선택
2. 토스페이먼츠 SDK → 카드 등록 → 빌링키 발급
3. 첫 결제 즉시 실행 (5,900원)
4. Webhook → Supabase Edge Function
   → members.role = 'member'
   → members.toss_billing_key 저장
   → next_billing_at = now() + 1 month
5. Edge Function이 매월 next_billing_at에 자동 결제 실행
```

### 6-2. 연간 단건결제

```
1. 사용자 /membership에서 "연 49,000원" 선택
2. 토스페이먼츠 SDK → 단건 결제
3. Webhook → Supabase Edge Function
   → members.role = 'member'
   → expires_at = now() + 1 year
4. expires_at 도래 시 cron으로 role = 'free' 강등
```

### 6-3. 해지 흐름

- 월간: 마이페이지 부재이므로 **이메일/카카오톡 문의 → 운영자 수동 처리** (Phase 1)
- 연간: 환불 정책 7일 이내 청약철회권만 적용
- Phase 2에서 마이페이지 + 자동 해지 도입

---

## 7. 인증 × 캐싱 전략

### 7-1. middleware matcher

```ts
export const config = {
  matcher: [
    "/ai-lab/vod/:path*",
    "/study-room/:path*",
    "/membership/success",
    "/api/members/:path*",
    "/api/experiments/:id/full",
  ],
};
```

→ SEO 페이지(/, /prompt-pedia, /figma-info, /community 등)는 **middleware 통과 안 함**. 기존 캐싱 무손상.

### 7-2. JWT custom claims (성능)

Supabase JWT에 `role`을 박는 hook 사용. middleware는 **로컬 JWT 검증**만 수행 → DB 조회 0회.

### 7-3. B 유형 (부분 공개) Hybrid Rendering

- SSG 단계 (빌드 타임): 제목, 메타, 30% 요약, OG, schema.org Article + paywall 마크업
- 클라이언트 fetch (멤버만): `GET /api/experiments/[id]/full` → 70% MDX 본문 렌더링

### 7-4. SEO 페이월 마크업

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "isAccessibleForFree": false,
  "hasPart": {
    "@type": "WebPageElement",
    "isAccessibleForFree": false,
    "cssSelector": ".paywall-content"
  }
}
```

→ Google이 페이월 본문도 인덱싱하면서 사용자에겐 페이월 표시.

---

## 8. 콘텐츠 운영 모델 (Phase 1)

### 8-1. 실험 리포트 작성 흐름

```
1. 운영자가 MDX 파일 작성: content/experiments/2026-W22-claude-wireframe.mdx
2. Supabase experiments 테이블에 메타 INSERT
3. git push → Vercel 자동 배포 → ISR 갱신
```

### 8-2. MDX 파일 구조

```mdx
---
slug: 2026-W22-claude-wireframe
title: Claude로 와이어프레임 그리기
week: 2026-05-25
tool: Claude
summary: |
  Claude의 새로운 이미지 생성 기능을 활용해...
  (이 요약은 30% 공개됨)
---

## 실험 배경

(여기부터 70%는 멤버 전용)

<ResultCard score={4.5} tool="Claude">
  적용가능성: 높음
</ResultCard>
```

### 8-3. Phase 1 콘텐츠 목표

- 출시 시점에 **실험 리포트 3건** 준비 (운영자 직접 작성)
- 라이브 1회 (사전 녹화 가능)
- 베타 기간 4주 동안 리포트 4건 + 라이브 2회 추가

---

## 9. 사업/법무 상태

| 항목                          | 상태                       |
| :---------------------------- | :------------------------- |
| 사업자등록                    | 완료                       |
| 통신판매업 신고               | 완료                       |
| 이용약관 / 환불정책           | Phase 1 출시 전 작성 필요  |
| 개인정보처리방침 업데이트     | Auth 도입 시 작성 필요     |
| 토스페이먼츠 가맹 + 빌링 신청 | 진행 필요 (개발 병행 가능) |

---

## 10. 마일스톤 (6~8주)

| 주차   | 액션                                            | 산출물                     |
| :----- | :---------------------------------------------- | :------------------------- |
| Week 1 | Supabase 셋업 + 스키마 + Auth + 토스 가맹 신청  | DB 마이그레이션, Auth 동작 |
| Week 2 | middleware + 인증 + JWT custom claims           | 인증 보호 동작             |
| Week 3 | 토스페이먼츠 통합 (월간 빌링 + 연간 단건)       | 결제 → 멤버 승급 동작      |
| Week 4 | /ai-lab, /ai-lab/[slug] 페이지 + MDX 파이프라인 | 리포트 1건 표시            |
| Week 5 | /ai-lab/live, /ai-lab/vod, /study-room          | 멤버 전용 콘텐츠 동작      |
| Week 6 | 홈/프롬프트피디아 CTA + 약관/정책 + QA          | 전체 흐름 통과             |
| Week 7 | 베타 20~30명 클로즈드 테스트                    | 피드백 수집                |
| Week 8 | 베타 피드백 반영 + 990원 프로모 론칭            | 첫 유료 멤버               |

상세 티켓: [MVP_TASKS.md](./MVP_TASKS.md)

---

## 11. Phase 2/3 예고

### Phase 2 (+4주)

- /mypage (구독 관리 + 활동 이력)
- /ai-lab/archive 검색 (Fuse.js 또는 Supabase FTS)
- Discord 결제 → 역할 자동화 (Edge Function 직접)
- experiments 멤버 직접 기여 폼
- 해지 webhook 자동화

### Phase 3 (+4주)

- /mentors, /mentors/[id]
- 멘토 승급 시스템
- 멘토 유료 세션 (일반 결제)
- 수익 정산 (수동 월 1회)

---

## 12. KPI (Phase 1 한정, 보수적)

| 지표              | 베타 (4주) | 론칭 후 1개월 | 3개월       |
| :---------------- | :--------- | :------------ | :---------- |
| 가입자            | 30명       | 100명         | 300명       |
| 유료 전환         | 5~10명     | 20~30명       | 60~90명     |
| 990원→정가 전환율 | —          | —             | 40%+ (보수) |
| 월 매출           | —          | ~17만         | ~50만       |

→ v2의 "3개월 150명, 월 123만"은 Phase 2 가동 후 도달 목표로 재정의.

---

## 13. 리스크 + 대응

| 리스크                     | 대응                                                                |
| :------------------------- | :------------------------------------------------------------------ |
| 토스 빌링 심사 지연        | 사업자등록 완료 상태이므로 1~2주 내 가능. 개발 병행.                |
| YouTube Unlisted 링크 유출 | 99% 케이스 OK. 800명 시점에 Cloudflare Stream 검토.                 |
| MDX 작성 부담              | 운영자 1명이 주 1건 작성 가능한지 베타에서 검증. 부족 시 격주 발행. |
| 스터디공간 예약 충돌       | Phase 1은 운영자 수동 확정. 충돌 시 수동 조정.                      |
| 결제 후 JWT 미갱신         | /membership/success에서 명시적 refreshSession() 호출.               |

---

**Last Updated**: 2026-05-22
**Project**: Figmapedia Renewal × Designer's AI Lab
**Status**: Phase 1 MVP 확정안
