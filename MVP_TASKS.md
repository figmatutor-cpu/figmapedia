# Phase 1 MVP 작업 티켓 (6~8주)

> [PRD_v3_MVP.md](./PRD_v3_MVP.md) 기반. 각 티켓은 `[T-XXX]` 식별자로 추적.
> ☐ pending / 🔄 in progress / ☑ done

---

## 🗓 일정 개요

| 주차 | 핵심 목표                                 | 종료 시점 검증              |
| :--- | :---------------------------------------- | :-------------------------- |
| W1   | Supabase + Auth + 토스 가맹 신청          | 로그인 동작, 빌링 심사 접수 |
| W2   | 인증 middleware + JWT claims              | 멤버 페이지 보호 동작       |
| W3   | 토스페이먼츠 결제 통합                    | 테스트 결제 → 멤버 승급     |
| W4   | MDX 파이프라인 + /ai-lab + /ai-lab/[slug] | 리포트 1건 표시 (30%/100%)  |
| W5   | /ai-lab/live, /vod, /study-room           | 멤버 전용 콘텐츠 동작       |
| W6   | 홈/프롬프트 CTA + 약관 + QA               | 전체 흐름 end-to-end        |
| W7   | 베타 클로즈드 (20~30명)                   | 피드백 5건+ 수집            |
| W8   | 피드백 반영 + 990원 프로모 론칭           | 첫 유료 멤버                |

---

## 🗂 병행 트랙 (개발 외)

```
[T-100] 사업/법무 트랙 (W1부터 병행, 개발과 무관)
[T-200] 콘텐츠 트랙 (W2부터 병행, MDX 리포트 3건 작성)
[T-300] 디자인 트랙 (W1~W3, 페이지 와이어프레임 + 컴포넌트)
```

---

## Week 1 — Supabase 셋업 + 토스 가맹 신청

### [T-001] Supabase 프로젝트 확인/생성

- [ ] 기존 figmapedia Supabase 프로젝트 재사용 가능 여부 확인
- [ ] 신규 생성 시 region: `ap-northeast-2` (Seoul)
- [ ] 환경변수 추가: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### [T-002] DB 스키마 마이그레이션 실행

- [ ] `supabase/migrations/0001_init_members.sql` 적용
- [ ] 테이블 확인: `members`, `experiments`, `payments`, `study_reservations`, `vods`
- [ ] RLS 정책 동작 검증 (anon으로 select 시도)

### [T-003] Supabase Auth 셋업 (이메일 + 구글)

- [ ] Email Provider 활성화 (magic link)
- [ ] Google OAuth Provider 설정 (Google Cloud Console에서 OAuth 2.0 클라이언트 발급 → Supabase에 Client ID/Secret 등록)
- [ ] `auth.users` 신규 생성 시 `members` 자동 INSERT 트리거 검증

### [T-004] `@supabase/ssr` 클라이언트 셋업

- [ ] `npm install @supabase/ssr @supabase/supabase-js`
- [ ] `src/lib/supabase/server.ts` (Server Component용)
- [ ] `src/lib/supabase/client.ts` (Client Component용)
- [ ] `src/lib/supabase/middleware.ts` (middleware용)

### [T-005] /auth/login + /auth/callback 페이지

- [ ] 이메일 magic link 폼
- [ ] 구글 로그인 버튼
- [ ] OAuth callback 핸들러

### [T-100] 토스페이먼츠 가맹 신청 (병행)

- [ ] 토스페이먼츠 콘솔 가입 (사업자번호)
- [ ] 일반결제 + 자동결제(빌링) 함께 신청
- [ ] 심사 진행 (1~2주 예상)

### [T-101] 약관/정책 초안 작성 (병행)

- [ ] 이용약관 (정기결제 7일 청약철회권 명시)
- [ ] 개인정보처리방침 업데이트 (Supabase Auth 수집 항목 명시)
- [ ] 환불정책

---

## Week 2 — 인증 middleware + JWT claims

### [T-006] middleware.ts 구현

- [ ] `src/middleware.ts` 작성 (matcher 제한적)
- [ ] matcher: `/ai-lab/vod/:path*`, `/study-room/:path*`, `/membership/success`, `/api/members/:path*`, `/api/experiments/:id/full`
- [ ] 세션 검증 → 미인증 시 `/auth/login?next=...` 리다이렉트

### [T-007] JWT custom claims (role)

- [ ] Supabase Auth Hook 등록 (`custom_access_token_hook`)
- [ ] members 테이블의 role을 JWT에 주입
- [ ] middleware에서 JWT 페이로드의 role로 판단

### [T-008] 권한 헬퍼

- [ ] `src/lib/auth/require-member.ts` (Server Component용)
- [ ] `src/lib/auth/use-member.ts` (Client Component용 hook)

### [T-009] 회원 페이지 보호 동작 검증

- [ ] 비로그인 → `/study-room` 접근 시 `/auth/login`으로 리다이렉트
- [ ] `role=free` 로그인 → `/study-room` 접근 시 `/membership`으로 리다이렉트
- [ ] `role=member` 로그인 → 정상 접근

