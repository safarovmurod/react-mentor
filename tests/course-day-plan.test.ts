// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { courseDayProgress, courseMonthPlan } from '@/lib/courses/plan';
import type { CourseLesson } from '@/lib/courses/schema';

const text = (value: string) => ({ tg: value, ru: value });
function lesson(id: string, level: 'beginner' | 'intermediate' = 'beginner'): CourseLesson {
  return {
    id, title: text('Урок ' + id), summary: text('Суммария ' + id), level, sourceIds: ['s'],
    sections: [{ title: text('Шаги'), body: text('Тело урока ' + id) }],
    questions: [{ id: 'q-' + id, question: text('Вопрос ' + id), answer: text('Ответ ' + id), options: [text('а'), text('б')], correctIndex: 0 }],
    practice: { task: text('Задача ' + id), hint: text('Подсказка ' + id), solution: '// решение', criteria: [text('Критерий')] },
  };
}
const lessons = [lesson('a'), lesson('b', 'intermediate')];

describe('courseMonthPlan', () => {
  it('строит 30 дней из реальных уроков', () => {
    const plan = courseMonthPlan(lessons);
    expect(plan).toHaveLength(30);
    expect(plan[0]).toMatchObject({ day: 1, section: 'answers', lesson: plan[0].lesson });
    expect(plan[0].lesson.id).toBe('a');
    expect(plan[1].lesson.id).toBe('b');
  });
});

describe('courseDayProgress', () => {
  it('первый незавершённый учебный день становится current, завершённые — done', () => {
    const { days, current } = courseDayProgress(courseMonthPlan(lessons), ['a'], []);
    expect(days[0].status).toBe('done');
    expect(days[1]).toMatchObject({ status: 'current', day: 2, section: 'answers' });
    expect(current?.day).toBe(2);
  });

  it('практический день завершается только сданной практикой этого урока', () => {
    const plan = courseMonthPlan(lessons);
    const practiceDayA = plan.find(day => day.section === 'practice' && day.lesson.id === 'a')!;
    const withoutPractice = courseDayProgress(plan, ['a', 'b'], []);
    expect(withoutPractice.current?.day).toBe(practiceDayA.day);
    const withPractice = courseDayProgress(plan, ['a', 'b'], ['a']);
    const practiceDayB = plan.find(day => day.section === 'practice' && day.lesson.id === 'b')!;
    expect(withPractice.current?.day).toBe(practiceDayB.day);
  });

  it('день тестов никогда не блокирует прогресс', () => {
    const plan = courseMonthPlan(lessons);
    const testsDay = plan.find(day => day.section === 'tests')!;
    const { days } = courseDayProgress(plan, [], []);
    expect(days[testsDay.day - 1].status).toBe('done');
  });

  it('когда всё завершено, current отсутствует', () => {
    const plan = courseMonthPlan(lessons);
    const { current, days } = courseDayProgress(plan, ['a', 'b'], ['a', 'b']);
    expect(current).toBeNull();
    expect(days.every(day => day.status === 'done')).toBe(true);
  });

  it('пустой план даёт пустой список', () => {
    const { days, current } = courseDayProgress(courseMonthPlan([]), [], []);
    expect(days).toEqual([]);
    expect(current).toBeNull();
  });
});
