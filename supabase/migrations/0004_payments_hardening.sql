-- ============================================================================
-- 0004_payments_hardening.sql
-- Phase 1 — 결제 라인 보안 보강
--
-- 추가:
--   - orders                (서버 발급 orderId + 가격/플랜 pending 매칭)
--   - webhook_events        (Toss webhook idempotency)
--   - payments.toss_payment_key UNIQUE 보강 (중복 confirm 방어)
--
-- 목적:
--   결제 라인에서 다음 공격/장애를 방어:
--     1) 클라이언트가 임의 amount / planType / orderId 위변조
--     2) 같은 paymentKey로 멱등성 깨고 멤버십 무한 연장
--     3) Toss webhook 재전송 시 중복 처리
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. orders — 결제 시작 시 서버가 발급, confirm 시 매칭 검증
-- ----------------------------------------------------------------------------
create type public.order_status as enum ('pending', 'confirmed', 'cancelled', 'expired');

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_id        text not null unique,
  user_id         uuid not null references public.members(id) on delete cascade,
  plan_type       public.plan_type not null,
  amount          int not null check (amount > 0),
  status          public.order_status not null default 'pending',
  expires_at      timestamptz not null default (now() + interval '30 minutes'),
  confirmed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index orders_user_idx on public.orders(user_id, created_at desc);
create index orders_status_idx on public.orders(status) where status = 'pending';

comment on table public.orders is
  '서버가 발급한 결제 주문. confirm 시 (order_id, user_id, plan_type, amount) 매칭으로 위변조 차단.';
comment on column public.orders.expires_at is
  '결제창에서 이탈 후 재사용 방지. 30분 후 자동 만료.';

-- ----------------------------------------------------------------------------
-- 2. webhook_events — Toss webhook 멱등성
-- ----------------------------------------------------------------------------
create table public.webhook_events (
  id              uuid primary key default gen_random_uuid(),
  -- Toss가 event_id를 항상 주는 건 아니므로 fallback 키 조합:
  -- 우선 eventType+orderId+paymentKey 해시. 콘솔에서 event_id 키 받으면 그걸로 대체.
  dedup_key       text not null unique,
  event_type      text not null,
  order_id        text,
  payment_key     text,
  raw_payload     jsonb,
  received_at     timestamptz not null default now()
);

create index webhook_events_event_type_idx on public.webhook_events(event_type, received_at desc);
create index webhook_events_order_idx on public.webhook_events(order_id);

comment on table public.webhook_events is
  'Toss webhook 중복 처리 방어. dedup_key는 event_id 또는 (eventType|orderId|paymentKey) 조합.';

-- ----------------------------------------------------------------------------
-- 3. payments.toss_payment_key UNIQUE 보강
--    같은 paymentKey로 두 번 confirm 호출되어도 두 번째는 거절되도록.
-- ----------------------------------------------------------------------------
create unique index if not exists payments_toss_payment_key_unique
  on public.payments(toss_payment_key);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.orders enable row level security;
alter table public.webhook_events enable row level security;

-- orders: 본인 row만 select. insert/update는 service_role 전용 (정책 없음 = 기본 deny).
create policy "Users can view their own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

-- webhook_events: 어떤 클라이언트도 접근 불가. service_role만.
-- (RLS만 enable하고 정책을 두지 않으면 authenticated/anon 모두 차단됨)

-- ============================================================================
-- 검증 쿼리
-- ============================================================================
-- select count(*) from public.orders;                          -- 0
-- select count(*) from public.webhook_events;                  -- 0
-- select indexname from pg_indexes
--   where tablename='payments' and indexname like '%payment_key%';
