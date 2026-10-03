import { expect, test, type Page } from '@playwright/test';

async function setup(page: Page) {
  await page.goto('/remote-api');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.locator('#control-ref')).toHaveText('switch');
  return page.locator('input[name="storageType"]');
}
async function value(page: Page, id: string) {
  return JSON.parse(await page.locator(`#${id}`).textContent() ?? 'null');
}

test('typed remote namespace hydrates and renders one semantic Switch input', async ({ page, request }) => {
  const html = await (await request.get('/remote-api')).text();
  expect(html).toContain('name="storageType"');
  expect(html).toContain('name="b:enabled"');
  const input = await setup(page);
  await expect(input).toHaveValue('seed');
  await expect(page.locator('#survey-form input[type="checkbox"]')).toHaveCount(1);
  await expect(page.locator('#survey-form span[type]')).toHaveCount(0);
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  await expect(input).toHaveAttribute('aria-describedby', /^base-ui-/);
  await page.getByRole('switch').click();
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  await expect.poll(async () => (await value(page, 'owner')).enabled).toBe(true);
  expect(await page.locator('#survey-form').evaluate((node: HTMLFormElement) => new FormData(node).get('b:enabled'))).toBe('on');
  expect(await value(page, 'changes')).toEqual([{ checked: true, type: 'click' }]);
  expect(await value(page, 'value-changes')).toEqual([{ value: true, type: 'click' }]);
  await page.getByRole('button', { name: 'Replace values', exact: true }).click();
  await expect(input).toHaveValue('replacement');
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: 'Set enabled', exact: true }).click();
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(input).toHaveValue('seed');
  await test.info().attach('source-switch-reset.json', { body: JSON.stringify(await page.locator('#survey-form').evaluate((form: HTMLFormElement) => {
    const control = form.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    return { checked: control.checked, defaultChecked: control.defaultChecked, html: control.outerHTML, successfulValues: [...new FormData(form)] };
  })), contentType: 'application/json' });
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  expect(await page.locator('#survey-form').evaluate((node: HTMLFormElement) => new FormData(node).has('b:enabled'))).toBe(false);
  expect(await value(page, 'changes')).toEqual([{ checked: true, type: 'click' }]);
  expect(await value(page, 'value-changes')).toEqual([{ value: true, type: 'click' }]);
});

test('actual literal Kit descriptors characterize initially undefined checkbox and reset defaults', async ({ page }) => {
  await setup(page);
  const checkbox = page.locator('#literal-enabled'), input = page.locator('#literal-text');
  await expect(checkbox).not.toBeChecked(); await expect(input).toHaveValue('seed');
  await checkbox.check();
  await expect.poll(async () => (await value(page, 'literal-owner')).enabled).toBe(true);
  await page.getByRole('button', { name: 'Literal replace values', exact: true }).click();
  await expect(checkbox).not.toBeChecked(); await expect(input).toHaveValue('replacement');
  await page.getByRole('button', { name: 'Literal set enabled', exact: true }).click();
  await expect(checkbox).toBeChecked();
  await page.getByRole('button', { name: 'Literal reset', exact: true }).click();
  await expect(input).toHaveValue('seed'); await expect(checkbox).not.toBeChecked();
  expect((await value(page, 'literal-owner')).enabled ?? false).toBe(false);
  await test.info().attach('literal-checked-reset.json', { body: JSON.stringify(await page.locator('#literal-reset-form').evaluate((form: HTMLFormElement) => {
    const control = form.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    return { checked: control.checked, defaultChecked: control.defaultChecked, html: control.outerHTML, successfulValues: [...new FormData(form)] };
  })), contentType: 'application/json' });
});

test('checked cancellation precedes native input and Kit ownership', async ({ page }) => {
  await setup(page);
  await page.locator('#survey-form').evaluate((node: HTMLFormElement) => {
    node.dataset.inputs = '0';
    node.addEventListener('input', () => { node.dataset.inputs = String(Number(node.dataset.inputs) + 1); });
  });
  await page.getByRole('button', { name: 'Toggle checked cancellation', exact: true }).click();
  await page.getByRole('switch').click();
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('#survey-form input[type="checkbox"]')).not.toBeChecked();
  await expect(page.locator('#survey-form')).toHaveAttribute('data-inputs', '0');
  expect((await value(page, 'owner')).enabled ?? false).toBe(false);
  expect(await value(page, 'changes')).toEqual([{ checked: true, type: 'click' }]);
  expect(await value(page, 'value-changes')).toEqual([]);
  await page.getByRole('button', { name: 'Toggle checked cancellation', exact: true }).click();
  await page.getByRole('switch').click();
  await expect.poll(async () => (await value(page, 'owner')).enabled).toBe(true);
  await expect(page.locator('#survey-form')).toHaveAttribute('data-inputs', '1');
  expect(await value(page, 'value-changes')).toEqual([{ value: true, type: 'click' }]);
});

for (const canceled of [false, true]) test(`remote source cancellation makes zero POST before next valid submission (authored=${canceled})`, async ({ page }) => {
  const input = await setup(page);
  const requests: string[] = [];
  page.on('request', (request) => { if (request.method() === 'POST' && request.url().includes('remote')) requests.push(request.url()); });
  if (canceled) await page.getByRole('button', { name: 'Toggle submit cancellation', exact: true }).click();
  else await input.fill('blocked');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  if (!canceled) { await expect(input).toBeFocused(); await expect(page.locator('#storage-error')).toHaveText('Blocked storage'); }
  await page.waitForTimeout(250);
  expect(requests).toHaveLength(0);
  expect(await value(page, 'enhancement')).toEqual([]);
  expect(await value(page, 'result')).toBeNull();
  if (canceled) await page.getByRole('button', { name: 'Toggle submit cancellation', exact: true }).click();
  await input.fill('valid');
  await page.getByRole('switch').click();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('#result')).toContainText('"storageType":"valid","enabled":true');
  expect(requests).toHaveLength(1);
  expect(await value(page, 'enhancement')).toEqual(['caller', 'settled']);
  await expect(input).toHaveValue('seed');
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
});
