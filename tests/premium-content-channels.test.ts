// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';
const mocks=vi.hoisted(()=>({authenticatedUser:vi.fn(),serverClient:vi.fn(),load:vi.fn(),courseAnswer:vi.fn(),projectAnswer:vi.fn(),readFile:vi.fn()}));
vi.mock('@/lib/account/require-user',()=>({authenticatedUser:mocks.authenticatedUser}));
vi.mock('@/lib/supabase/server',()=>({getSupabaseServerClient:mocks.serverClient}));
vi.mock('@/lib/courses/content',()=>({loadCourseContent:mocks.load}));
vi.mock('@/lib/courses/tutor',()=>({courseAnswer:mocks.courseAnswer}));
vi.mock('@/lib/tutor/project-answers',()=>({projectAnswer:mocks.projectAnswer}));
vi.mock('node:fs/promises',()=>({readFile:mocks.readFile}));
import {POST as tutor} from '@/app/api/tutor/route';
import {GET as attachment} from '@/app/course-files/[filename]/route';

const bytes=Buffer.from('PAID_ATTACHMENT_SECRET');
const hash=createHash('sha256').update(bytes).digest('hex');
const filename=hash+'.txt';
const file={url:'/course-files/'+filename,title:'private notes.txt',bytes:bytes.length,sha256:hash};
function db(tier:'pro'|'expert'|'starter'){
 const maybeSingle=vi.fn().mockResolvedValue({data:tier==='starter'?null:{tier,expires_at:'2099-01-01'},error:null});
 mocks.serverClient.mockReturnValue({from:()=>({select:()=>({eq:()=>({maybeSingle})})})});
}
function ask(courseId:string,token?:string){return tutor(new NextRequest('https://example.test/api/tutor',{method:'POST',headers:{'Content-Type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify({action:'ask',courseId,questionId:'premium-q1',userText:'explain private lesson',isDeep:true,language:'en'})}));}
function download(token?:string){return attachment(new Request('https://example.test/course-files/'+filename,{headers:token?{authorization:'Bearer '+token}:{}}),{params:Promise.resolve({filename})});}
beforeEach(()=>{
 vi.resetAllMocks();
 mocks.authenticatedUser.mockResolvedValue({id:'verified-user'});
 mocks.courseAnswer.mockResolvedValue({reply:'PAID_SECTION_SECRET',source:{title:'private'}});
 mocks.projectAnswer.mockReturnValue({reply:'FREE_REACT_REFERENCE'});
 mocks.load.mockImplementation(async(id:string)=>({files:id==='javascript-pro'?[file]:[]}));
 mocks.readFile.mockResolvedValue(bytes);
});
describe('premium local tutor reference protection',()=>{
 it('denies unauthenticated premium questions before looking up or returning private sections',async()=>{
  const response=await ask('javascript-pro');expect(response.status).toBe(401);expect(await response.json()).toEqual({error:'authentication_required'});
  expect(mocks.courseAnswer).not.toHaveBeenCalled();expect(mocks.load).not.toHaveBeenCalled();
 });
 it('denies insufficient membership and protects Expert answers from Pro members',async()=>{
  db('starter');const forbidden=await ask('javascript-pro','verified');expect(forbidden.status).toBe(403);expect(await forbidden.text()).not.toContain('PAID_SECTION_SECRET');
  db('pro');const expert=await ask('architecture-expert','verified');expect(expert.status).toBe(403);expect(mocks.courseAnswer).not.toHaveBeenCalled();
 });
 it('allows paid references only after membership verification and sets no-store',async()=>{
  db('expert');const response=await ask('javascript-pro','verified');expect(response.status).toBe(200);expect(await response.text()).toContain('PAID_SECTION_SECRET');expect(response.headers.get('cache-control')).toBe('private, no-store');
 });
 it('preserves public React and ordinary-course local references with no auth dependency',async()=>{
  expect((await ask('react')).status).toBe(200);expect(mocks.projectAnswer).toHaveBeenCalled();
  expect((await ask('html')).status).toBe(200);expect(mocks.courseAnswer).toHaveBeenCalledWith('html',expect.any(String),expect.any(Object));
  expect(mocks.authenticatedUser).not.toHaveBeenCalled();expect(mocks.serverClient).not.toHaveBeenCalled();
 });
});
describe('premium-only attachments',()=>{
 it('denies anonymous and Starter access before reading bytes',async()=>{
  const anonymous=await download();expect(anonymous.status).toBe(401);expect(await anonymous.text()).not.toContain('PAID_ATTACHMENT_SECRET');
  db('starter');const starter=await download('verified');expect(starter.status).toBe(403);expect(mocks.readFile).not.toHaveBeenCalled();
 });
 it('permits verified Pro access and prevents shared caching',async()=>{
  db('pro');const response=await download('verified');expect(response.status).toBe(200);expect(await response.text()).toBe('PAID_ATTACHMENT_SECRET');expect(response.headers.get('cache-control')).toBe('private, no-store');
 });
 it('fails closed on unavailable membership storage without touching file bytes',async()=>{
  mocks.serverClient.mockReturnValue(null);expect((await download('verified')).status).toBe(503);expect(mocks.readFile).not.toHaveBeenCalled();
 });
 it('keeps a hash public when the same file is part of a free course',async()=>{
  mocks.load.mockImplementation(async(id:string)=>({files:['javascript-pro','html'].includes(id)?[file]:[]}));
  const response=await download();expect(response.status).toBe(200);expect(await response.text()).toBe('PAID_ATTACHMENT_SECRET');expect(mocks.authenticatedUser).not.toHaveBeenCalled();expect(response.headers.get('cache-control')).toBe('public, max-age=60');
 });
 it('uses Pro requirement for a file shared by Expert and Pro courses',async()=>{
  mocks.load.mockImplementation(async(id:string)=>({files:['architecture-expert','javascript-pro'].includes(id)?[file]:[]}));
  db('pro');expect((await download('verified')).status).toBe(200);
 });
 it('does not let Pro users download Expert-only files',async()=>{
  mocks.load.mockImplementation(async(id:string)=>({files:id==='architecture-expert'?[file]:[]}));
  db('pro');const response=await download('verified');expect(response.status).toBe(403);expect(mocks.readFile).not.toHaveBeenCalled();
 });
 it('rejects traversal/unknown filenames and still checks artifact integrity',async()=>{
  expect((await attachment(new Request('https://example.test/file'),{params:Promise.resolve({filename:'../private.txt'})})).status).toBe(404);expect(mocks.load).not.toHaveBeenCalled();
  db('pro');mocks.readFile.mockResolvedValue(Buffer.from('CORRUPT'));expect((await download('verified')).status).toBe(404);
 });
});
