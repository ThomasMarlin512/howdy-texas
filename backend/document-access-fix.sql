begin;
create or replace function howdy_private.own_file_exists(object_path text)
returns boolean language sql stable security definer set search_path=''
as $$
 select (select howdy_private.my_key()) is not null
 and split_part(object_path,'/',1)=(select howdy_private.my_key())
 and exists(select 1 from storage.objects o where o.bucket_id='howdy-documents' and o.name=object_path);
$$;
revoke all on function howdy_private.own_file_exists(text) from public,anon;
grant execute on function howdy_private.own_file_exists(text) to authenticated;
alter policy howdy_documents_update on public.howdy_documents to authenticated using(created_by=(select howdy_private.my_key())) with check(created_by=(select howdy_private.my_key()) and (not ready or howdy_private.own_file_exists(path)));
alter policy howdy_documents_delete on public.howdy_documents to authenticated using(created_by=(select howdy_private.my_key()) and not howdy_private.own_file_exists(path));
commit;
