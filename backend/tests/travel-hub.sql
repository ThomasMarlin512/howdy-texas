-- Set howdy.test.user1 and howdy.test.user2 to two disposable, existing anonymous Auth user UUIDs before running.
-- Every test mutation is rolled back. Storage uploads/downloads are tested separately through the Storage API.
begin;
create temp table hub_test_fixture (u1 uuid,u2 uuid,outsider uuid,booking_id uuid,doc_id uuid,option_id uuid);
insert into hub_test_fixture values(current_setting('howdy.test.user1')::uuid,current_setting('howdy.test.user2')::uuid,gen_random_uuid(),null,gen_random_uuid(),null);
grant all on hub_test_fixture to authenticated;
insert into howdy_private.sessions(user_id,member_key,expires_at) select u1,'thomas',now()+interval '10 minutes' from hub_test_fixture union all select u2,'manuela',now()+interval '10 minutes' from hub_test_fixture on conflict(user_id) do update set member_key=excluded.member_key,expires_at=excluded.expires_at;
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',(select outsider from hub_test_fixture),'role','authenticated')::text,true);
do $$begin
 if (select count(*) from public.howdy_trip_settings)<>0 then raise exception 'Outsider reads settings';end if;
 begin insert into public.howdy_bookings(kind,title) values('car','Forbidden');raise exception 'Outsider insert succeeded';exception when insufficient_privilege or not_null_violation then null;end;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',(select u1 from hub_test_fixture),'role','authenticated')::text,true);
with b as (insert into public.howdy_bookings(kind,title,status,start_local,end_local,start_zone,end_zone,amount,currency) values('flight','HOWDY TEST ONLY','planned','2027-04-22 10:00','2027-04-22 14:00','Europe/Zurich','America/Chicago',100,'EUR') returning id) update hub_test_fixture set booking_id=(select id from b);
with d as (insert into public.howdy_date_options(start_date,end_date) values('2027-12-10','2027-12-20') returning id) update hub_test_fixture set option_id=(select id from d);
insert into public.howdy_date_votes(member_key,option_id,choice) select 'thomas',option_id,'yes' from hub_test_fixture;
insert into public.howdy_attendance(member_key,choice) values('thomas','maybe') on conflict(member_key) do update set choice='maybe';
insert into public.howdy_documents(id,booking_id,category,title,file_name,mime_type,bytes,path) select doc_id,booking_id,'flight','HOWDY TEST ONLY','test.pdf','application/pdf',20,'thomas/'||doc_id||'.pdf' from hub_test_fixture;
do $$begin
 begin update public.howdy_documents set ready=true where id=(select doc_id from hub_test_fixture);raise exception 'Ready without file accepted';exception when insufficient_privilege then null;end;
 begin insert into public.howdy_date_options(start_date,end_date) values('2027-04-22','2027-05-06');raise exception '15-day date accepted';exception when check_violation then null;end;
 begin update public.howdy_bookings set title='Conflict',revision=0 where id=(select booking_id from hub_test_fixture);raise exception 'Stale revision accepted';exception when raise_exception then if sqlerrm<>'Revision conflict' then raise;end if;end;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',(select u2 from hub_test_fixture),'role','authenticated')::text,true);
do $$begin
 if exists(select 1 from public.howdy_documents where id=(select doc_id from hub_test_fixture)) then raise exception 'Other member reads pending file';end if;
 begin insert into public.howdy_date_votes(member_key,option_id,choice) select 'thomas',option_id,'no' from hub_test_fixture on conflict(member_key,option_id) do update set choice='no';raise exception 'Other vote changed';exception when insufficient_privilege then null;end;
end $$;
update public.howdy_bookings set notes='Shared editing works',revision=revision+1 where id=(select booking_id from hub_test_fixture);
select set_config('request.jwt.claims',jsonb_build_object('sub',(select u1 from hub_test_fixture),'role','authenticated')::text,true);
update public.howdy_trip_settings set confirmed_option=(select option_id from hub_test_fixture),revision=revision+1 where id=1;
do $$begin
 if (select notes from public.howdy_bookings where id=(select booking_id from hub_test_fixture))<>'Shared editing works' then raise exception 'Shared editing failed';end if;
 begin update public.howdy_date_options set archived=true,revision=revision+1 where id=(select option_id from hub_test_fixture);raise exception 'Confirmed date archived';exception when insufficient_privilege then null;end;
 if (select choice from public.howdy_date_votes where member_key='thomas' and option_id=(select option_id from hub_test_fixture))<>'yes' then raise exception 'Vote not preserved';end if;
end $$;
reset role;
update howdy_private.sessions set expires_at=now()-interval '1 minute' where user_id=(select u1 from hub_test_fixture);
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',(select u1 from hub_test_fixture),'role','authenticated')::text,true);
do $$begin if exists(select 1 from public.howdy_documents where id=(select doc_id from hub_test_fixture)) or exists(select 1 from storage.objects where bucket_id='howdy-documents' and name='thomas/'||(select doc_id from hub_test_fixture)||'.pdf') then raise exception 'Expired member reads file';end if;end $$;
reset role;
rollback;
select 'PASS: outsider denied; own votes only; shared booking edits; exact revision; date bounds; pending file isolation; confirmed date protection; expired access; fixtures rolled back' as result;

