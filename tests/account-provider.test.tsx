import {createElement} from 'react';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {AuthRetryableFetchError,type Session,type SupabaseClient} from '@supabase/supabase-js';
import {AccountProvider,useAccount} from '@/components/account/account-provider';
import {useAppStore} from '@/stores/app-store';

const mocked=vi.hoisted(()=>({client:null as SupabaseClient|null,listener:null as ((event:string,next:Session|null)=>void)|null}));
vi.mock('@/lib/supabase/client',()=>({isSupabaseConfigured:true,getSupabaseBrowserClient:()=>mocked.client}));
vi.mock('@/lib/account/sync',()=>({startAccountSync:()=>({stop:vi.fn(),sync:vi.fn()})}));
const session={access_token:'saved-access',refresh_token:'saved-refresh',user:{id:'account-a'}} as Session;
function Probe(){const a=useAccount();return <><div data-testid="account-state">{JSON.stringify({loading:a.loading,userId:a.user?.id,profile:a.profile?.displayName,restoreFailed:a.restoreFailed,error:a.error})}</div><button onClick={a.reload}>Reopen account</button></>;}
function state(){return JSON.parse(screen.getByTestId('account-state').textContent!);}
function backend(){
  const getSession=vi.fn().mockResolvedValue({data:{session},error:null}),getUser=vi.fn().mockResolvedValue({data:{user:session.user},error:null});
  const profile=vi.fn().mockResolvedValue({data:{display_name:'Мансур',avatar_path:null},error:null});
  const builder={select:()=>builder,eq:()=>builder,abortSignal:()=>builder,maybeSingle:profile};
  mocked.client={auth:{getSession,getUser,mfa:{getAuthenticatorAssuranceLevel:vi.fn().mockResolvedValue({data:{currentLevel:'aal1',nextLevel:'aal1'},error:null})},onAuthStateChange:(listener:typeof mocked.listener)=>{mocked.listener=listener;return {data:{subscription:{unsubscribe:vi.fn()}}};}},from:()=>builder} as unknown as SupabaseClient;
  return {getSession,getUser,profile};
}
beforeEach(()=>{localStorage.clear();mocked.listener=null;});
afterEach(()=>{cleanup();mocked.client=null;});
it('keeps the account open and preserves current work on repeated tab-focus SIGNED_IN events',async()=>{
  const b=backend();render(createElement(AccountProvider,{children:createElement(Probe)}));
  await waitFor(()=>expect(state()).toMatchObject({loading:false,profile:'Мансур'}));
  useAppStore.setState({activeSecondsToday:42,tutorDrawerOpen:true});
  await act(async()=>{mocked.listener!('SIGNED_IN',session);await new Promise(resolve=>setTimeout(resolve,20));});
  expect(b.profile).toHaveBeenCalledTimes(1);expect(b.getUser).toHaveBeenCalledTimes(1);
  expect(useAppStore.getState()).toMatchObject({activeSecondsToday:42,tutorDrawerOpen:true});
});
it('automatically retries a temporarily unavailable saved session when the device reconnects',async()=>{
  const b=backend();b.getSession.mockResolvedValueOnce({data:{session:null},error:new AuthRetryableFetchError('Offline',503)});
  render(createElement(AccountProvider,{children:createElement(Probe)}));
  await waitFor(()=>expect(state()).toMatchObject({loading:false,restoreFailed:true}));
  expect(b.getUser).not.toHaveBeenCalled();
  await act(async()=>window.dispatchEvent(new Event('online')));
  await waitFor(()=>expect(state()).toMatchObject({loading:false,restoreFailed:false,userId:'account-a',profile:'Мансур',error:''}));
  expect(b.getSession).toHaveBeenCalledTimes(2);
});
it('finishes a failed restoration when automatic token refresh recovers without an online event',async()=>{
  const b=backend();render(createElement(AccountProvider,{children:createElement(Probe)}));
  await waitFor(()=>expect(state()).toMatchObject({loading:false,profile:'Мансур'}));
  b.getSession.mockResolvedValueOnce({data:{session:null},error:new AuthRetryableFetchError('Service unavailable',503)});
  fireEvent.click(screen.getByRole('button',{name:'Reopen account'}));
  await waitFor(()=>expect(state()).toMatchObject({loading:false,restoreFailed:true}));
  await act(async()=>mocked.listener!('TOKEN_REFRESHED',{...session,access_token:'refreshed-access'}));
  await waitFor(()=>expect(state()).toMatchObject({loading:false,restoreFailed:false,profile:'Мансур',error:''}));
  expect(b.getUser).toHaveBeenLastCalledWith('refreshed-access');
});
