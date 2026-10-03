// SDK compatibility supplements, not unchanged Base UI assertions.
import { expect, test, type Page } from '@playwright/test';
const unpatched = process.env.KIT_SUBMIT_EXPECT_UNPATCHED === '1';
const label = unpatched ? 'unpatched witness' : 'Kit compatibility acceptance';
async function setup(page: Page, parameters: Record<string, string> = {}) {
  const params = new URLSearchParams({ instance: `${test.info().testId}-${test.info().workerIndex}`, ...parameters });
  await page.goto(`/kit-submit-compat?${params}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.locator('#compat-attached')).toHaveText('true');
  await expect(page.locator('#compat-email')).toHaveAttribute('id', 'compat-email');
  await expect(page.locator('#compat-form label')).toHaveAttribute('for', 'compat-email');
  const requests: string[] = [];
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname.includes('/remote/')) requests.push(request.url());
  });
  return { input: page.locator('#compat-email'), requests };
}
async function counter(page: Page) {
  const reads = Number(await page.locator('#compat-counter-reads').textContent());
  await page.getByRole('button', { name: 'Read server counter', exact: true }).click();
  await expect(page.locator('#compat-counter-reads')).toHaveText(String(reads + 1));
  return Number(await page.locator('#compat-effects').textContent());
}
async function laterObservers(page: Page) {
  await page.locator('#compat-form').evaluate((form: HTMLFormElement) => {
    form.dataset.observed = '0';
    const main = form.parentElement!;
    main.dataset.observed = '0';
    form.addEventListener('submit', () => { form.dataset.observed = String(Number(form.dataset.observed) + 1); });
    main.addEventListener('submit', () => { main.dataset.observed = String(Number(main.dataset.observed) + 1); });
  });
}
async function expectNoRequest(page: Page, before: number, requests: string[], value: string) {
  // Wait through the asynchronous enhancement boundary; the following live server read is a second observation.
  await page.waitForTimeout(250);
  expect(requests).toHaveLength(0);
  expect(await counter(page)).toBe(before);
  await expect(page.locator('#compat-result')).toHaveText('null');
  await expect(page.locator('#compat-resets')).toHaveText('0');
  await expect(page.locator('#compat-pending')).toHaveText('0');
  await expect(page.locator('#compat-submitted')).toHaveText('false');
  await expect(page.locator('#compat-attached')).toHaveText('true');
  await expect(page.locator('#compat-email')).toHaveValue(value);
}
for (const mode of ['default', 'replacement']) {
  test(`${label}: ${mode} Field invalidation blocks before SDK then next valid submits exactly once`, async ({ page }) => {
    const { input, requests } = await setup(page, { mode });
    const before = await counter(page);
    await laterObservers(page);
    await input.fill('blocked@example.com');
    await page.getByRole('button', { name: 'Submit one', exact: true }).click();
    await expect(page.locator('#compat-consumer-calls')).toHaveText('0');
    if (unpatched) {
      await expect(page.locator('#compat-result')).toContainText('blocked@example.com');
      expect(requests).toHaveLength(1);
      expect(await counter(page)).toBe(before + 1);
      await expect(page.locator('#compat-resets')).toHaveText('1');
      return;
    }
    await expect(input).toBeFocused();
    await expectNoRequest(page, before, requests, 'blocked@example.com');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#compat-error')).toContainText('Blocked by Field');
    await expect(page.locator('#compat-form')).toHaveAttribute('data-observed', '1');
    await expect(page.locator('main')).toHaveAttribute('data-observed', '1');
    await input.fill('valid@example.com');
    await page.getByRole('button', { name: 'Submit two', exact: true }).click();
    await expect(page.locator('#compat-result')).toContainText('valid@example.com');
    await expect(page.locator('#compat-result')).toContainText('"intent":"two"');
    expect(requests).toHaveLength(1);
    expect(await counter(page)).toBe(before + 1);
    await expect(input).toHaveValue('seed@example.com');
    await expect(page.locator('#compat-resets')).toHaveText('1');
    await expect(page.locator('#compat-form')).toHaveAttribute('data-observed', '2');
    await expect(page.locator('main')).toHaveAttribute('data-observed', '2');
  });
}
for (const mode of ['native', 'default', 'replacement']) {
  test(`${label}: ${mode} authored cancellation preserves caller enhancement and the next submitter`, async ({ page }) => {
    const { input, requests } = await setup(page, { mode, cancel: '', custom: '' });
    const before = await counter(page);
    await laterObservers(page);
    await input.fill('canceled@example.com');
    await page.getByRole('button', { name: 'Submit one', exact: true }).click();
    await expect(page.locator('#compat-consumer-calls')).toHaveText('1');
    if (unpatched) {
      await expect(page.locator('#compat-result')).toContainText('canceled@example.com');
      expect(requests).toHaveLength(1);
      expect(await counter(page)).toBe(before + 1);
      await expect(page.locator('#compat-custom-calls')).toHaveText('1');
      await expect(page.locator('#compat-resets')).toHaveText('0');
      return;
    }
    await expectNoRequest(page, before, requests, 'canceled@example.com');
    await expect(page.locator('#compat-custom-calls')).toHaveText('0');
    await expect(page.locator('#compat-form')).toHaveAttribute('data-observed', '1');
    await expect(page.locator('main')).toHaveAttribute('data-observed', '1');
    await page.getByRole('button', { name: 'Allow submission', exact: true }).click();
    await input.fill('valid@example.com');
    await page.getByRole('button', { name: 'Submit two', exact: true }).click();
    await expect(page.locator('#compat-result')).toContainText('"intent":"two"');
    expect(requests).toHaveLength(1);
    expect(await counter(page)).toBe(before + 1);
    await expect(page.locator('#compat-custom-calls')).toHaveText('1');
    await expect(page.locator('#compat-consumer-calls')).toHaveText('2');
    await expect(page.locator('#compat-custom-results')).toContainText('"intent":"two"');
    await expect(input).toHaveValue('valid@example.com');
    await expect(page.locator('#compat-resets')).toHaveText('0');
  });
}
if (!unpatched) {
  for (const mode of ['default', 'replacement']) {
    test(`Kit compatibility acceptance: ${mode} canceled attempt never enters caller preflight`, async ({ page }) => {
      const { input, requests } = await setup(page, { mode, cancel: '', custom: '', gated: '' });
      const before = await counter(page);
      await input.fill('valid@example.com');
      await page.getByRole('button', { name: 'Submit one', exact: true }).click();
      await expectNoRequest(page, before, requests, 'valid@example.com');
      await expect(page.locator('#compat-preflight-calls')).toHaveText('0');
      await expect(page.locator('#compat-custom-calls')).toHaveText('0');
    });
    test(`Kit compatibility acceptance: ${mode} overlapping preflight retains each event submitter`, async ({ page }) => {
      const { input, requests } = await setup(page, { mode, custom: '', gated: '' });
      const before = await counter(page);
      await input.fill('first@example.com');
      await page.getByRole('button', { name: 'Submit one', exact: true }).click();
      await expect(page.locator('#compat-pending')).toHaveText('1');
      await input.fill('second@example.com');
      await page.getByRole('button', { name: 'Submit two', exact: true }).click();
      await expect(page.locator('#compat-pending')).toHaveText('2');
      await expect(page.locator('#compat-preflight-calls')).toHaveText('2');
      expect(requests).toHaveLength(0);
      await page.getByRole('button', { name: 'Release two', exact: true }).click();
      await expect(page.locator('#compat-result')).toContainText('second@example.com');
      await expect(page.locator('#compat-pending')).toHaveText('1');
      await page.getByRole('button', { name: 'Release one', exact: true }).click();
      await expect(page.locator('#compat-pending')).toHaveText('0');
      await expect(page.locator('#compat-custom-calls')).toHaveText('2');
      expect(requests).toHaveLength(2);
      expect(await counter(page)).toBe(before + 2);
      const results = JSON.parse(await page.locator('#compat-custom-results').textContent() ?? '[]');
      expect(results.map((result: { email: string; intent: string }) => ({ email: result.email, intent: result.intent }))).toEqual([
        { email: 'second@example.com', intent: 'two' }, { email: 'first@example.com', intent: 'one' },
      ]);
      await expect(page.locator('#compat-resets')).toHaveText('0');
    });
    test(`Kit compatibility acceptance: ${mode} custom JavaScript owns success reset`, async ({ page }) => {
      const { input, requests } = await setup(page, { mode, custom: '', customReset: '' });
      const before = await counter(page);
      await input.fill('valid@example.com');
      await page.getByRole('button', { name: 'Submit one', exact: true }).click();
      await expect(page.locator('#compat-custom-calls')).toHaveText('1');
      await expect(page.locator('#compat-resets')).toHaveText('1');
      await expect(input).toHaveValue('seed@example.com');
      expect(requests).toHaveLength(1);
      expect(await counter(page)).toBe(before + 1);
    });
  }
  test('Kit compatibility acceptance: SSR emits ordinary method/action/control defaults before hydration', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    try {
      const page = await context.newPage();
      await page.goto('/kit-submit-compat?mode=replacement');
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'false');
      await expect(page.locator('#compat-form')).toHaveAttribute('method', 'POST');
      await expect(page.locator('#compat-form')).toHaveAttribute('action', /\?\/remote=/);
      // Base UI intentionally uses the provider ID until control registration runs,
      // keeping the label associated in SSR before adopting the authored ID on hydration.
      const control = page.locator('#compat-form input[name="email"][type="email"]');
      await expect(control).toHaveValue('seed@example.com');
      const controlId = await control.getAttribute('id');
      expect(controlId).toBeTruthy();
      await expect(page.locator('#compat-form label')).toHaveAttribute('for', controlId!);
      await expect(page.locator('#compat-result')).toHaveText('null');
    } finally { await context.close(); }
  });
}
