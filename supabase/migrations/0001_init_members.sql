-- ============================================================================
-- 0001_init_members.sql
-- Phase 1 MVP — Designer's AI Lab
--
-- 생성 테이블:
--   - members              (auth.users 확장, role + 구독 상태)
--   - experiments          (실험 리포트 메타데이터)
--   - payments             (토스페이먼츠 결제 기록)
--   - study_reservations   (스터디 공간 예약)
--   - vods                 (YouTube Unlisted VOD 메타)
--
-- 보안:
--   - 모든 테이블에 RLS 활성화
--   - 본인 데이터만 접근 가능 (관리자는 service_role 사용)
--
-- 트리거:
--   - auth.users INSERT → members 자동 생성
--   - updated_at 자동 갱신
--   - JWT custom claims (members.role 주입)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUM 타입
-- ----------------------------------------------------------------------------
create type public.member_role as enum ('free', 'member', 'admin');
create type public.plan_type as enum ('monthly', 'annual');
create type public.reservation_status as enum ('pending', 'confirmed', 'cancelled');

-- ----------------------------------------------------------------------------
-- 2. members 테이블
-- ----------------------------------------------------------------------------
create table public.members (
  id                    uuid primary key references auth.users(id) on delete cascade,
  role                  public.member_role not null default 'free',

  -- 구독 정보
  plan_type             public.plan_type,
  toss_billing_key      text,
  toss_customer_key     text,
  subscription_status   text,
  subscribed_at         timestamptz,
  next_billing_at       timestamptz,
  expires_at            timestamptz,
  cancelled_at          timestamptz,

  -- 외부 연결
  discord_id            text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index members_role_idx on public.members(role);
create index members_next_billing_idx on public.members(next_billing_at)
  where plan_type = 'monthly' and subscription_status = 'active';
create index members_expires_idx on public.members(expires_at)
  where plan_type = 'annual';

comment on table public.members is 'auth.users 확장. 멤버십 등급과 구독 상태를 관리.';
comment on column public.members.role is 'free / member / admin (mentor는 Phase 3에 추가)';
comment on column public.members.next_billing_at is '월간 정기결제 다음 결제일';
comment on column public.members.expires_at is '연간 구독 만료일';

-- ----------------------------------------------------------------------------
-- 3. experiments 테이블 (실험 리포트 메타데이터)
-- ----------------------------------------------------------------------------
create table public.experiments (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  mdx_path      text not null,
  title         text not null,
  week          date not null,
  tool_name     text not null,
  summary       text not null,
  tags          text[] default '{}',
  author_id     uuid references public.members(id) on delete set null,
  is_published  boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index experiments_slug_idx on public.experiments(slug);
create index experiments_published_at_idx on public.experiments(published_at desc)
  where is_published = true;
create index experiments_tags_idx on public.experiments using gin(tags);

comment on table public.experiments is '실험 리포트 메타. 본문은 MDX 파일(mdx_path)에 저장.';
comment on column public.experiments.summary is '비회원에게 공개되는 30% 요약';
comment on column public.experiments.mdx_path is 'content/experiments/*.mdx 상대경로';

-- ----------------------------------------------------------------------------
-- 4. payments 테이블 (토스페이먼츠 결제 기록)
-- ----------------------------------------------------------------------------
create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.members(id) on delete cascade,
  toss_payment_key    text not null,
  toss_order_id       text not null unique,
  plan_type           public.plan_type not null,
  amount              int not null,
  status              text not null,
  paid_at             timestamptz not null default now(),
  receipt_url         text,
  raw_response        jsonb,
  created_at          timestamptz not null default now()
);

create index payments_user_idx on public.payments(user_id, paid_at desc);
create index payments_status_idx on public.payments(status);

comment on table public.payments is '토스페이먼츠 결제 기록. 영수증 + raw response 보관.';
comment on column public.payments.raw_response is '토스 API 응답 원본 (감사/디버깅용)';

-- ----------------------------------------------------------------------------
-- 5. study_reservations 테이블 (스터디 공간 예약)
-- ----------------------------------------------------------------------------
create table public.study_reservations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.members(id) on delete cascade,
  reserved_at   date not null,
  time_slot     text not null,
  status        public.reservation_status not null default 'pending',
  note          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint study_reservations_time_slot_check
    check (time_slot in ('morning', 'afternoon', 'evening'))
);

create unique index study_reservations_slot_unique
  on public.study_reservations(reserved_at, time_slot)
  where status in ('pending', 'confirmed');

create index study_reservations_user_idx on public.study_reservations(user_id, reserved_at desc);

comment on table public.study_reservations is '오프라인 스터디 공간 예약. Phase 1은 운영자 수동 확정.';
comment on column public.study_reservations.time_slot is 'morning / afternoon / evening (Phase 1 단순화)';

