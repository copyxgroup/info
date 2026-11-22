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
