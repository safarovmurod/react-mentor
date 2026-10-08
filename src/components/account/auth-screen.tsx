'use client';
import { useState } from 'react';
import { Atom, Mail, ShieldCheck } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAccount } from './account-provider';
import { authErrorMessage } from '@/lib/account/auth-errors';
import { useLearningStore } from '@/stores/learning-store';
import { AUTH_COPY } from '@/lib/auth-copy';

export function AuthScreen() {
  const account=useAccount();
  const language=useLearningStore(state=>state.language), copy=AUTH_COPY[language];
  const [mode,setMode]=useState<'login'|'signup'|'reset'>('login');
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  function continueAsGuest() {account.continueAsGuest();if (window.location.pathname!=='/home') window.location.assign('/home');}
  async function google() {
    const client=getSupabaseBrowserClient();if (!client) return;
    setBusy(true);setError('');
    try {
      const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin+'/auth/callback',queryParams:{prompt:'select_account'}}});
      if (error) throw error;
    } catch {setError(copy.googleError);setBusy(false);}
  }
  async function submit(event:React.FormEvent) {
    event.preventDefault();const client=getSupabaseBrowserClient();if (!client || busy) return;
    setBusy(true);setError('');setMessage('');
    try {
      if (mode==='reset') {
        const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/auth/callback?recovery=1'});if (error) throw error;
        setMessage(copy.resetSent);
      } else if (mode==='signup') {
        const {data,error}=await client.auth.signUp({email,password,options:{data:{full_name:name.trim()},emailRedirectTo:window.location.origin+'/auth/callback'}});if (error) throw error;
        if (!data.session) setMessage(copy.confirmEmail);
      } else {
        const {error}=await client.auth.signInWithPassword({email,password});if (error) throw error;
      }
    } catch (cause) {setError(authErrorMessage(cause,mode));}
    finally {setBusy(false);}
  }
  const title=mode==='signup' ? copy.signupTitle:mode==='reset' ? copy.resetTitle:copy.loginTitle;
  return <div className="account-screen"><section className="auth-card"><span className="auth-logo"><Atom size={28}/></span><p className="eyebrow">REACTMENTOR</p><h1>{title}</h1><p>{copy.intro}</p>
    {!account.configured && <section className="auth-unavailable"><p role="status">{copy.unavailable}</p><button className="button primary" onClick={continueAsGuest}>{copy.guest}</button></section>}
    <div className="google-option"><button className="button primary google-button" onClick={google} disabled={busy || !account.configured}><span className="google-mark" aria-hidden="true">G</span><span>{copy.google}</span></button><span className="recommend-tag">{copy.recommended}</span></div>
    <div className="auth-divider">{copy.orEmail}</div>
    <form className="account-form" onSubmit={submit}>
      <fieldset className="account-fields" disabled={busy || !account.configured} aria-label={mode==='signup'?copy.signUp:copy.signIn}>
      {mode==='signup' && <label>{copy.name}<input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={60}/></label>}
      <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/></label>
      {mode!=='reset' && <label>{copy.password}<input type="password" autoComplete={mode==='signup' ? 'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode==='signup' ? 8:1} maxLength={128}/></label>}
      <button className="button subtle" disabled={busy || !account.configured}><Mail size={17}/>{busy ? copy.saveWait:mode==='signup' ? copy.signUp:mode==='reset' ? copy.sendLink:copy.signIn}</button>
      </fieldset>
    </form>
    {(error || account.error) && <p role="alert" className="error-message">{error || account.error}</p>}{message && <p role="status" className="account-success">{message}</p>}
    <div className="auth-links"><button onClick={()=>{setMode(mode==='signup' ? 'login':'signup');setError('');setMessage('');setPassword('');}} disabled={busy}>{mode==='signup' ? copy.existing:copy.createAccount}</button><button onClick={()=>{setMode(mode==='reset' ? 'login':'reset');setError('');setMessage('');setPassword('');}} disabled={busy}>{mode==='reset' ? copy.backToLogin:copy.forgot}</button></div>
    {!account.user && account.configured && <button className="guest-button" onClick={continueAsGuest} disabled={busy}>{copy.guest}</button>}
    <p className="auth-security"><ShieldCheck size={15}/>{copy.security}</p>
  </section></div>;
}

export function FirstProfileScreen() {
  const account=useAccount();
  const copy=AUTH_COPY[useLearningStore(state=>state.language)];
  const [name,setName]=useState(String(account.user?.user_metadata?.full_name || '').slice(0,60));
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setError('');
    try {await account.saveProfile(name);} catch(cause) {setError(cause instanceof Error ? cause.message:copy.nameError);} finally {setBusy(false);}
  }
  return <div className="account-screen"><section className="auth-card"><span className="auth-logo"><Atom size={28}/></span><h1>{copy.firstNameTitle}</h1><p>{copy.firstNameDescription}</p><form className="account-form" onSubmit={submit}><label>{copy.name}<input autoFocus autoComplete="name" value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={60} required/></label><button className="button primary" disabled={busy || name.trim().length<2}>{busy ? copy.saveWait:copy.firstNameStart}</button></form>{error && <p role="alert" className="error-message">{error}</p>}<button className="guest-button" onClick={account.signOut} disabled={busy}>{copy.logout}</button></section></div>;
}

export function MfaChallengeScreen() {
  const account=useAccount();const [code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function verify(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setError('');
    try {
      const client=getSupabaseBrowserClient();if (!client) throw new Error();
      const factors=await client.auth.mfa.listFactors();const factor=factors.data?.totp[0];if (factors.error || !factor) throw new Error();
      const result=await client.auth.mfa.challengeAndVerify({factorId:factor.id,code});if (result.error) throw result.error;
      await account.reload();
    } catch {setError('Не удалось подтвердить код. Возьмите новый код из приложения.');} finally {setBusy(false);}
  }
  return <div className="account-screen"><section className="auth-card"><span className="auth-logo"><ShieldCheck size={28}/></span><h1>Подтвердите вход</h1><p>Введите 6 цифр из Google Authenticator, Microsoft Authenticator или другого приложения.</p><form className="account-form" onSubmit={verify}><label>Код authenticator<input autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} required/></label><button className="button primary" disabled={busy || code.length!==6}>{busy ? 'Проверяем…':'Подтвердить'}</button></form>{error && <p role="alert" className="error-message">{error}</p>}<button className="guest-button" onClick={account.signOut} disabled={busy}>Выйти</button></section></div>;
}

export function PasswordRecoveryScreen() {
  const account=useAccount();const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent) {
    event.preventDefault();if (password!==confirm) {setError('Пароли не совпадают.');return;}setBusy(true);setError('');
    try {const result=await getSupabaseBrowserClient()?.auth.updateUser({password});if (!result || result.error) throw new Error();await account.signOut();}
    catch {setError('Не удалось сменить пароль. Повторите запрос восстановления.');} finally {setBusy(false);}
  }
  return <div className="account-screen"><section className="auth-card"><h1>Новый пароль</h1><p>После сохранения войдите с новым паролем.</p><form className="account-form" onSubmit={submit}><label>Новый пароль<input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Повторите пароль<input type="password" autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button className="button primary" disabled={busy}>Сохранить пароль</button></form>{error && <p role="alert" className="error-message">{error}</p>}<button className="guest-button" onClick={account.signOut}>Отмена</button></section></div>;
}
