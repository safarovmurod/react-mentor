// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { loadCourseContent } from '@/lib/courses/content';
import { courseDayProgress, courseMonthPlan } from '@/lib/courses/plan';

describe('guided 30-day HTML + CSS course', () => {
  it('contains exactly Day 0 through Day 29, each with a real lesson, example, question and practice', async () => {
    const content = await loadCourseContent('html');
    const plan = courseMonthPlan(content.lessons);
    expect(plan.map(item => item.day)).toEqual(Array.from({ length: 30 }, (_, day) => day));
    expect(new Set(plan.map(item => item.lesson.id)).size).toBe(30);
    for (const item of plan) {
      expect(item.lesson.title.ru.length).toBeGreaterThan(8);
      expect(item.lesson.summary.ru.length).toBeGreaterThan(70);
      expect(item.lesson.sections.some(section => section.code?.trim())).toBe(true);
      expect(item.lesson.questions.length).toBeGreaterThan(0);
      expect(item.lesson.practice?.task.ru).toContain('Шаг 1');
      expect(item.lesson.practice?.task.ru).toContain('Шаг 4');
      expect(item.lesson.prerequisiteDays?.every(day => day < item.day)).toBe(true);
    }
    expect(plan[0].lesson.id).toBe('html-day-01');
    expect(plan[29].lesson.id).toBe('html-day-30');
    expect(plan[0].lesson.sections.map(section => section.code || '').join('\n')).toContain('styles.css');
  });

  it('Day 0 becomes current and only advances when both reading and practice are complete', async () => {
    const { lessons } = await loadCourseContent('html');
    const plan = courseMonthPlan(lessons);
    const id = plan[0].lesson.id;
    expect(courseDayProgress(plan, [], []).current?.day).toBe(0);
    expect(courseDayProgress(plan, [id], []).current?.day).toBe(0);
    expect(courseDayProgress(plan, [id], [id]).current?.day).toBe(1);
  });

  it('keeps the other published courses independent with practice on their planned days', async () => {
    for (const id of ['javascript-1', 'javascript-2', 'git', 'cpp'] as const) {
      const { lessons } = await loadCourseContent(id);
      const plan = courseMonthPlan(lessons);
      expect(plan).toHaveLength(30);
      expect(new Set(plan.map(item => item.lesson.id)).size).toBe(30);
      expect(plan.every(item => !!item.lesson.practice && item.lesson.questions.length > 0)).toBe(true);
    }
  });
});
