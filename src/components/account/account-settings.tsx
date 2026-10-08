'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Camera, Cloud, LogOut, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { prepareAvatar } from '@/lib/account/avatar';
import { accountStorageKey, mergeProgress, progressSnapshot } from '@/lib/account/progress';
import { useLearningStore } from '@/stores/learning-store';
import { useAccount } from './account-provider';
import { AccountAvatar } from './account-avatar';
import { ACCOUNT_COPY, accountErrorKey, type AccountCopyKey } from '@/lib/account-copy';

export function AccountSettings() {
  const account=useAccount();
  const copy=ACCOUNT_COPY[useLearningStore(state=>state.language)];

  const [name,setName]=useState(account.profile?.displayName || '');
  const [busy,setBusy]=useState(false),[error,setError]=useState<AccountCopyKey|''>(''),[message,setMessage]=useState<AccountCopyKey|''>('');
  async function save(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setError('');setMessage('');
    try {await account.saveProfile(name);setMessage('profileSaved');}
    catch(cause) {setError(accountErrorKey(cause,'profileError'));} finally {setBusy(false);}
  }
  async function upload(file:File|undefined) {
    if (!file || !account.user || busy) return;
    setBusy(true);setError('');setMessage('');
    const client=getSupabaseBrowserClient();const userId=account.user.id;
    let path:string|undefined;
    try {
      if (!client) throw new Error(ACCOUNT_COPY.ru.loginUnavailable);
      const blob=await prepareAvatar(file);
      path=userId+'/'+crypto.randomUUID()+'.webp';
      const {error:uploadError}=await client.storage.from('react-mentor-avatars').upload(path,blob,{contentType:'image/webp',upsert:false});
      if (uploadError) throw new Error(ACCOUNT_COPY.ru.photoUploadRetry);
      await account.saveProfile(account.profile!.displayName,path);
      if (account.profile?.avatarPath) await client.storage.from('react-mentor-avatars').remove([account.profile.avatarPath]);
      setMessage('photoUploaded');
    } catch(cause) {
      // Clean up a new upload when saving its profile failed.
      if (path && client) await client.storage.from('react-mentor-avatars').remove([path]);
      setError(accountErrorKey(cause,'photoUploadError'));
    } finally {setBusy(false);}
  }
  async function removePhoto() {
    if (!account.profile?.avatarPath || busy) return;setBusy(true);setError('');
    try {const path=account.profile.avatarPath;await account.saveProfile(account.profile.displayName,null);await getSupabaseBrowserClient()?.storage.from('react-mentor-avatars').remove([path]);setMessage('photoRemoved');}
    catch {setError('photoRemoveError');} finally {setBusy(false);}
  }
  async function importGuest() {
    if (busy) return;setError('');setMessage('');
    try {
      const stored=localStorage.getItem(accountStorageKey(null));
      if (!stored) {setMessage('noGuestProgress');return;}
      const guest=progressSnapshot(JSON.parse(stored).state);
      useLearningStore.setState(mergeProgress(progressSnapshot(useLearningStore.getState()),guest));
      await account.syncNow();setMessage('guestImported');
    } catch {setError('guestImportError');}
  }
  if (!account.user) return <section className="panel account-panel"><div className="section-heading"><h2>{copy.account}</h2><span className="account-badge">{copy.guestMode}</span></div><p>{copy.guestDescription}</p><Link className="button primary" href="/login">{copy.guestLogin}</Link></section>;
  return <>
    <section className="panel account-panel"><div className="section-heading"><h2>{copy.profile}</h2><span className="account-badge">{copy.account}</span></div>
      <div className="account-profile"><AccountAvatar/><div><strong>{account.profile?.displayName}</strong><p>{account.user.email}</p></div></div>
      <form className="account-form profile-form" onSubmit={save}><label>{copy.name}<input autoComplete="name" required minLength={2} maxLength={60} value={name} onChange={e=>setName(e.target.value)}/></label><button className="button primary" disabled={busy || name.trim().length<2}>{copy.saveName}</button></form>
      <div className="button-row"><label className={'button subtle upload-button '+(busy ? 'is-disabled':'')}><Camera size={17}/>{busy ? copy.wait:copy.addPhoto}<input type="file" aria-label={copy.addPhoto} accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}}/></label>{account.profile?.avatarPath && <button className="button subtle" disabled={busy} onClick={removePhoto}>{copy.removePhoto}</button>}</div><p className="account-hint">{copy.photoHint}</p>
      {error && <p role="alert" className="error-message">{copy[error]}</p>}{message && <p role="status" className="account-success">{copy[message]}</p>}
    </section>
    <section className="panel account-panel"><div className="section-heading"><h2><Cloud size={19}/>{copy.devices}</h2><span className="account-badge" role="status">{copy[account.syncStatus]}</span></div><p>{copy.deviceDescription}</p><div className="button-row"><button className="button subtle" onClick={account.syncNow} disabled={account.syncStatus==='syncing'}><RefreshCw size={16}/>{copy.sync}</button><button className="button subtle" onClick={importGuest}>{copy.importGuest}</button></div><PhoneQr/></section>
    <SecuritySettings/>
    <section className="panel account-panel"><h2>{copy.session}</h2><p>{copy.sessionDescription}</p><button className="button subtle" onClick={account.signOut}><LogOut size={17}/>{copy.logoutAccount}</button></section>
  </>;
}

