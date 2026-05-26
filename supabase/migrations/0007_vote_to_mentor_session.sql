-- ============================================================================
-- 0007_vote_to_mentor_session.sql
-- Phase 2 후속 — "주제+멘토 쌍" vote → winner 멘토 자동 세션 생성 + 10% 수수료
--
-- 변경:
--   1) mentor_session_bookings: platform_fee_amount / mentor_payout_amount / fee_rate 컬럼 추가
--   2) experiment_topics.submitted_by 가 active 멘토인지 검증하는 트리거
--   3) close_expired_topic_voting() 확장 — winner 마킹과 동시에
--      mentor_sessions (workshop + mentoring) 2 row 자동 INSERT
--
-- 의도:
--   - 수수료 분리는 결제 confirm 시점에 booking 에 함께 기록 (월배치 정산)
--   - 자동 생성 세션은 default 값(가격/정원/일정)으로 채워두고 멘토가 수정
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) mentor_session_bookings 수수료 컬럼 추가
-- ----------------------------------------------------------------------------
alter table public.mentor_session_bookings
  add column if not exists fee_rate              numeric(4,3) not null default 0.100,
  add column if not exists platform_fee_amount   int          not null default 0,
  add column if not exists mentor_payout_amount  int          not null default 0;

comment on column public.mentor_session_bookings.fee_rate is
  '플랫폼 수수료율 (0.100 = 10%). booking 생성 시점에 고정.';
comment on column public.mentor_session_bookings.platform_fee_amount is
  '플랫폼 수수료 (원). 결제 confirm 시 amount * fee_rate 로 계산.';
comment on column public.mentor_session_bookings.mentor_payout_amount is
  '멘토 정산 금액 (원). amount - platform_fee_amount.';

-- 멘토 정산 집계 인덱스 (월배치 정산 쿼리용)
create index if not exists mentor_session_bookings_payout_idx
  on public.mentor_session_bookings(mentor_id, status, completed_at desc)
  where status = 'completed';

-- 회계 무결성: payout + fee = amount (status=paid/completed 인 row 만)
alter table public.mentor_session_bookings
  drop constraint if exists mentor_session_bookings_fee_split_check;
alter table public.mentor_session_bookings
  add constraint mentor_session_bookings_fee_split_check
  check (
    status not in ('paid', 'completed')
    or platform_fee_amount + mentor_payout_amount = amount
  );

-- ----------------------------------------------------------------------------
-- 2) experiment_topics.submitted_by → active 멘토 검증 트리거
--    NULL 허용 (Phase 1 운영자 직접 등록 호환), 값이 있으면 active 멘토여야 함
-- ----------------------------------------------------------------------------
create or replace function public.ensure_topic_submitter_is_active_mentor()
returns trigger
language plpgsql
as $$
begin
  if new.submitted_by is null then
    return new;
  end if;

  if not exists (
    select 1 from public.members
    where id = new.submitted_by
      and mentor_status = 'active'
  ) then
    raise exception
      'experiment_topics.submitted_by (%) must reference an active mentor',
      new.submitted_by
    using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_topic_submitter_is_active_mentor_trg
  on public.experiment_topics;

create trigger ensure_topic_submitter_is_active_mentor_trg
  before insert or update of submitted_by on public.experiment_topics
  for each row execute function public.ensure_topic_submitter_is_active_mentor();

comment on function public.ensure_topic_submitter_is_active_mentor() is
  'topic.submitted_by 가 NULL 이거나 active 멘토를 가리키도록 강제.';

-- ----------------------------------------------------------------------------
-- 3) close_expired_topic_voting() 확장
--    winner 마킹과 동시에 mentor_sessions(workshop, mentoring) 2개 자동 생성
-- ----------------------------------------------------------------------------

-- 기본값 (운영자가 settings 테이블로 분리하기 전까지는 함수 내부에 고정)
--   workshop: 1대 다수 라이브 강의 — 정원 30, 가격 9,900
--   mentoring (커피챗): 1대 N, 정원 10, 가격 19,900
--
-- 멘토가 winner 마감 후 mypage 에서 일정/정원/가격을 직접 수정한다.

create or replace function public.close_expired_topic_voting()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_week date;
  v_winner_id uuid;
  v_mentor_id uuid;
  v_topic_title text;
begin
  for expired_week in
    select distinct week
    from public.experiment_topics
    where status = 'candidate'
      and voting_closes_at <= now()
  loop
    -- 3-a) winner / archived 마킹
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

    -- 3-b) winner 멘토에게 세션 2개 자동 생성
    --      submitted_by 가 있는 경우만 (active 멘토는 트리거가 보장)
    select et.id, et.submitted_by, et.title
      into v_winner_id, v_mentor_id, v_topic_title
    from public.experiment_topics et
    where et.week = expired_week
      and et.status = 'winner'
    limit 1;

    if v_mentor_id is not null then
      -- 동일 winner topic 으로 중복 자동생성 방지:
      --   description 에 winner topic id 를 표시자로 박아 두고 존재 여부 체크
      if not exists (
        select 1 from public.mentor_sessions
        where mentor_id = v_mentor_id
          and description like ('[auto:winner:' || v_winner_id::text || ']%')
      ) then
        insert into public.mentor_sessions
          (mentor_id, type, title, description, price, duration_minutes, max_participants, status)
        values
          (
            v_mentor_id,
            'workshop',
            '라이브 강의 · ' || coalesce(v_topic_title, '이번 주 위너 주제'),
            '[auto:winner:' || v_winner_id::text || '] 1위 주제 라이브 강의. 멘토가 일정/가격을 수정해 주세요.',
            9900,
            60,
            30,
            'open'
          ),
          (
            v_mentor_id,
            'mentoring',
            '커피챗 · ' || coalesce(v_topic_title, '이번 주 위너 주제'),
            '[auto:winner:' || v_winner_id::text || '] 1:N 커피챗. 멘토가 일정/정원을 수정해 주세요.',
            19900,
            45,
            10,
            'open'
          );
      end if;
    end if;
  end loop;
end;
$$;

grant execute on function public.close_expired_topic_voting() to authenticated, anon;

comment on function public.close_expired_topic_voting() is
  'voting_closes_at 지난 candidate 주제 마감 + winner 멘토 mentor_sessions 2개(workshop/mentoring) 자동 생성. API에서 lazy 호출.';

-- ============================================================================
-- 검증
-- ============================================================================
-- 1) 컬럼 추가 확인
-- select column_name, data_type
-- from information_schema.columns
-- where table_name = 'mentor_session_bookings'
--   and column_name in ('fee_rate','platform_fee_amount','mentor_payout_amount');
--
-- 2) 트리거 동작 — non-mentor user_id 로 submitted_by 넣으면 23514 에러
-- update public.experiment_topics set submitted_by = (select id from public.members where mentor_status is null limit 1) where id = '...';
--
-- 3) RPC 동작 — 만료 주제 강제로 만들고 호출
-- update public.experiment_topics set voting_closes_at = now() - interval '1 minute' where week = '...';
-- select public.close_expired_topic_voting();
-- select mentor_id, type, title, status from public.mentor_sessions where description like '[auto:winner:%';
