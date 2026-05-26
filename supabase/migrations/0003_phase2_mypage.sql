-- ============================================================================
-- 0003_phase2_mypage.sql
-- Phase 2 — 마이페이지 / 활동 이력 / 뱃지 시스템
--
-- 생성:
--   - member_activities             (활동 로그)
--   - badges                        (뱃지 정의)
--   - member_badges                 (멤버별 획득 뱃지)
--   - members.discord_role_synced_at (Discord 자동 동기화 시각)
--
-- 권한:
--   - 활동/뱃지 읽기는 본인만
--   - 쓰기는 service_role 전용 (트리거/API 라우트)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- members 확장
-- ----------------------------------------------------------------------------
alter table public.members
  add column if not exists discord_role_synced_at timestamptz;

comment on column public.members.discord_role_synced_at is
  'Discord 역할 자동 동기화 마지막 시점 (Phase 2 자동화).';

-- ----------------------------------------------------------------------------
-- member_activities — 활동 로그
-- ----------------------------------------------------------------------------
create table public.member_activities (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.members(id) on delete cascade,
  type         text not null,
  target_type  text,
  target_id    uuid,
  metadata     jsonb,
  created_at   timestamptz not null default now(),

  constraint member_activities_type_check
    check (type in (
      'vote',
      'comment',
      'share',
      'live_attend',
      'live_present',
      'experiment_contribute',
      'study_room_book',
      'mentor_session_book'
    ))
);

create index member_activities_user_idx
  on public.member_activities(user_id, created_at desc);
create index member_activities_type_idx
  on public.member_activities(type, created_at desc);

comment on table public.member_activities is
  '멤버 활동 로그. 통계/뱃지 자동 부여/마이페이지 활동 이력에 사용.';
comment on column public.member_activities.type is
  'vote / comment / share / live_attend / live_present / experiment_contribute / study_room_book / mentor_session_book';

-- ----------------------------------------------------------------------------
-- badges — 뱃지 정의 (운영자 관리)
-- ----------------------------------------------------------------------------
create table public.badges (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  label        text not null,
  description  text,
  icon         text,
  threshold    jsonb,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

comment on table public.badges is
  '뱃지 정의. code는 자동 부여 트리거에서 식별자로 사용.';
comment on column public.badges.threshold is
  '자동 부여 조건. 예: { "activity_type": "vote", "min_count": 1 }';

-- ----------------------------------------------------------------------------
-- member_badges — 획득 기록
-- ----------------------------------------------------------------------------
create table public.member_badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.members(id) on delete cascade,
  badge_id    uuid not null references public.badges(id) on delete cascade,
  earned_at   timestamptz not null default now(),

  constraint member_badges_unique unique (user_id, badge_id)
);

create index member_badges_user_idx on public.member_badges(user_id, earned_at desc);

-- ----------------------------------------------------------------------------
-- 시드 — 기본 뱃지 5종
-- ----------------------------------------------------------------------------
insert into public.badges (code, label, description, threshold) values
  ('first_vote', '첫 투표', '첫 주제 투표에 참여한 멤버', '{"activity_type":"vote","min_count":1}'::jsonb),
  ('topic_maker', '토픽 메이커', '제안한 주제가 winner로 선정된 멤버', '{"event":"topic_winner"}'::jsonb),
  ('mvp', '실험실 MVP', '베스트 실험 투표 1위로 선정된 멤버', '{"event":"experiment_mvp"}'::jsonb),
  ('streak_4w', '4주 연속 참여', '4주 연속으로 실험에 참여한 멤버', '{"streak":"weekly","weeks":4}'::jsonb),
  ('mentor', '멘토 승급', '멘토로 활동 중인 멤버', '{"event":"mentor_promoted"}'::jsonb)
on conflict (code) do nothing;

-- ============================================================================
-- 자동 부여 함수 (간단 패턴 — 활동 INSERT 시 첫 투표 뱃지 부여)
-- Phase 2 초기엔 가장 단순한 케이스만. 복잡한 streak/winner는 별도 함수로 확장.
-- ============================================================================
create or replace function public.auto_award_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first_vote_badge_id uuid;
begin
  if new.type = 'vote' then
    select id into first_vote_badge_id from public.badges where code = 'first_vote' limit 1;
    if first_vote_badge_id is not null then
      insert into public.member_badges (user_id, badge_id)
      values (new.user_id, first_vote_badge_id)
      on conflict (user_id, badge_id) do nothing;
    end if;
  end if;
  return new;
end;
$$;

create trigger auto_award_badges_trigger
  after insert on public.member_activities
  for each row execute function public.auto_award_badges();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.member_activities enable row level security;
alter table public.badges enable row level security;
alter table public.member_badges enable row level security;

-- 본인 활동만 조회
create policy "Users can view their own activities"
  on public.member_activities for select
  to authenticated
  using (auth.uid() = user_id);

-- 뱃지 정의는 모두 조회 가능 (마이페이지 미획득 표시용)
create policy "Anyone can view active badges"
  on public.badges for select
  to anon, authenticated
  using (is_active = true);

-- 본인 획득 뱃지만 조회
create policy "Users can view their own badges"
  on public.member_badges for select
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- 검증 쿼리
-- ============================================================================
-- select count(*) from public.badges;                  -- 5
-- select column_name from information_schema.columns
--   where table_name='members' and column_name='discord_role_synced_at';
-- select tgname from pg_trigger where tgname='auto_award_badges_trigger';
