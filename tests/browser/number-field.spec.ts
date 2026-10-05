// Actual pinned React 19.2.8/Svelte NumberField source-family supplements; zero ordinary credit.
import { expect, test } from '@playwright/test';
test.beforeAll(async ({ browser }) => {
  expect(browser.version()).toMatch(/^153\./);
  console.log(`NumberField secured Chromium ${browser.version()}, workers=1, retries=0`);
});
for (const framework of ['react', 'svelte']) {
  const open = async (page: import('@playwright/test').Page, scenario = 'default') => {
    await page.goto(`/number-field?scenario=${scenario}${framework === 'react' ? '&reference=react' : ''}`);
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    if (framework === 'react') await expect(page.locator('main')).toHaveAttribute('data-renderer', '19.2.8/19.2.8');
  };
  const traces = async (page: import('@playwright/test').Page) => JSON.parse(await page.locator('#number-traces').innerText()) as { kind: string; value: number | null; reason: string }[];
  test(`${framework} source native controls preserve label, logical registry and numeric serialization`, async ({ page }) => {
    await open(page);
    const input = page.getByTestId('visible');
    await expect(input).toHaveAttribute('type', 'text'); await expect(input).toHaveValue('2');
    await expect(input).toHaveAttribute('aria-labelledby', 'amount-label'); await expect(input).toHaveAttribute('aria-describedby', /amount-description/);
    await expect(page.locator('input[type="number"]')).toHaveAttribute('name', 'amount');
    expect(await page.locator('#number-form').evaluate(form => [...new FormData(form as HTMLFormElement)])).toEqual([['amount', '2']]);
    await expect(page.locator('#number-field')).toHaveAttribute('data-filled', '');
    await page.locator('#submit').click(); await expect(page.locator('#number-submissions')).toHaveText('[{"amount":2}]');
  });
  test(`${framework} source dirty text clamps numeric state and blur commits the stored value`, async ({ page }) => {
    await open(page, 'bounds');
    await page.getByTestId('visible').fill('12'); await expect(page.getByTestId('visible')).toHaveValue('12');
    await expect(page.locator('input[type="number"]')).toHaveValue('5');
    await page.locator('#outside').click(); await expect(page.getByTestId('visible')).toHaveValue('5');
    expect((await traces(page)).at(-1)).toMatchObject({ kind: 'commit', value: 5, reason: 'input-blur' });
    await expect(page.locator('#number-field')).toHaveAttribute('data-touched', ''); await expect(page.locator('#number-field')).toHaveAttribute('data-dirty', '');
  });
  test(`${framework} source allowOutOfRange preserves direct entry and still clamps keyboard steps`, async ({ page }) => {
    await open(page, 'outofrange'); await page.getByTestId('visible').fill('12');
    await expect(page.locator('input[type="number"]')).toHaveValue('12');
    expect(await page.locator('input[type="number"]').evaluate(input => (input as HTMLInputElement).validity.rangeOverflow)).toBe(true);
    await page.getByTestId('visible').press('ArrowDown'); await expect(page.getByTestId('visible')).toHaveValue('5');
  });
  test(`${framework} source modifiers, bounds and boundary no-op commit order`, async ({ page }) => {
    await open(page, 'bounds'); const input = page.getByTestId('visible');
    await input.press('Alt+Shift+ArrowUp'); await expect(input).toHaveValue('2.1');
    await input.press('Shift+ArrowUp'); await expect(input).toHaveValue('5');
    const count = (await traces(page)).length; await input.press('ArrowUp'); expect(await traces(page)).toHaveLength(count);
    await input.press('Home'); await expect(input).toHaveValue('0'); await input.press('End'); await expect(input).toHaveValue('5');
  });
  test(`${framework} source cancellation suppresses keyboard changes and commits`, async ({ page }) => {
    await open(page, 'cancel'); await page.getByTestId('visible').press('ArrowUp');
    await expect(page.getByTestId('visible')).toHaveValue('2'); await expect(page.locator('input[type="number"]')).toHaveValue('2');
    expect(await traces(page)).toEqual([{ kind: 'change', value: 3, reason: 'keyboard', direction: 1, type: 'keydown' }]);
  });
  test(`${framework} source controlled owner accepts changes and external replacements`, async ({ page }) => {
    await open(page, 'controlled'); await page.getByTestId('visible').press('ArrowUp'); await expect(page.getByTestId('visible')).toHaveValue('3');
    await page.locator('#owner-update').click(); await expect(page.getByTestId('visible')).toHaveValue('42'); await expect(page.locator('input[type="number"]')).toHaveValue('42');
  });
  test(`${framework} source controlled owner rejects keyboard changes`, async ({ page }) => {
    await open(page, 'controlled-reject'); await page.getByTestId('visible').press('ArrowUp');
    await expect(page.getByTestId('visible')).toHaveValue('2'); await expect(page.locator('input[type="number"]')).toHaveValue('2');
  });
  test(`${framework} source focus/blur and stepping retain precision beyond display rounding`, async ({ page }) => {
    await open(page, 'precision'); const input = page.getByTestId('visible');
    await input.focus(); await page.locator('#outside').click(); await expect(page.locator('input[type="number"]')).toHaveValue('1.23456789');
    await input.press('ArrowUp'); await expect(page.locator('input[type="number"]')).toHaveValue('1.33456789');
    await page.locator('#increase').click(); await expect(page.locator('input[type="number"]')).toHaveValue('1.43456789');
  });
  test(`${framework} source empty negative range seeds the value nearest zero`, async ({ page }) => {
    await open(page, 'empty-negative'); await expect(page.getByTestId('visible')).toHaveValue('');
    await page.getByTestId('visible').press('ArrowUp'); await expect(page.getByTestId('visible')).toHaveValue('-3');
    expect((await traces(page)).at(-1)).toMatchObject({ kind: 'commit', value: -3, reason: 'keyboard' });
  });
  for (const scenario of ['readonly', 'disabled']) test(`${framework} source ${scenario} blocks wheel, pointer and keyboard changes`, async ({ page }) => {
    await open(page, scenario); const input = page.getByTestId('visible');
    if (scenario === 'readonly') { await input.focus(); await input.press('ArrowUp'); }
    await page.locator('#increase').dispatchEvent('click');
    await input.dispatchEvent('wheel', { deltaY: -1, cancelable: true });
    await expect(input).toHaveValue('2'); expect(await traces(page)).toEqual([]);
  });
  test(`${framework} source wheel discrete commits ignore pinch and horizontal gestures`, async ({ page }) => {
    await open(page, 'bounds'); const input = page.getByTestId('visible'); await input.focus();
    await input.dispatchEvent('wheel', { deltaY: -10, ctrlKey: true, cancelable: true }); await input.dispatchEvent('wheel', { deltaY: 1, deltaX: -10, cancelable: true });
    await expect(input).toHaveValue('2');
    await input.dispatchEvent('wheel', { deltaY: -1, cancelable: true }); await expect(input).toHaveValue('3');
    expect((await traces(page)).at(-1)).toMatchObject({ kind: 'commit', value: 3, reason: 'wheel' });
  });
  test(`${framework} source held pointer changes repeat and release commits once`, async ({ page }) => {
    await open(page); const button = page.locator('#increase'); const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await expect(page.getByTestId('visible')).toHaveValue('3');
    await expect.poll(async () => Number(await page.getByTestId('visible').inputValue())).toBeGreaterThan(3);
    await page.mouse.up(); const commits = (await traces(page)).filter(trace => trace.kind === 'commit'); expect(commits).toHaveLength(1); expect(commits[0].reason).toBe('increment-press');
  });
  test(`${framework} source paste splices the selection and restores the caret`, async ({ page }) => {
    await open(page); const input = page.getByTestId('visible'); await input.fill('123');
    await input.evaluate(element => { const input = element as HTMLInputElement; input.setSelectionRange(1, 2); const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: new DataTransfer() }); event.clipboardData!.setData('text/plain', '8'); input.dispatchEvent(event); });
    await expect(input).toHaveValue('183'); expect(await input.evaluate(element => (element as HTMLInputElement).selectionStart)).toBe(2);
    expect((await traces(page)).at(-1)).toMatchObject({ kind: 'change', value: 183, reason: 'input-paste' });
  });
  for (const scenario of ['currency', 'percent']) test(`${framework} source ${scenario} formatted strings parse to numeric submission`, async ({ page }) => {
    await open(page, scenario); const input = page.getByTestId('visible');
    await input.fill(scenario === 'currency' ? '1.234,50 €' : '25%'); await page.locator('#outside').click();
    await expect(page.locator('input[type="number"]')).toHaveValue(scenario === 'currency' ? '1234.5' : '0.25');
  });
  test(`${framework} source required and custom Field validation focus the visible input`, async ({ page }) => {
    await open(page, 'required-empty'); await page.locator('#submit').click();
    await expect(page.locator('#number-field')).toHaveAttribute('data-invalid', ''); await expect(page.getByTestId('visible')).toBeFocused(); await expect(page.locator('#number-submissions')).toHaveText('[]');
    await page.getByTestId('visible').fill('3'); await page.locator('#submit').click(); await expect(page.locator('#number-submissions')).toHaveText('[{"amount":3}]');
    await open(page, 'validation'); await page.getByTestId('visible').fill('7'); await page.locator('#outside').click(); await expect(page.locator('#number-error')).toHaveText('Seven unavailable');
  });
  for (const scenario of ['rounding-blur', 'rounding-blur-controlled', 'rounding-blur-async', 'rounding-blur-async-controlled']) test(`${framework} source ${scenario} preserves settled validity and releases the one-change guard`, async ({ page }) => {
    await open(page, scenario); const input = page.getByTestId('visible');
    await expect(input).toHaveValue('1.23'); await expect(page.locator('input[type="number"]')).toHaveValue('1.234');
    await input.focus(); await page.locator('#outside').click();
    const validity = async () => JSON.parse(await page.locator('#validity').innerText());
    const rejected = { value: 1.23, initialValue: 1.234, state: { valid: false, customError: true }, error: 'Rounded amount rejected', errors: ['Rounded amount rejected'] };
    await expect.poll(validity).toMatchObject(rejected);
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    expect(await validity()).toMatchObject(rejected); await expect(page.locator('input[type="number"]')).toHaveValue('1.23');
    await expect(page.locator('#number-validation-calls')).toHaveText('[{"value":1.23,"values":{"amount":1.234}}]');
    const eventType = framework === 'react' ? 'focusout' : 'blur';
    expect(await traces(page)).toEqual([{ kind: 'change', value: 1.23, reason: 'input-blur', type: eventType }, { kind: 'commit', value: 1.23, reason: 'input-blur', type: eventType }]);
    if (scenario.includes('controlled')) {
      await page.locator('#owner-update').click(); await expect(input).toHaveValue('42');
      await expect.poll(validity).toMatchObject({ value: 42, initialValue: 1.234, state: { valid: true, customError: false }, error: '', errors: [] });
      await expect(page.locator('#number-validation-calls')).toHaveText('[{"value":1.23,"values":{"amount":1.234}}]');
    }
  });
  test(`${framework} source external native form owns the hidden numeric input`, async ({ page }) => {
    await open(page, 'external-form'); expect(await page.locator('#external-number-form').evaluate(form => [...new FormData(form as HTMLFormElement)])).toEqual([['amount', '2']]);
    expect(await page.locator('#number-form').evaluate(form => [...new FormData(form as HTMLFormElement)])).toEqual([]);
  });
  test(`${framework} source replacement hosts preserve numeric state and ref cleanup`, async ({ page }) => {
    await open(page); await page.locator('#replace-input').click(); await expect(page.getByTestId('visible')).toHaveAttribute('data-replacement', 'true');
    await page.getByTestId('visible').press('ArrowUp'); await expect(page.locator('input[type="number"]')).toHaveValue('3');
    await page.locator('#toggle-root').click(); await expect(page.getByTestId('visible')).toHaveCount(0); await expect(page.locator('input[type="number"]')).toHaveCount(0);
    await page.locator('#toggle-root').click(); await expect(page.getByTestId('visible')).toHaveValue('2');
  });
  test(`${framework} source scrub uses actual movement and pointer release commits once`, async ({ page }) => {
    // Denial is a real source branch; it retains scrubbing while suppressing the virtual cursor.
    await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { document.body.requestPointerLock = () => Promise.reject(new Error('Fixture pointer lock denied')); }); });
    await open(page); const scrub = page.getByTestId('scrub');
    await scrub.dispatchEvent('pointerdown', { pointerType: 'mouse', button: 0, clientX: 30, clientY: 30, cancelable: true });
    await expect(page.getByTestId('cursor')).toHaveCount(0);
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointermove', { movementX: 3, movementY: 0, cancelable: true })));
    await expect(page.locator('input[type="number"]')).toHaveValue('5');
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse' })));
    expect((await traces(page)).filter(trace => trace.kind === 'commit')).toEqual([expect.objectContaining({ value: 5, reason: 'scrub' })]);
    await expect(page.locator('#number-field [data-scrubbing]')).toHaveCount(0);
  });
  test(`${framework} native prevented text edits retain each renderer's visible value`, async ({ page }) => {
    await open(page, 'prevent-input'); await page.getByTestId('visible').fill('8');
    await expect(page.locator('input[type="number"]')).toHaveValue('2'); expect(await traces(page)).toEqual([]);
    const observed = await page.getByTestId('visible').inputValue();
    await test.info().attach('native-controlled-text-prevention', { body: JSON.stringify({ framework, visible: observed, numeric: 2 }), contentType: 'application/json' });
    // React restores its controlled value; the native Svelte spread retains the DOM edit.
    expect(observed).toBe(framework === 'react' ? '2' : '8');
  });
  for (const renderMode of ['csr', 'hydrated']) for (const controlled of [false, true]) {
    test(`${framework} literal form-reset defaults ${renderMode} controlled=${controlled}`, async ({ page }) => {
      const hydrationWarnings: string[] = [];
      page.on('console', message => { if (/hydration|mismatch/i.test(message.text())) hydrationWarnings.push(message.text()); });
      await page.goto(`/number-field?scenario=reset${controlled ? '-controlled' : ''}&renderMode=${renderMode}${framework === 'react' ? '&reference=react' : ''}`);
      await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
      const input = page.getByTestId('visible'), numeric = page.locator('input[type="number"]');
      await expect(input).toHaveValue('2'); await expect(numeric).toHaveValue('2');
      await input.press('ArrowUp'); await expect(input).toHaveValue('3'); await expect(numeric).toHaveValue('3');
      const before = await traces(page);
      const read = () => page.locator('#number-form').evaluate(form => {
        const visible = form.querySelector<HTMLInputElement>('input[type="text"]')!, numeric = form.querySelector<HTMLInputElement>('input[type="number"]')!;
        return { visible: visible.value, numeric: numeric.value, visibleDefault: visible.defaultValue, numericDefault: numeric.defaultValue, serialized: new FormData(form as HTMLFormElement).get('amount') };
      });
      const stepped = await read();
      await page.locator('#number-form').evaluate(form => (form as HTMLFormElement).reset());
      const expected = framework === 'react' ? '3' : '';
      await expect(input).toHaveValue(expected); await expect(numeric).toHaveValue(expected);
      const reset = await read(); expect(reset).toEqual({ visible: expected, numeric: expected, visibleDefault: expected, numericDefault: expected, serialized: expected });
      expect(await traces(page)).toEqual(before);
      await input.press('ArrowUp'); await expect(input).toHaveValue('4'); await expect(numeric).toHaveValue('4');
      expect((await traces(page)).at(-1)).toMatchObject({ kind: 'commit', value: 4, reason: 'keyboard' });
      expect(hydrationWarnings).toEqual([]);
      await test.info().attach('native-form-reset-defaults', { body: JSON.stringify({ framework, renderMode, controlled, stepped, reset, nextStep: await read(), storedNumericAfterReset: 3, resetChangeCommitCalls: 0 }), contentType: 'application/json' });
    });
  }
}
test('Svelte native SSR hydration retains value, labels, IDs and emits no hydration warning', async ({ page }) => {
  const warnings: string[] = []; page.on('console', message => { if (/hydration|mismatch/i.test(message.text())) warnings.push(message.text()); });
  await page.goto('/number-field?scenario=precision'); await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  await expect(page.getByTestId('visible')).toHaveValue('1.235'); await expect(page.getByTestId('visible')).toHaveAttribute('aria-labelledby', 'amount-label');
  await expect(page.locator('input[type="number"]')).toHaveValue('1.23456789'); expect(warnings).toEqual([]);
});
test('Svelte actual Kit typed Form namespace composes authored source NumberField with native descriptor names and owner values', async ({ page }) => {
  await page.goto('/number-field-remote'); await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  const input = page.getByTestId('remote-number-visible');
  await expect(input).toHaveValue('2'); await expect(input).toHaveAttribute('aria-labelledby', 'remote-number-label');
  const serialized = await page.locator('#remote-number-form').evaluate(form => [...new FormData(form as HTMLFormElement)]);
  expect(serialized).toEqual([['n:amount', '2']]);
  await input.press('ArrowUp'); await expect(page.locator('#remote-number-values')).toHaveText('{"amount":3}');
  await page.locator('#remote-number-owner').click(); await expect(input).toHaveValue('4');
  await page.locator('#remote-number-submit').click(); await expect(page.locator('#remote-number-result')).toContainText('"amount":4');
  await expect(page.locator('#remote-number-enhancements')).toHaveText('["caller","settled"]');
});
test('Svelte actual Kit invalid and canceled source submissions emit zero POSTs and a later valid submit emits one', async ({ page }) => {
  let posts = 0; page.on('request', request => { if (request.method() === 'POST') posts += 1; });
  await page.goto('/number-field-remote'); await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  const input = page.getByTestId('remote-number-visible'); await input.fill('7');
  await page.locator('#remote-number-submit').click(); await expect(page.locator('#remote-number-error')).toHaveText('Seven unavailable locally'); expect(posts).toBe(0);
  await input.fill('5'); await page.locator('#remote-number-cancel-submit').click(); await page.locator('#remote-number-submit').click();
  await expect(page.locator('#remote-number-enhancements')).toHaveText('[]'); expect(posts).toBe(0);
  await page.locator('#remote-number-cancel-submit').click(); await page.locator('#remote-number-submit').click();
  await expect(page.locator('#remote-number-result')).toContainText('"amount":5'); expect(posts).toBe(1);
});
test('Svelte actual Kit source change cancellation retains owner and live server issues remain Field-owned', async ({ page }) => {
  await page.goto('/number-field-remote'); await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  const input = page.getByTestId('remote-number-visible');
  await page.locator('#remote-number-cancel-change').click(); await input.press('ArrowUp');
  await expect(input).toHaveValue('2'); await expect(page.locator('#remote-number-values')).toHaveText('{"amount":2}');
  await page.locator('#remote-number-cancel-change').click(); await input.fill('9'); await page.locator('#remote-number-submit').click();
  await expect(page.locator('#remote-number-error')).toHaveText('Server amount unavailable');
  await input.fill('4'); await page.locator('#remote-number-submit').click(); await expect(page.locator('#remote-number-result')).toContainText('"amount":4');
});
