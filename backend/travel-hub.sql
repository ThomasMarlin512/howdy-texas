begin;
create table public.howdy_bookings (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('flight','hotel','car','activity')),
 title text not null check(length(trim(title)) between 2 and 160),
 status text not null default 'idea' check(status in ('idea','planned','booked','cancelled')),
 idea_id text references public.howdy_ideas(id),
 start_local timestamp, end_local timestamp,
 start_zone text not null default 'America/Chicago' check(start_zone in ('America/Chicago','Europe/Zurich')),
 end_zone text not null default 'America/Chicago' check(end_zone in ('America/Chicago','Europe/Zurich')),
 amount numeric(10,2) check(amount between 0 and 1000000),
 currency text not null default 'EUR' check(currency in ('EUR','USD')),
 url text not null default '' check(length(url)<=2000 and (url='' or url ~ '^https://[^/@[:space:]]+([/?#]|$)')),
 details jsonb not null default '{}' check(jsonb_typeof(details)='object' and octet_length(details::text)<=16000),
 notes text not null default '' check(length(notes)<=4000),
 created_by text not null default howdy_private.my_key() references howdy_private.members(member_key),
 revision integer not null default 0 check(revision>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(end_local is null or (start_local is not null and (end_local at time zone end_zone)>=(start_local at time zone start_zone)))
);
create index howdy_bookings_idea_idx on public.howdy_bookings(idea_id);
create index howdy_bookings_creator_idx on public.howdy_bookings(created_by);
create trigger howdy_bookings_revision before update on public.howdy_bookings for each row execute function howdy_private.check_plan();
alter table public.howdy_bookings enable row level security;
revoke all on public.howdy_bookings from public,anon,authenticated;
grant select on public.howdy_bookings to authenticated;
grant insert(kind,title,status,idea_id,start_local,end_local,start_zone,end_zone,amount,currency,url,details,notes) on public.howdy_bookings to authenticated;
grant update(kind,title,status,idea_id,start_local,end_local,start_zone,end_zone,amount,currency,url,details,notes,revision) on public.howdy_bookings to authenticated;
create policy howdy_bookings_read on public.howdy_bookings for select to authenticated using((select howdy_private.my_key()) is not null);
create policy howdy_bookings_insert on public.howdy_bookings for insert to authenticated with check(created_by=(select howdy_private.my_key()));
create policy howdy_bookings_update on public.howdy_bookings for update to authenticated using((select howdy_private.my_key()) is not null) with check((select howdy_private.my_key()) is not null);

create table public.howdy_date_options (
 id uuid primary key default gen_random_uuid(),
 start_date date not null check(start_date>='2027-04-22'),
 end_date date not null, archived boolean not null default false,
 created_by text references howdy_private.members(member_key) default howdy_private.my_key(),
 revision integer not null default 0, updated_at timestamptz not null default now(),
 unique(start_date,end_date), check(end_date-start_date between 2 and 13)
);
create index howdy_date_options_creator_idx on public.howdy_date_options(created_by);
create trigger howdy_date_options_revision before update on public.howdy_date_options for each row execute function howdy_private.check_plan();
alter table public.howdy_date_options enable row level security;
revoke all on public.howdy_date_options from public,anon,authenticated;
grant select on public.howdy_date_options to authenticated;
grant insert(start_date,end_date) on public.howdy_date_options to authenticated;
grant update(archived,revision) on public.howdy_date_options to authenticated;
create policy howdy_dates_read on public.howdy_date_options for select to authenticated using((select howdy_private.my_key()) is not null);
create policy howdy_dates_insert on public.howdy_date_options for insert to authenticated with check(created_by=(select howdy_private.my_key()));
create policy howdy_dates_update on public.howdy_date_options for update to authenticated using(created_by=(select howdy_private.my_key())) with check(created_by=(select howdy_private.my_key()));
insert into public.howdy_date_options(start_date,end_date) values ('2027-04-22','2027-05-01'),('2027-04-22','2027-05-03'),('2027-04-22','2027-05-05');

