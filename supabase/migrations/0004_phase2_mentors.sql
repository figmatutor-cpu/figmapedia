-- ============================================================================
-- 0004_phase2_mentors.sql
-- Phase 2 — 멘토 시스템 (멘토 프로필 + 세션 + 신청 + 후기)
--
-- 생성:
--   - mentor_status / session_type / session_status enum
--   - members 확장 (멘토 프로필 필드)
--   - mentor_sessions (1:1 / 워크샵 / 스터디)
--   - mentor_session_bookings (세션 신청 + 결제)
--   - mentor_reviews (세션 후 후기)
--
-- 권한:
--   - mentor_sessions 읽기는 모두 (마케팅 공개)
--   - bookings는 본인 + 해당 멘토만
--   - reviews는 모두 읽기 (공개), 작성은 본인 booking만
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUM 타입
-- ----------------------------------------------------------------------------
create type public.mentor_status as enum ('candidate', 'active', 'inactive');
create type public.session_type as enum ('mentoring', 'workshop', 'study');
create type public.session_status as enum ('open', 'closed', 'completed', 'cancelled');

-- ----------------------------------------------------------------------------
-- 2. members 확장 — 멘토 프로필 필드
-- ----------------------------------------------------------------------------
alter table public.members
  add column if not exists mentor_status public.mentor_status,
  add column if not exists display_name text,
  add column if not exists avatar_url text,
  add column if not exists mentor_title text,
  add column if not exists mentor_intro text,
  add column if not exists specialties text[],
  add column if not exists career jsonb,
  add column if not exists live_count int not null default 0,
  add column if not exists archive_count int not null default 0;

create index if not exists members_mentor_status_idx
  on public.members(mentor_status)
  where mentor_status = 'active';

comment on column public.members.mentor_status is
  'NULL=일반 멤버 / candidate=승급 검토중 / active=공개 멘토 / inactive=일시 비공개';
comment on column public.members.specialties is
  '전문 분야 배열 (예: ["UX 리서치", "프로토타이핑"])';
comment on column public.members.career is
  '경력 배열 jsonb (예: [{"title":"PD Lead","company":"카카오","period":"2020 — 현재"}])';

-- ----------------------------------------------------------------------------
-- 3. mentor_sessions 테이블
-- ----------------------------------------------------------------------------
create table public.mentor_sessions (
  id                uuid primary key default gen_random_uuid(),
  mentor_id         uuid not null references public.members(id) on delete cascade,
  type              public.session_type not null,
  title             text not null,
  description       text,
  price             int not null default 0,
  duration_minutes  int not null default 50,
  max_participants  int not null default 1,
  toss_payment_link text,
  schedule_text     text,
  status            public.session_status not null default 'open',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index mentor_sessions_mentor_idx
  on public.mentor_sessions(mentor_id, status);
create index mentor_sessions_status_idx
  on public.mentor_sessions(status, created_at desc);

create trigger mentor_sessions_set_updated_at
  before update on public.mentor_sessions
  for each row execute function public.set_updated_at();

comment on column public.mentor_sessions.price is '원 단위. 0이면 멤버 전용 무료';
comment on column public.mentor_sessions.schedule_text is
  '사람이 읽는 가능 시간 안내 (예: "월/수 19:00 — 22:00")';

-- ----------------------------------------------------------------------------
-- 4. mentor_session_bookings 테이블
-- ----------------------------------------------------------------------------
create table public.mentor_session_bookings (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.mentor_sessions(id) on delete cascade,
  mentor_id         uuid not null references public.members(id) on delete cascade,
  user_id           uuid not null references public.members(id) on delete cascade,
  toss_payment_key  text,
  toss_order_id     text unique,
  amount            int not null,
  status            text not null default 'pending_payment',
  scheduled_at      timestamptz,
  member_note       text,
  cancelled_at      timestamptz,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index mentor_session_bookings_user_idx
  on public.mentor_session_bookings(user_id, created_at desc);
create index mentor_session_bookings_mentor_idx
  on public.mentor_session_bookings(mentor_id, status);
create index mentor_session_bookings_session_idx
  on public.mentor_session_bookings(session_id);

create trigger mentor_session_bookings_set_updated_at
  before update on public.mentor_session_bookings
  for each row execute function public.set_updated_at();

comment on column public.mentor_session_bookings.status is
  'pending_payment / paid / completed / cancelled / no_show / refunded';

-- ----------------------------------------------------------------------------
-- 5. mentor_reviews 테이블
-- ----------------------------------------------------------------------------
create table public.mentor_reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null unique references public.mentor_session_bookings(id) on delete cascade,
  mentor_id   uuid not null references public.members(id) on delete cascade,
  user_id     uuid not null references public.members(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index mentor_reviews_mentor_idx
  on public.mentor_reviews(mentor_id, created_at desc)
  where is_public = true;

-- ============================================================================
-- view: 멘토 통계 (평점 + 세션 횟수)
-- ============================================================================
create or replace view public.mentor_stats as
select
  m.id as mentor_id,
  count(distinct b.id) filter (where b.status = 'completed') as completed_sessions,
  count(distinct r.id) filter (where r.is_public = true) as review_count,
  coalesce(avg(r.rating) filter (where r.is_public = true), 0)::numeric(3,2) as avg_rating,
  count(distinct b.id) filter (where b.status in ('paid', 'pending_payment')) as upcoming_sessions
from public.members m
left join public.mentor_session_bookings b on b.mentor_id = m.id
left join public.mentor_reviews r on r.mentor_id = m.id
where m.mentor_status = 'active'
group by m.id;

grant select on public.mentor_stats to anon, authenticated;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.mentor_sessions enable row level security;
alter table public.mentor_session_bookings enable row level security;
alter table public.mentor_reviews enable row level security;

-- mentor_sessions: 모두 공개 (마케팅)
create policy "Anyone can view open mentor sessions"
  on public.mentor_sessions for select
  to anon, authenticated
  using (status in ('open', 'closed', 'completed'));

-- mentor_session_bookings: 본인 또는 멘토만
create policy "Users can view their own bookings"
  on public.mentor_session_bookings for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Mentors can view their session bookings"
  on public.mentor_session_bookings for select
  to authenticated
  using (auth.uid() = mentor_id);

create policy "Authenticated users can create bookings"
  on public.mentor_session_bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can cancel their own bookings"
  on public.mentor_session_bookings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and status in ('cancelled', 'pending_payment')
  );

-- mentor_reviews: 공개 후기는 모두 읽기
create policy "Anyone can view public reviews"
  on public.mentor_reviews for select
  to anon, authenticated
  using (is_public = true);

create policy "Users can write reviews for their own bookings"
  on public.mentor_reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================================================
-- 검증 쿼리
-- ============================================================================
-- select column_name from information_schema.columns
--   where table_name='members' and column_name='mentor_status';
-- select * from public.mentor_stats;
-- select count(*) from public.mentor_sessions;
