# PRD Phase 2 — 마이페이지 / 아카이브 / 멘토 / 자동화

> 작성일: 2026-05-23 (Phase 1 출시 직전 단계)
> 참고: [PRD_v3_MVP.md](./PRD_v3_MVP.md) (Phase 1) · [QA_REPORT.md](./QA_REPORT.md) · 와이어프레임 노드 18:2~21:2 (마이페이지) / 8:2, 11:2, 12:2 (아카이브) / 15:2, 17:2 (멘토)

---

## 1. 진입 시점

Phase 2는 다음 4가지 조건이 모두 충족된 시점에 진입:

| 조건                              | 측정                        |
| --------------------------------- | --------------------------- |
| Phase 1 정식 출시 + 베타 운영 4주 | 첫 990원 프로모 종료 시점   |
| 유료 멤버 30명 이상               | members.role='member' count |
| 주제 투표 4주 연속 참여율 40%+    | experiment_topic_votes 분석 |
| 첫 멤버 자발적 기여 발생          | 댓글, 공유, 라이브 시청     |

→ 미충족 시 Phase 1 보강(콘텐츠, 운영 자동화)을 우선하고 Phase 2는 보류.

---

## 2. Phase 2 스코프 (3가지 영역)

### A. 마이페이지 시스템 (와이어프레임 16:2, 18:2~21:2)

| 페이지                         | 핵심 기능                                                          |
| ------------------------------ | ------------------------------------------------------------------ |
| `/mypage`                      | 프로필 + Discord 연동 상태 + 활동 요약 + 뱃지 미리보기 + 빠른 링크 |
| `/mypage/billing`              | 현재 구독, 결제 수단, 청구 내역, 자동 갱신 토글, 구독 취소         |
| `/mypage/activity`             | 통계 5개(총활동/투표/공유/발표/댓글) + 시간순 로그                 |
| `/mypage/badges`               | 획득 / 미획득 / 진행률                                             |
| `/mypage/earnings` (멘토 전용) | 누적 수익 / 정산 완료 / 대기 / 세션 내역 / 정산 내역               |

### B. 아카이브 검색 시스템 (와이어프레임 8:2, 11:2, 12:2)

| 페이지                                         | 핵심 기능                                                   |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `/ai-lab/archive`                              | 검색 + 카테고리 + 정렬 + 리포트 카드 그리드 (수평) + 더보기 |
| `/ai-lab/archive/search`                       | 도구 / 주제 / 키워드 필터 + 칩 + 결과 리스트                |
| (별도 페이지 X — 기존 `/ai-lab/[slug]` 재사용) | 아카이브 상세는 기존 리포트 페이지 활용                     |

### C. 멘토 시스템 (와이어프레임 15:2, 17:2)

| 페이지          | 핵심 기능                                                          |
| --------------- | ------------------------------------------------------------------ |
| `/mentors`      | 검색 + 분야/경력/세션유형 필터 + 멘토 카드 그리드                  |
| `/mentors/[id]` | 프로필 + 소개 + 전문분야 + 경력 + 후기 + 세션 안내 + 신청 오버레이 |

### D. Discord 자동화 (백그라운드)

- 결제 → Discord 역할 부여 (Supabase Edge Function 직접 호출)
- 해지 → 역할 제거
- 멘토 승급 → 'Mentor' 역할 부여

---

## 3. 데이터 모델 확장 (마이그레이션 0003)

### 3-1. 멘토 시스템

```sql
create type mentor_status as enum ('candidate', 'active', 'inactive');
create type session_type as enum ('mentoring', 'workshop', 'study');
create type session_status as enum ('open', 'closed', 'completed', 'cancelled');

-- members 확장 (멘토 자격)
alter table public.members add column mentor_status mentor_status;
alter table public.members add column live_count int default 0;
alter table public.members add column archive_count int default 0;
alter table public.members add column mentor_intro text;

-- 멘토 세션 (1:1, 워크샵, 스터디)
create table public.mentor_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.members(id) on delete cascade,
  type session_type not null,
  title text not null,
  description text,
  price int not null,           -- 원
  max_participants int default 1,
  toss_payment_link text,       -- Phase 2엔 결제 링크 방식, Phase 3에서 통합
  status session_status not null default 'open',
  created_at timestamptz default now()
);

-- 세션 신청
create table public.mentor_session_bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mentor_sessions(id) on delete cascade,
  user_id uuid not null references public.members(id) on delete cascade,
  toss_payment_key text,
  amount int not null,
  status text not null,          -- 'paid' / 'cancelled' / 'completed' / 'no_show'
  scheduled_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- 후기
create table public.mentor_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.mentor_session_bookings(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);
```

### 3-2. 활동 이력

