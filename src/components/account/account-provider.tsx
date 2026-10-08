'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { verifySavedSession } from '@/lib/account/session';
import { startAccountSync, type SyncStatus } from '@/lib/account/sync';
import { switchLearningAccount } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';
import { dateKey } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning-store';
import type { InterfaceLocale } from '@/lib/locale';

export interface AccountProfile {displayName:string;avatarPath:string|null;avatarUrl:string|null;}
interface AccountContext {
  configured:boolean;loading:boolean;user:User|null;profile:AccountProfile|null;guest:boolean;restoreFailed:boolean;
  error:string;needsMfa:boolean;syncStatus:SyncStatus;recovery:boolean;
  reload:()=>Promise<void>;saveProfile:(name:string,avatarPath?:string|null)=>Promise<void>;
  signOut:()=>Promise<void>;continueAsGuest:()=>void;syncNow:()=>Promise<void>;
}
const Context=createContext<AccountContext|null>(null);
export function useAccount() {const context=useContext(Context);if (!context) throw new Error('AccountProvider required');return context;}

export function AccountProvider({children,initialLocale='ru'}:{children:React.ReactNode;initialLocale?:InterfaceLocale}) {
  const [session,setSession]=useState<Session|null>(null);
  const [loading,setLoading]=useState(true), [profile,setProfile]=useState<AccountProfile|null>(null);
  const [guest,setGuest]=useState(false), [error,setError]=useState(''), [needsMfa,setNeedsMfa]=useState(false);
  const [syncStatus,setSyncStatus]=useState<SyncStatus>('local'), [recovery,setRecovery]=useState(false);
  const [restoreFailed,setRestoreFailed]=useState(false);
  const generation=useRef(0), scope=useRef<string|null|undefined>(undefined);
  const coordinator=useRef<ReturnType<typeof startAccountSync>|null>(null);
  const currentSession=useRef<Session|null>(null);
  const sessionReady=useRef(false), retryRestoration=useRef(false);

  const loadSession=useCallback(async (next:Session|null)=>{
    const run=++generation.current;
    sessionReady.current=false;retryRestoration.current=false;setRestoreFailed(false);
    setLoading(true);setError('');setProfile(null);setSession(next);currentSession.current=next;
    coordinator.current?.stop();coordinator.current=null;
    // Invalidate private UI before any asynchronous authentication operation.
    useAppStore.setState({tutorDrawerOpen:false,tutorQuestion:null,activeSecondsToday:0,sidebarOpen:false});
    const client=getSupabaseBrowserClient();
    try {
      if (next && client) {
        next=await verifySavedSession(client,next);
        if (run!==generation.current) return;
        currentSession.current=next;setSession(next);
        const {data:assurance,error:aalError}=await client.auth.mfa.getAuthenticatorAssuranceLevel(next.access_token);
        if (run!==generation.current) return;
        if (aalError || !assurance) throw new Error('Не удалось проверить защиту аккаунта.');
        const required=assurance.nextLevel==='aal2' && assurance.currentLevel!=='aal2';
        setNeedsMfa(required);
        if (required) return;
        if (scope.current!==next.user.id) {switchLearningAccount(next.user.id,initialLocale);scope.current=next.user.id;}
        const {data,error:profileError}=await client.from('react_mentor_profiles').select('display_name,avatar_path').eq('user_id',next.user.id).abortSignal(AbortSignal.timeout(15000)).maybeSingle();
        if (run!==generation.current) return;
        if (profileError) throw new Error('Не удалось загрузить профиль. Проверьте подключение и настройку базы.');
        let avatarUrl:string|null=null;
        if (data?.avatar_path) {
          const signed=await client.storage.from('react-mentor-avatars').createSignedUrl(data.avatar_path,3600);
          if (run!==generation.current) return;
          avatarUrl=signed.data?.signedUrl || null;
        }
        setProfile(data ? {displayName:data.display_name,avatarPath:data.avatar_path,avatarUrl}:null);
        setGuest(false);sessionStorage.removeItem('react-mentor-guest');
        coordinator.current=startAccountSync(client,next.user.id,setSyncStatus);
      } else {
        setNeedsMfa(false);setSyncStatus('local');setRecovery(false);
        switchLearningAccount(null,initialLocale);scope.current=null;
        setGuest(!isSupabaseConfigured || sessionStorage.getItem('react-mentor-guest')==='true');
      }
      useAppStore.setState({activeSecondsToday:useLearningStore.getState().studySeconds[dateKey()] || 0});
      sessionReady.current=true;
    } catch (cause) {if (run===generation.current) {
      retryRestoration.current=true;
      setError(isAuthRetryableFetchError(cause) ? 'Не удалось проверить подключение. Сохранённый вход восстановится, когда появится интернет.':cause instanceof Error ? cause.message:'Не удалось открыть аккаунт.');
    }}
    finally {if (run===generation.current) setLoading(false);}
  },[initialLocale]);

  const reload=useCallback(async ()=>{
    const client=getSupabaseBrowserClient();
    if (!client) {await loadSession(null);return;}
    const run=++generation.current;
    setLoading(true);setRestoreFailed(false);setError('');
    const {data,error:sessionError}=await client.auth.getSession();
    if (run!==generation.current) return;
    if (sessionError) {
      const retryable=isAuthRetryableFetchError(sessionError);
      retryRestoration.current=retryable;setRestoreFailed(retryable);setLoading(false);
      setError(retryable ? 'Сохранённый вход временно недоступен. Подключитесь к интернету — аккаунт восстановится автоматически.':'Сессия истекла. Войдите ещё раз.');return;
    }
    await loadSession(data.session);
    if (!data.session && new URLSearchParams(window.location.search).has('error')) setError('Вход не завершён. Повторите вход через Google или email.');
  },[loadSession]);

  useEffect(()=>{
    let active=true;const scheduled=new Set<ReturnType<typeof setTimeout>>();
    const stop=()=>{generation.current++;coordinator.current?.stop();};
    const client=getSupabaseBrowserClient();
    const listener=client?.auth.onAuthStateChange((event,next)=>{
      if (event==='PASSWORD_RECOVERY') setRecovery(true);
      // Supabase callbacks hold its auth lock. Never await auth calls inside them.
      if (event==='INITIAL_SESSION') return;
      if (event==='TOKEN_REFRESHED' && sessionReady.current && !retryRestoration.current && next?.user.id===currentSession.current?.user.id) {
        currentSession.current=next;setSession(next);return;
      }
      // Supabase repeats SIGNED_IN on tab focus. Keep the already verified UI.
      if (event==='SIGNED_IN' && sessionReady.current && next?.access_token===currentSession.current?.access_token) {
        currentSession.current=next;setSession(next);return;
      }
      const timer=setTimeout(()=>{scheduled.delete(timer);if (active) void loadSession(next);},0);scheduled.add(timer);
    });
    const online=()=>{if (active && retryRestoration.current) void reload();};
    const pageShow=(event:PageTransitionEvent)=>{if (active && event.persisted) void reload();};
    window.addEventListener('online',online);window.addEventListener('pageshow',pageShow);
    void Promise.resolve().then(()=>{if (active) return reload();});
    return ()=>{active=false;for (const timer of scheduled) clearTimeout(timer);stop();listener?.data.subscription.unsubscribe();window.removeEventListener('online',online);window.removeEventListener('pageshow',pageShow);};
  },[loadSession,reload]);

  async function saveProfile(name:string,avatarPath?:string|null) {
    const client=getSupabaseBrowserClient(), active=currentSession.current;
    const trimmed=name.trim();
    if (!client || !active || trimmed.length<2 || trimmed.length>60) throw new Error('Имя должно содержать от 2 до 60 символов.');
    const path=avatarPath===undefined ? profile?.avatarPath || null:avatarPath;
    if (path && !path.startsWith(active.user.id+'/')) throw new Error('Недопустимое фото.');
    const {error:saveError}=await client.from('react_mentor_profiles').upsert({user_id:active.user.id,display_name:trimmed,avatar_path:path,updated_at:new Date().toISOString()});
    if (saveError) throw new Error('Не удалось сохранить профиль. Попробуйте ещё раз.');
    if (currentSession.current?.user.id===active.user.id) await reload();
  }
  async function signOut() {
    setLoading(true);coordinator.current?.stop();sessionStorage.removeItem('react-mentor-guest');
    const client=getSupabaseBrowserClient();
    const result=await client?.auth.signOut({scope:'local'});
    if (result?.error) {setError('Не удалось выйти. Повторите попытку.');setLoading(false);return;}
    await loadSession(null);
  }
  function continueAsGuest() {
    if (currentSession.current) return;
    sessionStorage.setItem('react-mentor-guest','true');setGuest(true);setError('');
  }
  return <Context.Provider value={{configured:isSupabaseConfigured,loading,user:session?.user || null,profile,guest,restoreFailed,error,needsMfa,syncStatus,recovery,reload,saveProfile,signOut,continueAsGuest,syncNow:async ()=>{await coordinator.current?.sync();}}}>{children}</Context.Provider>;
}
