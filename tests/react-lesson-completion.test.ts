// @vitest-environment node
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { LEARNING_TOPICS } from '@/content/course';
import { exercisesForTopic } from '@/content/practice';
import { reactMonthDays } from '@/lib/react-plan';
import { tr } from '@/lib/translate';

const repaired = [5, 9, 15, 19, 20, 21, 23, 25, 27, 28, 29, 30, 31, 33, 37, 39, 45, 46, 49];

describe('completed React teaching material', () => {
  it('all scheduled topics in both months have explanations, questions, example code and code-backed exercises', () => {
    for (const month of [1, 2]) {
      for (const day of reactMonthDays(month)) {
        for (const topic of day.topics) {
          expect(topic.explanation.some(section => section.text.trim()), topic.id).toBe(true);
          expect(topic.questions.length, topic.id).toBeGreaterThan(0);
          expect(topic.questions.every(question => question.question.trim() && question.answer.trim()), topic.id).toBe(true);
          expect(topic.flow.length, topic.id).toBeGreaterThan(0);
          expect(topic.code.join('\n').trim(), topic.id).not.toBe('');
          for (const locale of ['ru', 'tg', 'en'] as const) {
            for (const exercise of exercisesForTopic(topic, locale)) {
              expect(exercise.task.trim(), exercise.id).not.toBe('');
              expect(exercise.criteria.every(criterion => criterion.trim()), exercise.id).toBe(true);
              // A Q&A fallback is not an implementation example.
              if (topic.id !== 'local-practice') expect(exercise.solution, exercise.id).toBe(topic.code.join('\n\n'));
            }
          }
        }
      }
    }
  });

  it('the nineteen previously empty examples parse as real TSX modules', () => {
    for (const number of repaired) {
      const topic = LEARNING_TOPICS.find(item => item.id === `topic-${number}`)!;
      const result = ts.transpileModule(topic.code.join('\n\n'), {
        fileName: `topic-${number}.tsx`, reportDiagnostics: true,
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, isolatedModules: true },
      });
      const errors = (result.diagnostics ?? []).filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error);
      expect(errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n')), topic.id).toEqual([]);
      expect(result.outputText).toContain('export default');
    }
  });

  it('new explanations and flow steps have actual Russian and English translations rather than dictionary fallback', () => {
    for (const number of repaired) {
      const topic = LEARNING_TOPICS.find(item => item.id === `topic-${number}`)!;
      expect(topic.explanation).toHaveLength(2);
      for (const text of [...topic.explanation.flatMap(section => [section.title, section.text]), ...topic.flow]) {
        for (const locale of ['ru', 'en'] as const) {
          expect(tr(text, locale).trim(), `${topic.id} ${locale}`).not.toBe('');
          expect(tr(text, locale), `${topic.id} ${locale}`).not.toBe(text);
        }
      }
    }
  });

  it('the dynamic route example validates decimal IDs rather than a literal backslash', () => {
    const topic = LEARNING_TOPICS.find(item => item.id === 'topic-33')!;
    const pattern = topic.code[0].match(/!\/(.+?)\/\.test\(id\)/)![1];
    const validId = new RegExp(pattern);
    expect(validId.test('1')).toBe(true);
    expect(validId.test('42')).toBe(true);
    for (const value of ['0', '-1', 'abc', '1.5', '1\\d']) expect(validId.test(value), value).toBe(false);
  });
});
