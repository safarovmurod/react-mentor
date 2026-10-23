// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({authenticatedUser:vi.fn(),requireMembership:vi.fn()}));
vi.mock('@/lib/account/require-user',()=>({authenticatedUser:mocks.authenticatedUser}));
vi.mock('@/lib/billing/community-server',()=>({
 requireMembership:mocks.requireMembership,
 communityResponse:(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}}),
}));
import { POST as checkout } from '@/app/api/billing/checkout/route';
import { GET as chatGet, POST as chatPost } from '@/app/api/community/route';
function req(body:unknown){return new Request('https://example.test/api',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}});}
beforeEach(()=>{vi.resetAllMocks();});
describe('unconfigured real payments',()=>{
 it('requires authentication and never creates an unpaid subscription',async()=>{
  mocks.authenticatedUser.mockResolvedValue(null);expect((await checkout(req({tier:'pro'}))).status).toBe(401);
  mocks.authenticatedUser.mockResolvedValue({id:'verified'});
  const response=await checkout(req({tier:'expert'}));expect(response.status).toBe(503);expect(await response.json()).toEqual({error:'billing_not_configured'});
 });
 it('rejects unsupported plans and oversized authenticated payloads',async()=>{
  mocks.authenticatedUser.mockResolvedValue({id:'verified'});
  expect((await checkout(req({tier:'admin'}))).status).toBe(400);
  expect((await checkout(req({tier:'pro',text:'x'.repeat(2048)}))).status).toBe(413);
 });
});
describe('community server boundary',()=>{
 it('protects message history and writes before any data operation',async()=>{
  mocks.requireMembership.mockResolvedValue({failure:Response.json({error:'membership_required'},{status:403})});
  expect((await chatGet(new Request('https://example.test/api'))).status).toBe(403);
  expect((await chatPost(req({kind:'message',text:'hello'}))).status).toBe(403);
 });
 it('rejects forged authors, timestamps and oversized messages without RPC',async()=>{
  const rpc=vi.fn();mocks.requireMembership.mockResolvedValue({client:{rpc},user:{id:'verified'},tier:'pro'});
  for(const body of [{kind:'message',text:'hello',author_id:'other'},{kind:'heartbeat',last_seen:'2099-01-01'},{kind:'message',text:'x'.repeat(2001)},{kind:'message',text:'   '}])expect((await chatPost(req(body))).status).toBe(400);
  expect((await chatPost(req({kind:'message',text:'x'.repeat(10_000)}))).status).toBe(413);expect(rpc).not.toHaveBeenCalled();
 });
 it('sends plain text only through the bounded database RPC and preserves DB rate-limit rejection',async()=>{
  const rpc=vi.fn().mockResolvedValueOnce({data:'id',error:null}).mockResolvedValueOnce({error:{code:'PT429'}});
  mocks.requireMembership.mockResolvedValue({client:{rpc},user:{id:'verified'},tier:'pro'});
  expect((await chatPost(req({kind:'message',text:' <script>alert(1)</script> '}))).status).toBe(201);
  expect(rpc).toHaveBeenNthCalledWith(1,'react_mentor_send_message',{message_body:'<script>alert(1)</script>'});
  expect((await chatPost(req({kind:'message',text:'again'}))).status).toBe(429);
 });
 it('heartbeat and leaving cannot supply arbitrary user ids or time',async()=>{
  const rpc=vi.fn().mockResolvedValue({error:null});mocks.requireMembership.mockResolvedValue({client:{rpc},user:{id:'verified'},tier:'expert'});
  expect((await chatPost(req({kind:'heartbeat'}))).status).toBe(200);expect(rpc).toHaveBeenCalledWith('react_mentor_chat_heartbeat',{leaving:false});
  expect((await chatPost(req({kind:'leave'}))).status).toBe(200);expect(rpc).toHaveBeenCalledWith('react_mentor_chat_heartbeat',{leaving:true});
 });
});
