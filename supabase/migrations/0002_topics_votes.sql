-- ============================================================================
-- 0002_topics_votes.sql
-- Phase 1 — 주제 투표 시스템 (시스템 내부 투표, Discord 대체)
--
-- 생성:
--   - topic_status enum
--   - experiment_topics              (후보 주제 + 상태)
--   - experiment_topic_votes         (투표 기록, 주당 1인 1표)
--   - topic_vote_counts (view)       (집계, anon 조회 가능)
--   - close_expired_topic_voting()   (자동 마감 함수)
--
-- 권한:
--   - topic 읽기는 anon/authenticated 모두 가능 (마케팅 노출)
--   - topic 쓰기는 service_role만 (운영자 또는 Phase 2 admin UI)
--   - vote 읽기/쓰기는 본인만
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUM 타입
-- ----------------------------------------------------------------------------
create type public.topic_status as enum (
  'candidate',
  'winner',
  'archived',
  'rejected'
);

-- ----------------------------------------------------------------------------
-- 2. experiment_topics 테이블
-- ----------------------------------------------------------------------------
create table public.experiment_topics (
  id                uuid primary key default gen_random_uuid(),
  week              date not null,
  title             text not null,
  description       text,
  status            public.topic_status not null default 'candidate',
  voting_closes_at  timestamptz not null,
  created_by        uuid references public.members(id) on delete set null,
  submitted_by      uuid references public.members(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index experiment_topics_week_idx on public.experiment_topics(week desc);
create index experiment_topics_status_idx on public.experiment_topics(status);
create index experiment_topics_voting_closes_idx
  on public.experiment_topics(voting_closes_at)
  where status = 'candidate';

comment on table public.experiment_topics is
  '주간 실험 주제 후보. Phase 1엔 운영자만 등록. submitted_by는 Phase 2 멤버 제안 확장용.';
comment on column public.experiment_topics.week is
  '주차 시작일 (월요일 권장)';
comment on column public.experiment_topics.submitted_by is
  'Phase 2: 멤버가 제안한 주제. Phase 1엔 NULL.';

create trigger experiment_topics_set_updated_at
  before update on public.experiment_topics
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. experiment_topic_votes 테이블
-- ----------------------------------------------------------------------------
create table public.experiment_topic_votes (
  id          uuid primary key default gen_random_uuid(),
  topic_id    uuid not null references public.experiment_topics(id) on delete cascade,
  user_id     uuid not null references public.members(id) on delete cascade,
  week        date not null,
  created_at  timestamptz not null default now(),

  constraint experiment_topic_votes_one_per_week unique (week, user_id)
);

create index experiment_topic_votes_topic_idx
  on public.experiment_topic_votes(topic_id);
create index experiment_topic_votes_user_idx
  on public.experiment_topic_votes(user_id, created_at desc);

comment on table public.experiment_topic_votes is
  '주제 투표 기록. UNIQUE(week, user_id)로 주당 1인 1표 강제.';
comment on column public.experiment_topic_votes.week is
  'experiment_topics.week과 동일. 트리거로 자동 채움.';

-- 트리거: week 자동 채움 (API 측에서 누락해도 자동 채움)
create or replace function public.fill_vote_week()
returns trigger
language plpgsql
as $$
begin
  if new.week is null then
    select week into new.week
    from public.experiment_topics
    where id = new.topic_id;
  end if;
  return new;
end;
$$;

create trigger fill_vote_week_trigger
  before insert on public.experiment_topic_votes
  for each row execute function public.fill_vote_week();

-- ----------------------------------------------------------------------------
-- 4. 집계 view (anon 조회 가능)
-- ----------------------------------------------------------------------------
create or replace view public.topic_vote_counts as
select
  topic_id,
  count(*)::int as votes
from public.experiment_topic_votes
group by topic_id;

grant select on public.topic_vote_counts to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. 자동 마감 함수 (API lazy 호출 + 추후 pg_cron 가능)
-- ----------------------------------------------------------------------------
create or replace function public.close_expired_topic_voting()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_week date;
begin
  for expired_week in
    select distinct week
    from public.experiment_topics
    where status = 'candidate'
      and voting_closes_at <= now()
  loop
    with ranked as (
      select
        t.id,
        coalesce(v.votes, 0) as votes,
        row_number() over (
          order by coalesce(v.votes, 0) desc, t.created_at asc
        ) as rn
      from public.experiment_topics t
      left join public.topic_vote_counts v on v.topic_id = t.id
      where t.week = expired_week
        and t.status = 'candidate'
    )
    update public.experiment_topics et
    set status = case when r.rn = 1 then 'winner'::public.topic_status
                       else 'archived'::public.topic_status end
    from ranked r
    where et.id = r.id;
  end loop;
end;
$$;

grant execute on function public.close_expired_topic_voting() to authenticated, anon;

comment on function public.close_expired_topic_voting() is
  'voting_closes_at이 지난 candidate 주제들을 winner/archived로 마감. API에서 lazy 호출. 향후 pg_cron 가능.';

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.experiment_topics enable row level security;
alter table public.experiment_topic_votes enable row level security;

-- ----------------------------------------------------------------------------
-- RLS: experiment_topics
-- 모두 read 가능 (마케팅용). 쓰기는 service_role 전용.
-- ----------------------------------------------------------------------------
create policy "Anyone can view topics"
  on public.experiment_topics for select
  to anon, authenticated
  using (status in ('candidate', 'winner', 'archived'));

-- ----------------------------------------------------------------------------
-- RLS: experiment_topic_votes
-- 본인 표만 read/insert/delete
-- (총 카운트는 view topic_vote_counts로 anon도 가능)
-- ----------------------------------------------------------------------------
create policy "Users can view their own votes"
  on public.experiment_topic_votes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Authenticated users can vote"
  on public.experiment_topic_votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own votes"
  on public.experiment_topic_votes for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- 시드 데이터 (선택) — 베타 테스트용 후보 1주차
-- 운영자가 수정/삭제할 수 있도록 service_role로 INSERT
-- 필요 없으면 이 블록은 주석 처리해도 됨
-- ============================================================================
-- insert into public.experiment_topics (week, title, description, voting_closes_at, status)
-- values
--   ('2026-05-25', 'Claude로 와이어프레임 그리기', 'Claude 캔버스 도구의 와이어프레임 생성 능력을 비교 실험합니다.', '2026-05-26 18:00+09', 'candidate'),
--   ('2026-05-25', 'Cursor로 디자인 시스템 자동화', 'Cursor 에이전트로 디자인 토큰을 코드와 동기화하는 워크플로우를 실험합니다.', '2026-05-26 18:00+09', 'candidate'),
--   ('2026-05-25', 'Figma AI 자동 배치 비교', 'Figma Make / FigJam AI / Plugin을 비교해서 자동 레이아웃 품질을 측정합니다.', '2026-05-26 18:00+09', 'candidate');

-- ============================================================================
-- 검증 쿼리
-- ============================================================================
-- select count(*) from public.experiment_topics;
-- select count(*) from public.experiment_topic_votes;
-- select * from public.topic_vote_counts;
-- select public.close_expired_topic_voting();