### [T-201] 실험 리포트 #1 작성 (병행, 콘텐츠 트랙)

- [ ] 주제 선정
- [ ] MDX 작성 (요약 30% + 본문 70%)

---

## Week 3 — 토스페이먼츠 결제 통합

### [T-010] 토스 SDK 통합

- [ ] `npm install @tosspayments/payment-sdk`
- [ ] 환경변수: `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`, `TOSS_WEBHOOK_SECRET`
- [ ] 테스트 키로 시작 (가맹 심사 통과 전)

### [T-011] /membership 페이지

- [ ] 월 5,900원 / 연 49,000원 선택 UI
- [ ] 토스 결제 위젯 호출
- [ ] customerKey = members.id (UUID)

### [T-012] 결제 성공 API `/api/payments/confirm`

- [ ] paymentKey, orderId, amount 검증
- [ ] 토스 confirm API 호출
- [ ] 결과 → `payments` 테이블 INSERT

### [T-013] Supabase Edge Function: 멤버 승급

- [ ] 토스 webhook 수신
- [ ] members.role = 'member' 업데이트
- [ ] plan_type, billing_key, expires_at, next_billing_at 설정
- [ ] JWT refresh 트리거

### [T-014] /membership/success 페이지

- [ ] 결제 정보 표시
- [ ] `supabase.auth.refreshSession()` 명시 호출
- [ ] /ai-lab으로 안내 + Discord 초대링크

### [T-015] 월간 정기결제 스케줄러

- [ ] Supabase Cron (pg_cron) 또는 Vercel Cron
- [ ] 매일 next_billing_at <= now()인 멤버 조회 → 토스 빌링 API로 결제 실행
- [ ] 성공: next_billing_at += 1 month
- [ ] 실패: subscription_status = 'past_due' + 재시도 로직

### [T-016] 연간 만료 처리

- [ ] Cron: 매일 expires_at < now() AND role='member' AND plan_type='annual' 조회
- [ ] role = 'free' 강등, JWT 갱신 트리거

### [T-202] 실험 리포트 #2 작성 (병행)

---

## Week 4 — MDX 파이프라인 + 콘텐츠 페이지

### [T-017] MDX 파이프라인 셋업

- [ ] `npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter`
- [ ] `next.config.ts`에 MDX 설정
- [ ] `content/experiments/` 디렉토리 생성
- [ ] MDX frontmatter 파싱 유틸 (`src/lib/mdx/experiments.ts`)

### [T-018] MDX 30% / 100% 분할 로직

- [ ] frontmatter에 `summary` 필드 (30% 공개용)
- [ ] 본문은 `<!-- members-only -->` 마커 이후 멤버 전용
- [ ] 또는: summary 길이 기준 자동 분할

### [T-019] /ai-lab 메인 페이지 (ISR)

- [ ] 이번주 주제 카드 (상단)
- [ ] 다음 라이브 일정 카드
- [ ] 최신 리포트 카드 리스트 (Supabase experiments 조회)
- [ ] revalidate: 1시간

### [T-020] /ai-lab/[slug] 리포트 상세 (Hybrid)

- [ ] SSG: 30% 본문 + 제목 + 메타 + OG
- [ ] schema.org Article + paywall 마크업
- [ ] 비회원: "더 보기" 페이월 UI + 가입 CTA
- [ ] 멤버: 클라이언트 fetch로 70% 본문 로드

### [T-021] /api/experiments/[id]/full

- [ ] 세션 검증 (Supabase server client)
- [ ] role='member' 또는 'admin' 확인
- [ ] MDX 70% 본문 반환

### [T-022] 리포트 카드 컴포넌트

- [ ] `src/components/ai-lab/ReportCard.tsx`
- [ ] 디자인 토큰 사용 (var(--color-_), var(--spacing-_))
- [ ] Storybook story 추가

### [T-203] 실험 리포트 #3 작성 (병행)

---

## Week 5 — Live / VOD / Study Room

### [T-023] /ai-lab/live 페이지 (공개)

- [ ] YouTube Live 임베드 (iframe)
- [ ] 다음 라이브 일정 표시 (Supabase 또는 정적)
- [ ] 진행 중 라이브 자동 감지 (또는 운영자 수동 토글)

### [T-024] /ai-lab/vod/[id] 페이지 (멤버 전용)

- [ ] middleware로 보호
- [ ] Supabase vods 테이블에서 youtube_id 조회
- [ ] YouTube Unlisted 임베드
- [ ] 관련 실험 리포트 링크

### [T-025] /study-room 페이지 (멤버 전용)

- [ ] 오프라인 공간 안내 (위치/주소/사진/이용규칙)
- [ ] 예약 폼 (날짜 + 시간대 + 사용목적)
- [ ] 본인 예약 현황 리스트
- [ ] 전체 예약 캘린더 (다른 멤버 예약 시각만 표시, 개인정보 X)

### [T-026] /api/study-reservations

- [ ] POST: 예약 생성 (status='pending')
- [ ] GET: 본인 예약 목록 + 전체 캘린더 (날짜+시간대만)
- [ ] DELETE: 본인 예약 취소

### [T-027] 운영자 예약 확정 (관리자 페이지)

