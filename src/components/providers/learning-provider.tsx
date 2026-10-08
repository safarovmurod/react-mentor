'use client';

import { useEffect } from 'react';
import { useLearningStore } from '@/stores/learning-store';
import { persistManualLocale, type InterfaceLocale } from '@/lib/locale';

export function LearningProvider({children,initialLocale}:{children:React.ReactNode;initialLocale:InterfaceLocale}) {
  const language = useLearningStore(state=>state.language);
  const ready = useLearningStore(state=>state.ready);
  const chosenAt = useLearningStore(state=>state.preferenceClock.language);
  const theme = useLearningStore(state=>state.theme);
  const storageError = useLearningStore(state=>state.storageError);
  useEffect(()=> { document.documentElement.lang=ready?language:initialLocale; document.documentElement.dataset.theme=theme; },[language,theme,ready,initialLocale]);
  // Older account caches may predate the manual-choice cookie. Sync only an
  // explicit stored choice; automatic geo defaults must never become a lock.
  useEffect(()=>{if(ready && chosenAt) persistManualLocale(language);},[language,ready,chosenAt]);
  return <>{storageError && <div role="alert" className="storage-alert">{storageError}</div>}{children}</>;
}
