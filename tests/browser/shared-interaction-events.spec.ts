// Supplemental browser witness: installed workspace public Radio consumes canonical Composite stopEvent (MIT).
import { expect, test } from '@playwright/test';
test('native public Radio loads and navigates with no Node process global', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/radio');
  await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  expect(await page.evaluate(() => 'process' in globalThis)).toBe(false);
  await page.getByTestId('radio-b').focus();
  await page.getByTestId('radio-b').press('ArrowRight');
  await expect(page.getByTestId('radio-c')).toBeFocused();
  await expect(page.getByTestId('radio-c')).toHaveAttribute('aria-checked', 'true');
  expect(errors).toEqual([]);
});
