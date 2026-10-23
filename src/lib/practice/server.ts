import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { authenticatedUser } from '@/lib/account/require-user';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { VerifiedPracticeProgress } from './types';

export function practiceFailure(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
}
export function practiceResponse(value: unknown) {
  return NextResponse.json(value, { headers: { 'Cache-Control': 'no-store' } });
}

/** Service role stays on the server; an authenticated learner cannot mint grades. */
export async function authorizePractice(request: Request): Promise<
  { client: SupabaseClient; userId: string } | { failure: NextResponse }
> {
  if (!request.headers.get('authorization')?.startsWith('Bearer ')) return { failure: practiceFailure('Authentication required.', 401) };
  const client = getSupabaseAdminClient();
  if (!client) return { failure: practiceFailure('Server-verified practice is not configured. Local practice is still available.', 503) };
  const user = await authenticatedUser(request);
  if (!user) return { failure: practiceFailure('Session could not be verified.', 401) };
  return { client, userId: user.id };
}

export async function readVerifiedPractice(client: SupabaseClient, userId: string): Promise<VerifiedPracticeProgress | null> {
  const [lessons, days] = await Promise.all([
    client.from('react_mentor_verified_practice').select('lesson_id,xp').eq('user_id', userId),
    client.from('react_mentor_verified_days').select('course_id,day').eq('user_id', userId),
  ]);
  if (lessons.error || days.error) return null;
  return {
    verified: true,
    completedLessons: (lessons.data ?? []).map(row => row.lesson_id),
    confirmedDays: (days.data ?? []).map(row => `${row.course_id}:day-${row.day}`),
    xp: (lessons.data ?? []).reduce((sum, row) => sum + row.xp, 0),
  };
}
