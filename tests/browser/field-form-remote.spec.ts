// Actual Kit direct-spread acceptance and unresolved submit characterization; all are supplements.
import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, query = '') {
  await page.goto(`/field-form-remote${query ? `?${query}` : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return page.locator('#remote-email');
}
for (const mode of ['', 'replacement', 'native']) {
  test(`Kit ${mode || 'default'} direct descriptors serialize each trusted edit and programmatic updates`, async ({ page }) => {
    const input = await setup(page, mode); await input.fill('sent@example.com');
    await expect(page.locator('#remote-value')).toHaveText('sent@example.com');
    expect(await input.evaluate((node: HTMLInputElement) => new FormData(node.form!).get('email'))).toBe('sent@example.com');
    await page.getByRole('button', { name: 'Programmatic', exact: true }).click(); await expect(input).toHaveValue('programmatic@example.com');
    await expect(page.locator('#remote-value')).toHaveText('programmatic@example.com');
    if (mode !== 'native') await expect(input).toHaveAttribute('aria-describedby', 'remote-description');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('#remote-result')).toContainText('programmatic@example.com');
    await expect(input).toHaveValue('seed@example.com'); await expect(page.locator('#remote-value')).toHaveText('seed@example.com');
  });
  test(`Kit ${mode || 'default'} server failure leaves input/result/reset state intact and surfaces issues`, async ({ page }) => {
    const input = await setup(page, mode); await input.fill('reject@example.com');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('#remote-issues')).toContainText('Server rejected email');
    await expect(page.locator('#remote-result')).toHaveText('null'); await expect(page.locator('#remote-resets')).toHaveText('0');
    await expect(input).toHaveValue('reject@example.com');
    if (mode !== 'native') { await expect(input).toHaveAttribute('aria-invalid', 'true'); await expect(page.locator('#remote-error')).toContainText('Server rejected email'); }
  });
  test(`Kit ${mode || 'default'} native and canceled reset retain their actual framework semantics`, async ({ page }) => {
    const input = await setup(page, `${mode ? `${mode}&` : ''}canceledReset`); await input.fill('edit@example.com');
    await page.getByRole('button', { name: 'Reset', exact: true }).click(); await expect(input).toHaveValue('edit@example.com');
    await expect(page.locator('#remote-value')).toHaveText('edit@example.com'); await expect(page.locator('#remote-resets')).toHaveText('1');
  });
}
test('diagnostic Kit Form invalid submit preserves raw request, listener and server-effect observations', async ({ page }) => {
  const input = await setup(page); const requests: string[] = [];
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('remote')) requests.push(request.url()); });
  await input.fill('blocked@example.com'); await page.getByRole('button', { name: 'Submit', exact: true }).click();
  // The server schema accepts this value; only Field rejects it. Record whether Kit still performs
  // the server operation. This characterization is not an acceptance assertion or parity credit.
  await expect(page.locator('#remote-events')).toContainText('after-attachments');
  await page.waitForTimeout(250);
  const observation = {
    requests: requests.length, result: JSON.parse(await page.locator('#remote-result').textContent() ?? 'null'),
    fieldValidity: JSON.parse(await page.locator('#field-validity').textContent() ?? 'null'),
    events: JSON.parse(await page.locator('#remote-events').textContent() ?? '[]'),
    nativeSubmit: await page.locator('#remote-native-submit').textContent(), resets: await page.locator('#remote-resets').textContent(),
  };
  await test.info().attach('kit-invalid-form-submit-observation.json', { body: JSON.stringify(observation, null, 2), contentType: 'application/json' });
  expect(observation.events.some((event: { stage: string; defaultPrevented: boolean }) => event.stage === 'after-attachments' && event.defaultPrevented)).toBe(true);
});
