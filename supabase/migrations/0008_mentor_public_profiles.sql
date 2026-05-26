-- ============================================================================
-- 0008_mentor_public_profiles.sql
-- anon 노출용 멘토 공개 프로필 view
--
-- 배경:
--   - members 테이블 RLS 가 authenticated 본인 row 만 select 허용 (0001 정책)
--   - /mentors 페이지는 비로그인 SSR 이라 anon 권한으로 쿼리 → 빈 배열 반환
--   - members 에 anon 정책을 추가하면 toss_billing_key/discord_id 등 민감 컬럼까지 노출됨
--
-- 해결:
--   - 안전 컬럼만 노출하는 view + security_invoker=false (default)
--     → view 가 owner 권한으로 underlying SELECT, anon 은 view 만 read
-- ============================================================================

create or replace view public.mentor_public_profiles
with (security_invoker = false) as
select
  id,
  display_name,
  avatar_url,
  mentor_title,
  mentor_intro,
  specialties,
  career,
  live_count,
  archive_count
from public.members
where mentor_status = 'active';

grant select on public.mentor_public_profiles to anon, authenticated;

comment on view public.mentor_public_profiles is
  'anon/authenticated 공개용 active 멘토 프로필. members 테이블의 민감 컬럼(toss_*, discord_id, plan_type 등) 제외.';

-- ============================================================================
-- 검증
-- ============================================================================
-- set role anon;
-- select count(*) from public.mentor_public_profiles;  -- active 멘토 수
-- select count(*) from public.members;                  -- 0 (RLS 차단)
-- reset role;
