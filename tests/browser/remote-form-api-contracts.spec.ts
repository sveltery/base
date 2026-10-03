// Supplemental developer-experience assertions; no unchanged upstream credit.
import { expect, test, type Page } from '@playwright/test';

async function setup(page: Page) {
  await page.goto('/remote-api-contracts');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
}
async function json(page: Page, id: string) {
  return JSON.parse(await page.locator(`#${id}`).textContent() ?? 'null');
}
function posts(page: Page) {
  const requests: string[] = [];
  page.on('request', (request) => { if (request.method() === 'POST' && request.url().includes('remote')) requests.push(request.url()); });
  return requests;
}
async function positive(page: Page, button: string, result: string, effect: string, expected: unknown) {
  const before = (await json(page, 'contract-effects'))[effect] ?? 0;
  const requests = posts(page);
  await page.getByRole('button', { name: button, exact: true }).click();
  await expect.poll(async () => (await json(page, result))?.values).toEqual(expected);
  expect(requests).toHaveLength(1);
  await page.getByRole('button', { name: 'Read contract effects', exact: true }).click();
  await expect.poll(async () => (await json(page, 'contract-effects'))[effect]).toBe(before + 1);
}

test('public remote controls SSR real native names and preserve file input defaults', async ({ page, request }) => {
  const html = await (await request.get('/remote-api-contracts')).text();
  expect(html).toContain('name="choices[]"');
  expect(html).toContain('name="items[0].label"');
  expect(html).toContain('id="manual-email"');
  await setup(page);
  await expect(page.locator('#uploads input[type="file"]')).toHaveCount(2);
  for (const input of await page.locator('#uploads input[type="file"]').all()) {
    expect(await input.getAttribute('value')).toBeNull();
    await expect(input).toHaveValue('');
  }
});

test('native array checkboxes retain the whole accessor array through set and the next toggle', async ({ page }) => {
  await setup(page);
  const red = page.getByLabel('Native red', { exact: true }), blue = page.getByLabel('Native blue', { exact: true });
  await expect(blue).not.toBeChecked();
  await blue.check();
  await expect.poll(() => json(page, 'native-choice-owner')).toEqual(['blue']);
  await blue.uncheck();
  await expect.poll(() => json(page, 'native-choice-owner')).toEqual([]);
  await red.check();
  await expect.poll(() => json(page, 'native-choice-owner')).toEqual(['red']);
  expect(await json(page, 'native-choice-changes')).toEqual([{ value: ['red'], type: 'click' }]);
  await page.getByRole('button', { name: 'Set native blue', exact: true }).click();
  await expect(red).not.toBeChecked(); await expect(blue).toBeChecked();
  await red.check();
  await expect.poll(() => json(page, 'native-choice-owner')).toEqual(['red', 'blue']);
  expect(await page.locator('#native-choices').evaluate((node: HTMLFormElement) => new FormData(node).getAll('choices[]'))).toEqual(['red', 'blue']);
  await positive(page, 'Save native choices', 'native-choice-result', 'nativeChoices', { choices: ['red', 'blue'] });
});

