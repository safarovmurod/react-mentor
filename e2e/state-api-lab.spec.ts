import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('react-mentor-learning-v2')) localStorage.setItem('react-mentor-learning-v2', JSON.stringify({ version: 2, state: { selectedCourse: 'react', courseChosen: true } }));
  });
});

const NAV = [
  ['/home', 'Мой день'],
  ['/plan', 'Учебный план'],
  ['/practice', 'Практика'],
  ['/tests', 'Тесты'],
  ['/interview', 'Интервью'],
  ['/revision', 'Повторение'],
  ['/weak-topics', 'Сложные темы'],
  ['/notes', 'Заметки'],
  ['/answers', 'Ответы'],
  ['/state-api-lab', 'State & API Lab'],
  ['/courses', 'Выбрать курс'],
  ['/settings', 'Настройки'],
] as const;

test('active navigation подсвечивает текущую страницу на каждом пункте sidebar', async ({ page }) => {
  test.setTimeout(90_000);
  for (const [route, name] of NAV) {
    await page.goto(route);
    await expect(page.locator('.sidebar')).toBeVisible();
    const link = page.locator(`.sidebar a[href="${route}"]`).first();
    await expect(link, `пункт ${name} (${route}) должен быть активным`).toHaveClass(/active/, { timeout: 5000 });
    await expect(link).toHaveAttribute('aria-current', 'page');
    // у остальных пунктов active быть не должно
    const activeCount = await page.locator('.sidebar .nav-item.active').count();
    expect(activeCount, `на ${route} активным должен быть только один пункт`).toBeLessThanOrEqual(2);
  }
});

test('sidebar показывает State & API Lab для React, страница открывается по прямой ссылке и после F5', async ({ page }) => {
  await page.goto('/home');
  await expect(page.locator('.sidebar a[href="/state-api-lab"]')).toBeVisible();
  await page.goto('/state-api-lab');
  await expect(page.getByRole('heading', { name: 'State & API Lab', level: 1 })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'State & API Lab', level: 1 })).toBeVisible();
});

test('Local → POST, затем Global → Redux и Zustand: операция POST сохраняется', async ({ page }) => {
  await page.goto('/state-api-lab');
  await page.getByRole('tab', { name: 'POST', exact: true }).click();
  await expect(page.locator('.lab-lesson-head h2')).toContainText('POST · addData');
  await page.getByRole('tab', { name: 'Global' }).click();
  await page.getByRole('tab', { name: 'Redux' }).click();
  await expect(page.locator('.lab-lesson-head h2')).toContainText('POST · AddData');
  await page.getByRole('tab', { name: 'Zustand' }).click();
  await expect(page.locator('.lab-lesson-head h2')).toContainText('POST · addData');
  await expect(page.locator('.lab-lesson-head .badge')).toHaveText('Zustand');
});

test('Практика ON скрывает решение и показывает шаги, OFF возвращает полный код', async ({ page }) => {
  await page.goto('/state-api-lab');
  await page.getByRole('tab', { name: 'POST', exact: true }).click();
  const heading = page.locator('.lab-code-heading h3');
  const firstCode = page.locator('.lab-code-pre').first();
  await expect(heading).toHaveText('Полный код');
  await expect(firstCode).toContainText('try');
  await page.getByRole('checkbox', { name: 'Практика' }).check();
  await expect(heading).toHaveText('Практика — напиши сам');
  await expect(firstCode).toContainText('Шаг 1');
  await expect(firstCode).not.toContainText('try');
  await page.getByRole('checkbox', { name: 'Практика' }).uncheck();
  await expect(heading).toHaveText('Полный код');
  await expect(firstCode).toContainText('try');
});

test('для курса C++ пункт State & API Lab скрыт', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('react-mentor-learning-v2', JSON.stringify({ version: 2, state: { selectedCourse: 'cpp', courseChosen: true } }));
  });
  await page.goto('/home');
  await expect(page.locator('.sidebar a[href="/state-api-lab"]')).toHaveCount(0);
});

test('mobile: drawer показывает активный пункт, body без горизонтального скролла на 320/360', async ({ page }) => {
  for (const width of [320, 360]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto('/state-api-lab');
    await expect(page.getByRole('heading', { name: 'State & API Lab', level: 1 })).toBeVisible();
    const noScroll = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, iw: window.innerWidth,
    }));
    expect(noScroll.sw, `на ${width}px не должно быть горизонтального скролла`).toBeLessThanOrEqual(noScroll.iw);
    // drawer: активный пункт State & API Lab
    await page.getByRole('button', { name: 'Открыть меню' }).click();
    const drawer = page.getByRole('dialog', { name: 'Навигация по курсу' });
    await expect(drawer).toBeVisible();
    const labLink = drawer.locator('a[href="/state-api-lab"]');
    await expect(labLink).toHaveClass(/active/);
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  }
});
