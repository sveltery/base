// Assertion ports from Base UI 47b40521; MIT: parity/progress/UPSTREAM_LICENSE.
// Ordinary declarations, parameterized expansions, conformance and supplements stay separate.
import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/progress?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return page.locator('#tested-progress');
}
async function percent(page: Page, value: number) {
  return page.evaluate(
    (v) => new Intl.NumberFormat(undefined, { style: 'percent' }).format(v),
    value,
  );
}
async function currency(page: Page, value: number, code = 'USD') {
  return page.evaluate(
    ({ v, c }) => new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(v),
    { v: value, c: code },
  );
}
async function lastCall(page: Page, kind: 'aria' | 'value') {
  return page.locator('main').evaluate((node, key) => {
    const probe = node as HTMLElement & {
      progressAriaCalls(): [string, number | null][];
      progressValueCalls(): [string | null, number | null][];
    };
    return (key === 'aria' ? probe.progressAriaCalls() : probe.progressValueCalls()).at(-1);
  }, kind);
}
for (const reference of [false, true]) {
  const framework = reference ? 'React' : 'Svelte';
  test(`Root:32 ${framework} ARIA attributes`, async ({ page }) => {
    const root = await setup(page, 'default', reference);
    await expect(root).toHaveAttribute('aria-valuenow', '30');
    await expect(root).toHaveAttribute('aria-valuemin', '0');
    await expect(root).toHaveAttribute('aria-valuemax', '100');
    await expect(root).toHaveAttribute('aria-valuetext', await percent(page, 0.3));
    expect(await root.getAttribute('aria-labelledby')).toBe(
      await page.getByTestId('label').getAttribute('id'),
    );
  });
  test(`Root:56 ${framework} update aria-valuenow`, async ({ page }) => {
    const root = await setup(page, 'update', reference);
    await page.getByRole('button', { name: 'Set 77', exact: true }).click();
    await expect(root).toHaveAttribute('aria-valuenow', '77');
  });
  test(`Root:65 ${framework} all parts status cycle`, async ({ page }) => {
    const root = await setup(page, 'cycle', reference);
    const parts = [
      root,
      ...['label', 'value', 'track', 'indicator'].map((id) => page.getByTestId(id)),
    ];
    for (const [value, status, text, width] of [
      [null, 'indeterminate', '', ''],
      [50, 'progressing', await percent(page, 0.5), '50%'],
      [100, 'complete', await percent(page, 1), '100%'],
      [null, 'indeterminate', '', ''],
    ] as const) {
      if (value !== null || (await root.getAttribute('data-complete')) !== null)
        await page.getByRole('button', { name: `Set ${value}`, exact: true }).click();
      for (const part of parts)
        for (const attribute of ['indeterminate', 'progressing', 'complete']) {
          if (attribute === status) await expect(part).toHaveAttribute(`data-${attribute}`);
          else await expect(part).not.toHaveAttribute(`data-${attribute}`);
        }
      if (value === null) {
        await expect(root).not.toHaveAttribute('aria-valuenow');
        await expect(root).toHaveAttribute('aria-valuetext', 'indeterminate progress');
      } else await expect(root).toHaveAttribute('aria-valuenow', String(value));
      expect(await page.getByTestId('value').textContent()).toBe(text);
      expect(
        await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width),
      ).toBe(width);
    }
  });
  test(`Root:122 ${framework} normalize custom range`, async ({ page }) => {
    const root = await setup(page, 'custom', reference);
    const expected = await percent(page, 0.5);
    expect(
      await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width),
    ).toBe('50%');
    expect(await page.getByTestId('value').textContent()).toBe(expected);
    await expect(root).toHaveAttribute('aria-valuetext', expected);
  });
  for (const [line, scenario, clamped, attr, fill] of [
    [140, 'over', 40, 'max', '100%'],
    [160, 'under', 20, 'min', '0%'],
  ] as const)
    test(`Root:${line} ${framework} clamp ${scenario}`, async ({ page }) => {
      const root = await setup(page, scenario, reference);
      const expected = await percent(page, scenario === 'over' ? 1 : 0);
      await expect(root).toHaveAttribute('aria-valuenow', String(clamped));
      await expect(root).toHaveAttribute(`aria-value${attr}`, String(clamped));
      await expect(root).toHaveAttribute('aria-valuetext', expected);
      expect(await page.getByTestId('value').textContent()).toBe(expected);
      expect(
        await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width),
      ).toBe(fill);
    });
  test(`Root:215 ${framework} complete above max`, async ({ page }) => {
    const root = await setup(page, 'complete', reference);
    await expect(root).toHaveAttribute('data-complete');
  });
  test(`Root:227 ${framework} equal bounds`, async ({ page }) => {
    const root = await setup(page, 'equal', reference);
    const expected = await percent(page, 0);
    await expect(root).toHaveAttribute('aria-valuenow', '5');
    await expect(root).toHaveAttribute('aria-valuetext', expected);
    expect(await page.getByTestId('value').textContent()).toBe(expected);
    expect(
      await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width),
    ).toBe('0%');
  });
  test(`Root:262 ${framework} aria formatter determinate and null`, async ({ page }) => {
    const root = await setup(page, 'callback', reference);
    const expected = await percent(page, 0.3);
    expect(await lastCall(page, 'aria')).toEqual([expected, 30]);
    await expect(root).toHaveAttribute('aria-valuetext', `${expected} uploaded`);
    expect(await page.getByTestId('value').textContent()).toBe(expected);
    await page.getByRole('button', { name: 'Set null', exact: true }).click();
    expect(await lastCall(page, 'aria')).toEqual(['', null]);
    await expect(root).toHaveAttribute('aria-valuetext', 'Waiting to start');
    expect(await page.getByTestId('value').textContent()).toBe('');
  });
  test(`Root:288 ${framework} currency format`, async ({ page }) => {
    const root = await setup(page, 'currency', reference);
    const expected = await currency(page, 30);
    expect(await page.getByTestId('value').textContent()).toBe(expected);
    await expect(root).toHaveAttribute('aria-valuetext', expected);
  });
  test(`Root:312 ${framework} format change same commit`, async ({ page }) => {
    await setup(page, 'currency', reference);
    expect(await page.getByTestId('value').textContent()).toBe(await currency(page, 30));
    await page.getByRole('button', { name: 'Set EUR', exact: true }).click();
    expect(await page.getByTestId('value').textContent()).toBe(await currency(page, 30, 'EUR'));
  });
  test(`Root:334 ${framework} locale`, async ({ page }) => {
    await setup(page, 'locale', reference);
    await expect(page.getByTestId('value')).toHaveText(
      await page.evaluate(() => new Intl.NumberFormat('de-DE').format(70.51)),
    );
  });
  test(`Indicator:17 ${framework} computed replacement styles`, async ({ page }) => {
    await setup(page, 'determinate', reference);
    const indicator = page.getByTestId('indicator');
    await expect(indicator).toHaveCSS('inset-inline-start', '0px');
    await expect(indicator).toHaveCSS('width', '33%');
    expect(await indicator.evaluate((node: HTMLElement) => node.style.width)).toBe('33%');
    await expect(indicator).toHaveCSS('height', '12px');
  });
  test(`Indicator:34 ${framework} zero computed width`, async ({ page }) => {
    await setup(page, 'zero', reference);
    await expect(page.getByTestId('indicator')).toHaveCSS('inset-inline-start', '0px');
    await expect(page.getByTestId('indicator')).toHaveCSS('width', '0px');
  });
  test(`Indicator:51 ${framework} indeterminate internal styles`, async ({ page }) => {
    await setup(page, 'indeterminate', reference);
    expect(
      await page
        .getByTestId('indicator')
        .evaluate((node: HTMLElement) => [
          node.style.width,
          node.style.height,
          node.style.insetInlineStart,
        ]),
    ).toEqual(['', '', '']);
    await expect(page.getByTestId('indicator')).toHaveCSS('inset-inline-start', 'auto');
  });
  test(`Label:17 ${framework} label association updates and clears`, async ({ page }) => {
    const root = await setup(page, 'labels', reference);
    await expect(root).toHaveAttribute('aria-labelledby', 'label-a');
    await page.getByRole('button', { name: 'Change id', exact: true }).click();
    await expect(root).toHaveAttribute('aria-labelledby', 'label-b');
    await page.getByRole('button', { name: 'Remove label', exact: true }).click();
    await expect(root).not.toHaveAttribute('aria-labelledby');
  });
  test(`Label:49 ${framework} missing context`, async ({ page }) => {
    await setup(page, 'context', reference);
    await expect(page.getByTestId('context-error')).toContainText(
      'Base UI: ProgressRootContext is missing. Progress parts must be placed within <Progress.Root>.',
    );
  });
  test(`Value:17 ${framework} default value`, async ({ page }) => {
    await setup(page, 'default', reference);
    expect(await page.getByTestId('value').textContent()).toBe(await percent(page, 0.3));
  });
  test(`Value:28 ${framework} formatted default value`, async ({ page }) => {
    await setup(page, 'currency', reference);
    expect(await page.getByTestId('value').textContent()).toBe(await currency(page, 30));
  });
  test(`Value:48 ${framework} callback arguments numerical`, async ({ page }) => {
    await setup(page, 'value-callback', reference);
    expect(await page.getByTestId('value').textContent()).toBe(`${await currency(page, 30)}|30`);
    expect(await lastCall(page, 'value')).toEqual([await currency(page, 30), 30]);
  });
  for (const [scenario, raw, clamped] of [
    ['formatted-over', 50, 40],
    ['formatted-under', 10, 20],
  ] as const)
    test(`parameterized Root:180 ${framework} ${raw}`, async ({ page }) => {
      const root = await setup(page, scenario, reference);
      const expected = await currency(page, clamped);
      await expect(root).toHaveAttribute('aria-valuenow', String(clamped));
      await expect(page.getByTestId('value')).toContainText(expected);
      expect(await lastCall(page, 'aria')).toEqual([expected, raw]);
      await expect(root).toHaveAttribute('aria-valuetext', `${expected} (raw: ${raw})`);
    });
  for (const scenario of ['nan', 'infinity', 'negative'])
    test(`parameterized Root:246 ${framework} ${scenario}`, async ({ page }) => {
      const root = await setup(page, scenario, reference);
      await expect(root).toHaveAttribute('data-indeterminate');
      await expect(root).not.toHaveAttribute('aria-valuenow');
      await expect(root).toHaveAttribute('aria-valuetext', 'indeterminate progress');
      expect(await page.getByTestId('value').textContent()).toBe('');
      expect(
        await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width),
      ).toBe('');
    });
  for (const [scenario, raw] of [
    ['value-null', 'null'],
    ['value-nan', 'NaN'],
  ])
    test(`parameterized Value:66 ${framework} ${raw}`, async ({ page }) => {
      await setup(page, scenario, reference);
      expect(await page.getByTestId('value').textContent()).toBe(`indeterminate|${raw}`);
      expect(await lastCall(page, 'value')).toEqual(['indeterminate', raw === 'null' ? null : NaN]);
    });
  test(`supplement ${framework} indeterminate removes all internal styles after determinate`, async ({
    page,
  }) => {
    await setup(page, 'default', reference);
    const indicator = page.getByTestId('indicator');
    await expect(indicator).toHaveCSS('height', '12px');
    await page.getByRole('button', { name: 'Set null', exact: true }).click();
    expect(
      await indicator.evaluate((node: HTMLElement) => [
        node.style.width,
        node.style.height,
        node.style.insetInlineStart,
      ]),
    ).toEqual(['', '', '']);
    await expect(indicator).toHaveCSS('height', '0px');
  });
  test(`supplement ${framework} native overrides and user indicator styles`, async ({ page }) => {
    const root = await setup(page, 'override', reference);
    await expect(root).toHaveAttribute('role', 'meter');
    await expect(root).toHaveAttribute('aria-valuenow', '123');
    await expect(root).toHaveAttribute('aria-valuetext', 'consumer');
    await expect(root).toHaveAttribute('aria-labelledby', 'external');
    await expect(root).toHaveAttribute('data-progressing');
    await expect(root).toHaveAttribute('data-complete', 'consumer');
    await setup(page, 'style-override', reference);
    await expect(page.getByTestId('indicator')).toHaveCSS('width', '7px');
    await page.getByRole('button', { name: 'Set null', exact: true }).click();
    await expect(page.getByTestId('indicator')).toHaveCSS('width', '7px');
    await expect(page.getByTestId('indicator')).toHaveCSS('height', '9px');
    await expect(page.getByTestId('indicator')).toHaveCSS('inset-inline-start', '2px');
  });
  test(`supplement ${framework} replacement Root and Value retain internal children`, async ({
    page,
  }) => {
    const root = await setup(page, 'replacement', reference);
    await expect(root).toHaveJSProperty('tagName', 'SECTION');
    await expect(root.locator(':scope > span[role=presentation]')).toHaveText('x');
    await expect(root.locator(':scope > span[role=presentation]')).toHaveCSS('position', 'fixed');
    await expect(root.locator(':scope > span[role=presentation]')).toHaveCSS('width', '1px');
    expect(await page.getByTestId('value').textContent()).toBe(await percent(page, 0.4));
    await page.getByRole('button', { name: 'Replace host', exact: true }).click();
    await expect(root).toHaveJSProperty('tagName', 'ARTICLE');
    await expect(root.locator(':scope > span[role=presentation]')).toHaveText('x');
    await page.getByRole('button', { name: 'Remove root', exact: true }).click();
    await expect(root).toHaveCount(0);
    await setup(page, 'replacement-callback', reference);
    expect(await page.getByTestId('value').textContent()).toBe(`${await percent(page, 0.4)}|40`);
    expect(await lastCall(page, 'value')).toEqual([await percent(page, 0.4), 40]);
  });
  for (const scenario of ['reversed', 'nan-min', 'nan-max', 'infinite-min', 'infinite-max'])
    test(`supplement ${framework} preserve bound arithmetic ${scenario}`, async ({ page }) => {
      const root = await setup(page, scenario, reference);
      const expected =
        scenario === 'reversed'
          ? { now: '40', fill: '50%', text: await percent(page, 0.5) }
          : scenario.startsWith('nan-')
            ? { now: 'NaN', fill: '0%', text: await percent(page, 0) }
            : { now: '30', fill: '0%', text: await percent(page, 0) };
      await expect(root).toHaveAttribute('aria-valuenow', expected.now);
      await expect(root).toHaveAttribute('data-progressing');
      await expect(root).toHaveAttribute('aria-valuetext', expected.text);
      expect(
        await page.getByTestId('indicator').evaluate((node: HTMLElement) => node.style.width),
      ).toBe(expected.fill);
    });
  for (const part of ['Root', 'Label', 'Track', 'Indicator', 'Value'])
    for (const mode of [
      'default',
      'function',
      'element',
      'style',
      'function-style',
      'element-style',
      'class',
      'wrapper-function',
      'wrapper-element',
      'wrapper-empty',
      'ref-function',
      'refs-element',
      'merged-class',
      'resolved-class',
    ])
      test(`conformance ${framework} ${part} ${mode}`, async ({ page }) => {
        await page.goto(
          `/progress?case=conformance&part=${part}&mode=${mode}${reference ? '&reference' : ''}`,
        );
        await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
        const node = page.getByTestId('conformance');
        await expect(node).toHaveAttribute('lang', 'fr');
        await expect(node).toHaveAttribute('data-foobar', 'foobar');
        if (['style', 'function-style', 'element-style'].includes(mode)) {
          await expect(node).toHaveAttribute('style', /color: green/);
          await expect(node).toHaveCSS('color', 'rgb(0, 128, 0)');
        }
        if (mode !== 'default' && mode !== 'style' && mode !== 'class' && mode !== 'wrapper-empty')
          await expect(node).toHaveAttribute('data-test-value', 'test-value');
        expect(
          await node.evaluate(
            (element) => element instanceof HTMLDivElement || element instanceof HTMLSpanElement,
          ),
        ).toBe(true);
        if (mode.startsWith('wrapper')) await expect(page.getByTestId('wrapper')).toHaveCount(1);
        if (mode === 'class') await expect(node).toHaveClass('test-class');
        if (mode === 'merged-class' || mode === 'resolved-class') {
          await expect(node).toHaveClass(/render-prop-classname/);
          await expect(node).toHaveClass(
            mode === 'resolved-class' ? /conditional-component-classname/ : /component-classname/,
          );
        }
        const tag =
          ['default', 'style', 'class'].includes(mode) && ['Value', 'Label'].includes(part)
            ? 'SPAN'
            : 'DIV';
        if (reference) {
          await expect(node).toHaveAttribute('data-ref', tag);
          await expect(node).toHaveAttribute('data-ref-id', 'conformance');
          if (mode === 'refs-element') {
            await expect(node).toHaveAttribute('data-render-ref', tag);
            await expect(node).toHaveAttribute('data-render-ref-id', 'conformance');
          }
        } else {
          await expect(page.getByTestId('ref')).toHaveText(tag);
          await expect(page.getByTestId('ref-id')).toHaveText('conformance');
          if (mode === 'refs-element') {
            await expect(page.getByTestId('render-ref')).toHaveText(tag);
            await expect(page.getByTestId('render-ref-id')).toHaveText('conformance');
            await expect(page.getByTestId('ref-identity')).toHaveText('true');
          }
        }
      });
}
for (const reference of [false, true])
  test(`supplement ${reference ? 'React' : 'Svelte'} SSR to hydration label registration`, async ({
    page,
    request,
  }) => {
    const url = `/progress-ssr${reference ? '?reference' : ''}`;
    const response = await request.get(url);
    const html = await response.text();
    const rootHtml = html.match(/<div[^>]*id="ssr-progress"[^>]*>/)?.[0];
    expect(rootHtml).toBeTruthy();
    expect(rootHtml).not.toContain('aria-labelledby');
    const labelId = await page.evaluate((markup) => {
      const document = new DOMParser().parseFromString(markup, 'text/html');
      return [...document.querySelectorAll('#ssr-progress span[id]')].find(
        (node) => node.textContent === 'SSR label',
      )?.id;
    }, html);
    expect(labelId).toBeTruthy();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.text().includes('hydration_mismatch'))
        errors.push(message.text());
    });
    await page.goto(url);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await expect(page.locator('#ssr-progress')).toHaveAttribute('aria-labelledby', labelId!);
    await expect(page.getByTestId('ssr-value')).toHaveText(await percent(page, 0.3));
    await expect(page.locator('#ssr-progress > span[role=presentation]').last()).toHaveText('x');
    expect(errors).toEqual([]);
  });
