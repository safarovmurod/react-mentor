import ts from 'typescript';
import type { CodeCheckResult, PracticeTask } from '@/types';
import { runFunction } from './function-runner';
import type { FunctionCase } from '@/content/practice';

export interface CheckOptions { task: PracticeTask; userCode: string }

/** Legacy task adapter. Learner code is never evaluated in the application
 * process. Only tasks with a real behavioral harness can receive a passing result.
 */
export async function checkPracticeCode({ task, userCode }: CheckOptions): Promise<CodeCheckResult> {
  const base: CodeCheckResult = { verdict: 'incorrect', score: 0, syntaxValid: false, astChecksPassed: false, runtimePassed: false, behaviorPassed: false, feedbackText: '', testResults: [] };
  if (!userCode.trim()) return { ...base, exactError: 'Код холӣ аст', feedbackText: 'Введите код решения.' };
  if (userCode.length > 50000) return { ...base, exactError: 'Code exceeds 50,000 characters.', feedbackText: 'Уменьшите размер решения.' };
  const transpiled = ts.transpileModule(userCode, { fileName: 'solution.ts', reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const diagnostic = transpiled.diagnostics?.find(item => item.category === ts.DiagnosticCategory.Error);
  if (diagnostic) {
    const exactError = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    const exactLine = diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : undefined;
    return { ...base, exactError, exactLine, feedbackText: exactError, testResults: [{ name: 'Syntax', passed: false, message: exactError }] };
  }
  base.syntaxValid = true;
  const file = ts.createSourceFile('solution.ts', userCode, ts.ScriptTarget.ES2022, true);
  // A single exported/declared function is a contract, not a prescribed spelling.
  const names = file.statements.flatMap(statement => {
    if (ts.isFunctionDeclaration(statement) && statement.name) return [statement.name.text];
    if (ts.isVariableStatement(statement)) return statement.declarationList.declarations.flatMap(declaration => ts.isIdentifier(declaration.name) && declaration.initializer && (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)) ? [declaration.name.text] : []);
    return [];
  });
  const expectedName = task.id === 'task_delete_react_local_lvl1' ? 'deleteTodo' : task.id === 'task_post_react_local_lvl1' ? 'addTodo' : task.id === 'task_search_react_local_lvl1' ? 'filterTodosByQuery' : null;
  if (!expectedName || !task.testCases.length) return { ...base, exactError: 'Automatic execution is not supported for this exercise.', feedbackText: 'Для этого задания нужен отдельный проверяющий стенд. Автоматическая оценка недоступна.' };
  const functionName = names.includes(expectedName) ? expectedName : names.length === 1 ? names[0] : null;
  if (!functionName) return { ...base, exactError: 'Export one solution function.', feedbackText: 'Объявите функцию решения.', testResults: [{ name: 'Function', passed: false }] };
  const tests: FunctionCase[] = task.testCases.map(test => ({ name: test.description, args: task.operation === 'DELETE' ? [test.input.items, test.input.id] : task.operation === 'POST' ? [test.input.items, test.input.text] : [test.input.items, test.input.query], expected: test.expected }));
  try {
    const results = await runFunction(userCode, functionName, tests);
    const passed = results.length === tests.length && results.every(result => result.passed);
    return { ...base, verdict: passed ? 'correct' : 'incorrect', score: results.length === tests.length ? Math.round(results.filter(result => result.passed).length / tests.length * 100) : 0, astChecksPassed: true, runtimePassed: results.every(result => !result.error), behaviorPassed: passed, feedbackText: passed ? 'Все поведенческие проверки пройдены.' : 'Результат не соответствует условию задания.', testResults: results.map(result => ({ name: result.name, passed: result.passed, message: result.error ?? (result.passed ? undefined : 'Ожидается: ' + JSON.stringify(result.expected) + '; получено: ' + JSON.stringify(result.actual)) })) };
  } catch (error) {
    const exactError = error instanceof Error ? error.message : 'Execution unavailable.';
    return { ...base, astChecksPassed: true, exactError, feedbackText: exactError, testResults: [{ name: 'Execution', passed: false, message: exactError }] };
  }
}
