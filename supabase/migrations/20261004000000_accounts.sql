-- Standalone migration: safe to apply to a Supabase project shared by other apps.
-- Does not depend on the older workspace/demo schema or change its tables.
begin;
create table if not exists public.react_mentor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  avatar_path text,
  updated_at timestamptz not null default now(),
  constraint own_avatar_path check (avatar_path is null or avatar_path like user_id::text || '/%')
);
create table if not exists public.react_mentor_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- If a verified authenticator is enrolled, private data needs its second factor.
-- SECURITY DEFINER is narrowly scoped: no arguments, returns only a boolean,
-- fixed search_path. It cannot expose other users' factor records.
create or replace function public.react_mentor_session_allowed()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    coalesce(auth.jwt()->>'aal','') = 'aal2'
    or not exists(select 1 from auth.mfa_factors where user_id = auth.uid() and status = 'verified')
  );
$$;
revoke all on function public.react_mentor_session_allowed() from public, anon;
grant execute on function public.react_mentor_session_allowed() to authenticated;

alter table public.react_mentor_profiles enable row level security;
alter table public.react_mentor_progress enable row level security;
create policy "mentor profile belongs to account" on public.react_mentor_profiles
  for all to authenticated
  using (user_id = (select auth.uid()) and (select public.react_mentor_session_allowed()))
  with check (user_id = (select auth.uid()) and (select public.react_mentor_session_allowed()));
create policy "mentor progress belongs to account" on public.react_mentor_progress
  for select to authenticated
  using (user_id = (select auth.uid()) and (select public.react_mentor_session_allowed()));
-- Writes go through the compare-and-swap function, not an unrestricted upsert.
revoke all on public.react_mentor_profiles, public.react_mentor_progress from anon;
revoke all on public.react_mentor_progress from authenticated;
grant select on public.react_mentor_progress to authenticated;
grant select, insert, update, delete on public.react_mentor_profiles to authenticated;

create or replace function public.react_mentor_save_progress(expected_revision bigint, progress_data jsonb)
returns setof public.react_mentor_progress
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); current_revision bigint;
begin
  if not public.react_mentor_session_allowed() then raise exception 'Authentication required' using errcode='42501'; end if;
  if jsonb_typeof(progress_data) <> 'object' or progress_data is null or octet_length(progress_data::text) > 2097152 then
    raise exception 'Invalid progress data' using errcode='22023';
  end if;
  -- Serializes creation and updates for this account only, across all devices.
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select revision into current_revision from public.react_mentor_progress where user_id=uid;
  if coalesce(current_revision,0) <> expected_revision then raise exception 'Revision conflict' using errcode='PT409'; end if;
  return query insert into public.react_mentor_progress(user_id,data,revision)
    values(uid,progress_data,1)
    on conflict (user_id) do update set data=excluded.data, revision=react_mentor_progress.revision+1,updated_at=now()
    returning *;
end;
$$;
revoke all on function public.react_mentor_save_progress(bigint,jsonb) from public, anon;
grant execute on function public.react_mentor_save_progress(bigint,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('react-mentor-avatars','react-mentor-avatars',false,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "mentor avatar read" on storage.objects for select to authenticated
using (bucket_id='react-mentor-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.react_mentor_session_allowed()));
create policy "mentor avatar insert" on storage.objects for insert to authenticated
with check (bucket_id='react-mentor-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.react_mentor_session_allowed()));
create policy "mentor avatar update" on storage.objects for update to authenticated
using (bucket_id='react-mentor-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.react_mentor_session_allowed()))
with check (bucket_id='react-mentor-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.react_mentor_session_allowed()));
create policy "mentor avatar delete" on storage.objects for delete to authenticated
using (bucket_id='react-mentor-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.react_mentor_session_allowed()));
commit;