```sql
create table public.member_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.members(id) on delete cascade,
  type text not null,           -- 'vote' / 'comment' / 'share' / 'live_attend' / 'live_present'
  target_type text,             -- 'topic' / 'experiment' / 'mentor_session' 등
  target_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create index member_activities_user_idx
  on public.member_activities(user_id, created_at desc);
```

### 3-3. 뱃지

```sql
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,    -- 'topic_maker' / 'mvp' / 'streak_4w' / 'mentor' 등
  label text not null,
  description text,
  icon text,
  threshold jsonb               -- 자동 부여 조건 (예: { activity_count: 4 })
);

create table public.member_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.members(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);
```

### 3-4. Discord 연동

```sql
-- members 확장 (이미 discord_id 컬럼 있음 — Phase 2에서 활용)
-- discord_role_synced_at timestamptz — 마지막 역할 동기화 시점
alter table public.members add column discord_role_synced_at timestamptz;
```

---

## 4. 페이지별 상세

### 4-1. `/mypage` (대시보드)

**구조** (와이어프레임 16:2 단순화):

- 프로필 (아바타 + 이름 + 가입일)
- Discord 연동 상태 카드 (연동됨 / 연동 필요)
- 빠른 링크 (4개: 구독 / 활동 / 뱃지 / [멘토면 수익])

**구현**:

- `src/app/mypage/page.tsx` (Server, requireMember)
- `src/app/mypage/layout.tsx` (공통 사이드/탭 네비)
- `src/components/mypage/MyPageNav.tsx`
- `src/components/mypage/ProfileSummary.tsx`
- `src/components/mypage/DiscordLinkPanel.tsx`

### 4-2. `/mypage/billing` (구독 관리, 와이어프레임 18:2)

**핵심**:

- 현재 구독 카드 (플랜 / 갱신일 / 월 요금)
- 결제 수단 표시 + 변경 버튼 (토스 빌링키 재등록)
- 청구 내역 5건 (payments 테이블 조회)
- 자동 갱신 ON/OFF 토글
- 청구 이메일 변경
- 구독 취소 (오버레이 모달)

**구현**:

- `src/app/mypage/billing/page.tsx`
- `src/components/mypage/BillingPanel.tsx` (Client — 토글 + 모달)
- `src/components/mypage/BillingHistoryTable.tsx`
- `src/components/mypage/CancelSubscriptionModal.tsx`
- `src/app/api/mypage/billing/cancel/route.ts` (POST — 구독 취소 + 토스 호출)
- `src/app/api/mypage/billing/payment-method/route.ts` (PATCH — 결제 수단 변경 요청 트리거)

### 4-3. `/mypage/activity` (활동 이력, 와이어프레임 19:2)

**핵심**:

- 통계 5개 (member_activities 집계)
- 활동 유형 필터 (투표 / 공유 / 발표 / 댓글)
- 시간순 로그 7~10건 + 페이지네이션

**구현**:

- `src/app/mypage/activity/page.tsx`
- `src/components/mypage/ActivityStats.tsx` (재사용 가능)
- `src/components/mypage/ActivityList.tsx`

### 4-4. `/mypage/badges` (뱃지, 와이어프레임 20:2)

**핵심**:

- 통계 3개 (보유 / 미획득 / 최근 획득)
- 획득 리스트 (badges + member_badges JOIN)
- 미획득 리스트 (조건 + 진행률)

**자동 부여 로직** (Edge Function 또는 트리거):

- member_activities INSERT 시 → 해당 조건 매치 검사 → member_badges INSERT
- 예: 첫 투표 → 'first_vote' 뱃지
- 4주 연속 → 'streak_4w' 뱃지

### 4-5. `/mypage/earnings` (멘토 수익, 와이어프레임 21:2)

**핵심**:

- 멘토 전용 페이지 (`requireMentor()`)
- 통계 4개 (누적 / 정산 완료 / 대기 / 이번 달)
- 수익 내역 (mentor_session_bookings + 정산 상태)
- 정산 내역 (별도 테이블 또는 외부 시트)

→ Phase 2 후반 또는 Phase 3로 분리 가능 (멘토 시스템 가동 후).

### 4-6. `/ai-lab/archive` (아카이브 목록, 와이어프레임 8:2)

**핵심**:

- 검색 인풋 (Fuse.js 즉시 + Supabase FTS 옵션)
- 카테고리 필터 (도구별 / 주제별)
- 정렬 (최신 / 인기)
- 리포트 카드 그리드 (썸네일 + 제목 + 태그 + 조회수 + 댓글수)

**구현**:

- `src/app/ai-lab/archive/page.tsx` (Server — 초기 데이터 + Client 패널)
- `src/components/ai-lab/archive/ArchiveBrowser.tsx` (Client — 검색/필터)
- `src/components/ai-lab/archive/ArchiveCard.tsx` (수평 카드)

**검색 전략**:

