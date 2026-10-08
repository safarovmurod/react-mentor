import { notFound } from 'next/navigation';
import { isCourseId } from '@/lib/courses/ids';
import { CourseWorkspace } from '@/components/courses/course-workspace';
import { loadCourseContent } from '@/lib/courses/content';
import { redirect } from 'next/navigation';

export default async function CoursePage({params,searchParams}:{params:Promise<{courseId:string;section:string}>;searchParams:Promise<{day?:string}>}) {
  const {courseId,section}=await params;
  if (!isCourseId(courseId) || courseId==='react' || !['home','plan','answers','practice','tests','interview','revision','weak-topics'].includes(section)) notFound();
  const query=await searchParams;
  const day=query.day!==undefined?Number(query.day):undefined;
  if(day!==undefined&&(!Number.isInteger(day)||day<0||day>30)) notFound();
  if(['revision','weak-topics'].includes(section)) redirect(`/courses/${courseId}/plan`);
  if(section==='interview') redirect(`/courses/${courseId}/tests${day!==undefined?'?day='+day:''}`);
  return <CourseWorkspace key={courseId+section+day} courseId={courseId} section={section} day={day} initialContent={await loadCourseContent(courseId)}/>;
}
