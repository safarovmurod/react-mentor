'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLearningStore } from '@/stores/learning-store';
import { CourseCatalog } from './course-catalog';
import { CourseWorkspace } from './course-workspace';
import { useAccount } from '@/components/account/account-provider';

const sections:Record<string,string> = {'/home':'home','/plan':'plan','/study':'answers','/practice':'practice','/tests':'tests','/interview':'interview','/revision':'revision','/weak-topics':'weak-topics','/answers':'answers'};
export function CourseBoundary({children}:{children:React.ReactNode}) {
  const pathname=usePathname();
  const router=useRouter();
  // Legacy React month 3 URLs can be intercepted by this course-aware shell.
  // Redirect them here as well as in their server pages, preserving the selected day.
  useEffect(()=>{
    if(pathname!=='/home'&&pathname!=='/practice')return;
    const params=new URLSearchParams(window.location.search);
    if(params.get('month')!=='3')return;
    const value=params.get('day');
    const day=value!==null&&/^\d+$/.test(value)&&Number(value)<=30?`?day=${Number(value)}`:'';
    router.replace(`/courses/nextjs/${pathname==='/home'?'home':'practice'}${day}`);
  },[pathname,router]);
  const account=useAccount();
  const course=useLearningStore(state=>state.selectedCourse);
  const chosen=useLearningStore(state=>state.courseChosen);
  const previousWork=useLearningStore(state=>state.studied.length+state.completedTopics.length+state.completedPractice.length+state.notes.length+Object.keys(state.answers).length+Object.keys(state.drafts).length);
  if (!chosen && !previousWork && !pathname.startsWith('/courses') && (pathname==='/home' || account.user)) return <CourseCatalog/>;
  if (course!=='react' && sections[pathname]) return <CourseWorkspace key={course+pathname} courseId={course} section={sections[pathname]}/>;
  return children;
}
