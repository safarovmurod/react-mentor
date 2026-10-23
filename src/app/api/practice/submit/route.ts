import { createHash } from 'node:crypto';
import { z } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { validateFirstHtmlLesson } from '@/lib/practice/html-validator';
import { authorizePractice, practiceFailure, practiceResponse, readVerifiedPractice } from '@/lib/practice/server';
import { VERIFIED_HTML_LESSON, type PracticeSubmissionResult } from '@/lib/practice/types';

const inputSchema = z.object({ courseId: z.literal('html'), lessonId: z.literal(VERIFIED_HTML_LESSON), code: z.string().min(1).max(100_000) }).strict();

export async function POST(request: Request) {
  const access = await authorizePractice(request);
  if ('failure' in access) return access.failure;
  let input: unknown;
  try { input = await readBoundedJson(request, 128_000); }
  catch (error) { return practiceFailure('Invalid or oversized JSON.', error instanceof RequestBodyError ? error.status : 400); }
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return practiceFailure('Only the HTML day 1 exercise is supported by server verification.', 400);
  const checks = validateFirstHtmlLesson(parsed.data.code);
  const passed = checks.every(check => check.passed);
  let awardedXp = 0;
  if (passed) {
    const { data, error } = await access.client.rpc('react_mentor_record_verified_html', {
      learner_id: access.userId,
      solution_hash: createHash('sha256').update(parsed.data.code).digest('hex'),
    });
    if (error || !Array.isArray(data) || !data[0]) return practiceFailure('Could not save the verified result. No completion has been confirmed.', 503);
    awardedXp = data[0].awarded_xp;
  }
  const progress = await readVerifiedPractice(access.client, access.userId);
  if (!progress) return practiceFailure('Verified progress is unavailable.', 503);
  const result: PracticeSubmissionResult = { verified: true, passed, checks, awardedXp, totalXp: progress.xp, completedLessons: progress.completedLessons, confirmedDays: progress.confirmedDays };
  return practiceResponse(result);
}