- A) **Fuse.js 클라이언트 측** — 빠르지만 콘텐츠 500+ 시 부담
- B) **Supabase FTS (full-text search)** — 한국어 형태소 분석 필요. `tsvector` 컬럼 추가
- **Phase 2 초기는 A**, 콘텐츠 500+ 시점에 B로 전환

### 4-7. `/ai-lab/archive/search` (필터 검색, 와이어프레임 11:2)

→ `/ai-lab/archive`와 통합 가능. 별도 경로 안 만들고 query 파라미터로 처리.

### 4-8. `/mentors` (멘토 찾기, 와이어프레임 15:2)

**구조**:

- 검색 + 4개 필터 (분야 / 경력 / 세션 유형 / 정렬)
- 카테고리 칩 (전체 / UX / 프로덕트 / 리서치 / 브랜딩)
- 멘토 카드 그리드 3열 (프로필 + 이름 + 직책 + 평점 + 세션 횟수 + 신청 버튼)

**구현**:

- `src/app/mentors/page.tsx` (Server, 공개 페이지 — 마케팅 노출)
- `src/components/mentors/MentorList.tsx` (Client — 필터/검색)
- `src/components/mentors/MentorCard.tsx`

### 4-9. `/mentors/[id]` (멘토 상세, 와이어프레임 17:2)

**구조**:

- 헤더: 프로필 사진 + 이름 + 직책 + 전문 분야 칩 + "세션 신청하기"
- 좌측: 소개 / 전문 분야 / 주요 경력 / 멤버 후기
- 우측: 세션 안내 (유형 / 시간 / 비용) / 세션 가능 시간 / 통계
- 오버레이: 세션 신청 모달 (멘토 / 시간 / 목적 입력 → 결제)

**구현**:

- `src/app/mentors/[id]/page.tsx`
- `src/components/mentors/MentorProfile.tsx`
- `src/components/mentors/SessionBookingModal.tsx` (Client)
- `src/app/api/mentor-sessions/[id]/book/route.ts` (POST — 신청 + 토스 결제 링크 생성)

---

## 5. Discord 자동화 (백그라운드)

### 5-1. 결제 → 역할 부여

```
[Toss webhook] PAYMENT_DONE
  ↓
[/api/payments/webhook] members.role='member' UPDATE
  ↓
[Supabase Edge Function: assign-discord-role]
  ↓
Discord Bot API → 멤버 역할 부여
  ↓
members.discord_role_synced_at = now()
```

### 5-2. 해지 → 역할 제거

같은 패턴, 역방향.

### 5-3. 멘토 승급 → 멘토 역할

운영자가 `/admin/mentors`에서 mentor_status='active'로 변경 시 트리거.

### 5-4. 기술 선택

| 옵션                          | 장점                    | 단점                              |
| ----------------------------- | ----------------------- | --------------------------------- |
| Supabase Edge Function (Deno) | Supabase 내장           | Discord.js 호환 X (HTTP API 직접) |
| Vercel Serverless             | TS 친숙                 | 추가 인프라                       |
| Discord Bot (Railway)         | 봇 명령어/이벤트 풀스펙 | 별도 운영 부담                    |

**Phase 2 초기는 Supabase Edge Function + Discord HTTP API**. 봇 명령어 필요해지면 Railway 봇 추가.

---

## 6. 비즈니스 로직 핵심

### 6-1. 멘토 승급 조건

```ts
// Supabase function or scheduled check
function isMentorEligible(memberId): boolean {
  const live_count >= 3;
  const archive_count >= 10;
  // + 운영자 수동 승인 (자동 안 함, 마지막은 사람)
}
```

→ 자동 승급 X. 운영자가 `/admin/mentors`에서 후보 리스트 보고 수동 활성화.

### 6-2. 멘토 세션 수익 배분

- 멘토 80% / 플랫폼 20%
- Phase 2 초기: **수동 정산** (운영자가 월별 합산 → 송금)
- Phase 3 이후: Stripe Connect (한국 미지원) → 토스 별도 정산 API 또는 외부 송금 서비스

### 6-3. 뱃지 자동 부여 시점

- member_activities INSERT 트리거 (Postgres function)
- 또는 Edge Function 주기적 실행 (매일)
- **Phase 2 초기: 트리거** (실시간)

---

## 7. 페이지/API 일람

### 페이지

| 경로               | 인증               | 마케팅 노출              |
| ------------------ | ------------------ | ------------------------ |
| `/mypage`          | 멤버               | noindex                  |
| `/mypage/billing`  | 멤버               | noindex                  |
| `/mypage/activity` | 멤버               | noindex                  |
| `/mypage/badges`   | 멤버               | noindex                  |
| `/mypage/earnings` | 멘토               | noindex                  |
| `/ai-lab/archive`  | 멤버 (메타는 공개) | partial — 메타데이터 SEO |
| `/mentors`         | 공개               | ✅ SEO                   |
| `/mentors/[id]`    | 공개               | ✅ SEO                   |
| `/admin/mentors`   | 운영자             | noindex                  |

