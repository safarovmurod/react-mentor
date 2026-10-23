// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { courseContentSchema } from '@/lib/courses/schema';

const ids = ['java', 'csharp', 'go', 'rust', 'php', 'ruby', 'sql', 'bash', 'nodejs', 'mongodb', 'swift', 'kotlin'] as const;
const load = (id: typeof ids[number]) => courseContentSchema.parse(JSON.parse(readFileSync(path.join(process.cwd(), 'src/content/courses', id + '.json'), 'utf8')));
const root = mkdtempSync(path.join(tmpdir(), 'devatlas-trusted-examples-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));
const probe = (command: string, args: string[], pattern?: RegExp) => {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 5000 });
  return result.status === 0 && (!pattern || pattern.test(result.stdout + result.stderr));
};
const hasJava = probe('java', ['--list-modules'], /jdk\.compiler@/);
const hasGo = probe('go', ['version'], /^go version go/);
const hasPython = probe('python3', ['--version'], /Python 3\./);
const hasBash = probe('bash', ['--version'], /GNU bash/);
const hasNode = probe(process.execPath, ['--version'], /^v\d+/);

// These subprocesses execute only reviewed, repository-owned examples. This is
// not a submission runner and must never receive learner-controlled source.
function runTrusted(command: string, args: string[], input?: string) {
  const result = spawnSync(command, args, { cwd: root, input, encoding: 'utf8', timeout: 20000, maxBuffer: 200000 });
  expect(result.error, result.error?.message).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

describe('original two-day programming introductions', () => {
  it.each(ids)('%s has two ordered, sourced and fully authored RU/TG/EN lessons', id => {
    const course = load(id);
    expect(course.courseId).toBe(id);
    expect(course.lessons.map(lesson => lesson.day)).toEqual([1, 2]);
    expect(course.lessons[0].prerequisiteDays).toEqual([]);
    expect(course.lessons[1].prerequisiteDays).toEqual([1]);
    expect(course.sources[0].url).toMatch(/^https:\/\//);
    for (const lesson of course.lessons) {
      expect(lesson.id).toMatch(new RegExp('^' + id + '-day-0[12]$'));
      expect(lesson.practice?.solution).toBe(lesson.sections[0].code);
      expect(lesson.sections[0].output?.en).toBeTruthy();
      expect(lesson.questions).toHaveLength(1);
      const question = lesson.questions[0];
      expect(question.options[question.correctIndex]).toEqual(question.answer);
      for (const locale of ['ru', 'tg', 'en'] as const) {
        expect(lesson.title[locale]?.length).toBeGreaterThan(8);
        expect(lesson.sections[0].body[locale]?.length).toBeGreaterThan(90);
        expect(lesson.practice?.task[locale]).toContain(lesson.sections[0].output![locale]);
        expect(lesson.practice?.criteria.every(criterion => Boolean(criterion[locale]))).toBe(true);
      }
    }
  });

  it.skipIf(!hasJava)('Java source-file launcher runs both examples with exact expected output', () => {
    for (const lesson of load('java').lessons) {
      writeFileSync(path.join(root, 'Main.java'), lesson.practice!.solution);
      expect(runTrusted('java', ['Main.java'])).toBe(lesson.sections[0].output!.en);
    }
  });
  it.skipIf(!hasNode)('Node examples perform the stated calculation and fail on a broken implementation', () => {
    for (const lesson of load('nodejs').lessons) {
      writeFileSync(path.join(root, 'main.mjs'), lesson.practice!.solution);
      expect(runTrusted(process.execPath, ['main.mjs'])).toBe(lesson.sections[0].output!.en);
    }
    const solution = load('nodejs').lessons[1].practice!.solution;
    writeFileSync(path.join(root, 'main.mjs'), solution.replace('price * quantity', 'price + quantity'));
    const broken = spawnSync(process.execPath, ['main.mjs'], { cwd: root, encoding: 'utf8', timeout: 5000 });
    expect(broken.status).not.toBe(0);
    expect(broken.stderr).toContain('AssertionError');
  });
  it.skipIf(!hasBash)('Bash examples run and their validation rejects nonnumeric input', () => {
    for (const lesson of load('bash').lessons) {
      writeFileSync(path.join(root, 'main.sh'), lesson.practice!.solution);
      expect(runTrusted('bash', ['main.sh'])).toBe(lesson.sections[0].output!.en);
    }
    const solution = load('bash').lessons[1].practice!.solution;
    writeFileSync(path.join(root, 'main.sh'), solution + '\ntotal 07 02\nif total 12 abc; then exit 99; fi\n');
    expect(runTrusted('bash', ['main.sh'])).toBe('36\n0\nInvalid input rejected\n14');
  });
  it.skipIf(!hasPython)('SQL examples run in actual in-memory SQLite and preserve guarded stock', () => {
    const sqlite = 'import sqlite3, sys\nc=sqlite3.connect(":memory:")\nbuffer=""\nfor line in sys.stdin:\n buffer+=line\n if sqlite3.complete_statement(buffer):\n  cursor=c.execute(buffer)\n  if cursor.description:\n   for row in cursor.fetchall(): print("|".join(str(value) for value in row))\n  buffer=""\n';
    for (const lesson of load('sql').lessons) expect(runTrusted('python3', ['-c', sqlite], lesson.practice!.solution)).toBe(lesson.sections[0].output!.en);
  });
  it.skipIf(!hasGo)('Go examples compile with the actual Go programming-language toolchain', () => {
    for (const lesson of load('go').lessons) {
      writeFileSync(path.join(root, 'main.go'), lesson.practice!.solution);
      expect(runTrusted('go', ['run', 'main.go'])).toBe(lesson.sections[0].output!.en);
    }
  });
  // SDKs/database are not installed/configured in this cloud instance. Keep
  // unexecuted examples visible as skipped, not silently counted as passing.
  it.skip.each(['csharp', 'rust', 'php', 'ruby', 'mongodb', 'swift', 'kotlin'])('%s compiler/interpreter/database examples await an available local runtime', () => {});
});
