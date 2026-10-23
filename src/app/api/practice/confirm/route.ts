import { z } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { authorizePractice, practiceFailure, practiceResponse, readVerifiedPractice } from '@/lib/practice/server';

const inputSchema = z.object({ courseId: z.literal('html'), day: z.literal(1) }).strict();

export async function POST(request: Request) {
  const access = await authorizePractice(request);
  if ('failure' in access) return access.failure;
  let input: unknown;
  try { input = await readBoundedJson(request, 1024); }
  catch (error) { return practiceFailure('Invalid or oversized JSON.', error instanceof RequestBodyError ? error.status : 400); }
  if (!inputSchema.safeParse(input).success) return practiceFailure('Only HTML day 1 confirmation is supported.', 400);
  const { error } = await access.client.rpc('react_mentor_confirm_verified_html_day', { learner_id: access.userId });
  if (error?.code === 'PT409') return practiceFailure('Pass the server-verified HTML day 1 exercise before confirming the day.', 409);
  if (error) return practiceFailure('Could not confirm the day. Check the practice database migration.', 503);
  const progress = await readVerifiedPractice(access.client, access.userId);
  if (!progress) return practiceFailure('Verified progress is unavailable.', 503);
  return practiceResponse(progress);
}
