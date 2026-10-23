import { COURSE_CATALOG } from '@/content/courses/catalog';
import type { MembershipTier } from '@/lib/billing/entitlements';

export type CourseAccessTier = MembershipTier;
const rank: Record<CourseAccessTier, number> = { starter: 0, pro: 1, expert: 2 };

/** Unknown catalog IDs never implicitly become free courses. */
export function courseAccessTier(courseId: string): CourseAccessTier | null {
  const course = COURSE_CATALOG.find(entry => entry.id === courseId);
  return course ? course.accessTier ?? 'starter' : null;
}

/** Course access comes from trusted membership, never selected UI plan or account metadata. */
export function hasCourseAccess(memberTier: CourseAccessTier, requiredTier: CourseAccessTier): boolean {
  return rank[memberTier] >= rank[requiredTier];
}
