// Actual Kit/native reset regressions; no unchanged Base UI assertion credit.
import { expect, test, type Page } from '@playwright/test';
const unpatched = process.env.KIT_SUBMIT_EXPECT_UNPATCHED === '1';
const label = unpatched ? 'unpatched reset witness' : 'Kit reset compatibility';
async function setup(page: Page, parameters: Record<string, string> = {}) {
  const params = new URLSearchParams({
    instance: `${test.info().testId}-${test.info().workerIndex}`,
    ...parameters,
  });
  await page.goto(`/kit-reset-compat?${params}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname.includes('/remote/'))
      requests.push(request.url());
  });
  await page.getByRole('button', { name: 'Set edited values', exact: true }).click();
  await expect(page.locator('#reset-label')).toHaveValue('replacement');
  await expect(page.locator('#reset-enabled')).toBeChecked();
  return requests;
}
async function counter(page: Page) {
  const reads = Number(await page.locator('#reset-counter-reads').textContent());
  await page.getByRole('button', { name: 'Read server counter', exact: true }).click();
  await expect(page.locator('#reset-counter-reads')).toHaveText(String(reads + 1));
  return Number(await page.locator('#reset-effects').textContent());
}
async function expectDefaults(page: Page, stale = false) {
  await expect(page.locator('#reset-label')).toHaveValue('seed');
  await expect(page.locator('#reset-enabled')).not.toBeChecked();
  expect(
    await page.locator('#reset-form').evaluate((form: HTMLFormElement) => [...new FormData(form)]),
  ).toEqual([
    ['id', new URL(page.url()).searchParams.get('instance')],
    ['label', 'seed'],
  ]);
  await expect
    .poll(async () => {
      const owner = JSON.parse((await page.locator('#reset-owner').textContent()) ?? '{}');
      return { label: owner.label, enabled: owner.enabled ?? false };
    })
    .toEqual(stale ? { label: 'replacement', enabled: true } : { label: 'seed', enabled: false });
}
async function expectNoSubmission(page: Page, before: number, requests: string[]) {
  await page.waitForTimeout(100);
  expect(requests).toHaveLength(0);
  expect(await counter(page)).toBe(before);
  await expect(page.locator('#reset-pending')).toHaveText('0');
  await expect(page.locator('#reset-submitted')).toHaveText('false');
  await expect(page.locator('#reset-result')).toHaveText('null');
}
test(`${label}: trusted reset copies browser defaults into the remote owner`, async ({ page }) => {
  const requests = await setup(page);
  const before = await counter(page);
  await page.getByRole('button', { name: 'Native reset', exact: true }).click();
  await expectDefaults(page, unpatched);
  await expect(page.locator('#reset-events')).toHaveText('1');
  await expectNoSubmission(page, before, requests);
});
test(`${label}: public programmatic reset retains the default owner copy`, async ({ page }) => {
  const requests = await setup(page);
  const before = await counter(page);
  await page.getByRole('button', { name: 'Programmatic reset', exact: true }).click();
  await expectDefaults(page);
  await expect(page.locator('#reset-events')).toHaveText('1');
  await expectNoSubmission(page, before, requests);
});
for (const custom of [false, true]) {
  test(`${label}: ${custom ? 'caller' : 'default'} enhancement success retains programmatic reset`, async ({
    page,
  }) => {
    const requests = await setup(page, custom ? { custom: '' } : {});
    const before = await counter(page);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('#reset-result')).toContainText(
      '"label":"replacement","enabled":true',
    );
    await expectDefaults(page);
    await expect(page.locator('#reset-pending')).toHaveText('0');
    await expect(page.locator('#reset-submitted')).toHaveText('true');
    await expect(page.locator('#reset-events')).toHaveText('1');
    await expect(page.locator('#reset-custom-calls')).toHaveText(custom ? '1' : '0');
    expect(requests).toHaveLength(1);
    expect(await counter(page)).toBe(before + 1);
  });
}
for (const later of [false, true]) {
  test(`${label}: ${later ? 'later listener' : 'declarative handler'} canceled reset preserves values and clears Kit issues/touched`, async ({
    page,
  }) => {
    const requests = await setup(page, { issues: '', ...(later ? {} : { cancel: '' }) });
    const before = await counter(page);
    if (later)
      await page.locator('#reset-form').evaluate((form: HTMLFormElement) => {
        form.addEventListener('reset', (event) => event.preventDefault());
      });
    await page.getByRole('button', { name: 'Validate touched fields', exact: true }).click();
    await expect(page.locator('#reset-validations')).toHaveText('1');
    await expect(page.locator('#reset-issues')).toContainText('Client checkbox issue');
    await page.getByRole('button', { name: 'Native reset', exact: true }).click();
    await expect(page.locator('#reset-issues')).toHaveText('[]');
    await expect(page.locator('#reset-label')).toHaveValue('replacement');
    await expect(page.locator('#reset-enabled')).toBeChecked();
    await expect(page.locator('#reset-owner')).toContainText(
      '"label":"replacement","enabled":true',
    );
    // Public validation's default touched filter observes the reset clearing touched.
    await page.getByRole('button', { name: 'Validate touched fields', exact: true }).click();
    await expect(page.locator('#reset-validations')).toHaveText('2');
    await expect(page.locator('#reset-issues')).toHaveText('[]');
    await expect(page.locator('#reset-events')).toHaveText('1');
    await expectNoSubmission(page, before, requests);
  });
}
test(`${label}: native reset during held preflight retains the captured submission and pending count`, async ({
  page,
}) => {
  const requests = await setup(page, { gated: '', custom: '' });
  const before = await counter(page);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('#reset-pending')).toHaveText('1');
  await expect(page.getByRole('button', { name: 'Release preflight', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Native reset', exact: true }).click();
  await expectDefaults(page, unpatched);
  expect(requests).toHaveLength(0);
  expect(await counter(page)).toBe(before);
  await expect(page.locator('#reset-pending')).toHaveText('1');
  await expect(page.locator('#reset-result')).toHaveText('null');
  await page.getByRole('button', { name: 'Release preflight', exact: true }).click();
  await expect(page.locator('#reset-result')).toContainText('"label":"replacement","enabled":true');
  await expect(page.locator('#reset-pending')).toHaveText('0');
  await expect(page.locator('#reset-custom-calls')).toHaveText('1');
  await expect(page.locator('#reset-events')).toHaveText('1');
  expect(requests).toHaveLength(1);
  expect(await counter(page)).toBe(before + 1);
  await expectDefaults(page, unpatched);
});
