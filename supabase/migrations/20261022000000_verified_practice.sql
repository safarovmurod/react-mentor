-- Server-attested results are separate from user-editable learning/draft sync.
-- Run after the account migrations. Never expose SUPABASE_SERVICE_ROLE_KEY.
begin;
create table public.react_mentor_verified_practice (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (course_id = 'html'),
  lesson_id text not null check (lesson_id = 'html-day-01'),
  solution_sha256 text not null check (solution_sha256 ~ '^[a-f0-9]{64}$'),
  xp integer not null default 50 check (xp = 50),
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_id)
);
create table public.react_mentor_verified_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (course_id = 'html'),
  day integer not null check (day = 1),
  confirmed_at timestamptz not null default now(),
  primary key (user_id, course_id, day)
);
alter table public.react_mentor_verified_practice enable row level security;
alter table public.react_mentor_verified_days enable row level security;
revoke all on public.react_mentor_verified_practice, public.react_mentor_verified_days from public, anon, authenticated;
grant select on public.react_mentor_verified_practice, public.react_mentor_verified_days to authenticated;
grant all on public.react_mentor_verified_practice, public.react_mentor_verified_days to service_role;
create policy "verified practice is private" on public.react_mentor_verified_practice for select to authenticated
  using (user_id = (select auth.uid()) and (select public.react_mentor_session_allowed()));
create policy "verified days are private" on public.react_mentor_verified_days for select to authenticated
  using (user_id = (select auth.uid()) and (select public.react_mentor_session_allowed()));

-- Authenticated clients cannot call either mutating RPC. Only the server grades.
create function public.react_mentor_record_verified_html(learner_id uuid, solution_hash text)
returns table (awarded_xp integer, total_xp bigint)
language plpgsql security definer set search_path = '' as $$
declare inserted integer;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server authorization required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(learner_id::text, 2201));
  insert into public.react_mentor_verified_practice(user_id,course_id,lesson_id,solution_sha256,xp)
    values(learner_id,'html','html-day-01',solution_hash,50)
    on conflict (user_id,course_id,lesson_id) do nothing;
  get diagnostics inserted = row_count;
  return query select inserted * 50, coalesce(sum(p.xp),0) from public.react_mentor_verified_practice p where p.user_id = learner_id;
end;
$$;
create function public.react_mentor_confirm_verified_html_day(learner_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server authorization required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(learner_id::text, 2201));
  if not exists(select 1 from public.react_mentor_verified_practice where user_id=learner_id and course_id='html' and lesson_id='html-day-01') then
    raise exception 'Verified prerequisite required' using errcode='PT409';
  end if;
  insert into public.react_mentor_verified_days(user_id,course_id,day) values(learner_id,'html',1)
    on conflict (user_id,course_id,day) do nothing;
  return true;
end;
$$;
revoke all on function public.react_mentor_record_verified_html(uuid,text), public.react_mentor_confirm_verified_html_day(uuid) from public, anon, authenticated;
grant execute on function public.react_mentor_record_verified_html(uuid,text), public.react_mentor_confirm_verified_html_day(uuid) to service_role;
commit;
