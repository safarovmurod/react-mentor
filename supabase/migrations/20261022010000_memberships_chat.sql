-- Apply after account migrations. No paid access is granted automatically.
-- Only a trusted administrator / verified future payment webhook may provision memberships.
begin;
create table if not exists public.react_mentor_memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 tier text not null check (tier in ('pro','expert')),
 expires_at timestamptz not null,
 updated_at timestamptz not null default now()
);
alter table public.react_mentor_memberships enable row level security;
revoke all on public.react_mentor_memberships from public, anon, authenticated;
grant select on public.react_mentor_memberships to authenticated;
-- Provisioning must work without relying on Supabase's project-specific default
-- grants. This key belongs only to the trusted server/administrator, never UI.
grant all on public.react_mentor_memberships to service_role;
create policy "own membership read" on public.react_mentor_memberships for select to authenticated
 using(user_id=(select auth.uid()) and (select public.react_mentor_session_allowed()));

create or replace function public.react_mentor_paid_member()
returns boolean language sql stable security definer set search_path='' as $$
 select public.react_mentor_session_allowed() and exists(
  select 1 from public.react_mentor_memberships where user_id=auth.uid() and expires_at>now() and tier in ('pro','expert')
 );
$$;
revoke all on function public.react_mentor_paid_member() from public, anon;
grant execute on function public.react_mentor_paid_member() to authenticated;

create table if not exists public.react_mentor_chat_messages (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references auth.users(id) on delete cascade,
 author_name text not null check(char_length(author_name) between 2 and 60),
 body text not null check(char_length(btrim(body)) between 1 and 2000),
 created_at timestamptz not null default now()
);
create index if not exists mentor_chat_created_idx on public.react_mentor_chat_messages(created_at desc);
create index if not exists mentor_chat_author_created_idx on public.react_mentor_chat_messages(author_id,created_at desc);
create table if not exists public.react_mentor_chat_presence (
 user_id uuid primary key references auth.users(id) on delete cascade,
 last_seen timestamptz not null default now()
);
alter table public.react_mentor_chat_messages enable row level security;
alter table public.react_mentor_chat_presence enable row level security;
revoke all on public.react_mentor_chat_messages,public.react_mentor_chat_presence from public,anon,authenticated;
grant select on public.react_mentor_chat_messages,public.react_mentor_chat_presence to authenticated;
create policy "paid chat read" on public.react_mentor_chat_messages for select to authenticated
 using((select public.react_mentor_paid_member()));
create policy "paid presence read" on public.react_mentor_chat_presence for select to authenticated
 using(last_seen>now()-interval '90 seconds' and (select public.react_mentor_paid_member()));

-- RPCs are the only write path: caller cannot forge author, time, or plan.
create or replace function public.react_mentor_send_message(message_body text)
returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); display text; message_id uuid;
begin
 if not public.react_mentor_paid_member() then raise exception 'Membership required' using errcode='42501'; end if;
 if message_body is null or char_length(btrim(message_body)) not between 1 and 2000 then raise exception 'Invalid message' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('mentor-chat:'||uid::text,0));
 if exists(select 1 from public.react_mentor_chat_messages where author_id=uid and created_at>now()-interval '2 seconds')
 or (select count(*) from public.react_mentor_chat_messages where author_id=uid and created_at>now()-interval '1 minute')>=20 then
  raise exception 'Too many messages' using errcode='PT429';
 end if;
 select display_name into display from public.react_mentor_profiles where user_id=uid;
 if display is null then raise exception 'Profile required' using errcode='42501'; end if;
 insert into public.react_mentor_chat_messages(author_id,author_name,body) values(uid,display,btrim(message_body)) returning id into message_id;
 return message_id;
end;
$$;
create or replace function public.react_mentor_chat_heartbeat(leaving boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if not public.react_mentor_paid_member() then raise exception 'Membership required' using errcode='42501'; end if;
 if leaving then delete from public.react_mentor_chat_presence where user_id=uid; return; end if;
 -- The database supplies timestamps. Repeated calls cannot move presence into the future.
 insert into public.react_mentor_chat_presence(user_id,last_seen) values(uid,now())
 on conflict(user_id) do update set last_seen=now() where react_mentor_chat_presence.last_seen<now()-interval '15 seconds';
end;
$$;
revoke all on function public.react_mentor_send_message(text),public.react_mentor_chat_heartbeat(boolean) from public,anon;
grant execute on function public.react_mentor_send_message(text),public.react_mentor_chat_heartbeat(boolean) to authenticated;
commit;
