// Assertion ports from Base UI 47b40521; MIT: parity/meter/UPSTREAM_LICENSE.
// 22 ordinary declarations; four parameterized variants, conformance and supplements are separate.
import { expect, test, type Page, type Locator } from '@playwright/test';
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/meter?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return page.locator('#tested-meter');
}
async function percent(page: Page, value: number, locale?: string) { return page.evaluate(({ value, locale }) => new Intl.NumberFormat(locale, { style: 'percent' }).format(value), { value, locale }); }
async function currency(page: Page, value: number, code = 'USD', locale?: string) { return page.evaluate(({ value, code, locale }) => new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(value), { value, code, locale }); }
async function lastCall(page: Page, kind: 'aria' | 'value') {
  return page.locator('main').evaluate((node, key) => {
    const probe = node as HTMLElement & { meterAriaCalls(): [string, number][]; meterValueCalls(): [string, number][] };
    return (key === 'aria' ? probe.meterAriaCalls() : probe.meterValueCalls()).at(-1);
  }, kind);
}
async function textAndFill(page: Page, root: Locator, text: string, fill: string) {
  await expect(root).toHaveAttribute('aria-valuetext', text);
  expect(await page.getByTestId('value').textContent()).toBe(text);
  expect(await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width)).toBe(fill);
}
for (const reference of [false, true]) {
  const framework = reference ? 'React' : 'Svelte';
  test(`Root:19 ${framework} ARIA attributes`, async ({ page }) => {
    const root = await setup(page, 'default', reference);
    await expect(root).toHaveAttribute('aria-valuenow', '30'); await expect(root).toHaveAttribute('aria-valuemin', '0'); await expect(root).toHaveAttribute('aria-valuemax', '100');
    await expect(root).toHaveAttribute('aria-valuetext', await percent(page, .3));
    expect(await root.getAttribute('aria-labelledby')).toBe(await page.getByTestId('label').getAttribute('id'));
  });
  test(`Root:40 ${framework} localized aria and visible text match`, async ({ page }) => {
    const root = await setup(page, 'de-percent', reference); await expect(root).toHaveAttribute('aria-valuetext', await percent(page, .3, 'de-DE'));
    expect(await root.getAttribute('aria-valuetext')).toBe(await page.getByTestId('value').textContent());
  });
  test(`Root:56 ${framework} default rounding matches visible text`, async ({ page }) => {
    const root = await setup(page, 'rounded', reference); await expect(root).toHaveAttribute('aria-valuetext', await percent(page, .33333));
    expect(await root.getAttribute('aria-valuetext')).toBe(await page.getByTestId('value').textContent());
  });
  test(`Root:70 ${framework} value update refreshes all outputs`, async ({ page }) => {
    const root = await setup(page, 'update', reference); await expect(root).toHaveAttribute('aria-valuenow', '50'); await textAndFill(page, root, await percent(page, .5), '50%');
    await page.getByRole('button', { name: 'Set 77', exact: true }).click(); await expect(root).toHaveAttribute('aria-valuenow', '77'); await textAndFill(page, root, await percent(page, .77), '77%');
  });
  test(`Root:101 ${framework} aria callback raw arguments and spoken-only result`, async ({ page }) => {
    const root = await setup(page, 'callback', reference); const expected = await percent(page, .3);
    expect(await lastCall(page, 'aria')).toEqual([expected, 30]); await expect(root).toHaveAttribute('aria-valuetext', `30 of 100 (${expected})`); expect(await page.getByTestId('value').textContent()).toBe(expected);
  });
  test(`Root:122 ${framework} custom range position and indicator`, async ({ page }) => {
    const root = await setup(page, 'custom', reference); await expect(root).toHaveAttribute('aria-valuenow', '0.5'); await textAndFill(page, root, await percent(page, .5), '50%');
  });
  test(`Root:141 ${framework} nonzero minimum formatting`, async ({ page }) => {
    const root = await setup(page, 'nonzero', reference); const expected = await percent(page, .5); await expect(root).toHaveAttribute('aria-valuetext', expected); expect(await page.getByTestId('value').textContent()).toBe(expected);
  });
  test(`Root:154 ${framework} rerender synchronizes bounds value text and indicator`, async ({ page }) => {
    const root = await setup(page, 'range-update', reference);
    await expect(root).toHaveAttribute('aria-valuemin', '10'); await expect(root).toHaveAttribute('aria-valuemax', '30'); await expect(root).toHaveAttribute('aria-valuenow', '20'); await textAndFill(page, root, await percent(page, .5), '50%');
    await page.getByRole('button', { name: 'Update range', exact: true }).click();
    await expect(root).toHaveAttribute('aria-valuemin', '20'); await expect(root).toHaveAttribute('aria-valuemax', '60'); await expect(root).toHaveAttribute('aria-valuenow', '50'); await textAndFill(page, root, await percent(page, .75), '75%');
  });
  test(`Root:226 ${framework} currency formatting`, async ({ page }) => {
    const root = await setup(page, 'currency', reference); const expected = await currency(page, 30); expect(await page.getByTestId('value').textContent()).toBe(expected); await expect(root).toHaveAttribute('aria-valuetext', expected);
  });
  test(`Root:250 ${framework} currency clamps text range and fill but preserves raw callback`, async ({ page }) => {
    const root = await setup(page, 'formatted-over', reference); const expected = await currency(page, 100);
    expect(await page.getByTestId('value').textContent()).toBe(expected); await expect(root).toHaveAttribute('aria-valuenow', '100'); expect(await lastCall(page, 'aria')).toEqual([expected, 150]);
    await expect(root).toHaveAttribute('aria-valuetext', `${expected} (raw: 150)`); expect(await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width)).toBe('100%');
  });
  test(`Root:279 ${framework} explicit decimal locale`, async ({ page }) => {
    await setup(page, 'locale', reference); expect(await page.getByTestId('value').textContent()).toBe(await page.evaluate(() => new Intl.NumberFormat('de-DE').format(86.49)));
  });
  test(`Indicator:17 ${framework} above maximum fill`, async ({ page }) => { await setup(page, 'over', reference); expect(await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width)).toBe('100%'); });
  test(`Indicator:29 ${framework} below minimum fill`, async ({ page }) => { await setup(page, 'under', reference); expect(await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width)).toBe('0%'); });
  test(`Indicator:41 ${framework} equal bounds finite fill`, async ({ page }) => { await setup(page, 'equal', reference); expect(await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width)).toBe('0%'); });
  test(`Indicator:55 ${framework} computed positioning styles`, async ({ page }) => {
    await setup(page, 'determinate', reference); await expect(page.getByTestId('indicator')).toHaveCSS('left', '0px'); await expect(page.getByTestId('indicator')).toHaveCSS('width', '33px');
  });
  test(`Indicator:72 ${framework} computed zero width`, async ({ page }) => {
    await setup(page, 'zero', reference); await expect(page.getByTestId('indicator')).toHaveCSS('inset-inline-start', '0px'); await expect(page.getByTestId('indicator')).toHaveCSS('width', '0px');
  });
  test(`Label:17 ${framework} label association updates and clears`, async ({ page }) => {
    const root = await setup(page, 'labels', reference); await expect(root).toHaveAttribute('aria-labelledby', 'label-a');
    await page.getByRole('button', { name: 'Change id', exact: true }).click(); await expect(root).toHaveAttribute('aria-labelledby', 'label-b');
    await page.getByRole('button', { name: 'Remove label', exact: true }).click(); await expect(root).not.toHaveAttribute('aria-labelledby');
  });
  test(`Label:49 ${framework} missing context descriptive error`, async ({ page }) => { await setup(page, 'context', reference); await expect(page.getByTestId('context-error')).toHaveText('Base UI: MeterRootContext is missing. Meter parts must be placed within <Meter.Root>.'); });
  test(`Value:17 ${framework} default visible value`, async ({ page }) => { await setup(page, 'default', reference); expect(await page.getByTestId('value').textContent()).toBe(await percent(page, .3)); });
  test(`Value:28 ${framework} formatted visible value`, async ({ page }) => { await setup(page, 'currency', reference); expect(await page.getByTestId('value').textContent()).toBe(await currency(page, 30)); });
  test(`Value:47 ${framework} children callback formatted and raw arguments`, async ({ page }) => { await setup(page, 'value-callback', reference); const args = await lastCall(page, 'value'); expect(args?.[0]).toEqual(await currency(page, 30)); expect(args?.[1]).toEqual(30); });
  test(`Value:65 ${framework} callback arguments refresh after value change`, async ({ page }) => {
    await setup(page, 'value-update', reference); let args = await lastCall(page, 'value'); expect(args?.[0]).toEqual(await percent(page, .3)); expect(args?.[1]).toEqual(30);
    await page.getByRole('button', { name: 'Set 60', exact: true }).click(); args = await lastCall(page, 'value'); expect(args?.[0]).toEqual(await percent(page, .6)); expect(args?.[1]).toEqual(60);
  });
  for (const [scenario, now, normalized] of [['over', '100', 1], ['under', '0', 0], ['equal', '5', 0], ['nan', '0', 0]] as const) test(`parameterized Root:188 ${framework} ${scenario}`, async ({ page }) => {
    const root = await setup(page, scenario, reference); await expect(root).toHaveAttribute('aria-valuenow', now); await expect(root).toHaveAttribute('aria-valuetext', await percent(page, normalized));
  });
  test(`supplement ${framework} label generated id remount and presentation semantics`, async ({ page }) => {
    const root = await setup(page, 'labels', reference); await expect(page.getByTestId('label')).toHaveAttribute('role', 'presentation');
    await page.getByRole('button', { name: 'Generate id', exact: true }).click(); const id = await page.getByTestId('label').getAttribute('id'); expect(id).toMatch(/^base-ui-/); await expect(root).toHaveAttribute('aria-labelledby', id!);
    await page.getByRole('button', { name: 'Remove label', exact: true }).click(); await expect(root).not.toHaveAttribute('aria-labelledby');
    await page.getByRole('button', { name: 'Remount label', exact: true }).click(); const remountId = await page.getByTestId('label').getAttribute('id'); expect(remountId).toMatch(/^base-ui-/); expect(remountId).not.toBe(id); await expect(root).toHaveAttribute('aria-labelledby', remountId!);
  });
  test(`supplement ${framework} nonfinite transitions preserve raw callback numbers`, async ({ page }) => {
    const root = await setup(page, 'raw-callback', reference);
    for (const [button, raw, clamped, fill] of [[null, 150, 100, '100%'], ['Set NaN', NaN, 0, '0%'], ['Set Infinity', Infinity, 100, '100%'], ['Set -Infinity', -Infinity, 0, '0%'], ['Set 77', 77, 77, '77%']] as const) {
      if (button) await page.getByRole('button', { name: button, exact: true }).click(); const text = await currency(page, clamped);
      expect(await lastCall(page, 'aria')).toEqual([text, raw]); expect(await lastCall(page, 'value')).toEqual([text, raw]); await expect(root).toHaveAttribute('aria-valuenow', String(clamped));
      await expect(root).toHaveAttribute('aria-valuetext', `${text} (raw: ${raw})`); expect(await page.getByTestId('value').textContent()).toBe(`${text}|${raw}`); expect(await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width)).toBe(fill);
    }
  });
  test(`supplement ${framework} locale and format transitions synchronize`, async ({ page }) => {
    const root = await setup(page, 'currency', reference); await textAndFill(page, root, await currency(page, 30), '30%');
    await page.getByRole('button', { name: 'Set EUR', exact: true }).click(); await textAndFill(page, root, await currency(page, 30, 'EUR'), '30%');
    await page.getByRole('button', { name: 'Set German', exact: true }).click(); await textAndFill(page, root, await currency(page, 30, 'EUR', 'de-DE'), '30%');
    await page.getByRole('button', { name: 'Clear format', exact: true }).click(); await textAndFill(page, root, await percent(page, .3, 'de-DE'), '30%');
  });
  test(`supplement ${framework} bound transitions retain pinned arithmetic`, async ({ page }) => {
    const root = await setup(page, 'default', reference);
    for (const [button, min, max, now, normalized, fill] of [['Reverse bounds', '40', '20', '40', .5, '50%'], ['NaN min', 'NaN', '100', 'NaN', 0, '0%'], ['Infinite max', '0', 'Infinity', '30', 0, '0%'], ['NaN custom range', '20', '40', '20', 0, '0%']] as const) {
      await page.getByRole('button', { name: button, exact: true }).click(); await expect(root).toHaveAttribute('aria-valuemin', min); await expect(root).toHaveAttribute('aria-valuemax', max); await expect(root).toHaveAttribute('aria-valuenow', now); await textAndFill(page, root, await percent(page, normalized), fill);
    }
  });
  test(`supplement ${framework} nested labels and older-label cleanup preserve ownership`, async ({ page }) => {
    await setup(page, 'nested', reference); const outer = page.locator('#outer'), inner = page.locator('#inner');
    await expect(outer).toHaveAttribute('aria-labelledby', 'second'); await expect(inner).toHaveAttribute('aria-labelledby', 'inner-label');
    await expect(page.locator('#outer-value')).toHaveText(await percent(page, .5)); await expect(page.locator('#inner-value')).toHaveText(await percent(page, 1));
    await page.getByRole('button', { name: 'Remove first', exact: true }).click(); await expect(outer).toHaveAttribute('aria-labelledby', 'second'); await expect(inner).toHaveAttribute('aria-labelledby', 'inner-label');
    await page.getByRole('button', { name: 'Generate second id', exact: true }).click(); const id = await page.getByTestId('second-label').getAttribute('id'); expect(id).toMatch(/^base-ui-/); await expect(outer).toHaveAttribute('aria-labelledby', id!);
    await page.getByRole('button', { name: 'Set NaN', exact: true }).click(); await expect(outer).toHaveAttribute('aria-valuenow', '0'); await expect(page.locator('#outer-value')).toHaveText(await percent(page, 0)); await expect(inner).toHaveAttribute('aria-valuenow', '100'); await expect(page.locator('#inner-value')).toHaveText(await percent(page, 1));
  });
  test(`supplement ${framework} indicator replacement retains computed inherited styles`, async ({ page }) => {
    await setup(page, 'replacement-indicator', reference); const indicator = page.getByTestId('indicator'); await expect(indicator).toHaveJSProperty('tagName', 'SPAN'); await expect(indicator).toHaveCSS('width', '99px'); await expect(indicator).toHaveCSS('height', '12px'); await expect(indicator).toHaveCSS('inset-inline-start', '0px');
    await page.getByRole('button', { name: 'Set NaN', exact: true }).click(); await expect(indicator).toHaveCSS('width', '0px'); await expect(indicator).toHaveCSS('height', '12px');
  });
  test(`supplement ${framework} rightmost native and indicator style overrides`, async ({ page }) => {
    const root = await setup(page, 'override', reference); await expect(root).toHaveAttribute('role', 'progressbar'); await expect(root).toHaveAttribute('aria-valuenow', '123'); await expect(root).toHaveAttribute('aria-valuetext', 'consumer'); await expect(root).toHaveAttribute('aria-labelledby', 'external');
    await setup(page, 'style-override', reference); const indicator = page.getByTestId('indicator');
    await expect(indicator).toHaveCSS('width', '7px'); await expect(indicator).toHaveCSS('height', '9px'); await expect(indicator).toHaveCSS('inset-inline-start', '2px');
    await page.getByRole('button', { name: 'Set NaN', exact: true }).click(); await expect(indicator).toHaveCSS('width', '7px'); await expect(indicator).toHaveCSS('height', '9px'); await expect(indicator).toHaveCSS('inset-inline-start', '2px');
  });
  test(`supplement ${framework} replacement hosts retain children empty state refs and cleanup`, async ({ page }) => {
    const root = await setup(page, 'replacement', reference); await expect(root).toHaveJSProperty('tagName', 'SECTION');
    const hidden = root.locator(':scope > span[role=presentation]'); await expect(hidden).toHaveText('x');
    for (const [property, value] of [['position', 'fixed'], ['top', '0px'], ['left', '0px'], ['clip-path', 'inset(50%)'], ['overflow', 'hidden'], ['white-space', 'nowrap'], ['border-top-width', '0px'], ['padding', '0px'], ['width', '1px'], ['height', '1px'], ['margin', '-1px']] as const) await expect(hidden).toHaveCSS(property, value);
    expect(await page.getByTestId('value').textContent()).toBe(await percent(page, .4)); await expect(page.getByTestId('value')).toHaveAttribute('aria-hidden', 'true');
    for (const part of [root, ...['label', 'track', 'indicator', 'value'].map(id => page.getByTestId(id))]) await expect(part).toHaveAttribute('data-render-state', '{}');
    await expect(page.getByTestId('indicator')).toHaveCSS('height', '12px');
    expect(await page.locator('main').evaluate(node => (node as HTMLElement & { meterRefs(): HTMLElement[] }).meterRefs().map(el => [el.tagName, el.isConnected]))).toEqual(Array.from({ length: 5 }, () => ['SECTION', true]));
    await page.locator('main').evaluate(node => { const probe = node as HTMLElement & { meterRefs(): HTMLElement[]; meterOldRefs?: HTMLElement[] }; probe.meterOldRefs = probe.meterRefs(); });
    await page.getByRole('button', { name: 'Replace host', exact: true }).click(); await expect(root).toHaveJSProperty('tagName', 'ARTICLE'); await expect(root.locator(':scope > span[role=presentation]')).toHaveText('x');
    expect(await page.locator('main').evaluate(node => (node as HTMLElement & { meterRefs(): HTMLElement[] }).meterRefs().map(el => [el.tagName, el.isConnected]))).toEqual(Array.from({ length: 5 }, () => ['ARTICLE', true]));
    expect(await page.locator('main').evaluate(node => (node as HTMLElement & { meterOldRefs: HTMLElement[] }).meterOldRefs.map(el => el.isConnected))).toEqual([false, false, false, false, false]);
    await page.getByRole('button', { name: 'Remove root', exact: true }).click(); await expect(root).toHaveCount(0); expect(await page.locator('main').evaluate(node => (node as HTMLElement & { meterRefs(): (HTMLElement | null)[] }).meterRefs())).toEqual([null, null, null, null, null]);
    await setup(page, 'replacement-callback', reference); expect(await page.getByTestId('value').textContent()).toBe(`${await percent(page, .4)}|40`); expect(await lastCall(page, 'value')).toEqual([await percent(page, .4), 40]);
  });
  for (const scenario of ['reversed', 'nan-min', 'nan-max', 'infinite-min', 'infinite-max', 'nan-custom']) test(`supplement ${framework} preserve bound arithmetic ${scenario}`, async ({ page }) => {
    const root = await setup(page, scenario, reference);
    const expected = scenario === 'reversed' ? { now: '40', fill: '50%', normalized: .5 } : scenario === 'nan-custom' ? { now: '20', fill: '0%', normalized: 0 } : scenario.startsWith('nan-') ? { now: 'NaN', fill: '0%', normalized: 0 } : { now: '30', fill: '0%', normalized: 0 };
    await expect(root).toHaveAttribute('aria-valuenow', expected.now); await textAndFill(page, root, await percent(page, expected.normalized), expected.fill);
  });
  for (const part of ['Root', 'Label', 'Track', 'Indicator', 'Value']) for (const mode of ['default', 'function', 'element', 'style', 'function-style', 'element-style', 'class', 'wrapper-function', 'wrapper-element', 'wrapper-empty', 'ref-function', 'refs-element', 'merged-class', 'resolved-class']) test(`conformance ${framework} ${part} ${mode}`, async ({ page }) => {
    await page.goto(`/meter?case=conformance&part=${part}&mode=${mode}${reference ? '&reference' : ''}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const node = page.getByTestId('conformance'); await expect(node).toHaveAttribute('lang', 'fr'); await expect(node).toHaveAttribute('data-foobar', 'foobar');
    if (['style', 'function-style', 'element-style'].includes(mode)) { await expect(node).toHaveAttribute('style', /color: green/); await expect(node).toHaveCSS('color', 'rgb(0, 128, 0)'); }
    if (!['default', 'style', 'class', 'wrapper-empty'].includes(mode)) await expect(node).toHaveAttribute('data-test-value', 'test-value');
    expect(await node.evaluate(element => element instanceof HTMLDivElement || element instanceof HTMLSpanElement)).toBe(true);
    if (mode.startsWith('wrapper')) await expect(page.getByTestId('wrapper')).toHaveCount(1);
    if (mode === 'class') await expect(node).toHaveClass('test-class');
    if (mode === 'merged-class' || mode === 'resolved-class') { await expect(node).toHaveClass(/render-prop-classname/); await expect(node).toHaveClass(mode === 'resolved-class' ? /conditional-component-classname/ : /component-classname/); }
    const tag = ['default', 'style', 'class'].includes(mode) && ['Value', 'Label'].includes(part) ? 'SPAN' : 'DIV';
    if (reference) { await expect(node).toHaveAttribute('data-ref', tag); await expect(node).toHaveAttribute('data-ref-id', 'conformance'); if (mode === 'refs-element') { await expect(node).toHaveAttribute('data-render-ref', tag); await expect(node).toHaveAttribute('data-render-ref-id', 'conformance'); } }
    else { await expect(page.getByTestId('ref')).toHaveText(tag); await expect(page.getByTestId('ref-id')).toHaveText('conformance'); if (mode === 'refs-element') { await expect(page.getByTestId('render-ref')).toHaveText(tag); await expect(page.getByTestId('render-ref-id')).toHaveText('conformance'); await expect(page.getByTestId('ref-identity')).toHaveText('true'); } }
  });
}
for (const reference of [false, true]) test(`supplement ${reference ? 'React' : 'Svelte'} SSR hydration registers stable label`, async ({ page, request }) => {
  const url = `/meter-ssr${reference ? '?reference' : ''}`; const response = await request.get(url); const html = await response.text();
  const rootHtml = html.match(/<div[^>]*id="ssr-meter"[^>]*>/)?.[0]; expect(rootHtml).toBeTruthy(); expect(rootHtml).not.toContain('aria-labelledby');
  const labelId = await page.evaluate(markup => { const document = new DOMParser().parseFromString(markup, 'text/html'); return [...document.querySelectorAll('#ssr-meter span[id]')].find(node => node.textContent === 'SSR label')?.id; }, html); expect(labelId).toBeTruthy();
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error' || message.text().includes('hydration_mismatch')) errors.push(message.text()); });
  await page.goto(url); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); await expect(page.locator('#ssr-meter')).toHaveAttribute('aria-labelledby', labelId!);
  await expect(page.getByTestId('ssr-value')).toHaveText(await percent(page, .3)); await expect(page.locator('#ssr-meter > span[role=presentation]').last()).toHaveText('x'); expect(errors).toEqual([]);
});
