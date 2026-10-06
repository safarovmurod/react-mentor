import { expect, test, type Page } from '@playwright/test';
import quiz from '../src/content/imported/quiz.json';

const question = quiz.groups[0].items[0];
const consoleErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  // These regression scenarios concern a learner who already chose React.
  await page.addInitScript(()=>{if (!localStorage.getItem('react-mentor-learning-v2')) localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{selectedCourse:'react',courseChosen:true}}));});
  const errors: string[] = [];
  consoleErrors.set(page, errors);
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => { throw error; });
});

test.afterEach(async ({ page }, testInfo) => {
  const errors = consoleErrors.get(page) || [];
  // The error-flow test deliberately serves HTTP 429; Chromium logs that
  // expected network failure independently of the application's error UI.
  const unexpected = errors.filter(message => !(testInfo.title.includes('mocked provider') && /status of 429/.test(message)));
  expect(unexpected).toEqual([]);
  await expect(page.locator('nextjs-portal').getByText(/Runtime Error|Build Error/)).toHaveCount(0);
});

test('homepage renders local fonts without external font requests', async ({ page }, testInfo) => {
  const externalFonts: string[] = [];
  page.on('request', request => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) externalFonts.push(request.url());
  });
  await page.goto('/');
  await expect(page).toHaveURL(/\/home$/);
  await expect(page).toHaveTitle(/ReactMentor/);
  await expect(page.getByRole('heading', { name: 'Время разобраться в React.' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const fontState = await page.evaluate(() => ({
    loadedFamilies: [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family.replaceAll('"', '')),
    family: getComputedStyle(document.body).fontFamily,
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(fontState.loadedFamilies).toContain(fontState.family.split(',')[0].trim().replaceAll('"', ''));
  expect(fontState.family.toLowerCase()).toContain('inter');
  expect(fontState.width).toBeLessThanOrEqual(fontState.viewport);
  expect(externalFonts).toEqual([]);
  await page.screenshot({ path: '/tmp/react-mentor-' + testInfo.project.name + '-home.png' });
});

test('a correct quiz answer awards 10 XP and survives reload without duplicates', async ({ page }) => {
  await page.goto('/tests?topic=topic-1');
  await page.locator('.answer-option').filter({ hasText: question.correctAnswer }).click();
  await page.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(page.locator('.result-label')).toContainText('Верно');
  await page.reload();
  await expect(page.locator('.result-label')).toContainText('Верно');
  await expect(page.locator('.answer-option').first()).toBeDisabled();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);
  expect(stored.awards['test:quiz-q001']).toBe(10);
  expect(Object.keys(stored.answers)).toHaveLength(1);
  await page.goto('/home');
  await expect(page.locator('.stats-grid .stat').last().locator('strong')).toContainText('10');
  await page.reload();
  await expect(page.locator('.stats-grid .stat').last().locator('strong')).toContainText('10');
});

test('an incorrect answer persists with no XP award', async ({ page }) => {
  await page.goto('/tests?topic=topic-1');
  await page.locator('.answer-option').filter({ hasText: question.distractors[0] }).click();
  await page.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(page.locator('.result-label')).toContainText('Нужно повторить');
  await page.reload();
  await expect(page.locator('.result-label')).toContainText('Нужно повторить');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);
  expect(stored.awards['test:quiz-q001']).toBeUndefined();
  expect(Object.values(stored.answers)).toEqual([expect.objectContaining({ correct: false, questionId: 'quiz-q001' })]);
});

test('Tutor opens, replies from actual local course material and closes with Escape', async ({ page }) => {
  await page.goto('/home');
  await page.getByRole('button', { name: 'AI Tutor', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Савол ба Tutor')).toBeFocused();
  await expect(dialog.getByRole('link',{name:'Воридшавӣ / регистрация',exact:true})).toHaveAttribute('href','/login');
  await dialog.getByLabel('Савол ба Tutor').fill('useState чиба даркорай?');
  await dialog.getByRole('button', { name: 'Фиристодан', exact: true }).click();
  await expect(dialog.locator('.tutor-source').first()).toHaveText('Маводи лоиҳа · 0 токен');
  await expect(dialog.locator('.tutor-message.assistant').last()).toContainText('useState');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'AI Tutor', exact: true })).toBeFocused();
});

test('Tutor handles online chat history, token usage and API errors (mocked provider)', async ({ page }, testInfo) => {
  const requests: Record<string, unknown>[] = [];
  await page.route('**/api/tutor', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill(requests.length < 3 ? {
      json: { mode: 'online', reply: requests.length === 1 ? 'useState хотираи компонент аст.' : 'setState → render → UI.', usage: { totalTokens: 321 } },
    } : { status: 429, json: { error: 'Лимит ё токенҳои AnyModel тамом шуданд.' } });
  });
  await page.goto('/home');
  await page.getByRole('button', { name: 'AI Tutor', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Савол ба Tutor').fill('useState чиба даркорай?');
  await dialog.getByRole('button', { name: 'Фиристодан', exact: true }).click();
  await expect(dialog.locator('.tutor-source').last()).toContainText('AI · AnyModel · 321 токен');
  await dialog.getByRole('button', { name: 'Чуқур фаҳмон', exact: true }).click();
  await expect(dialog.locator('.tutor-message.assistant').last()).toContainText('setState → render → UI.');
  expect(requests[1]).toMatchObject({ isDeep: true, history: [
    { role: 'user', content: 'useState чиба даркорай?' },
    { role: 'assistant', content: 'useState хотираи компонент аст.' },
  ] });
  await expect(dialog.locator('.tutor-footnote')).toContainText('642 токен');
  await page.screenshot({ path: '/tmp/react-mentor-' + testInfo.project.name + '-tutor.png' });
  await dialog.getByLabel('Савол ба Tutor').fill('useEffect?');
  await dialog.getByRole('button', { name: 'Фиристодан', exact: true }).click();
  await expect(dialog.locator('.tutor-error')).toContainText('токенҳои AnyModel тамом шуданд');
  await expect(dialog.getByLabel('Савол ба Tutor')).toBeEnabled();
});

test('deep tutor uses the displayed quiz answer and keeps its source through repeated follow-ups', async ({ page }, testInfo) => {
  await page.goto('/tests?topic=topic-1');
  await page.locator('.answer-option').filter({ hasText: question.correctAnswer }).click();
  await page.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(page.locator('.result-label')).toContainText('Верно');
  await page.locator('.answer-content').getByRole('button', { name: 'Чуқур фаҳмон', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Савол ба Tutor')).toHaveValue(question.question);
  for (let index = 0; index < 3; index++) {
    await dialog.getByRole('button', { name: 'Чуқур фаҳмон', exact: true }).click();
    const response = dialog.locator('.tutor-message.assistant').last();
    await expect(response).toContainText(question.correctAnswer);
    await expect(response).toContainText('Ҷараёни кор');
    await expect(response).toContainText('State / Props');
    await expect(response.getByRole('link')).toHaveAttribute('href', '/lesson/topic-1');
    await expect(response.locator('.tutor-source').first()).toHaveText('Маводи лоиҳа · 0 токен');
    await expect(dialog.getByLabel('Савол ба Tutor')).toBeEnabled();
  }
  await page.screenshot({ path: '/tmp/react-mentor-' + testInfo.project.name + '-local-deep.png' });
  await dialog.getByLabel('Савол ба Tutor').fill('Svelte runes чияй?');
  await dialog.getByRole('button', { name: 'Фиристодан', exact: true }).click();
  await expect(dialog.locator('.tutor-message.assistant').last()).toContainText('ёфт нашуд');
  await expect(dialog.locator('.tutor-message.assistant').last().getByRole('link')).toHaveCount(0);
});