function PhoneQr() {
  const copy=ACCOUNT_COPY[useLearningStore(state=>state.language)];
  const [image,setImage]=useState(''),[error,setError]=useState(false);
  useEffect(()=>{
    let active=true;
    import('qrcode').then(qr=>qr.toDataURL(window.location.origin+'/login',{width:192,margin:2})).then(url=>{if (active) setImage(url);}).catch(()=>{if (active) setError(true);});
    return ()=>{active=false;};
  },[]);
  return <div className="phone-connect"><div><h3><Smartphone size={18}/>{copy.phone}</h3><p>{copy.phoneDescription}</p>{error && <p role="alert">{copy.phoneError}</p>}</div>{image && /* Locally generated QR, no credentials. */
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} width={192} height={192} alt={copy.phoneAlt}/>}</div>;
}

function SecuritySettings() {
  const account=useAccount(),copy=ACCOUNT_COPY[useLearningStore(state=>state.language)];
  const [factors,setFactors]=useState<{id:string;friendly_name?:string}[]>([]),[loading,setLoading]=useState(true);
  const [enrollment,setEnrollment]=useState<{id:string;qr:string;secret:string}|null>(null);
  const [code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState<AccountCopyKey|''>(''),[message,setMessage]=useState<AccountCopyKey|''>('');
  useEffect(()=>{
    let active=true;const client=getSupabaseBrowserClient();
    if (client) client.auth.mfa.listFactors().then(result=>{if (!active) return;if (result.error) setError('factorCheckError');else setFactors(result.data.totp);setLoading(false);});
    return ()=>{active=false;};
  },[]);
  async function enroll() {
    if (busy) return;setBusy(true);setError('');setMessage('');
    try {
      const client=getSupabaseBrowserClient();if (!client) throw new Error();
      // Remove incomplete factors left by abandoned enrollment before starting.
      const listed=await client.auth.mfa.listFactors();if (listed.error) throw listed.error;
      for (const factor of listed.data.all.filter(f=>f.factor_type==='totp' && f.status==='unverified')) {const removed=await client.auth.mfa.unenroll({factorId:factor.id});if (removed.error) throw removed.error;}
      const result=await client.auth.mfa.enroll({factorType:'totp',friendlyName:'ReactMentor',issuer:'ReactMentor'});if (result.error) throw result.error;
      const qr=result.data.totp.qr_code;
      setEnrollment({id:result.data.id,qr:qr.startsWith('data:') ? qr:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(qr),secret:result.data.totp.secret});setCode('');
    } catch {setError('enrollError');} finally {setBusy(false);}
  }
  async function verify(event:React.FormEvent) {
    event.preventDefault();if (!enrollment || busy) return;setBusy(true);setError('');
    try {const result=await getSupabaseBrowserClient()?.auth.mfa.challengeAndVerify({factorId:enrollment.id,code});if (!result || result.error) throw new Error();setEnrollment(null);setCode('');await account.reload();}
    catch {setError('verifyError');} finally {setBusy(false);}
  }
  async function cancel() {
    if (!enrollment || busy) return;setBusy(true);setError('');
    try {const result=await getSupabaseBrowserClient()?.auth.mfa.unenroll({factorId:enrollment.id});if (!result || result.error) throw new Error();setEnrollment(null);setCode('');}
    catch {setError('cancelError');} finally {setBusy(false);}
  }
  async function remove(id:string) {
    if (busy) return;setBusy(true);setError('');
    try {const result=await getSupabaseBrowserClient()?.auth.mfa.unenroll({factorId:id});if (!result || result.error) throw new Error();setFactors(items=>items.filter(f=>f.id!==id));setMessage('factorRemoved');await account.reload();}
    catch {setError('factorRemoveError');} finally {setBusy(false);}
  }
  return <section className="panel account-panel"><div className="section-heading"><h2><ShieldCheck size={19}/>{copy.security}</h2><span className="account-badge">{loading ? copy.checking:factors.length ? copy.connected:copy.ordinaryLogin}</span></div><p>{copy.securityDescription}</p>
    {loading ? null:enrollment ? <div className="mfa-enrollment"><p>{copy.enrollScan}<br/>{copy.enrollCode}</p>{/* Sensitive enrollment QR stays in component memory only. */
      // eslint-disable-next-line @next/next/no-img-element
      <img src={enrollment.qr} alt={copy.enrollAlt} width={192} height={192}/>}<details><summary>{copy.enrollManual}</summary><code className="mfa-secret">{enrollment.secret}</code></details><p className="account-hint">{copy.enrollHint}</p><form className="account-form" onSubmit={verify}><label>{copy.appCode}<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label><div className="button-row"><button className="button primary" disabled={busy || code.length!==6}>{copy.enableSecurity}</button><button type="button" className="button subtle" disabled={busy} onClick={cancel}>{copy.cancel}</button></div></form></div>:factors.length ? factors.map(factor=><div className="setting-row" key={factor.id}><div><strong>{factor.friendly_name || 'Authenticator'}</strong><p>{copy.requiredCode}</p></div><button className="button subtle" disabled={busy} onClick={()=>remove(factor.id)}>{copy.disable}</button></div>):<button className="button subtle" disabled={busy} onClick={enroll}><ShieldCheck size={17}/>{copy.enroll}</button>}
    {error && <p role="alert" className="error-message">{copy[error]}</p>}{message && <p role="status" className="account-success">{copy[message]}</p>}
  </section>;
}
