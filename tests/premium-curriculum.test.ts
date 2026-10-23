// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { courseContentSchema } from '@/lib/courses/schema';

const ids = ['javascript-pro', 'backend-pro', 'architecture-expert'] as const;
const load = (id: typeof ids[number]) => courseContentSchema.parse(JSON.parse(readFileSync(path.join(process.cwd(), 'src/content/courses', id + '.json'), 'utf8')));
const root = mkdtempSync(path.join(tmpdir(), 'devatlas-reviewed-premium-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));
function runReviewedFixture(source: string) {
  // Repository-authored fixtures only. Never call this with learner submissions.
  writeFileSync(path.join(root, 'lesson.mjs'), source);
  return spawnSync(process.execPath, ['lesson.mjs'], { cwd: root, encoding: 'utf8', timeout: 15000, maxBuffer: 200000 });
}

describe('separate published premium curriculum', () => {
  it.each(ids)('%s publishes exactly three complete ordered lessons', id => {
    const course = load(id);
    expect(course.courseId).toBe(id);
    expect(course.lessons.map(lesson => lesson.day)).toEqual([1, 2, 3]);
    for (const [index, lesson] of course.lessons.entries()) {
      expect(lesson.prerequisiteDays).toEqual(index === 0 ? [] : [index]);
      expect(lesson.practice).toBeTruthy();
      expect(lesson.questions.length).toBeGreaterThan(0);
      expect(lesson.sections.some(section => section.code && section.output?.en)).toBe(true);
      for (const locale of ['ru', 'tg', 'en'] as const) {
        expect(lesson.title[locale]).toBeTruthy();
        expect(lesson.sections[0].body[locale]!.length).toBeGreaterThan(150);
        expect(lesson.practice!.task[locale]!.length).toBeGreaterThan(100);
        expect(lesson.practice!.criteria.every(criterion => Boolean(criterion[locale]))).toBe(true);
        if (id === 'architecture-expert') {
          expect(lesson.practice!.kind).toBe('written');
          expect(lesson.practice!.referenceAnswer?.[locale]!.length).toBeGreaterThan(300);
        } else expect(lesson.practice!.kind).toBe('code');
      }
    }
  });
  it.each(ids)('%s trusted examples execute and produce their stated output', id => {
    for (const lesson of load(id).lessons) {
      const example = lesson.sections.find(section => section.code)!;
      const result = runReviewedFixture(example.code!);
      expect(result.error, result.error?.message).toBeUndefined();
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout.trim()).toBe(example.output!.en);
      if (lesson.practice!.kind === 'code') expect(lesson.practice!.solution).toBe(example.code);
    }
  });

  const defects = [
    { id: 'javascript-pro', day: 1, before: 'previous.completed + Number(task.done)', after: 'previous.completed + 1' },
    { id: 'javascript-pro', day: 2, before: 'if (!response.ok)', after: 'if (false)' },
    { id: 'javascript-pro', day: 3, before: 'return { version: 1, theme: value.theme, fontSize: value.fontSize };', after: 'return value;' },
    { id: 'backend-pro', day: 1, before: 'Object.keys(value).some(key => key !== "title")', after: 'false' },
    { id: 'backend-pro', day: 2, before: '!todo || todo.ownerId !== session.userId', after: '!todo' },
    { id: 'backend-pro', day: 3, before: 'return reply(401,', after: 'return reply(200,' },
    { id: 'architecture-expert', day: 1, before: 'idempotent !== true', after: 'false' },
    { id: 'architecture-expert', day: 2, before: 'entitlement.userId !== principal.userId', after: 'false' },
    { id: 'architecture-expert', day: 3, before: 'evidence.restoreTested !== true', after: 'false' },
  ] as const;
  it.each(defects)('$id day $day checks fail on a real semantic/security defect', defect => {
    const source = load(defect.id).lessons[defect.day - 1].sections.find(section => section.code)!.code!;
    expect(source).toContain(defect.before);
    const result = runReviewedFixture(source.replace(defect.before, defect.after));
    expect(result.error, result.error?.message).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/AssertionError/);
  });
});
