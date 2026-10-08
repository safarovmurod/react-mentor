import { z } from 'zod';
import { COURSE_IDS } from './ids';

const text = z.object({ tg: z.string().min(1), ru: z.string().min(1), en: z.string().optional() });
const id = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,119}$/);
const source = z.object({ id, title: z.string().min(1), url: z.string().url().refine(url => new URL(url).protocol === 'https:'), page: z.number().int().positive().optional() });
export const courseContentSchema = z.object({
  courseId: z.enum(COURSE_IDS).exclude(['react']),
  sources: z.array(source),
  files: z.array(z.object({ id, title: z.string().min(1), url: z.string().regex(/^\/course-files\/[a-f0-9]{64}\.[a-z0-9]+$/), bytes: z.number().int().nonnegative(), sha256: z.string().regex(/^[a-f0-9]{64}$/), sourceIds: z.array(id).min(1) })),
  lessons: z.array(z.object({
    id, day: z.number().int().min(1).max(30).optional(), prerequisiteDays: z.array(z.number().int().min(1).max(30)).optional(), title: text, summary: text, level: z.enum(['beginner', 'intermediate']), sourceIds: z.array(id).min(1),
    sections: z.array(z.object({ title: text, body: text, code: z.string().optional(), language: z.string().optional(), output: text.optional() })).min(1),
    questions: z.array(z.object({ id, question: text, answer: text, options: z.array(text).min(2).max(6), correctIndex: z.number().int().nonnegative() })),
    practice: z.object({ task: text, hint: text, solution: z.string(), criteria: z.array(text).min(1) }).optional(),
  })),
}).superRefine((course, ctx) => {
  const sourceIds = new Set(course.sources.map(source => source.id));
  if (sourceIds.size !== course.sources.length) ctx.addIssue({ code: 'custom', message: 'Duplicate source ID' });
  const lessonIds = new Set<string>(), questionIds = new Set<string>(), fileIds = new Set<string>();
  for (const lesson of course.lessons) {
    if (lessonIds.has(lesson.id)) ctx.addIssue({ code: 'custom', message: 'Duplicate lesson ID' });
    lessonIds.add(lesson.id);
    for (const question of lesson.questions) {
      if (questionIds.has(question.id) || question.correctIndex >= question.options.length) ctx.addIssue({ code: 'custom', message: 'Invalid question ID or correct option' });
      questionIds.add(question.id);
    }
  }
  for (const file of course.files) {
    if (fileIds.has(file.id) || !file.url.startsWith('/course-files/' + file.sha256 + '.')) ctx.addIssue({ code: 'custom', message: 'Invalid file ID or digest' });
    fileIds.add(file.id);
  }
  for (const item of [...course.lessons, ...course.files]) for (const sourceId of item.sourceIds) {
    if (!sourceIds.has(sourceId)) ctx.addIssue({ code: 'custom', message: 'Missing source reference: ' + sourceId });
  }
});
export type CourseContent = z.infer<typeof courseContentSchema>;
export type CourseLesson = CourseContent['lessons'][number];
export type CourseText = CourseLesson['title'];
export function courseText(value: CourseText, language: 'tg' | 'ru' | 'en') { return value[language] || value.ru; }
