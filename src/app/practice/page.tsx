import { courseAccessTier } from '@/lib/courses/access';
import { PracticeHub } from '@/components/learning/practice-hub';
import { getTopic } from '@/content/course';
import { redirect } from 'next/navigation';
import { PracticeSelector } from '@/components/learning/practice-selector';
import { CourseWorkspace } from '@/components/courses/course-workspace';
import { isCourseId } from '@/lib/courses/ids';
import { loadCourseContent } from '@/lib/courses/content';
import { notFound } from 'next/navigation';
export default async function PracticePage({searchParams}:{searchParams:Promise<{month?:string;topic?:string;day?:string;course?:string}>}) {
 const params=await searchParams;const month=Number(params.month);
 if(params.course&&!isCourseId(params.course))notFound();
 if(params.course&&isCourseId(params.course)&&params.course!=='react'){
  const day=params.day!==undefined?Number(params.day):undefined;
  if(day!==undefined&&(!Number.isInteger(day)||day<1||day>30))notFound();
  return <><PracticeSelector selected={params.course}/><CourseWorkspace key={params.course+day} courseId={params.course} section="practice" day={day} initialContent={courseAccessTier(params.course)==='starter'?await loadCourseContent(params.course):undefined}/></>;
 }
 if(month===3||getTopic(params.topic||'')?.month===3)redirect(`/courses/nextjs/practice${params.day?`?day=${params.day}`:''}`);
 if(!params.course&&!params.month&&!params.topic&&!params.day)return <PracticeSelector/>;
 return <><PracticeSelector selected="react"/><PracticeHub initialMonth={[1,2,3].includes(month)?month:undefined} initialTopic={params.topic} initialDay={Number(params.day)||undefined}/></>;
}
