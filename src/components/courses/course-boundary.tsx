'use client';
import { usePathname } from 'next/navigation';
import { useLearningStore } from '@/stores/learning-store';
import { CourseCatalog } from './course-catalog';
import { CourseWorkspace } from './course-workspace';
import { useAccount } from '@/components/account/account-provider';

const sections:Record<string,string> = {'/home':'home','/plan':'plan','/study':'answers','/practice':'practice','/tests':'tests','/interview':'interview','/revision':'revision','/weak-topics':'weak-topics','/answers':'answers'};
export function CourseBoundary({children}:{children:React.ReactNode}) {
  const pathname=usePathname();
  const account=useAccount();
  const course=useLearningStore(state=>state.selectedCourse);
  const chosen=useLearningStore(state=>state.courseChosen);
  const previousWork=useLearningStore(state=>state.studied.length+state.completedTopics.length+state.completedPractice.length+state.notes.length+Object.keys(state.answers).length+Object.keys(state.drafts).length);
  if (!chosen && !previousWork && !pathname.startsWith('/courses') && (pathname==='/home' || account.user)) return <CourseCatalog/>;
  if (course!=='react' && sections[pathname]) return <CourseWorkspace key={course+pathname} courseId={course} section={sections[pathname]}/>;
  return children;
}
