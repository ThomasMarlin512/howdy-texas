begin;
create schema howdy_private;
revoke all on schema howdy_private from public,anon;
grant usage on schema howdy_private to authenticated,service_role;
create table howdy_private.members (
 member_key text primary key check(member_key=lower(member_key)),
 full_name text not null,
 secret_hash text not null,
 enabled boolean not null default true
);
create table howdy_private.sessions (
 user_id uuid primary key references auth.users(id) on delete cascade,
 member_key text not null references howdy_private.members(member_key),
 expires_at timestamptz not null
);
create index howdy_sessions_member_idx on howdy_private.sessions(member_key);
create table howdy_private.login_attempts (
 bucket text primary key,
 failures integer not null default 0,
 started_at timestamptz not null default now()
);
revoke all on all tables in schema howdy_private from public,anon,authenticated;
-- Member names and password hashes are inserted separately at deployment.
create function howdy_private.my_key() returns text language sql stable security definer set search_path='' as $$
 select s.member_key from howdy_private.sessions s join howdy_private.members m using(member_key)
 where s.user_id=(select auth.uid()) and s.expires_at>now() and m.enabled
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
end; $$;
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


create function howdy_private.context() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('me',h.member_key,'name',h.full_name,
 'people',(select jsonb_agg(jsonb_build_object('key',p.member_key,'name',p.full_name) order by p.member_key) from howdy_private.members p where p.enabled))
 from howdy_private.members h where h.member_key=howdy_private.my_key()
$$;
revoke all on function howdy_private.context() from public,anon;
grant execute on function howdy_private.context() to authenticated;
create function public.howdy_context() returns jsonb language sql stable security invoker set search_path='' as $$select howdy_private.context()$$;
revoke all on function public.howdy_context() from public,anon;
grant execute on function public.howdy_context() to authenticated;

create function howdy_private.logout() returns void language sql security definer set search_path='' as $$
 delete from howdy_private.sessions where user_id=(select auth.uid())
$$;
revoke all on function howdy_private.logout() from public,anon;
grant execute on function howdy_private.logout() to authenticated;
create function public.howdy_logout() returns void language sql security invoker set search_path='' as $$select howdy_private.logout()$$;
revoke all on function public.howdy_logout() from public,anon;
grant execute on function public.howdy_logout() to authenticated;

create function howdy_private.authenticate(p_name text,p_code text,p_requester uuid,p_client_key text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 n text:=lower(trim(p_name)); k text; secret text; actual_hash text;
 account_bucket text; network_bucket text; bucket_key text; row_state howdy_private.login_attempts;
begin
 if p_requester is null or n is null or length(n)<2 or length(n)>40 or p_code is null or length(p_code)<4 or octet_length(p_code)>72
 or p_client_key is null or p_client_key !~ '^[0-9a-f]{64}$' then return jsonb_build_object('ok',false); end if;
 if not exists(select 1 from auth.users where id=p_requester) then return jsonb_build_object('ok',false); end if;
 account_bucket:='account:'||encode(extensions.digest(n,'sha256'),'hex');
 network_bucket:='network:'||p_client_key;
 -- Serialize both buckets so parallel attempts cannot bypass the limits.
 for bucket_key in select v from unnest(array[account_bucket,network_bucket]) as v order by v loop
  perform pg_advisory_xact_lock(hashtextextended(bucket_key,0));
 end loop;
 for bucket_key in select v from unnest(array[account_bucket,network_bucket]) as v loop
  insert into howdy_private.login_attempts(bucket) values(bucket_key) on conflict do nothing;
  select * into row_state from howdy_private.login_attempts where bucket=bucket_key for update;
  if row_state.started_at<now()-interval '15 minutes' then
   update howdy_private.login_attempts set failures=0,started_at=now() where bucket=bucket_key;
  elsif row_state.failures >= (case when bucket_key=account_bucket then 8 else 40 end) then
   return jsonb_build_object('ok',false,'limited',true);
  end if;
 end loop;
 select member_key,secret_hash into k,secret from howdy_private.members where member_key=n and enabled;
 -- Use a real bcrypt hash for unknown names as well.
 select coalesce(secret,(select secret_hash from howdy_private.members limit 1)) into actual_hash;
 if k is null or actual_hash is null then
  if actual_hash is not null then perform extensions.crypt(p_code,actual_hash); end if;
 else
  if extensions.crypt(p_code,actual_hash)=secret then
   insert into howdy_private.sessions(user_id,member_key,expires_at) values(p_requester,k,now()+interval '30 days')
    on conflict(user_id) do update set member_key=excluded.member_key,expires_at=excluded.expires_at;
   update howdy_private.login_attempts set failures=0,started_at=now() where bucket=account_bucket;
   delete from howdy_private.login_attempts where started_at<now()-interval '1 day';
   return jsonb_build_object('ok',true);
  end if;
 end if;
 update howdy_private.login_attempts set failures=failures+1 where bucket in(account_bucket,network_bucket);
 return jsonb_build_object('ok',false);
end; $$;
revoke all on function howdy_private.authenticate(text,text,uuid,text) from public,anon,authenticated;
grant execute on function howdy_private.authenticate(text,text,uuid,text) to service_role;
create function public.howdy_authenticate(p_name text,p_code text,p_requester uuid,p_client_key text)
returns jsonb language sql security invoker set search_path='' as $$
 select howdy_private.authenticate(p_name,p_code,p_requester,p_client_key)
$$;
revoke all on function public.howdy_authenticate(text,text,uuid,text) from public,anon,authenticated;
grant execute on function public.howdy_authenticate(text,text,uuid,text) to service_role;
commit;

