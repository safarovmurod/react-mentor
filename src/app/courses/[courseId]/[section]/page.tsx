import { notFound } from 'next/navigation';
import { isCourseId } from '@/lib/courses/ids';
import { CourseWorkspace } from '@/components/courses/course-workspace';

export default async function CoursePage({params}:{params:Promise<{courseId:string;section:string}>}) {
  const {courseId,section}=await params;
  if (!isCourseId(courseId) || courseId==='react' || !['home','plan','answers','practice','tests','interview','revision','weak-topics'].includes(section)) notFound();
  return <CourseWorkspace key={courseId+section} courseId={courseId} section={section}/>;
}
