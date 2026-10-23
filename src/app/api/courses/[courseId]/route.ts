import { isCourseId } from '@/lib/courses/ids';
import { loadCourseContent } from '@/lib/courses/content';
import { courseAccessTier } from '@/lib/courses/access';
import { authorizeCourseContent } from '@/lib/courses/access-server';

export async function GET(request: Request, {params}: {params: Promise<{courseId:string}>}) {
  const {courseId} = await params;
  if (!isCourseId(courseId) || courseId === 'react') return Response.json({error:'Course not found'}, {status:404});
  const access = await authorizeCourseContent(request, courseId);
  if (!access.allowed) return access.response;
  // Only load premium source after authorization. Paid responses must never enter shared caches.
  return Response.json(await loadCourseContent(courseId), { headers: {
    'Cache-Control': courseAccessTier(courseId) === 'starter' ? 'public, max-age=60' : 'private, no-store',
  } });
}
