-- Revision mismatches are expected HTTP 409 responses, not server errors.
-- Keep the account lock and compare-and-swap protection for existing installs.
begin;
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

commit;