### API

| 경로                                 | 메서드      | 권한                     |
| ------------------------------------ | ----------- | ------------------------ |
| `/api/mypage/billing/cancel`         | POST        | 멤버                     |
| `/api/mypage/billing/payment-method` | PATCH       | 멤버                     |
| `/api/mypage/activity`               | GET         | 멤버                     |
| `/api/mypage/badges`                 | GET         | 멤버                     |
| `/api/mypage/earnings`               | GET         | 멘토                     |
| `/api/archive/search`                | GET (query) | 공개 메타, 본문은 페이월 |
| `/api/mentor-sessions`               | GET         | 공개 (active만)          |
| `/api/mentor-sessions/[id]/book`     | POST        | 멤버                     |
| `/api/admin/mentors`                 | POST/PATCH  | 운영자                   |

---

## 8. 마이그레이션 + 미들웨어

### 마이그레이션 0003 — Phase 2 스키마

위 3-1 ~ 3-4 통합.

### 미들웨어 matcher 확장

```ts
matcher: [
  // 기존
  "/study-room/:path*",
  "/ai-lab/vod/:path*",
  "/membership/success",
  "/mypage/:path*",
  "/admin/:path*",
  // 신규
  "/mypage/earnings", // requireMentor (별도 헬퍼)
];
```

`requireMentor` 헬퍼 신규 (role==='admin' 또는 mentor_status==='active').

---

## 9. 단계 분할 (예상 8주)

| 주차  | 작업                                                                         |
| ----- | ---------------------------------------------------------------------------- |
| P2-W1 | 마이그레이션 0003 + members 확장 + 마이페이지 layout/nav                     |
| P2-W2 | `/mypage/billing` + cancel/payment-method API + 토스 빌링키 변경 흐름        |
| P2-W3 | `/mypage/activity` + `/mypage/badges` + 자동 뱃지 트리거 + member_activities |
| P2-W4 | `/ai-lab/archive` Fuse.js 검색 + 카드 그리드 + 카테고리 필터                 |
| P2-W5 | `/mentors` 리스트 + `/mentors/[id]` 프로필 + 후기 표시                       |
| P2-W6 | 세션 신청 흐름 + 토스 결제 링크 + mentor_session_bookings                    |
| P2-W7 | Discord Edge Function — 결제/해지/멘토 역할 자동 부여                        |
| P2-W8 | 통합 QA + Phase 2 베타 (10명) + 첫 멘토 2명 활성화                           |

---

## 10. 우선순위 (충돌 시)

1. **마이페이지 (billing 우선)** — 멤버 가장 강한 요구 (구독 관리, 해지 self-service)
2. **아카이브 검색** — 콘텐츠 누적 후 필요
3. **멘토 시스템** — 첫 멘토 활성화는 Phase 1 마지막 8주 뒤
4. **Discord 자동화** — 멤버 100명 넘어서 수동 부담 커지면 도입

순서 변경 가능 (베타 피드백에 따라).

---

## 11. 리스크 / 결정 미정 항목

| 항목                     | 상태                                                            |
| ------------------------ | --------------------------------------------------------------- |
| 멘토 수익 정산 자동화    | Stripe Connect 한국 미지원 → 수동/외부 송금. Phase 3에서 재검토 |
| 한국어 FTS               | Supabase FTS의 한국어 분석 한계 — Fuse.js로 시작                |
| Discord Bot vs HTTP API  | HTTP API 우선, 봇 기능 필요 시 Railway 추가                     |
| 멤버 활동 로그 보관 기간 | 1년 / 영구? — 개인정보처리방침 결정 후 적용                     |
| 뱃지 디자인 (이미지)     | 디자인 작업 필요 — Phase 2-W3 전에 디자이너 별도                |
| 멘토 프로필 사진 호스팅  | Supabase Storage 활용. 용량 한도 점검                           |

---

## 12. Phase 2 진입 후 Phase 1 회고 활용

Phase 1 베타 데이터로 다음을 검증한 뒤 Phase 2 조정:

- 가장 인기있는 멤버 혜택 → 마이페이지 우선순위 조정
- 가장 많이 본 리포트 카테고리 → 아카이브 카테고리 필터 시드
- 멤버 → 멘토 후보 전환 가능성 — 발표/기여 패턴 분석
- 990원 → 정가 전환율 — Phase 2 가격 조정 근거

---

**Last Updated**: 2026-05-23
**Status**: Phase 2 초안 — Phase 1 베타 운영 4주 후 확정
**Owner**: figmapedia 운영팀
