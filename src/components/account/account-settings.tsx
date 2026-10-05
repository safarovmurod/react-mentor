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

export function AccountSettings() {
  const account=useAccount();
  const [name,setName]=useState(account.profile?.displayName || '');
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  async function save(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setError('');setMessage('');
    try {await account.saveProfile(name);setMessage('Профиль сохранён.');}
    catch(cause) {setError(cause instanceof Error ? cause.message:'Не удалось сохранить профиль.');} finally {setBusy(false);}
  }
  async function upload(file:File|undefined) {
    if (!file || !account.user || busy) return;
    setBusy(true);setError('');setMessage('');
    const client=getSupabaseBrowserClient();const userId=account.user.id;
    let path:string|undefined;
    try {
      if (!client) throw new Error('Вход не подключён.');
      const blob=await prepareAvatar(file);
      path=userId+'/'+crypto.randomUUID()+'.webp';
      const {error:uploadError}=await client.storage.from('react-mentor-avatars').upload(path,blob,{contentType:'image/webp',upsert:false});
      if (uploadError) throw new Error('Не удалось загрузить фото. Попробуйте ещё раз.');
      await account.saveProfile(account.profile!.displayName,path);
      if (account.profile?.avatarPath) await client.storage.from('react-mentor-avatars').remove([account.profile.avatarPath]);
      setMessage('Фото обновлено.');
    } catch(cause) {
      // Clean up a new upload when saving its profile failed.
      if (path && client) await client.storage.from('react-mentor-avatars').remove([path]);
      setError(cause instanceof Error ? cause.message:'Не удалось загрузить фото.');
    } finally {setBusy(false);}
  }
  async function removePhoto() {
    if (!account.profile?.avatarPath || busy) return;setBusy(true);setError('');
    try {const path=account.profile.avatarPath;await account.saveProfile(account.profile.displayName,null);await getSupabaseBrowserClient()?.storage.from('react-mentor-avatars').remove([path]);setMessage('Фото удалено.');}
    catch {setError('Не удалось удалить фото.');} finally {setBusy(false);}
  }
  async function importGuest() {
    if (busy) return;setError('');setMessage('');
    try {
      const stored=localStorage.getItem(accountStorageKey(null));
      if (!stored) {setMessage('Гостевого прогресса пока нет.');return;}
      const guest=progressSnapshot(JSON.parse(stored).state);
      useLearningStore.setState(mergeProgress(progressSnapshot(useLearningStore.getState()),guest));
      await account.syncNow();setMessage('Гостевой прогресс добавлен. Статус облака показан ниже.');
    } catch {setError('Не удалось прочитать гостевой прогресс. Исходные данные сохранены.');}
  }
  if (!account.user) return <section className="panel account-panel"><div className="section-heading"><h2>Ваш аккаунт</h2><span className="account-badge">Гостевой режим</span></div><p>Сейчас прогресс хранится в этом браузере. Войдите, чтобы продолжить обучение на телефоне и сохранить личный профиль.</p><Link className="button primary" href="/login">Войти · Google или email</Link></section>;
  const statuses={local:'В этом браузере',syncing:'Сохраняем в облако…',synced:'Сохранено в облаке',offline:'Нет сети · изменения сохранены в браузере',error:'Облако недоступно · изменения сохранены в браузере'};
  return <>
    <section className="panel account-panel"><div className="section-heading"><h2>Личный профиль</h2><span className="account-badge">Ваш аккаунт</span></div>
      <div className="account-profile"><AccountAvatar/><div><strong>{account.profile?.displayName}</strong><p>{account.user.email}</p></div></div>
      <form className="account-form profile-form" onSubmit={save}><label>Ваше имя<input autoComplete="name" required minLength={2} maxLength={60} value={name} onChange={e=>setName(e.target.value)}/></label><button className="button primary" disabled={busy || name.trim().length<2}>Сохранить имя</button></form>
      <div className="button-row"><label className={'button subtle upload-button '+(busy ? 'is-disabled':'')}><Camera size={17}/>{busy ? 'Подождите…':'Добавить фото'}<input type="file" aria-label="Добавить фото" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}}/></label>{account.profile?.avatarPath && <button className="button subtle" disabled={busy} onClick={removePhoto}>Удалить фото</button>}</div><p className="account-hint">JPEG, PNG или WebP до 5 МБ. Фото обрезается до квадрата и хранится приватно.</p>
      {error && <p role="alert" className="error-message">{error}</p>}{message && <p role="status" className="account-success">{message}</p>}
    </section>
    <section className="panel account-panel"><div className="section-heading"><h2><Cloud size={19}/>Сохранение и устройства</h2><span className="account-badge" role="status">{statuses[account.syncStatus]}</span></div><p>Ваши ответы, XP, заметки, настройки и код доступны только вашему аккаунту. На другом устройстве войдите в тот же аккаунт.</p><div className="button-row"><button className="button subtle" onClick={account.syncNow} disabled={account.syncStatus==='syncing'}><RefreshCw size={16}/>Синхронизировать</button><button className="button subtle" onClick={importGuest}>Добавить прогресс гостя из этого браузера</button></div><PhoneQr/></section>
    <SecuritySettings/>
    <section className="panel account-panel"><h2>Сессия</h2><p>Вход сохраняется на этом устройстве после закрытия браузера. Выход закроет аккаунт здесь; на других устройствах он останется открытым.</p><button className="button subtle" onClick={account.signOut}><LogOut size={17}/>Выйти из аккаунта</button></section>
  </>;
}