-- ----------------------------------------------------------------------------
-- 6. vods 테이블 (YouTube Unlisted VOD)
-- ----------------------------------------------------------------------------
create table public.vods (
  id                  uuid primary key default gen_random_uuid(),
  youtube_id          text not null,
  title               text not null,
  recorded_at         date not null,
  experiment_id       uuid references public.experiments(id) on delete set null,
  duration_seconds    int,
  is_published        boolean not null default true,
  created_at          timestamptz not null default now()
);

create index vods_recorded_at_idx on public.vods(recorded_at desc) where is_published = true;
create index vods_experiment_idx on public.vods(experiment_id);

comment on table public.vods is 'YouTube Live → Unlisted 다시보기 영상. 멤버 전용 접근.';

-- ============================================================================
-- 트리거: updated_at 자동 갱신
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger members_set_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

create trigger experiments_set_updated_at
  before update on public.experiments
  for each row execute function public.set_updated_at();

create trigger study_reservations_set_updated_at
  before update on public.study_reservations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 트리거: auth.users 생성 시 members 자동 생성
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (id, role)
  values (new.id, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- JWT custom claims hook
-- Supabase Auth가 access token 발급 시 호출. members.role을 app_metadata에 주입.
-- 활성화: Dashboard → Authentication → Hooks → Custom Access Token (postgres function)
-- ============================================================================
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_role public.member_role;
begin
  select role into user_role
  from public.members
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if user_role is not null then
    claims := jsonb_set(
      claims,
      '{app_metadata}',
      coalesce(claims->'app_metadata', '{}'::jsonb) || jsonb_build_object('role', user_role)
    );
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
grant all on table public.members to supabase_auth_admin;
create policy "Auth admin can read members for JWT hook"
  on public.members
  as permissive
  for select
  to supabase_auth_admin
  using (true);

-- ============================================================================
-- RLS 활성화
-- ============================================================================
alter table public.members enable row level security;
alter table public.experiments enable row level security;
alter table public.payments enable row level security;
alter table public.study_reservations enable row level security;
alter table public.vods enable row level security;

-- ----------------------------------------------------------------------------
-- RLS: members
-- ----------------------------------------------------------------------------
create policy "Users can view their own member row"
  on public.members for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own member row (limited)"
  on public.members for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- 주의: role / billing_key 등 민감 필드는 클라이언트 업데이트 금지.
-- API 레이어 또는 service_role 키로만 수정해야 함.
-- 향후 column-level grant 또는 별도 view로 분리 고려.

-- ----------------------------------------------------------------------------
-- RLS: experiments
-- 공개된 리포트 메타는 anon도 읽기 가능 (SEO 페이지에 30% 노출)
-- 미공개 메타는 admin만 (service_role 사용)
-- ----------------------------------------------------------------------------
create policy "Anyone can view published experiments"
  on public.experiments for select
  to anon, authenticated
  using (is_published = true);

-- ----------------------------------------------------------------------------
-- RLS: payments — 본인만 조회 가능. 쓰기는 service_role 전용.
-- ----------------------------------------------------------------------------
create policy "Users can view their own payments"
  on public.payments for select
  to authenticated
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS: study_reservations
-- ----------------------------------------------------------------------------
create policy "Members can view their own reservations"
  on public.study_reservations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "All authenticated users can view slot availability"
  on public.study_reservations for select
  to authenticated
  using (true);
-- 주의: 위 정책은 모든 컬럼이 보임. 개인정보(note, user_id 등) 노출 막으려면
-- 별도 view (date + time_slot + status만) 만들고 클라이언트는 view 사용.

create policy "Members can create their own reservations"
  on public.study_reservations for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      select role from public.members where id = auth.uid()
    ) in ('member', 'admin')
  );

create policy "Members can cancel their own reservations"
  on public.study_reservations for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and status = 'cancelled'
  );

-- ----------------------------------------------------------------------------
-- RLS: vods
-- 멤버 전용 영상이지만 메타는 비회원도 목록 노출 가능
-- youtube_id 노출은 API 레이어에서 멤버 검증 후 제공
-- ----------------------------------------------------------------------------
create policy "Anyone can view published vod metadata"
  on public.vods for select
  to anon, authenticated
  using (is_published = true);

-- ============================================================================
-- 유틸 view: 스터디룸 공개 캘린더 (개인정보 제거)
-- ============================================================================
create or replace view public.study_room_calendar as
select
  reserved_at,
  time_slot,
  status
from public.study_reservations
where status in ('pending', 'confirmed');

grant select on public.study_room_calendar to anon, authenticated;

-- ============================================================================
-- 검증 쿼리 (마이그레이션 후 실행)
-- ============================================================================
-- select count(*) from public.members;                       -- 0
-- select tablename from pg_tables where schemaname='public'; -- 5개 확인
-- select count(*) from pg_policies where schemaname='public';-- 정책 카운트
