begin;
create schema if not exists howdy_private;
revoke all on schema howdy_private from public, anon;
grant usage on schema howdy_private to authenticated, service_role;
create table if not exists howdy_private.members (
  member_key text primary key,
  full_name text not null,
  legacy_key text unique,
  user_id uuid unique references auth.users(id),
  login_email text unique,
  is_admin boolean not null default false
);
revoke all on howdy_private.members from public, anon, authenticated;
-- Insert the four reviewed member mappings separately, inside the deployment
-- transaction. Personal names, UUID mappings and aliases stay out of source.

create or replace function howdy_private.my_key() returns text language sql stable security definer set search_path='' as $$
 select h.member_key from howdy_private.members h
 where h.user_id=(select auth.uid()) or (h.legacy_key is not null and exists (
   select 1 from public.trip_attendance t join public.group_members m on m.user_id=t.user_id
   where t.roster_key=h.legacy_key and m.user_id=(select auth.uid())
 )) limit 1
$$;
revoke all on function howdy_private.my_key() from public,anon;
grant execute on function howdy_private.my_key() to authenticated;

create table if not exists public.howdy_plan (
 id smallint primary key check(id=1), revision integer not null default 0 check(revision>=0),
 data jsonb not null default '{}'::jsonb check(jsonb_typeof(data)='object' and octet_length(data::text)<=30000),
 updated_at timestamptz not null default now()
);
alter table public.howdy_plan enable row level security;
revoke all on public.howdy_plan from public,anon,authenticated;
grant select on public.howdy_plan to authenticated;
grant update(data,revision) on public.howdy_plan to authenticated;
create policy howdy_plan_read on public.howdy_plan for select to authenticated using ((select howdy_private.my_key()) is not null);
create policy howdy_plan_update on public.howdy_plan for update to authenticated using ((select howdy_private.my_key()) is not null) with check ((select howdy_private.my_key()) is not null);
create or replace function howdy_private.check_plan() returns trigger language plpgsql set search_path='' as $$
begin
 if new.revision<>old.revision+1 then raise exception 'Revision conflict'; end if;
 new.updated_at=now(); return new;
end $$;
create trigger howdy_plan_revision before update on public.howdy_plan for each row execute function howdy_private.check_plan();
insert into public.howdy_plan(id,data) values(1,'{}') on conflict do nothing;

create table if not exists public.howdy_votes (
 member_key text not null references howdy_private.members(member_key),
 day smallint not null check(day between 1 and 10), primary key(member_key,day)
);
alter table public.howdy_votes enable row level security;
revoke all on public.howdy_votes from public,anon,authenticated;
grant select,insert,delete on public.howdy_votes to authenticated;
create policy howdy_votes_read on public.howdy_votes for select to authenticated using((select howdy_private.my_key()) is not null);
create policy howdy_votes_insert on public.howdy_votes for insert to authenticated with check(member_key=(select howdy_private.my_key()));
create policy howdy_votes_delete on public.howdy_votes for delete to authenticated using(member_key=(select howdy_private.my_key()));

create or replace function howdy_private.context() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('me',h.member_key,'name',h.full_name,'admin',h.is_admin,'legacy',h.legacy_key is not null,
 'people',(select jsonb_agg(jsonb_build_object('key',p.member_key,'name',p.full_name,'ready',p.legacy_key is not null or p.user_id is not null) order by p.member_key) from howdy_private.members p))
 from howdy_private.members h where h.member_key=howdy_private.my_key()
$$;
revoke all on function howdy_private.context() from public,anon;
grant execute on function howdy_private.context() to authenticated;
create or replace function public.howdy_context() returns jsonb language sql stable security invoker set search_path='' as $$ select howdy_private.context() $$;
revoke all on function public.howdy_context() from public,anon;
grant execute on function public.howdy_context() to authenticated;

-- The Edge function is the only caller of these service-only helpers.
create or replace function public.howdy_login_target(p_name text) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('key',h.member_key,'name',h.full_name,'legacy',h.legacy_key is not null,'email',h.login_email,'ready',h.legacy_key is not null or h.user_id is not null)
 from howdy_private.members h
 where lower(trim(p_name)) in (lower(h.full_name),h.member_key)
 or (h.legacy_key is not null and exists (select 1 from public.trip_attendance t join public.group_members m on m.user_id=t.user_id where t.roster_key=h.legacy_key and lower(m.display_name)=lower(trim(p_name)))) limit 1
$$;
revoke all on function public.howdy_login_target(text) from public,anon,authenticated;
grant execute on function public.howdy_login_target(text) to service_role;

create or replace function public.howdy_provision_target(p_requester uuid,p_member text,p_user_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare target howdy_private.members;
begin
 if not exists(select 1 from howdy_private.members h join public.trip_attendance t on t.roster_key=h.legacy_key join auth.users u on u.id=t.user_id where h.is_admin and t.user_id=p_requester and u.email_confirmed_at is not null) then raise exception 'Not authorized'; end if;
 select * into target from howdy_private.members where member_key=p_member and legacy_key is null for update;
 if target.member_key is null or target.user_id is not null then raise exception 'Account already configured or unavailable'; end if;
 if p_user_id is not null then
  if not exists(select 1 from auth.users u where u.id=p_user_id and u.email=target.login_email) then raise exception 'Identity mismatch'; end if;
  update howdy_private.members set user_id=p_user_id where member_key=p_member;
 end if;
 return jsonb_build_object('email',target.login_email,'name',target.full_name);
end $$;
revoke all on function public.howdy_provision_target(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.howdy_provision_target(uuid,text,uuid) to service_role;
commit;
