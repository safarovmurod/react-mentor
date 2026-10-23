import { authorizePractice, practiceFailure, practiceResponse, readVerifiedPractice } from '@/lib/practice/server';

export async function GET(request: Request) {
  const access = await authorizePractice(request);
  if ('failure' in access) return access.failure;
  const progress = await readVerifiedPractice(access.client, access.userId);
  if (!progress) return practiceFailure('Verified progress is unavailable. Check the practice database migration.', 503);
  return practiceResponse(progress);
}
