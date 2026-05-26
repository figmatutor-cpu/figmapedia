-- ============================================================================
-- 0005_security_hardening.sql
-- 보안 보강 — RLS 및 컬럼 권한 정비
--
-- 작업:
--   A. members 컬럼 권한 분리 (privilege escalation 방어)
--      → discord_id만 본인 update 가능, role/billing/subscription 컬럼은 service_role 전용
--
--   B. community_posts / community_comments 인증 기반 전환
--      → user_id 컬럼 추가 (auth.users 참조)
--      → RLS 활성화 + 정책: anon SELECT, authenticated 본인만 INSERT/UPDATE/DELETE
--
--   C. 마이그레이션 미추적 테이블 RLS 활성화
--      → embeddings, page_thumbnails, thumbnails: RLS enable + 정책 0개 = 자동 deny.
--      → API 라우트는 service_role 키로 접근하므로 정상 동작 유지.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- A. members — 컬럼 단위 update 권한 제한
--
-- 0001의 정책 "Users can update their own member row (limited)"은 row 제한만 함.
-- column-level grant를 추가해야 비로소 컬럼 제한이 강제된다.
-- ----------------------------------------------------------------------------
revoke update on public.members from authenticated;
grant update (discord_id) on public.members to authenticated;
-- role, plan_type, toss_billing_key, toss_customer_key, subscription_status,
-- subscribed_at, next_billing_at, expires_at, cancelled_at, discord_role_synced_at
-- 등은 grant 안 함 → authenticated가 update 시도해도 권한 거부.

comment on policy "Users can update their own member row (limited)"
  on public.members
  is 'row 단위 본인 검증. 실제 컬럼 제한은 column-level grant(0005)로 강제.';

-- ----------------------------------------------------------------------------
-- B. community_posts / community_comments
--    기존 테이블에 user_id 컬럼 추가 + RLS + 정책
--    (마이그레이션이 추적되지 않은 테이블이므로 if not exists / drop policy 패턴)
-- ----------------------------------------------------------------------------
alter table public.community_posts
  add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.community_comments
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists community_posts_user_idx
  on public.community_posts(user_id, created_at desc);
create index if not exists community_comments_user_idx
  on public.community_comments(user_id, created_at desc);

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;

drop policy if exists "Anyone can view community posts" on public.community_posts;
drop policy if exists "Authed users can insert posts as self" on public.community_posts;
drop policy if exists "Authed users can update own posts" on public.community_posts;
drop policy if exists "Authed users can delete own posts" on public.community_posts;

create policy "Anyone can view community posts"
  on public.community_posts for select
  to anon, authenticated
  using (true);

create policy "Authed users can insert posts as self"
  on public.community_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Authed users can update own posts"
  on public.community_posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Authed users can delete own posts"
  on public.community_posts for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Anyone can view community comments" on public.community_comments;
drop policy if exists "Authed users can insert comments as self" on public.community_comments;
drop policy if exists "Authed users can delete own comments" on public.community_comments;

create policy "Anyone can view community comments"
  on public.community_comments for select
  to anon, authenticated
  using (true);

create policy "Authed users can insert comments as self"
  on public.community_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Authed users can delete own comments"
  on public.community_comments for delete
  to authenticated
  using (auth.uid() = user_id);

comment on column public.community_posts.user_id is
  '작성자 (auth.users). 인증 도입 후 NOT NULL 권장. 기존 익명 글은 NULL 허용으로 유지.';
comment on column public.community_comments.user_id is
  '작성자 (auth.users). 인증 도입 후 NOT NULL 권장.';

-- ----------------------------------------------------------------------------
-- C. embeddings / page_thumbnails / thumbnails
--    테이블 존재 여부에 따라 RLS만 enable. service_role은 RLS 우회 → 라우트는 그대로 동작.
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'embeddings') then
    execute 'alter table public.embeddings enable row level security';
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'page_thumbnails') then
    execute 'alter table public.page_thumbnails enable row level security';
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'thumbnails') then
    execute 'alter table public.thumbnails enable row level security';
  end if;
end $$;

-- ============================================================================
-- 검증 쿼리
-- ============================================================================
-- 컬럼 권한 확인:
-- select column_name, privilege_type from information_schema.column_privileges
--   where table_name='members' and grantee='authenticated';
--
-- RLS 정책 확인:
-- select tablename, policyname from pg_policies
--   where schemaname='public' and tablename like 'community_%' order by tablename, policyname;
--
-- RLS enable 확인:
-- select tablename, rowsecurity from pg_tables
--   where schemaname='public' and tablename in ('embeddings','page_thumbnails','thumbnails');
