// Native reset preservation during trusted edits; no upstream declaration credit.
import { expect, test } from '@playwright/test';
for (const canceled of [false, true]) test(`Input pending restoration respects callback-triggered native reset (canceled=${canceled})`, async ({ page }) => {
  await page.goto(`/input?case=controlled-default-reset-in-input${canceled ? '-cancel' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); const input = page.getByTestId('input');
  await input.fill('edit'); await expect(input).toHaveValue(canceled ? 'owner' : 'seed');
  await expect(page.getByTestId('calls')).toHaveText(JSON.stringify([{ value: canceled ? 'edit' : 'seed', reason: 'none', type: 'input', canceled: false, defaultPrevented: false }]));
});
