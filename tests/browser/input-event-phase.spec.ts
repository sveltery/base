// Native Svelte reset during trusted edits; historical restoration assertions are retained separately, with zero ordinary credit.
import { expect, test } from '@playwright/test';
for (const canceled of [false, true]) test(`Input uses native callback-triggered reset behavior (canceled=${canceled})`, async ({ page }) => {
  await page.goto(`/input?case=controlled-default-reset-in-input${canceled ? '-cancel' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); const input = page.getByTestId('input');
  await input.fill('edit'); await expect(input).toHaveValue(canceled ? 'edit' : 'seed');
  await expect(page.getByTestId('calls')).toHaveText(JSON.stringify([{ value: canceled ? 'edit' : 'seed', reason: 'none', type: 'input', canceled: false, defaultPrevented: false }]));
});
