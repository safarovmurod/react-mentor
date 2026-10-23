import { authenticatedUser } from '@/lib/account/require-user';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { serverMembership } from '@/lib/billing/entitlements';
import { courseAccessTier, hasCourseAccess } from './access';

type CourseAuthorization = { allowed: true } | { allowed: false; response: Response };
function deny(error: string, status: number, requiredTier?: 'pro' | 'expert'): CourseAuthorization {
  return { allowed: false, response: Response.json({ error, ...(requiredTier ? { requiredTier } : {}) }, {
    status, headers: { 'Cache-Control': 'private, no-store' },
  }) };
}

/** A server-only guard. It returns no lesson text, grading answers or solution data on denial. */
export async function authorizeCourseContent(request: Request, courseId: string): Promise<CourseAuthorization> {
  if (typeof window !== 'undefined') throw new Error('Course authorization is server-only');
  const requiredTier = courseAccessTier(courseId);
  if (!requiredTier) return deny('course_not_found', 404);
  if (requiredTier === 'starter') return { allowed: true };
  // Cookie/localStorage membership hints are intentionally ignored.
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim()) return deny('authentication_required', 401);
  try {
    const user = await authenticatedUser(request);
    if (!user) return deny('authentication_required', 401);
    const client = getSupabaseServerClient(authorization);
    if (!client) return deny('service_unavailable', 503);
    const membership = await serverMembership(client, user.id);
    if (!membership.available) return deny('service_unavailable', 503);
    if (!hasCourseAccess(membership.tier, requiredTier)) return deny('membership_required', 403, requiredTier);
    return { allowed: true };
  } catch {
    return deny('service_unavailable', 503);
  }
}
