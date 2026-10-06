import { isCourseId } from '@/lib/courses/ids';
import { loadCourseContent } from '@/lib/courses/content';

export async function GET(_request: Request, {params}: {params: Promise<{courseId:string}>}) {
  const {courseId} = await params;
  if (!isCourseId(courseId) || courseId === 'react') return Response.json({error:'Course not found'}, {status:404});
  return Response.json(await loadCourseContent(courseId), {headers:{'Cache-Control':'public, max-age=60'}});
}
