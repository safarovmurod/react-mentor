'use client';
import { useState } from 'react';
import { Download, Globe2, Palette, Database, ListChecks } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { PageHeading } from '@/components/learning/page-heading';
import { AccountSettings } from '@/components/account/account-settings';
import { useAccount } from '@/components/account/account-provider';
import { progressSnapshot } from '@/lib/account/progress';
export default function SettingsPage() {
 const state=useLearningStore();const account=useAccount();const copy=COPY[state.language];const [error,setError]=useState('');
 async function exportProgress() {
  try {
   const legacy:Record<string,unknown>={};
   // Legacy IndexedDB belongs to the original guest, never another account.
   if (!account.user) {const {localDb}=await import('@/lib/db/dexie-db');for(const table of localDb.tables)legacy[table.name]=await table.toArray();}
   const blob=new Blob([JSON.stringify({version:3,exportedAt:new Date().toISOString(),accountId:account.user?.id || null,progress:progressSnapshot(state),legacy},null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='react-mentor-progress.json';anchor.click();URL.revokeObjectURL(url);
  } catch {setError(state.language==='ru'?'Не удалось экспортировать. Данные не удалены.':'Export failed. Your data has not been deleted.');}
 }
 return <><PageHeading title={copy.settings} subtitle={copy.settingsSubtitle}/><AccountSettings/><section className="panel settings-panel">
 <div className="setting-row"><div className="setting-label"><Globe2 size={21}/><div><h2>{copy.interfaceLanguage}</h2></div></div><select aria-label={copy.interfaceLanguage} value={state.language} onChange={event=>state.setPreferences({language:event.target.value as 'ru'|'en'})}><option value="ru">Русский</option><option value="en">English</option></select></div>
 <div className="setting-row"><div><h2>{copy.learningLanguage}</h2><p>{copy.tajik}</p></div><select aria-label={copy.learningLanguage} value={state.contentLanguage} onChange={event=>state.setPreferences({contentLanguage:event.target.value as 'tg'|'ru'|'en'})}><option value="tg">Тоҷикӣ</option><option value="ru">Русский</option><option value="en">English</option></select></div>
 <div className="setting-row"><div className="setting-label"><ListChecks size={21}/><div><h2>{copy.questionsPerDay}</h2><p>{copy.limitHint}</p></div></div><select aria-label={copy.questionsPerDay} value={state.dailyLimit} onChange={event=>state.setPreferences({dailyLimit:Number(event.target.value) as 5|10|15})}>{[5,10,15].map(value=><option key={value} value={value}>{value}</option>)}</select></div>
 <div className="setting-row"><div className="setting-label"><Palette size={21}/><h2>{copy.theme}</h2></div><select aria-label={copy.theme} value={state.theme} onChange={event=>state.setPreferences({theme:event.target.value as 'light'|'dark'})}><option value="light">{copy.light}</option><option value="dark">{copy.dark}</option></select></div>
 <div className="setting-row"><div className="setting-label"><Database size={21}/><div><h2>{copy.storage}</h2><p>{account.user ? (state.language==='ru' ? 'Прогресс вашего аккаунта сохраняется в браузере и синхронизируется с облаком.':'Your account progress is cached in this browser and synchronized to the cloud.'):copy.storageHint}</p></div></div><button className="button subtle" onClick={exportProgress}><Download size={17}/>{copy.export}</button></div>
 {error&&<p className="error-message" role="alert">{error}</p>}
 </section></>;
}
