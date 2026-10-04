import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import type {SupabaseClient} from '@supabase/supabase-js';
import {startAccountSync} from '@/lib/account/sync';
import {switchLearningAccount,useLearningStore} from '@/stores/learning-store';
beforeEach(()=>{localStorage.clear();switchLearningAccount(null);vi.useFakeTimers();});
afterEach(()=>vi.useRealTimers());

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

it('merges a revision conflict with other-device work before retrying a write',async ()=>{
  const remote={revision:1,data:{studied:['remote'],awards:{remote:5}}};
  const read=vi.fn().mockResolvedValueOnce({data:null,error:null}).mockResolvedValue({data:remote,error:null});
  const builder={select:()=>builder,eq:()=>builder,maybeSingle:read};
  const rpc=vi.fn().mockResolvedValueOnce({data:null,error:{code:'40001'}}).mockImplementation(async (_name,args)=>({data:[{revision:2,data:args.progress_data}],error:null}));
  const client={from:()=>builder,rpc} as unknown as SupabaseClient;
  switchLearningAccount('account-a');useLearningStore.getState().markStudied('local');
  const status=vi.fn(),sync=startAccountSync(client,'account-a',status);
  await vi.advanceTimersByTimeAsync(250);
  expect(rpc).toHaveBeenCalledTimes(2);expect(rpc.mock.calls[1][1]).toMatchObject({expected_revision:1,progress_data:{studied:['remote','local'],awards:{remote:5,'learn:local':2}}});
  expect(status).toHaveBeenLastCalledWith('synced');sync.stop();
});