test('real CheckboxGroup reports source callbacks, metadata, successful hidden values and a positive POST', async ({ page }) => {
  await setup(page);
  const form = page.locator('#styled-choices');
  await form.evaluate((node: HTMLFormElement) => {
    node.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        node.dataset.inputPhase = JSON.stringify({ value: target.value, checked: target.checked, values: new FormData(node).getAll('choices[]') });
        node.dataset.inputCount = String(Number(node.dataset.inputCount ?? 0) + 1);
      }
    });
  });
  await page.getByRole('button', { name: 'Set styled blue', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Styled blue', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('checkbox', { name: 'Styled red', exact: true }).click();
  await test.info().attach('styled-checkbox-group-native-measurement', {
    contentType: 'application/json',
    body: JSON.stringify({ owner: await json(page, 'styled-choice-owner'), callbacks: await json(page, 'styled-choice-changes'), nativeInputPhase: JSON.parse(await form.getAttribute('data-input-phase') ?? 'null'), successfulValues: await form.evaluate((node: HTMLFormElement) => new FormData(node).getAll('choices[]')) }),
  });
  await expect.poll(() => json(page, 'styled-choice-owner')).toEqual(['red', 'blue']);
  expect(await json(page, 'styled-choice-changes')).toEqual([{ value: ['blue', 'red'], type: 'click', reason: 'none' }]);
  await expect(page.locator('#styled-choice-group')).toHaveClass(/source-dirty/);
  await expect(page.locator('#styled-choice-group')).toHaveClass(/source-filled/);
  expect(await form.evaluate((node: HTMLFormElement) => new FormData(node).getAll('choices[]'))).toEqual(['red', 'blue']);
  expect(JSON.parse(await form.getAttribute('data-input-phase') ?? 'null')).toMatchObject({ checked: true });
  await page.getByRole('checkbox', { name: 'Styled blue', exact: true }).click();
  await expect.poll(() => json(page, 'styled-choice-owner')).toEqual(['red']);
  await page.getByRole('checkbox', { name: 'Styled blue', exact: true }).click();
  await expect.poll(() => json(page, 'styled-choice-owner')).toEqual(['red', 'blue']);
  expect(await json(page, 'styled-choice-changes')).toEqual([
    { value: ['blue', 'red'], type: 'click', reason: 'none' },
    { value: ['red'], type: 'click', reason: 'none' },
    { value: ['red', 'blue'], type: 'click', reason: 'none' },
  ]);
  const inputCount = await form.getAttribute('data-input-count'), requests = posts(page);
  await page.getByRole('button', { name: 'Toggle styled option cancellation', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Styled blue', exact: true }).click();
  expect(await json(page, 'styled-choice-canceled-checks')).toEqual([{ value: false, type: 'click' }]);
  await expect(page.getByRole('checkbox', { name: 'Styled blue', exact: true })).toHaveAttribute('aria-checked', 'true');
  expect(await json(page, 'styled-choice-owner')).toEqual(['red', 'blue']);
  expect(await json(page, 'styled-choice-changes')).toHaveLength(3);
  expect(await form.getAttribute('data-input-count')).toBe(inputCount);
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Toggle styled option cancellation', exact: true }).click();
  await positive(page, 'Save styled choices', 'styled-choice-result', 'styledChoices', { choices: ['red', 'blue'] });
});

for (const styled of [false, true]) test(`${styled ? 'real RadioGroup' : 'native radio'} owns one selection and serializes a positive POST`, async ({ page }) => {
  await setup(page);
  const formId = styled ? 'styled-radio' : 'native-radio';
  const red = styled ? page.getByRole('radio', { name: 'Styled radio red', exact: true }) : page.getByLabel('Native radio red', { exact: true });
  const blue = styled ? page.getByRole('radio', { name: 'Styled radio blue', exact: true }) : page.getByLabel('Native radio blue', { exact: true });
  await red.click(); await blue.click();
  if (styled) {
    await expect(blue).toHaveAttribute('aria-checked', 'true'); await expect(red).toHaveAttribute('aria-checked', 'false');
    expect(await json(page, 'styled-radio-changes')).toEqual([{ value: 'red', type: 'click' }, { value: 'blue', type: 'click' }]);
    await expect(page.locator(`#${formId} input[name="choice"]`)).toHaveCount(2);
    await expect(page.locator(`#${formId} input[name="choice"]:checked`)).toHaveCount(1);
  } else { await expect(blue).toBeChecked(); await expect(red).not.toBeChecked(); }
  expect(await page.locator(`#${formId}`).evaluate((node: HTMLFormElement) => new FormData(node).getAll('choice'))).toEqual(['blue']);
  await positive(page, styled ? 'Save styled radio' : 'Save native radio', `${formId}-result`, styled ? 'styledRadio' : 'nativeRadio', { choice: 'blue' });
});

test('real numeric RadioGroup keeps Kit numeric names and one successful selection', async ({ page }) => {
  await setup(page);
  const one = page.getByRole('radio', { name: 'Styled radio one', exact: true }), two = page.getByRole('radio', { name: 'Styled radio two', exact: true });
  await one.click(); await two.click();
  await expect(one).toHaveAttribute('aria-checked', 'false'); await expect(two).toHaveAttribute('aria-checked', 'true');
  await expect.poll(() => json(page, 'numeric-radio-owner')).toBe(2);
  expect(await json(page, 'numeric-radio-changes')).toEqual([{ value: 1, type: 'click' }, { value: 2, type: 'click' }]);
  await expect(page.locator('#numeric-radio input[name="n:choice"]')).toHaveCount(2);
  await expect(page.locator('#numeric-radio input[name="n:choice"]:checked')).toHaveCount(1);
  expect(await page.locator('#numeric-radio').evaluate((node: HTMLFormElement) => new FormData(node).getAll('n:choice'))).toEqual(['2']);
  await positive(page, 'Save numeric radio', 'numeric-radio-result', 'numericRadio', { choice: 2 });
});

test('selects preserve authored options, multiple selection, native render props and live set', async ({ page }) => {
  await setup(page);
  const single = page.getByLabel('Single color', { exact: true }), multiple = page.getByLabel('Multiple colors', { exact: true }), custom = page.getByLabel('Custom select', { exact: true });
  await expect(single).toHaveValue('red'); await expect(multiple).toHaveValues(['red']); await expect(custom).toHaveValue('red');
  await page.getByRole('button', { name: 'Set selects blue', exact: true }).click();
  await expect(single).toHaveValue('blue'); await expect(multiple).toHaveValues(['blue']); await expect(custom).toHaveValue('blue');
  await multiple.selectOption(['red', 'blue']); await custom.selectOption('red');
  await expect.poll(() => json(page, 'select-owner')).toEqual({ single: 'blue', multiple: ['red', 'blue'], custom: 'red' });
  await positive(page, 'Save selects', 'select-result', 'selects', { single: 'blue', multiple: ['red', 'blue'], custom: 'red' });
});

test('File and File[] use native file hosts and actual multipart POSTs without a forced value', async ({ page }) => {
  await setup(page);
  await page.getByLabel('Single file', { exact: true }).setInputFiles({ name: 'one.txt', mimeType: 'text/plain', buffer: Buffer.from('one') });
  await page.getByLabel('Multiple files', { exact: true }).setInputFiles([
    { name: 'two.txt', mimeType: 'text/plain', buffer: Buffer.from('two') }, { name: 'three.txt', mimeType: 'text/plain', buffer: Buffer.from('three') },
  ]);
  const before = (await json(page, 'contract-effects')).uploads ?? 0, requests = posts(page);
  await page.getByRole('button', { name: 'Save uploads', exact: true }).click();
  await expect.poll(() => json(page, 'upload-result')).toEqual({ file: 'one.txt', files: ['two.txt', 'three.txt'], effects: before + 1 });
  expect(requests).toHaveLength(1);
  await page.getByRole('button', { name: 'Read contract effects', exact: true }).click();
  await expect.poll(async () => (await json(page, 'contract-effects')).uploads).toBe(before + 1);
});

test('nested server errors use logical canonical paths, authored IDs and authoritative empty errors', async ({ page }) => {
  await setup(page);
  const email = page.getByLabel('Nested email', { exact: true }), index = page.getByLabel('Indexed label', { exact: true });
  await expect(email).toHaveAttribute('id', 'manual-email'); await expect(index).toHaveAttribute('id', 'manual-index');
  await expect(index).toHaveAttribute('name', 'items[0].label');
  await email.fill('server-reject'); await index.fill('server-reject');
  const requests = posts(page), before = (await json(page, 'contract-effects')).nested ?? 0;
  await page.getByRole('button', { name: 'Save nested', exact: true }).click();
  await expect(page.locator('#nested-email-error')).toHaveText('Server email error'); await expect(page.locator('#nested-index-error')).toHaveText('Server indexed error');
  expect(requests).toHaveLength(1);
  expect((await json(page, 'contract-effects')).nested ?? 0).toBe(before);
  await page.getByRole('button', { name: 'Toggle authoritative errors', exact: true }).click();
  await expect(page.locator('#nested-email-error')).toHaveCount(0); await expect(page.locator('#nested-index-error')).toHaveCount(0);
  expect(await json(page, 'nested-issues')).toHaveLength(2);
  await email.fill('valid@example.com'); await index.fill('valid');
  await positive(page, 'Save nested', 'nested-result', 'nested', { profile: { email: 'valid@example.com' }, items: [{ label: 'valid' }] });
});

test('preflight errors route to nested and leading-zero indexed fields without a POST', async ({ page }) => {
  await setup(page);
  await page.getByLabel('Nested email', { exact: true }).fill('preflight-reject'); await page.getByLabel('Indexed label', { exact: true }).fill('preflight-reject');
  const requests = posts(page);
  await page.getByRole('button', { name: 'Validate preflight', exact: true }).click();
  await expect(page.locator('#nested-email-error')).toHaveText('Preflight email error'); await expect(page.locator('#nested-index-error')).toHaveText('Preflight indexed error');
  expect(requests).toHaveLength(0);
  await page.getByLabel('Indexed label', { exact: true }).fill('valid');
  await expect(page.locator('#nested-index-error')).toHaveCount(0);
  await expect(page.locator('#nested-email-error')).toHaveText('Preflight email error');
});

test('remote.for IDs keep live fields, errors and results isolated', async ({ page }) => {
  await setup(page);
  const first = page.getByLabel('Isolated 0', { exact: true }), second = page.getByLabel('Isolated 1', { exact: true });
  await first.fill('server-reject');
  await page.getByRole('button', { name: 'Save isolated 0', exact: true }).click();
  await expect(page.locator('#isolated-error-0')).toHaveText('Server message error'); await expect(page.locator('#isolated-error-1')).toHaveCount(0);
  await expect(second).toHaveValue('second-seed'); expect(await json(page, 'isolated-result-1')).toBeNull();
  await second.fill('second-valid');
  await positive(page, 'Save isolated 1', 'isolated-result-1', 'isolated', { message: 'second-valid' });
  await expect(first).toHaveValue('server-reject'); await expect(page.locator('#isolated-error-0')).toHaveText('Server message error'); expect(await json(page, 'isolated-result-0')).toBeNull();
});

test('authored native name and ID override keep source errors and programmatic values logical', async ({ page }) => {
  await setup(page);
  const control = page.getByLabel('Manual message', { exact: true });
  await expect(control).toHaveAttribute('id', 'authored-control-id');
  await expect(control).toHaveAttribute('name', 'authored-native-name');
  await expect(control).toHaveAttribute('aria-invalid', 'true');
  await expect(control).toHaveAttribute('aria-describedby', /manual-error/);
  await expect(page.locator('#manual-error')).toHaveText('Manual logical field error');
  await page.getByRole('button', { name: 'Set manual logical value', exact: true }).click();
  await expect(control).toHaveValue('manual-next');
  await expect(page.locator('#manual-error')).toHaveCount(0);
});

test('original enhance preserves query updates, custom JS, pending, result, submitter and reset', async ({ page }) => {
  await setup(page);
  const input = page.getByLabel('Enhanced message', { exact: true }), before = (await json(page, 'contract-effects')).enhanced ?? 0, requests = posts(page);
  await input.fill('enhanced-valid'); await page.getByRole('button', { name: 'Review enhanced', exact: true }).click();
  await expect(page.locator('#enhanced-pending')).toHaveText('1');
  await expect.poll(async () => (await json(page, 'enhanced-result'))?.values).toEqual({ message: 'enhanced-valid', intent: 'review' });
  await expect(page.locator('#enhanced-pending')).toHaveText('0');
  await expect.poll(() => json(page, 'enhancement-events')).toEqual(['caller', 'updated', 'custom-js']);
  await expect.poll(async () => (await json(page, 'contract-effects')).enhanced).toBe(before + 1);
  await expect(input).toHaveValue('enhanced-seed'); expect(requests).toHaveLength(1);
});

test('remote Form supports an actual no-JavaScript submission with the authored submitter', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/remote-api-contracts');
    await page.getByLabel('Enhanced message', { exact: true }).fill('no-js-valid');
    await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Review enhanced', exact: true }).click()]);
    await expect(page.locator('#enhanced-result')).toContainText('"message":"no-js-valid","intent":"review"');
    await expect(page.locator('#enhancement-events')).toHaveText('[]');
  } finally { await context.close(); }
});
