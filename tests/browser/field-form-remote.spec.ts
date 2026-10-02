// Actual Kit direct-spread acceptance and unresolved submit characterization; all are supplements.
import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, query = '') {
  await page.goto(`/field-form-remote${query ? `?${query}` : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return page.locator('#remote-email');
}
async function readCounter(page: Page) {
  const reads = Number(await page.locator('#counter-reads').textContent());
  await page.getByRole('button', { name: 'Read server counter', exact: true }).click();
  await expect(page.locator('#counter-reads')).toHaveText(String(reads + 1));
  return Number(await page.locator('#server-counter').textContent());
}
for (const mode of ['', 'replacement', 'formReplacement', 'native']) {
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
    const input = await setup(page, mode); const before = await readCounter(page); await input.fill('reject@example.com');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('#remote-issues')).toContainText('Server rejected email');
    await expect(page.locator('#remote-result')).toHaveText('null'); await expect(page.locator('#remote-resets')).toHaveText('0');
    await expect(input).toHaveValue('reject@example.com');
    if (mode !== 'native') { await expect(input).toHaveAttribute('aria-invalid', 'true'); await expect(page.locator('#remote-error')).toContainText('Server rejected email'); }
    expect(await readCounter(page) - before).toBe(0);
  });
  test(`Kit ${mode || 'default'} native and canceled reset retain their actual framework semantics`, async ({ page }) => {
    const input = await setup(page, `${mode ? `${mode}&` : ''}canceledReset`); await input.fill('edit@example.com');
    await page.getByRole('button', { name: 'Reset', exact: true }).click(); await expect(input).toHaveValue('edit@example.com');
    await expect(page.locator('#remote-value')).toHaveText('edit@example.com'); await expect(page.locator('#remote-resets')).toHaveText('1');
  });
  test(`Kit ${mode || 'default'} direct validate publishes server issues without a server operation or reset`, async ({ page }) => {
    const input = await setup(page, mode); const before = await readCounter(page); await input.fill('bad');
    await page.getByRole('button', { name: 'Validate', exact: true }).click();
    await expect(page.locator('#remote-issues')).toContainText('Email required');
    expect(await readCounter(page) - before).toBe(0); await expect(page.locator('#remote-result')).toHaveText('null'); await expect(page.locator('#remote-resets')).toHaveText('0');
    await expect(input).toHaveValue('bad'); await expect(page.locator('#remote-value')).toHaveText('bad');
    if (mode !== 'native') { await expect(input).toHaveAttribute('aria-invalid', 'true'); await expect(page.locator('#remote-error')).toContainText('Email required'); }
  });
}
test('diagnostic Kit Form invalid submit preserves raw request, listener and server-effect observations', async ({ page }) => {
  const input = await setup(page); const before = await readCounter(page); const requests: string[] = [];
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('remote')) requests.push(request.url()); });
  await input.fill('blocked@example.com'); await page.getByRole('button', { name: 'Submit', exact: true }).click();
  // The server schema accepts this value; only Field rejects it. Record whether Kit still performs
  // the server operation. This characterization is not an acceptance assertion or parity credit.
  await expect(page.locator('#remote-events')).toContainText('capture');
  await page.waitForTimeout(250);
  const observation = {
    counterBefore: before, counterAfter: await readCounter(page),
    nativeAction: await page.locator('#remote-form').evaluate((form: HTMLFormElement) => ({ method: form.method, action: form.action, target: form.target })),
    requests: requests.length, result: JSON.parse(await page.locator('#remote-result').textContent() ?? 'null'),
    fieldValidity: JSON.parse(await page.locator('#field-validity').textContent() ?? 'null'),
    events: JSON.parse(await page.locator('#remote-events').textContent() ?? '[]'),
    nativeSubmit: await page.locator('#remote-native-submit').textContent(), resets: await page.locator('#remote-resets').textContent(),
  };
  await test.info().attach('kit-invalid-form-submit-observation.json', { body: JSON.stringify(observation, null, 2), contentType: 'application/json' });
  expect(observation.events.some((event: { stage: string }) => event.stage === 'capture')).toBe(true);
});
for (const mode of ['native', '']) test(`diagnostic Kit ${mode || 'Form'} ordinary preventDefault cancellation preserves enhancement outcome`, async ({ page }) => {
  const input = await setup(page, `${mode ? `${mode}&` : ''}canceledSubmit`); const before = await readCounter(page);
  const requests: string[] = [];
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('remote')) requests.push(request.url()); });
  await input.fill('canceled@example.com'); await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('#remote-events')).toContainText('after-attachments'); await page.waitForTimeout(250);
  const observation = { mode: mode || 'Form', counterBefore: before, counterAfter: await readCounter(page), requests: requests.length,
    result: JSON.parse(await page.locator('#remote-result').textContent() ?? 'null'),
    events: JSON.parse(await page.locator('#remote-events').textContent() ?? '[]'),
    nativeSubmit: await page.locator('#remote-native-submit').textContent(), resets: await page.locator('#remote-resets').textContent() };
  await test.info().attach('kit-canceled-submit-observation.json', { body: JSON.stringify(observation, null, 2), contentType: 'application/json' });
  expect(observation.events.some((event: { stage: string; defaultPrevented: boolean }) => event.stage === 'after-attachments' && event.defaultPrevented)).toBe(true);
});
for (const mode of ['', 'replacement', 'formReplacement']) test(`acceptance Kit ${mode || 'default'} invalid contextual Field submits zero requests and performs zero server operations`, async ({ page }) => {
  const input = await setup(page, mode); const before = await readCounter(page); const requests: string[] = [];
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('remote')) requests.push(request.url()); });
  await input.fill('blocked@example.com'); await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await page.waitForTimeout(300);
  const after = await readCounter(page);
  await test.info().attach('kit-invalid-submit-acceptance-counter.json', { body: JSON.stringify({ before, after, delta: after - before, requests: requests.length }), contentType: 'application/json' });
  expect.soft(requests).toHaveLength(0); expect.soft(after - before).toBe(0);
  await expect.soft(page.locator('#remote-result')).toHaveText('null'); await expect.soft(page.locator('#remote-resets')).toHaveText('0');
  await expect.soft(input).toHaveValue('blocked@example.com'); await expect.soft(input).toHaveAttribute('aria-invalid', 'true');
});
