import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkPracticeCode } from '@/lib/grading/code-checker';
import { PRACTICE_TASKS } from '@/content/practice-tasks';
import { runFunction } from '@/lib/grading/function-runner';

vi.mock('@/lib/grading/function-runner', () => ({ runFunction: vi.fn() }));
const execute = vi.mocked(runFunction);
const task = PRACTICE_TASKS.find(item => item.id === 'task_delete_react_local_lvl1')!;

beforeEach(() => { execute.mockReset(); });
describe('legacy task adapter uses isolated execution', () => {
  it('passes real task inputs to the isolated runner and accepts renamed solution functions', async () => {
    execute.mockImplementation(async (_code, _name, tests) => tests.map(test => ({ name: test.name, passed: true })));
    const code = 'export const remove = (records: {id:number}[], target:number) => records.filter(record => record.id !== target)';
    const result = await checkPracticeCode({ task, userCode: code });
    expect(result.verdict).toBe('correct');
    expect(execute).toHaveBeenCalledWith(code, 'remove', expect.arrayContaining([expect.objectContaining({ args: [task.testCases[0].input.items, 2], expected: task.testCases[0].expected })]));
  });
  it('reports syntax line and never dispatches malformed code', async () => {
    const result = await checkPracticeCode({ task, userCode: 'export function broken(items) {\nreturn items.filter(item => true;\n}' });
    expect(result.syntaxValid).toBe(false);
    expect(result.exactLine).toBe(2);
    expect(execute).not.toHaveBeenCalled();
  });
  it('does not turn a failed behavioral check into a passing grade', async () => {
    execute.mockResolvedValue(task.testCases.map(test => ({ name: test.description, passed: false, actual: [], expected: test.expected })));
    const result = await checkPracticeCode({ task, userCode: 'export function deleteTodo(items, id) { return [] }' });
    expect(result.behaviorPassed).toBe(false);
    expect(result.verdict).toBe('incorrect');
  });
  it('never evaluates side effects in the checker process', async () => {
    execute.mockRejectedValue(new Error('Browser isolation unavailable'));
    const result = await checkPracticeCode({ task, userCode: 'globalThis.__learnerSideEffect = true; export function deleteTodo() {}' });
    expect((globalThis as Record<string, unknown>).__learnerSideEffect).toBeUndefined();
    expect(result.verdict).toBe('incorrect');
  });
  it('does not fabricate success for unsupported tasks', async () => {
    const unsupported = PRACTICE_TASKS.find(item => item.id === 'task_delete_zustand_lvl1')!;
    const result = await checkPracticeCode({ task: unsupported, userCode: unsupported.solutionCode });
    expect(result.verdict).toBe('incorrect');
    expect(result.exactError).toMatch(/not supported/);
    expect(execute).not.toHaveBeenCalled();
  });
  it('handles empty code and empty test suites without passing', async () => {
    expect((await checkPracticeCode({ task, userCode: '' })).score).toBe(0);
    expect((await checkPracticeCode({ task: { ...task, testCases: [] }, userCode: task.solutionCode })).behaviorPassed).toBe(false);
    expect(execute).not.toHaveBeenCalled();
  });
});
