// Trusted native Svelte comparators for current-form reset observation; no parity credit.
import { expect, test } from '@playwright/test';
for (const scenario of ['reassociation', 'stop-immediate', 'unrelated-old', 'attachment-bubble', 'attachment-capture', 'attachment-bubble-replacement', 'attachment-capture-replacement', 'render-attachment-bubble-before', 'render-attachment-capture-before']) for (const canceled of [false, true]) for (const native of [true, false]) {
  test(`trusted reset observation (${native ? 'native' : 'Input'}/${scenario}/canceled=${canceled})`, async ({ page }) => {
    await page.goto(`/input-reset-observation?case=${scenario}${native ? '&native' : ''}${canceled ? '&canceled' : ''}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); const input = page.getByTestId('reset-input');
    await input.fill('edit'); await expect(input).toHaveValue(!canceled && scenario !== 'unrelated-old' ? 'seed' : native ? 'edit' : 'owner');
    expect(await input.evaluate((node: HTMLInputElement) => node.form?.id)).toBe(scenario === 'stop-immediate' || scenario.includes('attachment-') ? 'reset-first' : 'reset-second');
    if (!native && scenario.endsWith('-replacement')) await expect(input).toHaveAttribute('data-merged', 'true');
  });
}
