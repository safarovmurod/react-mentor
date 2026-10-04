'use client';

import { useEffect } from 'react';
import { useLearningStore } from '@/stores/learning-store';

export function LearningProvider({children}:{children:React.ReactNode}) {
  const language = useLearningStore(state=>state.language);
  const theme = useLearningStore(state=>state.theme);
  const storageError = useLearningStore(state=>state.storageError);
  useEffect(()=> { document.documentElement.lang=language; document.documentElement.dataset.theme=theme; },[language,theme]);
  return <>{storageError && <div role="alert" className="storage-alert">{storageError}</div>}{children}</>;
}