- [ ] Supabase 대시보드에서 직접 처리 (Phase 1 단순화)
- [ ] 또는: `/admin/reservations` 페이지 (role='admin' 보호)

---

## Week 6 — 홈/프롬프트 CTA + QA

### [T-028] 홈페이지 AI 실험실 섹션 추가

- [ ] 기존 "무엇을 찾으세요?" 아래 신규 섹션
- [ ] 주간싸이클 간략 설명
- [ ] CTA: "월 5,900원으로 시작하기" → /membership

### [T-029] /prompt-pedia 각 항목 하단 CTA

- [ ] 박스 컴포넌트: "이 프롬프트로 직접 실험해보세요"
- [ ] 버튼: "AI 실험실 보기 →" → /ai-lab

### [T-030] GNB 메뉴 추가

- [ ] "AI 실험실" 항목 추가
- [ ] 모바일/데스크탑 반응형 확인

### [T-031] 약관/정책 페이지

- [ ] /terms, /privacy, /refund-policy
- [ ] /membership 페이지에 동의 체크박스

### [T-032] 통합 QA (golden path)

- [ ] 비회원: 홈 → 프롬프트 → CTA → /ai-lab → 리포트 30% → /membership
- [ ] 결제: 토스 테스트 카드로 월간/연간 각각 1회
- [ ] 멤버: VOD 시청, 리포트 100% 열람, 스터디룸 예약
- [ ] 로그아웃 후 동일 페이지 접근 시 차단 확인

### [T-033] SEO 점검

- [ ] sitemap.xml에 /ai-lab/\* 포함
- [ ] robots.txt 점검 (멤버 전용 페이지 disallow 여부 결정)
- [ ] OG 이미지 생성
- [ ] schema.org Article + paywall 마크업 검증 (Google Rich Results Test)

### [T-034] 성능 점검

- [ ] Lighthouse 90+ 유지
- [ ] middleware가 공개 페이지에서 동작하지 않는지 확인
- [ ] ISR 정상 동작 확인

---

## Week 7 — 베타 클로즈드 테스트

### [T-035] 베타 초대 (20~30명)

- [ ] 카카오톡 방 + Discord 채널로 모집
- [ ] 베타 코드 발급 (또는 무료 코드 → 0원 결제로 멤버 승급)
- [ ] 베타 안내 가이드 발송

### [T-036] 피드백 수집

- [ ] Notion 폼 또는 Discord #베타-피드백 채널
- [ ] 운영자 일일 모니터링
- [ ] 크리티컬 버그 즉시 핫픽스

### [T-037] 첫 라이브 (또는 사전녹화) 진행

- [ ] YouTube Live로 송출
- [ ] 종료 후 Unlisted로 전환
- [ ] vods 테이블 등록

---

## Week 8 — 정식 론칭

### [T-038] 피드백 반영

- [ ] 베타 피드백 우선순위 분류 (P0/P1/P2)
- [ ] P0만 론칭 전 처리

### [T-039] 990원 프로모 설정

- [ ] /membership에 첫 달 990원 옵션
- [ ] 프로모 코드 또는 자동 적용 로직

### [T-040] 공식 론칭

- [ ] SNS / 카카오톡방 알림
- [ ] 뉴스레터 발송 (있다면)
- [ ] 첫 유료 멤버 발생 모니터링

### [T-041] 운영 핸드북 (간단)

- [ ] 결제 실패 시 처리 매뉴얼
- [ ] 해지 요청 응대 (이메일/카톡)
- [ ] 스터디룸 예약 확정 워크플로우
- [ ] 주간 리포트 발행 워크플로우

---

## 🚨 의존성 / 크리티컬 패스

```
T-001 (Supabase) → T-002 (스키마) → T-003 (Auth) → T-004 (클라이언트)
                                              ↓
                                       T-006 (middleware)
                                              ↓
                                       T-010 (토스) → T-013 (Edge Function)
                                              ↓
                                       T-017 (MDX) → T-020 (리포트)
                                              ↓
                                       T-023~T-026 (Live/VOD/Study)
                                              ↓
                                       T-032 (QA) → T-035 (베타) → T-040 (론칭)
```

**최장 경로**: T-001 → T-040 ≈ 8주

**병렬 가능**:

- T-100 (토스 가맹) — W1부터 W2까지 심사
- T-200 (콘텐츠 작성) — W2~W4
- T-300 (디자인) — W1~W3

---

## ✅ Phase 1 종료 기준

- [ ] 비회원이 홈 → 프롬프트피디아 → /ai-lab → 30% 리포트 → /membership 흐름 완주 가능
- [ ] 토스 결제로 월간/연간 모두 정상 결제 → 멤버 승급
- [ ] 멤버가 100% 리포트 + VOD + 스터디룸 예약 모두 사용 가능
- [ ] middleware가 공개 페이지의 캐싱/SEO를 깨지 않음 (Lighthouse 90+ 유지)
- [ ] 베타에서 P0 버그 0건
- [ ] 약관/정책 페이지 노출
- [ ] 990원 프로모로 첫 유료 멤버 1명 이상 발생

---

**Last Updated**: 2026-05-22
