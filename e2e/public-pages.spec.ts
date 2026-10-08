import { expect, test } from '@playwright/test';

test('public landing and policy pages open without login on desktop and small phones', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: /React ва JavaScript-ро/ })).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await expect(page.locator('.public-feature-grid article')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Оғози омӯзиш/ })).toHaveAttribute('href', '/login');

  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 740 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('heading', { name: /React ва JavaScript-ро/ })).toBeInViewport();
  }

  await page.locator('.public-footer').getByRole('link', { name: 'Махфият' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { name: 'Махфият' })).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await page.getByRole('link', { name: /React Mentor/ }).click();

  await page.locator('.public-footer').getByRole('link', { name: 'Қоидаҳо' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole('heading', { name: 'Қоидаҳои истифода' })).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCount(0);
});
