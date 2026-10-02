// Trusted Chromium remote-form phase diagnostics. No runtime bridge or parity credit.
import { expect, test } from '@playwright/test';
for (const mode of ['native', 'default', 'replacement']) test(`trusted Kit remote field phase diagnostics (${mode})`, async ({ page }, testInfo) => {
  await page.goto(`/input-remote?${mode === 'default' ? '' : mode}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const input = page.getByRole('textbox', { name: 'Email', exact: true });
  try {
    await input.fill(''); await input.pressSequentially('a@b.co');
    await expect(input).toHaveValue('a@b.co'); await expect(page.getByTestId('remote-value')).toHaveText('a@b.co');
  } finally {
    const raw = await page.getByTestId('phases').textContent() ?? '[]';
    await testInfo.attach(`input-remote-phases-${mode}.json`, { body: raw, contentType: 'application/json' });
    console.info(`INPUT_REMOTE_PHASES_${mode}`, JSON.stringify((JSON.parse(raw) as unknown[]).slice(-18)));
  }
});
