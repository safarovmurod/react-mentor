import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import type {SupabaseClient} from '@supabase/supabase-js';
import {startAccountSync} from '@/lib/account/sync';
import {switchLearningAccount,useLearningStore} from '@/stores/learning-store';
beforeEach(()=>{localStorage.clear();switchLearningAccount(null);vi.useFakeTimers();});
afterEach(()=>vi.useRealTimers());

it('sends and restores course-scoped data through the existing owner-protected progress RPC',async ()=>{
  let row:{revision:number;data:unknown}|null=null;
  const builder={select:()=>builder,eq:()=>builder,maybeSingle:async()=>({data:row,error:null})};
  const rpc=vi.fn(async (_name,args)=>{row={revision:(row?.revision||0)+1,data:args.progress_data};return {data:[row],error:null};});
  const client={from:()=>builder,rpc} as unknown as SupabaseClient;
  switchLearningAccount('a');useLearningStore.getState().chooseCourse('html');useLearningStore.getState().saveCourseNote('html',{id:'n',title:'HTML',content:'Synced note'});
  const first=startAccountSync(client,'a',vi.fn());await vi.advanceTimersByTimeAsync(10);first.stop();
  expect(rpc.mock.calls[0][1].progress_data.courses.html.notes[0].content).toBe('Synced note');
  localStorage.clear();switchLearningAccount('a');expect(useLearningStore.getState().courses).toEqual({});
  const second=startAccountSync(client,'a',vi.fn());await vi.advanceTimersByTimeAsync(10);
  expect(useLearningStore.getState().selectedCourse).toBe('html');expect(useLearningStore.getState().courses.html?.notes[0].content).toBe('Synced note');second.stop();
});

it('discards a delayed old-account cloud response after switching accounts',async ()=>{
  let respond!:(value:unknown)=>void;
  const pending=new Promise(resolve=>{respond=resolve;});
  const builder={select:()=>builder,eq:()=>builder,maybeSingle:()=>pending};
  const rpc=vi.fn();const client={from:()=>builder,rpc} as unknown as SupabaseClient;
  switchLearningAccount('account-a');const sync=startAccountSync(client,'account-a',vi.fn());
  sync.stop();switchLearningAccount('account-b');useLearningStore.getState().saveNote({id:'b',title:'B',content:'Private B'});
  respond({data:{revision:1,data:{notes:[{id:'a',title:'A',content:'Private A'}]}},error:null});
  await vi.advanceTimersByTimeAsync(10);
  expect(useLearningStore.getState().notes).toEqual([{id:'b',title:'B',content:'Private B'}]);expect(rpc).not.toHaveBeenCalled();
});

it.each(['PT409','40001'])('merges a %s revision conflict with other-device work before retrying a write',async (code)=>{
  const remote={revision:1,data:{studied:['remote'],awards:{remote:5}}};
  const read=vi.fn().mockResolvedValueOnce({data:null,error:null}).mockResolvedValue({data:remote,error:null});
  const builder={select:()=>builder,eq:()=>builder,maybeSingle:read};
  const rpc=vi.fn().mockResolvedValueOnce({data:null,error:{code}}).mockImplementation(async (_name,args)=>({data:[{revision:2,data:args.progress_data}],error:null}));
  const client={from:()=>builder,rpc} as unknown as SupabaseClient;
  switchLearningAccount('account-a');useLearningStore.getState().markStudied('local');
  const status=vi.fn(),sync=startAccountSync(client,'account-a',status);
  await vi.advanceTimersByTimeAsync(250);
  expect(rpc).toHaveBeenCalledTimes(2);expect(rpc.mock.calls[1][1]).toMatchObject({expected_revision:1,progress_data:{studied:['remote','local'],awards:{remote:5,'learn:local':2}}});
  expect(status).toHaveBeenLastCalledWith('synced');sync.stop();
});
