// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';

// Real PostgreSQL-compatible execution of the new SQL. The identity/MFA helpers
// model Supabase's JWT boundary; live Supabase deployment is a separate check.
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
let db:PGlite;
async function actor(role:'authenticated'|'service_role',id=A,mfa=true){
 await db.exec(`reset role; set request.jwt.claim.role='${role}'; set request.jwt.claim.sub='${id}'; set request.jwt.claim.mfa='${mfa}'; set role ${role};`);
}
async function admin(){await db.exec('reset role');}
async function record(id=A){return db.query<{awarded_xp:number;total_xp:number}>(`select * from public.react_mentor_record_verified_html($1,repeat('a',64))`,[id]);}

beforeAll(async()=>{
 db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create function auth.role() returns text language sql as $$ select current_setting('request.jwt.claim.role',true) $$;
 create function public.react_mentor_session_allowed() returns boolean language sql as $$ select coalesce(current_setting('request.jwt.claim.mfa',true),'false')='true' $$;
 create table public.react_mentor_profiles(user_id uuid primary key references auth.users(id), display_name text);
 grant usage on schema auth,public to anon,authenticated,service_role;
 grant execute on all functions in schema auth to anon,authenticated,service_role;`);
 for(const file of ['20261022000000_verified_practice.sql','20261022010000_memberships_chat.sql'])
  await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
},30000);
beforeEach(async()=>{
 await admin();
 await db.exec(`truncate auth.users cascade; insert into auth.users values('${A}'),('${B}');
 insert into public.react_mentor_profiles values('${A}','Learner A'),('${B}','Learner B');`);
});
afterAll(async()=>{await db?.close();});

describe('verified progress SQL and RLS',()=>{
 it('awards XP once and rejects learner-minted grades',async()=>{
  await actor('service_role');
  expect((await record()).rows[0]).toMatchObject({awarded_xp:50,total_xp:50});
  expect((await record()).rows[0]).toMatchObject({awarded_xp:0,total_xp:50});
  await actor('authenticated');
  await expect(record()).rejects.toThrow(/permission denied/i);
 });
 it('requires a verified prerequisite and makes confirmation idempotent',async()=>{
  await actor('service_role');
  await expect(db.query('select public.react_mentor_confirm_verified_html_day($1)',[A])).rejects.toThrow(/prerequisite/i);
  await record();
  await db.query('select public.react_mentor_confirm_verified_html_day($1)',[A]);
  await db.query('select public.react_mentor_confirm_verified_html_day($1)',[A]);
  expect((await db.query('select * from public.react_mentor_verified_days')).rows).toHaveLength(1);
 });
 it('keeps grades private between accounts and denies direct writes',async()=>{
  await actor('service_role');await record(A);await record(B);
  await actor('authenticated',A);
  expect((await db.query<{user_id:string}>('select user_id from public.react_mentor_verified_practice')).rows).toEqual([{user_id:A}]);
  await expect(db.query('delete from public.react_mentor_verified_practice')).rejects.toThrow(/permission denied/i);
  await actor('authenticated',A,false);
  expect((await db.query('select * from public.react_mentor_verified_practice')).rows).toHaveLength(0);
 });
});

describe('subscription chat SQL and RLS',()=>{
 async function subscribe(id=A){await admin();await db.query("insert into public.react_mentor_memberships(user_id,tier,expires_at) values($1,'pro',now()+interval '1 day')",[id]);}
 it('allows only trusted service provisioning and private membership reads',async()=>{
  await actor('service_role');
  await db.query("insert into public.react_mentor_memberships(user_id,tier,expires_at) values($1,'pro',now()+interval '1 day')",[A]);
  await actor('authenticated',A);
  expect((await db.query('select tier from public.react_mentor_memberships')).rows).toEqual([{tier:'pro'}]);
  await actor('authenticated',B);
  expect((await db.query('select tier from public.react_mentor_memberships')).rows).toHaveLength(0);
 });
 it('denies unpaid members and prevents self-upgrading',async()=>{
  await actor('authenticated');
  await expect(db.query("select public.react_mentor_send_message('Hello')")).rejects.toThrow(/membership/i);
  await expect(db.query("insert into public.react_mentor_memberships(user_id,tier,expires_at) values($1,'expert',now()+interval '1 day')",[A])).rejects.toThrow(/permission denied/i);
  expect((await db.query('select * from public.react_mentor_chat_messages')).rows).toHaveLength(0);
 });
 it('derives message author from identity and enforces posting rate limits',async()=>{
  await subscribe();await actor('authenticated');
  await db.query("select public.react_mentor_send_message('<script>alert(1)</script>')");
  expect((await db.query<{author_id:string;body:string}>('select author_id,body from public.react_mentor_chat_messages')).rows).toEqual([{author_id:A,body:'<script>alert(1)</script>'}]);
  await expect(db.query("select public.react_mentor_send_message('Again')")).rejects.toThrow(/too many/i);
  await expect(db.query('delete from public.react_mentor_chat_messages')).rejects.toThrow(/permission denied/i);
 });
 it('uses database time for presence, expires stale entries, supports leave',async()=>{
  await subscribe();await actor('authenticated');
  await db.query('select public.react_mentor_chat_heartbeat(false)');
  expect((await db.query('select * from public.react_mentor_chat_presence')).rows).toHaveLength(1);
  await admin();await db.exec("update public.react_mentor_chat_presence set last_seen=now()-interval '91 seconds'");
  await actor('authenticated');
  expect((await db.query('select * from public.react_mentor_chat_presence')).rows).toHaveLength(0);
  await db.query('select public.react_mentor_chat_heartbeat(false)');
  await db.query('select public.react_mentor_chat_heartbeat(true)');
  expect((await db.query('select * from public.react_mentor_chat_presence')).rows).toHaveLength(0);
 });
 it('revokes chat reads and writes after membership expires or MFA is absent',async()=>{
  await subscribe();await actor('authenticated');
  await db.query("select public.react_mentor_send_message('Private discussion')");
  await actor('authenticated',A,false);
  expect((await db.query('select * from public.react_mentor_chat_messages')).rows).toHaveLength(0);
  await expect(db.query('select public.react_mentor_chat_heartbeat(false)')).rejects.toThrow(/membership/i);
  await admin();await db.exec("update public.react_mentor_memberships set expires_at=now()-interval '1 second'");
  await actor('authenticated');
  expect((await db.query('select * from public.react_mentor_chat_messages')).rows).toHaveLength(0);
  await expect(db.query("select public.react_mentor_send_message('Expired')")).rejects.toThrow(/membership/i);
 });
});
