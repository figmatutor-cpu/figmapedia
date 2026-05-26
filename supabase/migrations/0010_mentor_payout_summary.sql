-- ============================================================================
-- 0010_mentor_payout_summary.sql
-- 멘토 월별 정산 합산 view
--
-- 사용처:
--   - /mypage/mentor 에서 본인 정산 합산 조회
--   - admin 운영 시 월말 정산 송금 대상 추출
--
-- 보안:
--   - security_invoker = true → underlying mentor_session_bookings 의 RLS 적용
--   - 본인이 멘토인 booking 만 노출됨 (0004 RLS "Mentors can view their session bookings")
--   - admin/service_role 은 전체 노출
-- ============================================================================

create or replace view public.mentor_payout_summary
with (security_invoker = true) as
select
  b.mentor_id,
  date_trunc('month', coalesce(b.completed_at, b.updated_at))::date as month,
  count(*) filter (where b.status in ('paid', 'completed')) as paid_count,
  coalesce(
    sum(b.amount) filter (where b.status in ('paid', 'completed')),
    0
  )::int as gross_amount,
  coalesce(
    sum(b.platform_fee_amount) filter (where b.status in ('paid', 'completed')),
    0
  )::int as platform_fee_total,
  coalesce(
    sum(b.mentor_payout_amount) filter (where b.status in ('paid', 'completed')),
    0
  )::int as mentor_payout_total
from public.mentor_session_bookings b
group by b.mentor_id, date_trunc('month', coalesce(b.completed_at, b.updated_at));

grant select on public.mentor_payout_summary to authenticated;

comment on view public.mentor_payout_summary is
  '멘토별 월별 정산 합산. security_invoker=true 라 underlying RLS 적용 → 본인 정산만 노출.';

-- ============================================================================
-- 검증
-- ============================================================================
-- 멘토 본인 로그인 상태로:
--   select * from public.mentor_payout_summary order by month desc;
-- → 본인 booking 의 월별 정산만 반환
--
-- service_role 로:
--   select * from public.mentor_payout_summary;
-- → 모든 멘토의 정산 (월말 송금 리포트)
