-- ============================================================================
-- 0009_orders_mentor_session_kind.sql
-- orders 에 결제 종류 분기 추가 — Phase C 결제 흐름 통합
--
-- Why:
--   기존 orders 는 멤버십 전용 (plan_type NOT NULL). 멘토 세션 결제도 같은
--   orders 테이블로 추적해야 confirm 흐름·webhook 멱등성·정산 쿼리가 일관됨.
--
-- 변경:
--   - order_kind enum 추가 ('membership', 'mentor_session')
--   - orders.kind 추가 (default 'membership' — 기존 row 호환)
--   - orders.mentor_session_booking_id 추가 (FK, nullable)
--   - orders.plan_type NOT NULL 해제 (mentor_session 일 땐 NULL)
--   - CHECK 제약: kind 별로 어떤 필드가 채워져야 하는지 강제
-- ============================================================================

create type public.order_kind as enum ('membership', 'mentor_session');

alter table public.orders
  add column kind public.order_kind not null default 'membership',
  add column mentor_session_booking_id uuid
    references public.mentor_session_bookings(id) on delete set null,
  alter column plan_type drop not null;

create index orders_kind_idx on public.orders(kind, status);
create index orders_mentor_booking_idx
  on public.orders(mentor_session_booking_id)
  where mentor_session_booking_id is not null;

alter table public.orders
  add constraint orders_kind_consistency_check
  check (
    (kind = 'membership'
       and plan_type is not null
       and mentor_session_booking_id is null)
    or
    (kind = 'mentor_session'
       and plan_type is null
       and mentor_session_booking_id is not null)
  );

comment on column public.orders.kind is
  '결제 종류. membership=멤버십 구독, mentor_session=멘토 세션 1회 결제.';
comment on column public.orders.mentor_session_booking_id is
  'kind=mentor_session 일 때 연결된 booking. confirm 시 fee 계산해서 booking 에 기록.';

-- ============================================================================
-- 검증
-- ============================================================================
-- select column_name, is_nullable from information_schema.columns
--   where table_name='orders' and column_name in ('kind','mentor_session_booking_id','plan_type');
-- select conname from pg_constraint where conrelid = 'public.orders'::regclass;
