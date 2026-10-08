'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAccount } from './account-provider';
import { AuthScreen, FirstProfileScreen, MfaChallengeScreen, PasswordRecoveryScreen } from './auth-screen';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { ActivityTracker } from '@/components/providers/activity-tracker';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/stores/app-store';
const TutorDrawer=dynamic(()=>import('@/components/layout/tutor-drawer').then(module=>module.TutorDrawer));
import { CourseBoundary } from '@/components/courses/course-boundary';
import { useLearningStore } from '@/stores/learning-store';
import { ACCOUNT_COPY, accountErrorKey } from '@/lib/account-copy';

export function AccountShell({children}:{children:React.ReactNode}) {
  const account=useAccount();const pathname=usePathname();
  const course=useLearningStore(state=>state.selectedCourse);
  const copy=ACCOUNT_COPY[useLearningStore(state=>state.language)];
  const tutorOpen=useAppStore(state=>state.tutorDrawerOpen);
  const [tutorMounted,setTutorMounted]=useState(false);
  if(tutorOpen&&!tutorMounted)setTutorMounted(true);
  // Public pages must remain readable without Supabase, guest mode or login.
  if (pathname==='/' || pathname==='/privacy' || pathname==='/terms') return <>{children}</>;
  if (account.loading) return <div className="account-screen"><p role="status">{copy.opening}</p></div>;
  if (account.restoreFailed) return <div className="account-screen"><section className="auth-card"><h1>{copy.restoring}</h1><p role="alert">{copy[accountErrorKey(account.error,'restoreError')]}</p><button className="button primary" onClick={account.reload}>{copy.retry}</button></section></div>;
  if (account.needsMfa) return <MfaChallengeScreen/>;
  if (account.user && account.recovery) return <PasswordRecoveryScreen/>;
  if (account.user && account.error) return <div className="account-screen"><section className="auth-card"><h1>{copy.openFailed}</h1><p role="alert">{copy[accountErrorKey(account.error,'openError')]}</p><button className="button primary" onClick={account.reload}>{copy.retry}</button><button className="guest-button" onClick={account.signOut}>{copy.logout}</button></section></div>;
  if (account.user && !account.profile) return <FirstProfileScreen/>;
  if (!account.user && (!account.guest || pathname==='/login' || pathname==='/auth/callback')) return <AuthScreen/>;
  return <><ActivityTracker key={'activity:'+(account.user?.id || 'guest')+course}/><Header/><Sidebar/><main className="app-main"><div className="page-container"><CourseBoundary>{children}</CourseBoundary></div></main>{tutorMounted&&<TutorDrawer key={'tutor:'+(account.user?.id || 'guest')+course}/>}</>;
}