create table public.howdy_date_votes (
 member_key text not null default howdy_private.my_key() references howdy_private.members(member_key),
 option_id uuid not null references public.howdy_date_options(id),
 choice text not null check(choice in ('yes','maybe','no')),
 primary key(member_key,option_id)
);
create index howdy_date_votes_option_idx on public.howdy_date_votes(option_id);
create table public.howdy_attendance (
 member_key text primary key default howdy_private.my_key() references howdy_private.members(member_key),
 choice text not null check(choice in ('yes','maybe','no'))
);
create table public.howdy_idea_ballots (
 member_key text not null default howdy_private.my_key() references howdy_private.members(member_key),
 idea_id text not null references public.howdy_ideas(id),
 choice text not null check(choice in ('yes','maybe','no')),
 primary key(member_key,idea_id)
);
create index howdy_idea_ballots_idea_idx on public.howdy_idea_ballots(idea_id);
do $$
declare t text;
begin
 foreach t in array array['howdy_date_votes','howdy_attendance','howdy_idea_ballots'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 execute format('create policy %I on public.%I for select to authenticated using((select howdy_private.my_key()) is not null)',t||'_read',t);
 execute format('create policy %I on public.%I for insert to authenticated with check(member_key=(select howdy_private.my_key()))',t||'_insert',t);
 execute format('create policy %I on public.%I for update to authenticated using(member_key=(select howdy_private.my_key())) with check(member_key=(select howdy_private.my_key()))',t||'_update',t);
 execute format('create policy %I on public.%I for delete to authenticated using(member_key=(select howdy_private.my_key()))',t||'_delete',t);
 end loop;
end $$;
create policy howdy_date_vote_active on public.howdy_date_votes as restrictive for all to authenticated using(true) with check(exists(select 1 from public.howdy_date_options d where d.id=option_id and not d.archived));
create policy howdy_idea_ballot_active on public.howdy_idea_ballots as restrictive for all to authenticated using(true) with check(exists(select 1 from public.howdy_ideas i where i.id=idea_id and not i.archived));

create table public.howdy_trip_settings (
 id smallint primary key check(id=1),
 confirmed_option uuid references public.howdy_date_options(id),
 album_url text not null default '' check(length(album_url)<=2000 and (album_url='' or album_url ~ '^https://[^/@[:space:]]+([/?#]|$)')),
 album_label text not null default 'Unser gemeinsames Fotoalbum' check(length(album_label) between 1 and 160),
 revision integer not null default 0, updated_at timestamptz not null default now()
);
create index howdy_trip_settings_date_idx on public.howdy_trip_settings(confirmed_option);
insert into public.howdy_trip_settings(id) values(1);
create trigger howdy_trip_settings_revision before update on public.howdy_trip_settings for each row execute function howdy_private.check_plan();
alter table public.howdy_trip_settings enable row level security;
revoke all on public.howdy_trip_settings from public,anon,authenticated;
grant select on public.howdy_trip_settings to authenticated;
grant update(confirmed_option,album_url,album_label,revision) on public.howdy_trip_settings to authenticated;
create policy howdy_settings_read on public.howdy_trip_settings for select to authenticated using((select howdy_private.my_key()) is not null);
create policy howdy_settings_update on public.howdy_trip_settings for update to authenticated using((select howdy_private.my_key()) is not null) with check((select howdy_private.my_key()) is not null);

create table public.howdy_documents (
 id uuid primary key,
 booking_id uuid references public.howdy_bookings(id),
 category text not null check(category in ('flight','hotel','car','other')),
 title text not null check(length(trim(title)) between 2 and 160),
 file_name text not null check(length(file_name) between 1 and 240 and position('/' in file_name)=0 and position(chr(92) in file_name)=0),
 mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif')),
 bytes integer not null check(bytes between 1 and 10485760),
 path text not null unique,
 ready boolean not null default false,
 created_by text not null default howdy_private.my_key() references howdy_private.members(member_key),
 created_at timestamptz not null default now(),
 check(path = created_by||'/'||id::text||'.'||case mime_type when 'application/pdf' then 'pdf' when 'image/jpeg' then 'jpg' when 'image/png' then 'png' when 'image/webp' then 'webp' when 'image/heic' then 'heic' else 'heif' end)
);
create index howdy_documents_booking_idx on public.howdy_documents(booking_id);
create index howdy_documents_creator_idx on public.howdy_documents(created_by);
alter table public.howdy_documents enable row level security;
revoke all on public.howdy_documents from public,anon,authenticated;
grant select,delete on public.howdy_documents to authenticated;
grant insert(id,booking_id,category,title,file_name,mime_type,bytes,path) on public.howdy_documents to authenticated;
grant update(ready,booking_id,title,category) on public.howdy_documents to authenticated;
create policy howdy_documents_read on public.howdy_documents for select to authenticated using((select howdy_private.my_key()) is not null and (ready or created_by=(select howdy_private.my_key())));
create policy howdy_documents_insert on public.howdy_documents for insert to authenticated with check(created_by=(select howdy_private.my_key()) and not ready);
create or replace function howdy_private.own_file_exists(object_path text)
returns boolean language sql stable security definer set search_path=''
as $
 select (select howdy_private.my_key()) is not null
 and split_part(object_path,'/',1)=(select howdy_private.my_key())
 and exists(select 1 from storage.objects o where o.bucket_id='howdy-documents' and o.name=object_path);
$;
revoke all on function howdy_private.own_file_exists(text) from public,anon;
grant execute on function howdy_private.own_file_exists(text) to authenticated;
create policy howdy_documents_update on public.howdy_documents for update to authenticated using(created_by=(select howdy_private.my_key())) with check(created_by=(select howdy_private.my_key()) and (not ready or howdy_private.own_file_exists(path)));
create policy howdy_documents_delete on public.howdy_documents for delete to authenticated using(created_by=(select howdy_private.my_key()) and not howdy_private.own_file_exists(path));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('howdy-documents','howdy-documents',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif']);
create policy howdy_files_read on storage.objects for select to authenticated using(bucket_id='howdy-documents' and (select howdy_private.my_key()) is not null and exists(select 1 from public.howdy_documents d where d.path=name));
create policy howdy_files_insert on storage.objects for insert to authenticated with check(bucket_id='howdy-documents' and exists(select 1 from public.howdy_documents d where d.path=name and d.created_by=(select howdy_private.my_key()) and not d.ready));
create policy howdy_files_delete on storage.objects for delete to authenticated using(bucket_id='howdy-documents' and exists(select 1 from public.howdy_documents d where d.path=name and d.created_by=(select howdy_private.my_key())));
create policy howdy_confirm_active on public.howdy_trip_settings as restrictive for update to authenticated using(true) with check(confirmed_option is null or exists(select 1 from public.howdy_date_options d where d.id=confirmed_option and not d.archived));
create policy howdy_keep_confirmed_date on public.howdy_date_options as restrictive for update to authenticated using(true) with check(not archived or not exists(select 1 from public.howdy_trip_settings s where s.confirmed_option=howdy_date_options.id));
-- No UPDATE policy: uploaded objects cannot silently overwrite existing tickets.
commit;

