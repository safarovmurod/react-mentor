// @vitest-environment node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { courseContentSchema } from '@/lib/courses/schema';
import { courseMonthPlan } from '@/lib/courses/plan';

const introductions = [
  'ux-design', 'digital-marketing', 'data-analytics', 'business-foundations', 'communication',
  'content-creation', 'english-foundations', 'digital-literacy', 'personal-productivity', 'management-foundations',
] as const;
const applied = ['ux-pro', 'business-pro'] as const;
async function content(id: string) {
  const file = await readFile(path.join(process.cwd(), 'src/content/courses', `${id}.json`), 'utf8');
  return courseContentSchema.parse(JSON.parse(file));
}

describe('original general-education modules', () => {
  it('publishes only actual days, each with instruction, questions and a substantive written assignment', async () => {
    const lessonIds = new Set<string>();
    const questionIds = new Set<string>();
    let lessonCount = 0;
    for (const id of [...introductions, ...applied]) {
      const course = await content(id);
      expect(course.courseId).toBe(id);
      const count = applied.some(value => value === id) ? 3 : 2;
      const plan = courseMonthPlan(course.lessons);
      expect(plan.map(item => item.day)).toEqual(Array.from({ length: count }, (_, index) => index + 1));
      expect(course.lessons).toHaveLength(count);
      expect(course.sources.length).toBeGreaterThan(0);
      for (const [index, lesson] of course.lessons.entries()) {
        lessonCount++;
        expect(lessonIds.has(lesson.id)).toBe(false);
        lessonIds.add(lesson.id);
        expect(lesson.id).toBe(`${id}-day-${String(index + 1).padStart(2, '0')}`);
        expect(lesson.prerequisiteDays).toEqual(index === 0 ? [] : [index]);
        expect(lesson.sections.length).toBeGreaterThanOrEqual(2);
        expect(lesson.sections.every(section => section.code === undefined && section.language === undefined)).toBe(true);
        expect(lesson.practice?.kind).toBe('written');
        expect(lesson.practice?.referenceAnswer).toBeDefined();
        expect(lesson.practice!.criteria.length).toBeGreaterThanOrEqual(3);
        for (const locale of ['ru', 'tg', 'en'] as const) {
          expect(lesson.title[locale]!.length).toBeGreaterThan(15);
          expect(lesson.summary[locale]!.length).toBeGreaterThan(80);
          for (const section of lesson.sections) expect(section.body[locale]!.length).toBeGreaterThan(100);
          expect(lesson.practice!.task[locale]).toMatch(/^1\. /);
          expect(lesson.practice!.task[locale]).toContain('\n4. ');
          expect(lesson.practice!.referenceAnswer![locale]!.length).toBeGreaterThan(180);
          expect(lesson.practice!.referenceAnswer![locale]).toBe(lesson.sections[1].body[locale]);
          expect(lesson.practice!.criteria.every(criterion => criterion[locale]!.trim().length > 15)).toBe(true);
        }
        expect(lesson.practice!.solution).toBe(lesson.practice!.referenceAnswer!.ru);
        expect(lesson.questions.length).toBeGreaterThan(0);
        for (const question of lesson.questions) {
          expect(questionIds.has(question.id)).toBe(false);
          questionIds.add(question.id);
          expect(question.id.startsWith(lesson.id + '-')).toBe(true);
          for (const locale of ['ru', 'tg', 'en'] as const) {
            const options = question.options.map(option => option[locale]);
            expect(new Set(options).size).toBe(options.length);
            expect(question.answer[locale]).toBe(options[question.correctIndex]);
          }
        }
      }
    }
    expect(lessonCount).toBe(26);
  });

  it('applied Pro cases are distinct from free introductions and include three intermediate days', async () => {
    for (const [pro, intro] of [['ux-pro', 'ux-design'], ['business-pro', 'business-foundations']] as const) {
      const premium = await content(pro);
      const starter = await content(intro);
      expect(premium.lessons).toHaveLength(3);
      expect(premium.lessons.every(lesson => lesson.level === 'intermediate')).toBe(true);
      const original = new Set(starter.lessons.map(lesson => lesson.practice!.solution));
      for (const lesson of premium.lessons) {
        expect(original.has(lesson.practice!.solution)).toBe(false);
      }
    }
  });

  it('the analytics worked example has correct mean and median and an honest sample limitation', async () => {
    const course = await content('data-analytics');
    const answer = course.lessons[1].practice!.referenceAnswer!.en!;
    const values = answer.match(/minutes: ([\d, ]+)\./)![1].split(',').map(Number).sort((a, b) => a - b);
    const sum = values.reduce((total, value) => total + value, 0);
    expect(sum).toBe(30);
    expect(sum / values.length).toBe(6);
    expect(values[Math.floor(values.length / 2)]).toBe(3);
    expect(answer).toContain('mean 30/5 = 6, median 3');
    expect(answer).toContain('only five observations');
  });

  it('the applied business example includes labor and computes coverage and negative contribution correctly', async () => {
    const course = await content('business-pro');
    const answer = course.lessons[1].practice!.referenceAnswer!.en!;
    const price = Number(answer.match(/price (\d+)/)![1]);
    const [, laborText, materialText, feeText] = answer.match(/labor (\d+), materials (\d+), fee (\d+)/)!;
    const contribution = price - Number(laborText) - Number(materialText) - Number(feeText);
    expect(contribution).toBe(9);
    expect(Math.ceil(90 / contribution)).toBe(10);
    expect(Math.ceil(90 / (price - 11 - Number(materialText) - Number(feeText)))).toBe(15);
    expect(price - 18 - Number(materialText) - Number(feeText)).toBe(-1);
    expect(answer).toContain('contribution is −1');
    expect(answer).toContain('actual demand is unproven');
    const experiment = course.lessons[2].practice!.referenceAnswer!.en!;
    expect(experiment).toContain('3-percentage-point difference');
    expect(experiment).toContain('25% relative increase');
    expect(experiment).toContain('No real experiment was run');
  });

  it('child-safe digital literacy explicitly requires fictional data, no real registration and trusted help', async () => {
    const course = await content('digital-literacy');
    const first = course.lessons[0].practice!.referenceAnswer!.en!;
    expect(first).toContain('Fictional profile');
    expect(first).toContain('Do not create a real account');
    expect(first).toContain('trusted adult');
    expect(course.lessons[0].practice!.task.en).toContain('Enter no real passwords');
    expect(course.lessons[1].practice!.task.en).toContain('Include no actual codes');
  });
});
