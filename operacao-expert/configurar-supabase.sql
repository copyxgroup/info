begin;

create table if not exists public.expert_members (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.expert_members enable row level security;
revoke all on public.expert_members from public, anon, authenticated;
grant select on public.expert_members to authenticated;
drop policy if exists expert_read_own_membership on public.expert_members;
create policy expert_read_own_membership on public.expert_members
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.expert_bms (
  id text primary key,
  record jsonb not null check (jsonb_typeof(record) = 'object' and not record ? 'secret'),
  revision bigint not null default 1 check (revision > 0)
);
create table if not exists public.expert_accounts (
  id text primary key,
  record jsonb not null check (jsonb_typeof(record) = 'object' and not record ? 'secret'),
  revision bigint not null default 1 check (revision > 0),
  bm_id text generated always as (record ->> 'bm') stored not null references public.expert_bms(id)
);
create table if not exists public.expert_spend (
  id text primary key,
  record jsonb not null check (jsonb_typeof(record) = 'object' and not record ? 'secret'),
  revision bigint not null default 1 check (revision > 0),
  account_id text generated always as (record ->> 'account') stored not null references public.expert_accounts(id)
);
create table if not exists public.expert_assets (
  id text primary key,
  record jsonb not null check (jsonb_typeof(record) = 'object' and not record ? 'secret'),
  revision bigint not null default 1 check (revision > 0),
  account_id text generated always as (nullif(record ->> 'account', '')) stored references public.expert_accounts(id),
  owner_bm_id text generated always as (nullif(record ->> 'ownerBm', '')) stored references public.expert_bms(id)
);
create table if not exists public.expert_platforms (
  id text primary key,
  record jsonb not null check (jsonb_typeof(record) = 'object' and not record ? 'secret'),
  revision bigint not null default 1 check (revision > 0)
);

create unique index if not exists expert_bms_meta_id on public.expert_bms ((record ->> 'meta'));
create unique index if not exists expert_accounts_meta_id on public.expert_accounts ((record ->> 'meta'));

do $$
declare
  table_name text;
  allowed text := 'exists (select 1 from public.expert_members where user_id = (select auth.uid()))';
begin
  foreach table_name in array array['expert_bms','expert_accounts','expert_spend','expert_assets','expert_platforms']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update on public.%I to authenticated', table_name);
    execute format('drop policy if exists expert_team_select on public.%I', table_name);
    execute format('drop policy if exists expert_team_insert on public.%I', table_name);
    execute format('drop policy if exists expert_team_update on public.%I', table_name);
    execute format('create policy expert_team_select on public.%I for select to authenticated using (%s)', table_name, allowed);
    execute format('create policy expert_team_insert on public.%I for insert to authenticated with check (%s)', table_name, allowed);
    execute format('create policy expert_team_update on public.%I for update to authenticated using (%s) with check (%s)', table_name, allowed, allowed);
  end loop;
end $$;

commit;

-- Depois de criar o usuário em Authentication > Users, execute separadamente:
-- insert into public.expert_members (user_id)
-- select id from auth.users where lower(email) = lower('SEU_EMAIL')
-- on conflict do nothing;

begin;
create table if not exists public.expert_links (
  id text primary key,
  record jsonb not null check (jsonb_typeof(record) = 'object' and not record ? 'secret'),
  revision bigint not null default 1 check (revision > 0)
);
alter table public.expert_links enable row level security;
revoke all on public.expert_links from public, anon, authenticated;
grant select, insert, update on public.expert_links to authenticated;
drop policy if exists expert_team_select on public.expert_links;
drop policy if exists expert_team_insert on public.expert_links;
drop policy if exists expert_team_update on public.expert_links;
create policy expert_team_select on public.expert_links for select to authenticated
  using (exists (select 1 from public.expert_members where user_id = (select auth.uid())));
create policy expert_team_insert on public.expert_links for insert to authenticated
  with check (exists (select 1 from public.expert_members where user_id = (select auth.uid())));
create policy expert_team_update on public.expert_links for update to authenticated
  using (exists (select 1 from public.expert_members where user_id = (select auth.uid())))
  with check (exists (select 1 from public.expert_members where user_id = (select auth.uid())));
commit;
