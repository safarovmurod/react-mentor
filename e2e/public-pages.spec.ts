import { expect, test } from '@playwright/test';

test('public landing and policy pages open without login on desktop and small phones', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: /Изучайте React и JavaScript/ })).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await expect(page.locator('.public-feature-grid article')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Начать обучение/ })).toHaveAttribute('href', '/login');

  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 740 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('heading', { name: /Изучайте React и JavaScript/ })).toBeInViewport();
  }

  await page.locator('.public-footer').getByRole('link', { name: 'Конфиденциальность' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { name: 'Конфиденциальность' })).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await page.getByRole('link', { name: /React Mentor/ }).click();

  await page.locator('.public-footer').getByRole('link', { name: 'Правила' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole('heading', { name: 'Правила использования' })).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCount(0);
});
