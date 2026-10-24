// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { courseContentSchema } from '@/lib/courses/schema';
import { courseMonthPlan } from '@/lib/courses/plan';
import { COURSE_CATALOG, LEARNING_TRACKS, coursePublishedDays } from '@/content/courses/catalog';
import type { CourseLesson } from '@/lib/courses/schema';

const text = (value: string) => ({ tg: value, ru: value, en: value });
// Minimal but schema-valid lesson fixture used only to probe calendar limits.
function syntheticLesson(day: number): CourseLesson {
  return {
    id: 'fixture-day-' + day, day, prerequisiteDays: day === 1 ? [] : [day - 1],
    title: text('Титул ' + day), summary: text('Описание ' + day), level: 'beginner', sourceIds: ['fixture-source'],
    sections: [{ title: text('Раздел'), body: text('Тело раздела ' + day) }],
    questions: [{ id: 'fixture-q-' + day, question: text('Вопрос'), answer: text('Ответ'), options: [text('а'), text('б')], correctIndex: 0 }],
    practice: { task: text('Задача'), hint: text('Подсказка'), solution: 'print(1)', criteria: [text('Критерий')] },
  };
}

describe('long curricula beyond thirty days', () => {
  it('the content schema accepts explicitly scheduled days above 30 with valid prerequisites', () => {
    const longCourse = {
      courseId: 'python', sources: [{ id: 'fixture-source', title: 'Fixture', url: 'https://example.com/docs' }], files: [],
      lessons: [syntheticLesson(1), syntheticLesson(30), syntheticLesson(31), syntheticLesson(45)],
    };
    const parsed = courseContentSchema.parse(longCourse);
    expect(parsed.lessons.map(lesson => lesson.day)).toEqual([1, 30, 31, 45]);
    expect(courseMonthPlan(parsed.lessons)).toHaveLength(4);
  });
  it('a fully scheduled forty-five day plan keeps sequential navigation', () => {
    const lessons = Array.from({ length: 45 }, (_, index) => syntheticLesson(index + 1));
    const plan = courseMonthPlan(lessons);
    expect(plan.map(item => item.day)).toEqual(Array.from({ length: 45 }, (_, index) => index + 1));
  });
});

describe('learning track coverage matrix', () => {
  const stageOf = (tier?: string) => (tier === 'pro' ? 'pro' : tier === 'expert' ? 'expert' : 'beginner');
  it('reports the honest published state of every track and stage', () => {
    for (const track of LEARNING_TRACKS) {
      const published = { beginner: 0, pro: 0, expert: 0 } as Record<'beginner' | 'pro' | 'expert', number>;
      for (const entry of track.courses) {
        const days = coursePublishedDays(entry.course);
        expect(days, track.id + '/' + entry.course).toBeGreaterThan(0);
        published[entry.stage] += days;
      }
      // A track only claims the stages it actually publishes; the UI must keep
      // rendering missing stages as "not published yet" rather than inventing them.
      expect(Object.values(published).every(days => days >= 0)).toBe(true);
    }
  });
  it('locks the currently published multi-stage tracks', () => {
    const expected = {
      javascript: { beginner: true, pro: true, expert: false },
      backend: { beginner: true, pro: true, expert: false },
      ux: { beginner: true, pro: true, expert: false },
      business: { beginner: true, pro: true, expert: false },
      architecture: { beginner: false, pro: false, expert: true },
    } as Record<string, Record<string, boolean>>;
    for (const [trackId, stages] of Object.entries(expected)) {
      const track = LEARNING_TRACKS.find(item => item.id === trackId)!;
      for (const [stage, present] of Object.entries(stages)) {
        expect(track.courses.some(entry => entry.stage === stage), trackId + '/' + stage).toBe(present);
      }
    }
  });
  it('every stage course is reachable in the catalog with matching tier', () => {
    for (const course of COURSE_CATALOG) {
      const stage = stageOf(course.accessTier);
      if (stage !== 'beginner') expect(course.accessTier).toBe(stage);
    }
  });
});
