// Real Kit 2.70.3 remote forms, native Svelte comparator. No upstream parity credit.
import { expect, test } from '@playwright/test';
const unpatched = process.env.KIT_SUBMIT_EXPECT_UNPATCHED === '1';
for (const native of [true, false]) {
  const label = native ? 'Native' : 'Input'; const query = native ? '?native' : '';
  test(`${label} direct remote field spreads retain keystrokes, callback ordering and programmatic updates`, async ({ page }) => {
    await page.goto(`/input-remote${query}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const input = page.getByRole('textbox', { name: 'Email', exact: true }); await expect(input).toHaveValue('seed@example.com');
    await input.fill(''); await input.pressSequentially('a@b.co'); await expect(input).toHaveValue('a@b.co'); await expect(page.getByTestId('remote-value')).toHaveText('a@b.co');
    const events = JSON.parse(await page.getByTestId('events').textContent() ?? '[]') as { channel: string; value: string; remote: string; reason?: string; type?: string }[];
    for (const event of events) { expect(event.remote).toBe(event.value); if (event.channel === 'value') { expect(event.reason).toBe('none'); expect(event.type).toBe('input'); } }
    if (!native) for (let i = 0; i < events.length; i += 2) expect(events.slice(i, i + 2).map(event => event.channel)).toEqual(['consumer', 'value']);
    const count = events.length; await page.getByRole('button', { name: 'Programmatic', exact: true }).click(); await expect(input).toHaveValue('programmatic@example.com');
    await expect(page.getByTestId('remote-value')).toHaveText('programmatic@example.com'); expect(JSON.parse(await page.getByTestId('events').textContent() ?? '[]')).toHaveLength(count);
    expect(await input.evaluate((node: HTMLInputElement) => node.defaultValue)).toBe('seed@example.com');
  });
  test(`${label} remote submission preserves native validation and server issues then resets successfully`, async ({ page }) => {
    await page.goto(`/input-remote${query}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); const input = page.getByRole('textbox', { name: 'Email', exact: true });
    await input.fill('bad'); await page.getByRole('button', { name: 'Submit', exact: true }).click(); await expect(page.getByTestId('invalid')).toHaveText('1'); await expect(page.getByTestId('result')).toHaveText('null');
    await input.fill('reject@example.com'); await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByTestId('issues')).toContainText('Email rejected by server'); await expect(input).toHaveAttribute('aria-invalid', 'true'); await expect(input).not.toHaveAttribute('data-invalid');
    await expect(input).toHaveValue('reject@example.com'); await expect(page.getByTestId('resets')).toHaveText('0');
    await input.fill('accepted@example.com'); await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByTestId('result')).toHaveText('{"email":"accepted@example.com"}'); await expect(input).toHaveValue('seed@example.com');
    await expect(page.getByTestId('remote-value')).toHaveText('seed@example.com'); await expect(page.getByTestId('issues')).toHaveText('[]'); await expect(page.getByTestId('resets')).toHaveText('1');
  });
  for (const canceled of [false, true]) test(`${label} remote ${canceled ? 'canceled' : 'native'} reset snapshots DOM and clears issues`, async ({ page }) => {
    await page.goto(`/input-remote?${native ? 'native&' : ''}${canceled ? 'canceled-reset' : ''}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const input = page.getByRole('textbox', { name: 'Email', exact: true }); await input.fill('reject@example.com');
    await page.getByRole('button', { name: 'Validate', exact: true }).click(); await expect(page.getByTestId('issues')).toContainText('Email rejected by server');
    const events = await page.getByTestId('events').textContent();
    const requests: string[] = [];
    page.on('request', request => { if (request.method() === 'POST') requests.push(request.url()); });
    const settled = Number(await page.getByTestId('reset-settled').textContent());
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByTestId('reset-settled')).toHaveText(String(settled + 1));
    const expectedOwner = canceled || unpatched ? 'reject@example.com' : 'seed@example.com';
    expect(JSON.parse(await page.getByTestId('reset-observation').textContent() ?? 'null')).toEqual({
      formData: canceled ? 'reject@example.com' : 'seed@example.com', remote: expectedOwner, issues: [], canceled,
    });
    await expect(input).toHaveValue(canceled ? 'reject@example.com' : 'seed@example.com');
    // Original Kit keeps its stale owner; the explicit compatibility patch copies
    // native defaults. Both lanes preserve canceled reset's original issues clearing.
    await expect(page.getByTestId('remote-value')).toHaveText(expectedOwner);
    await expect(page.getByTestId('issues')).toHaveText('[]'); await expect(page.getByTestId('events')).toHaveText(events ?? '[]');
    await expect(page.getByTestId('resets')).toHaveText('1');
    await expect(page.getByTestId('result')).toHaveText('null');
    expect(requests).toHaveLength(0);
    await input.fill('after-reset@example.com');
    await expect(input).toHaveValue('after-reset@example.com');
    await expect(page.getByTestId('remote-value')).toHaveText('after-reset@example.com');
    expect(requests).toHaveLength(0);
  });
}
test('Input value-detail cancellation preserves direct remote state and native edit', async ({ page }) => {
  await page.goto('/input-remote?canceled-value'); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const input = page.getByRole('textbox', { name: 'Email', exact: true }); await input.fill('edit@example.com'); await expect(input).toHaveValue('edit@example.com');
  await expect(page.getByTestId('remote-value')).toHaveText('edit@example.com'); await expect(page.getByTestId('events')).toContainText('"canceled":true');
});