function PhoneQr() {
  const [image,setImage]=useState(''),[error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    import('qrcode').then(qr=>qr.toDataURL(window.location.origin+'/login',{width:192,margin:2})).then(url=>{if (active) setImage(url);}).catch(()=>{if (active) setError('QR недоступен. Откройте этот сайт на телефоне.');});
    return ()=>{active=false;};
  },[]);
  return <div className="phone-connect"><div><h3><Smartphone size={18}/>Продолжить на телефоне</h3><p>Сканируйте QR камерой, откройте сайт и войдите в тот же Google или email аккаунт. QR содержит только ссылку на сайт.</p>{error && <p role="alert">{error}</p>}</div>{image && /* Locally generated QR, no credentials. */
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} width={192} height={192} alt="QR: открыть вход на телефоне"/>}</div>;
}

function SecuritySettings() {
  const account=useAccount();
  const [factors,setFactors]=useState<{id:string;friendly_name?:string}[]>([]),[loading,setLoading]=useState(true);
  const [enrollment,setEnrollment]=useState<{id:string;qr:string;secret:string}|null>(null);
  const [code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  useEffect(()=>{
    let active=true;const client=getSupabaseBrowserClient();
    if (client) client.auth.mfa.listFactors().then(result=>{if (!active) return;if (result.error) setError('Не удалось проверить authenticator.');else setFactors(result.data.totp);setLoading(false);});
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
    } catch {setError('Не удалось подключить authenticator. Попробуйте позже.');} finally {setBusy(false);}
  }
  async function verify(event:React.FormEvent) {
    event.preventDefault();if (!enrollment || busy) return;setBusy(true);setError('');
    try {const result=await getSupabaseBrowserClient()?.auth.mfa.challengeAndVerify({factorId:enrollment.id,code});if (!result || result.error) throw new Error();setEnrollment(null);setCode('');await account.reload();}
    catch {setError('Код не принят. Возьмите новый код из приложения.');} finally {setBusy(false);}
  }
  async function cancel() {
    if (!enrollment || busy) return;setBusy(true);setError('');
    try {const result=await getSupabaseBrowserClient()?.auth.mfa.unenroll({factorId:enrollment.id});if (!result || result.error) throw new Error();setEnrollment(null);setCode('');}
    catch {setError('Не удалось отменить подключение. Повторите попытку.');} finally {setBusy(false);}
  }
  async function remove(id:string) {
    if (busy) return;setBusy(true);setError('');
    try {const result=await getSupabaseBrowserClient()?.auth.mfa.unenroll({factorId:id});if (!result || result.error) throw new Error();setFactors(items=>items.filter(f=>f.id!==id));setMessage('Authenticator отключён.');await account.reload();}
    catch {setError('Не удалось отключить authenticator. Подтвердите вход и повторите.');} finally {setBusy(false);}
  }
  return <section className="panel account-panel"><div className="section-heading"><h2><ShieldCheck size={19}/>Защита аккаунта</h2><span className="account-badge">{loading ? 'Проверяем…':factors.length ? 'Authenticator подключён':'Обычный вход'}</span></div><p>Дополнительная защита через приложение на телефоне. Работает без SMS: Google Authenticator, Microsoft Authenticator, 2FAS и другие.</p>
    {loading ? null:enrollment ? <div className="mfa-enrollment"><p>1. Отсканируйте QR в приложении authenticator.<br/>2. Введите код, чтобы включить защиту.</p>{/* Sensitive enrollment QR stays in component memory only. */
      // eslint-disable-next-line @next/next/no-img-element
      <img src={enrollment.qr} alt="QR для приложения authenticator" width={192} height={192}/>}<details><summary>Не получается сканировать? Введите ключ вручную</summary><code className="mfa-secret">{enrollment.secret}</code></details><p className="account-hint">Сохраните доступ к приложению: коды понадобятся при следующем входе. Этот QR и ключ никому не отправляйте.</p><form className="account-form" onSubmit={verify}><label>Код из приложения<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label><div className="button-row"><button className="button primary" disabled={busy || code.length!==6}>Подключить защиту</button><button type="button" className="button subtle" disabled={busy} onClick={cancel}>Отмена</button></div></form></div>:factors.length ? factors.map(factor=><div className="setting-row" key={factor.id}><div><strong>{factor.friendly_name || 'Authenticator'}</strong><p>При входе потребуется код из приложения.</p></div><button className="button subtle" disabled={busy} onClick={()=>remove(factor.id)}>Отключить</button></div>):<button className="button subtle" disabled={busy} onClick={enroll}><ShieldCheck size={17}/>Подключить authenticator · QR</button>}
    {error && <p role="alert" className="error-message">{error}</p>}{message && <p role="status" className="account-success">{message}</p>}
  </section>;
}
