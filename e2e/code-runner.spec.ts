import { expect, test } from '@playwright/test';

test('isolated function checks accept equivalent code and terminate infinite loops', async ({ page }) => {
  await page.goto('/practice?course=react&month=1');
  await page.getByRole('tab', { name: 'Функции: тесты' }).click();
  await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 30000 });
  const setCode = (code: string) => page.evaluate(value => {
    const monaco = (window as unknown as { monaco: { editor: { getModels: () => { uri: { path: string }; setValue: (value: string) => void }[] } } }).monaco;
    monaco.editor.getModels().find(model => model.uri.path.includes('function-delete'))!.setValue(value);
  }, code);

  // Different parameter names, algorithm and object-property order remain valid.
  await setCode('export function removeTodo(records, target) { const kept=[]; for (const record of records) { if(record.id!==target) kept.push({text:record.text,id:record.id}); } return kept; }');
  await page.locator('.editor-footer button').click();
  await expect(page.locator('.test-results .success-text')).toHaveCount(3, { timeout: 15000 });
  await expect(page.locator('.test-results .warning-text')).toHaveCount(0);

  // Worker code has no platform DOM access.
  await setCode('export function removeTodo(records, target) { return document.cookie; }');
  await page.locator('.editor-footer button').click();
  await expect(page.locator('.test-results')).toContainText('document is not defined');
  await expect(page.locator('.test-results .success-text')).toHaveCount(0);

  // The worker cannot make even same-origin requests with the platform's session.
  let networkRequests = 0;
  await page.route('**/security-runner-probe', async route => {
    networkRequests += 1;
    await route.fulfill({ status: 200, body: '{}' });
  });
  const probe = new URL('/security-runner-probe', page.url()).href;
  await setCode(`export async function removeTodo(records, target) {
    try {
      await fetch(${JSON.stringify(probe)});
      throw new Error('Network access must be denied');
    } catch (error) {
      if (error.name !== 'TypeError') throw error;
    }
    return records.filter(record => record.id !== target);
  }`);
  await page.locator('.editor-footer button').click();
  await expect(page.locator('.test-results .success-text')).toHaveCount(3, { timeout: 15000 });
  expect(networkRequests).toBe(0);

  await setCode('export function removeTodo(records, target) { while(true) {} }');
  await page.locator('.editor-footer button').click();
  await expect(page.locator('.error-message')).toContainText('Timeout', { timeout: 10000 });
  // The application main thread remains responsive after terminating the worker.
  await page.getByRole('button', { name: /^Задание [−+]$/ }).click();
  await expect(page.locator('.task-spec')).toHaveCount(0);
  expect(await page.evaluate(() => 1 + 1)).toBe(2);
});
