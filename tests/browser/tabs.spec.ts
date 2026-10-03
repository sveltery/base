// Actual pinned Source/native paired Tabs predicates and separate supplements. MIT.
import { expect, test, type Page } from '@playwright/test';
const calls = async (page: Page) =>
  JSON.parse(await page.locator('#calls').innerText()) as Array<{
    value: unknown;
    reason: string;
    direction: string;
    type: string;
    canceled: boolean;
  }>;
const open = async (page: Page, framework: string, scenario = 'default') => {
  await page.goto(
    `/tabs?scenario=${scenario}${framework === 'react' ? '&reference=react' : ''}`,
  );
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  if (framework === 'react')
    await expect(page.locator('main')).toHaveAttribute(
      'data-renderer',
      '19.2.8/19.2.8',
    );
};
const selected = (page: Page) => page.locator('[role=tab][aria-selected=true]');
async function observeParser(page: Page) {
  await page.addInitScript(() => {
    const descriptor = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'currentScript',
    )!;
    const observations = { executions: 0, nonce: [] as string[] };
    Object.assign(window, { tabsParser: observations });
    Object.defineProperty(Document.prototype, 'currentScript', {
      ...descriptor,
      get() {
        const script = descriptor.get!.call(this) as HTMLScriptElement | null;
        if (
          script?.textContent?.includes('--active-tab-') &&
          script.textContent.includes('previousElementSibling')
        ) {
          observations.executions += 1;
          observations.nonce.push(script.nonce);
        }
        return script;
      },
    });
  });
}
async function geometry(page: Page) {
  return page.getByTestId('indicator').evaluate((element) => {
    const style = (element as HTMLElement).style;
    return Object.fromEntries(
      ['left', 'right', 'top', 'bottom', 'width', 'height'].map((key) => [
        key,
        Number.parseFloat(style.getPropertyValue(`--active-tab-${key}`)),
      ]),
    );
  });
}
for (const framework of ['react', 'svelte']) {
  for (const [scenario, expected, reason] of [
    ['default', 0, null],
    ['selected-last', 2, null],
    ['implicit', 0, 'initial'],
    ['implicit-disabled-first', 1, 'initial'],
    ['disabled-first', 0, null],
    ['implicit-missing', 0, 'initial'],
    ['missing', 0, 'missing'],
    ['all-disabled', null, 'initial'],
    ['null', null, null],
    ['controlled-disabled-first', 0, null],
    ['controlled-missing', null, null],
  ] as const) {
    test(`${framework} Source initial/default/disabled/missing selection ${scenario}`, async ({
      page,
    }) => {
      await open(page, framework, scenario);
      if (expected === null) await expect(selected(page)).toHaveCount(0);
      else
        await expect(selected(page)).toHaveAttribute(
          'data-testid',
          `tab-${expected}`,
        );
      const log = await calls(page);
      expect(log.map((entry) => entry.reason)).toEqual(
        reason === null ? [] : [reason],
      );
      if (reason !== null)
        expect(log[0]).toMatchObject({
          value: expected,
          direction: 'none',
          type: 'base-ui',
        });
    });
  }
  test(`${framework} Source associations follow mounted panels, selected tab and panel index`, async ({
    page,
  }) => {
    await open(page, framework);
    const first = page.getByTestId('panel-0');
    await expect(first).toHaveAttribute('aria-labelledby', 'tab-0');
    await expect(page.getByTestId('tab-0')).toHaveAttribute(
      'aria-controls',
      (await first.getAttribute('id')) as string,
    );
    await expect(first).toHaveAttribute('data-index', '0');
    await page.getByTestId('tab-1').click();
    await expect(first).toHaveCount(0);
    await expect(page.getByTestId('tab-0')).not.toHaveAttribute(
      'aria-controls',
    );
    await expect(page.getByTestId('panel-1')).toHaveAttribute(
      'aria-labelledby',
      'tab-1',
    );
    await expect(page.getByTestId('tab-1')).toHaveAttribute(
      'aria-controls',
      (await page.getByTestId('panel-1').getAttribute('id')) as string,
    );
  });
  for (const scenario of ['default', 'custom', 'rtl', 'vertical']) {
    test(`${framework} Source manual navigation, Home/End and Space activation ${scenario}`, async ({
      page,
    }) => {
      await open(page, framework, scenario);
      await page.getByTestId('tab-0').focus();
      const forward =
        scenario === 'vertical'
          ? 'ArrowDown'
          : scenario === 'rtl'
            ? 'ArrowLeft'
            : 'ArrowRight';
      await page.getByTestId('tab-0').press(forward);
      await expect(page.getByTestId('tab-1')).toBeFocused();
      await expect(selected(page)).toHaveAttribute('data-testid', 'tab-0');
      await page.getByTestId('tab-1').press(' ');
      await expect(selected(page)).toHaveAttribute('data-testid', 'tab-1');
      await page.getByTestId('tab-1').press('End');
      await expect(page.getByTestId('tab-2')).toBeFocused();
      await page.getByTestId('tab-2').press('Enter');
      await expect(selected(page)).toHaveAttribute('data-testid', 'tab-2');
      await page.getByTestId('tab-2').press(forward);
      await expect(page.getByTestId('tab-0')).toBeFocused();
      await page.getByTestId('tab-0').press('End');
      await page.getByTestId('tab-2').press('Home');
      await expect(page.getByTestId('tab-0')).toBeFocused();
      expect((await calls(page)).map((entry) => entry.value)).toEqual([1, 2]);
    });
  }
  test(`${framework} Source no-loop boundaries and modifier/cross-axis keys retain focus`, async ({
    page,
  }) => {
    await open(page, framework, 'no-loop');
    await page.getByTestId('tab-0').focus();
    for (const key of ['ArrowLeft', 'Shift+ArrowRight', 'ArrowDown']) {
      await page.getByTestId('tab-0').press(key);
      await expect(page.getByTestId('tab-0')).toBeFocused();
    }
    await page.getByTestId('tab-0').press('End');
    await page.getByTestId('tab-2').press('ArrowRight');
    await expect(page.getByTestId('tab-2')).toBeFocused();
    expect(await calls(page)).toEqual([]);
  });
  test(`${framework} Source disabled Tab is focusable through navigation and cannot activate`, async ({
    page,
  }) => {
    await open(page, framework, 'disabled-middle-activate');
    await page.getByTestId('tab-0').focus();
    await page.getByTestId('tab-0').press('ArrowRight');
    await expect(page.getByTestId('tab-1')).toBeFocused();
    await expect(page.getByTestId('tab-1')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await page.getByTestId('tab-1').press('Enter');
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-0');
    await page.getByTestId('tab-1').press('ArrowRight');
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-2');
    expect((await calls(page)).map((entry) => entry.value)).toEqual([2]);
  });
  test(`${framework} Source activateOnFocus avoids reactivating current value and secondary focus activation`, async ({
    page,
  }) => {
    await open(page, framework, 'activate');
    await page.getByTestId('tab-1').focus();
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-1');
    await page.getByTestId('tab-1').click();
    expect((await calls(page)).map((entry) => entry.value)).toEqual([1]);
    await page.getByTestId('tab-2').click({ button: 'right' });
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-1');
    await page.locator('#after').focus();
    await page.getByTestId('tab-2').focus();
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-2');
    expect((await calls(page)).map((entry) => entry.value)).toEqual([1, 2]);
  });
  for (const scenario of [
    'cancel',
    'controlled-reject',
    'prevent-handler',
    'prevent-default',
  ]) {
    test(`${framework} Source cancellation/composed handler ${scenario}`, async ({
      page,
    }) => {
      await open(page, framework, scenario);
      await page.getByTestId('tab-1').click();
      await expect(selected(page)).toHaveAttribute(
        'data-testid',
        scenario === 'prevent-default' ? 'tab-1' : 'tab-0',
      );
      expect((await calls(page)).map((entry) => entry.value)).toEqual(
        scenario === 'prevent-handler' ? [] : [1],
      );
      if (scenario === 'cancel')
        expect((await calls(page))[0].canceled).toBe(true);
    });
  }
  test(`${framework} Source automatic initial and disabled fallbacks cannot be canceled`, async ({
    page,
  }) => {
    await open(page, framework, 'implicit-disabled-first-cancel');
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-1');
    expect((await calls(page))[0]).toMatchObject({
      reason: 'initial',
      value: 1,
      canceled: true,
    });
    await page.locator('#disable').click();
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-0');
    expect((await calls(page)).map((entry) => entry.reason)).toEqual([
      'initial',
      'disabled',
    ]);
    expect((await calls(page))[1]).toMatchObject({
      value: 0,
      direction: 'none',
      canceled: true,
    });
  });
  test(`${framework} Source uncontrolled disabled/removal/empty fallback reasons and restoration`, async ({
    page,
  }) => {
    await open(page, framework);
    await page.getByTestId('tab-1').click();
    await page.locator('#disable').click();
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-0');
    await page.locator('#remove').click();
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-2');
    await page.locator('#clear').click();
    await expect(selected(page)).toHaveCount(0);
    await expect(page.getByTestId('indicator')).toHaveCount(0);
    expect((await calls(page)).map((entry) => entry.reason)).toEqual([
      'none',
      'disabled',
      'missing',
      'missing',
    ]);
    expect((await calls(page)).at(-1)).toMatchObject({
      value: null,
      direction: 'none',
    });
    await page.locator('#insert').click();
    await expect(selected(page)).toHaveCount(0);
  });
  test(`${framework} Source controlled changes retain focus highlight while list contains focus`, async ({
    page,
  }) => {
    await open(page, framework, 'controlled');
    await page.getByTestId('tab-1').focus();
    await page.evaluate(() =>
      (document.querySelector('#external') as HTMLElement).click(),
    );
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-2');
    await expect(page.getByTestId('tab-1')).toBeFocused();
    await expect(page.getByTestId('tab-1')).toHaveAttribute('tabindex', '0');
    await page.getByTestId('tab-1').press('ArrowRight');
    await expect(page.getByTestId('tab-2')).toBeFocused();
    expect(await calls(page)).toEqual([]);
  });
  test(`${framework} Source object values preserve identity selection`, async ({
    page,
  }) => {
    await open(page, framework, 'objects');
    await page.getByTestId('tab-2').click();
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-2');
    expect((await calls(page))[0].value).toEqual({ key: 'c' });
  });
  test(`${framework} Source keepMounted keeps hidden inert panels and their edited state`, async ({
    page,
  }) => {
    await open(page, framework, 'keep');
    await page.getByLabel('Panel field 0').fill('retained');
    await page.getByTestId('tab-1').click();
    const hidden = page.getByTestId('panel-0');
    await expect(hidden).toBeHidden();
    await expect(hidden).toHaveAttribute('inert', '');
    await expect(hidden).toHaveAttribute('tabindex', '-1');
    await page.getByTestId('tab-0').click();
    await expect(page.getByLabel('Panel field 0')).toHaveValue('retained');
    await expect(hidden).not.toHaveAttribute('inert');
  });
  test(`${framework} Source duplicate-panel ownership keeps the surviving registration`, async ({
    page,
  }) => {
    await open(page, framework, 'keep');
    const original = await page.getByTestId('panel-0').getAttribute('id');
    await page.locator('#duplicate').click();
    await expect(page.getByTestId('tab-0')).toHaveAttribute(
      'aria-controls',
      (await page.getByTestId('duplicate-panel').getAttribute('id')) as string,
    );
    await page.locator('#drop-original').click();
    await expect(page.getByTestId('panel-0')).toHaveCount(0);
    await expect(page.getByTestId('tab-0')).toHaveAttribute(
      'aria-controls',
      (await page.getByTestId('duplicate-panel').getAttribute('id')) as string,
    );
    await page.locator('#duplicate').click();
    await expect(page.getByTestId('tab-0')).not.toHaveAttribute(
      'aria-controls',
    );
    // The original Source registration was shadowed; removing its replacement does not restore it.
    expect(original).not.toBe('');
  });
  test(`${framework} Source caret navigation respects text selection and the text boundary`, async ({
    page,
  }) => {
    await open(page, framework, 'caret');
    const input = page.getByLabel('Textbox 0');
    await input.focus();
    await expect
      .poll(() =>
        input.evaluate((node) => [
          (node as HTMLInputElement).selectionStart,
          (node as HTMLInputElement).selectionEnd,
        ]),
      )
      .toEqual([0, 4]);
    await input.press('ArrowRight');
    await expect(input).toBeFocused();
    await input.evaluate((node) =>
      (node as HTMLInputElement).setSelectionRange(4, 4),
    );
    await input.press('ArrowRight');
    await expect(page.getByTestId('tab-1')).toBeFocused();
  });
  for (const scenario of [
    'default',
    'selected-last',
    'selected-last-vertical',
    'selected-last-rtl',
    'selected-last-translate',
    'selected-last-translate-longhand',
    'selected-last-translate-percent',
    'multiple-indicators',
  ]) {
    test(`${framework} Source indicator real layout/translation and resize ${scenario}`, async ({
      page,
    }) => {
      await open(page, framework, scenario);
      const active = selected(page);
      await expect(page.getByTestId('indicator')).toBeVisible();
      const before = await geometry(page);
      expect(before.width).toBeCloseTo(100, 2);
      expect(before.height).toBeCloseTo(40, 2);
      const checkOverlay = async () => {
        const tab = await active.boundingBox(),
          indicator = await page.getByTestId('indicator').boundingBox();
        expect(indicator?.x).toBeCloseTo(tab!.x, 1);
        expect(indicator?.y).toBeCloseTo(tab!.y, 1);
        expect(indicator?.width).toBeCloseTo(tab!.width, 1);
        expect(indicator?.height).toBeCloseTo(tab!.height, 1);
      };
      await checkOverlay();
      await page.locator('#resize').click();
      await expect
        .poll(async () => (await geometry(page)).right)
        .not.toBe(before.right);
      await checkOverlay();
      if (scenario === 'multiple-indicators')
        expect(
          await page.getByTestId('indicator-two').getAttribute('style'),
        ).toBe(await page.getByTestId('indicator').getAttribute('style'));
    });
  }
  test(`${framework} Source resize observation follows a swapped rendered tab host`, async ({
    page,
  }) => {
    await open(page, framework, 'selected-last');
    const before = await geometry(page);
    await page.locator('#swap').click();
    await expect(page.getByTestId('tab-1')).toHaveJSProperty('tagName', 'DIV');
    await page.getByTestId('tab-1').evaluate((node) => {
      (node as HTMLElement).style.width = '160px';
    });
    await expect
      .poll(async () => (await geometry(page)).left)
      .toBeCloseTo(before.left + 60, 1);
    await page.locator('#unmount').click();
    await expect(page.getByTestId('indicator')).toHaveCount(0);
    await page.locator('#unmount').click();
    await expect(page.getByTestId('indicator')).toBeVisible();
  });
  test(`${framework} Source missing controlled value exposes null geometry, null value omits indicator`, async ({
    page,
  }) => {
    await open(page, framework, 'controlled-missing');
    await expect(page.getByTestId('indicator')).toBeHidden();
    await expect(page.getByTestId('indicator')).toHaveAttribute(
      'data-position',
      'null',
    );
    await expect(page.getByTestId('indicator')).toHaveAttribute(
      'data-size',
      'null',
    );
    await page.locator('#external-null').click();
    await expect(page.getByTestId('indicator')).toHaveCount(0);
  });
  for (const scenario of [
    'selected-last-prehydrate',
    'selected-last-vertical-prehydrate',
    'selected-last-rtl-prehydrate',
  ]) {
    test(`${framework} Source nonce SSR parser positions once and real hydration preserves geometry ${scenario}`, async ({
      page,
    }) => {
      await observeParser(page);
      const errors: string[] = [];
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type()))
          errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/tabs-ssr?framework=${framework}&scenario=${scenario}`);
      await expect(page.locator('main')).toHaveAttribute(
        'data-hydrated',
        'false',
      );
      await expect(page.getByTestId('indicator')).toBeVisible();
      const before = await geometry(page);
      expect(before.width).toBeCloseTo(100, 1);
      expect(before.height).toBeCloseTo(40, 1);
      expect(
        await page.evaluate(
          () => (window as unknown as { tabsParser: unknown }).tabsParser,
        ),
      ).toEqual({ executions: 1, nonce: ['tabs-nonce'] });
      expect(
        await page
          .locator('script')
          .evaluateAll(
            (nodes) =>
              nodes.filter((node) => node.nonce === 'tabs-nonce').length,
          ),
      ).toBe(1);
      expect(errors).toEqual([]);
      await page.goto(
        `/tabs-ssr?framework=${framework}&scenario=${scenario}&hydrate=true`,
      );
      await expect(page.locator('main')).toHaveAttribute(
        'data-hydrated',
        'true',
      );
      await expect(
        page.locator('script[nonce="tabs-nonce"]:not([type=module])'),
      ).toHaveCount(0);
      const after = await geometry(page);
      for (const name of ['left', 'right', 'top', 'bottom', 'width', 'height'])
        expect(after[name]).toBeCloseTo(before[name], 1);
      expect(
        await page.evaluate(
          () => (window as unknown as { tabsParser: unknown }).tabsParser,
        ),
      ).toEqual({ executions: 1, nonce: ['tabs-nonce'] });
      expect(errors).toEqual([]);
      await page.getByTestId('tab-0').click();
      await expect(selected(page)).toHaveAttribute('data-testid', 'tab-0');
      expect(errors).toEqual([]);
    });
  }
  test(`${framework} Source parser resize observes a hidden streamed segment until both dimensions are measurable`, async ({
    page,
  }) => {
    await page.goto(`/tabs-ssr?framework=${framework}&hidden=true`);
    await expect(page.getByTestId('indicator')).toHaveAttribute('hidden', '');
    await page.evaluate(() => {
      (document.querySelector('#hydration-host') as HTMLElement).style.display =
        '';
    });
    await expect(page.getByTestId('indicator')).toBeVisible();
    expect((await geometry(page)).width).toBe(100);
  });
  test(`${framework} Source parser stops without resurrecting an indicator after captured selection moves`, async ({
    page,
  }) => {
    await page.goto(`/tabs-ssr?framework=${framework}&hidden=true`);
    await page.evaluate(() => {
      document.querySelector('[data-active]')?.removeAttribute('data-active');
      (document.querySelector('#hydration-host') as HTMLElement).style.display =
        '';
    });
    await expect(page.getByTestId('indicator')).toHaveAttribute('hidden', '');
    await page.getByTestId('tab-2').evaluate((element) => {
      element.setAttribute('data-active', '');
      (element as HTMLElement).style.width = '140px';
    });
    await expect(page.getByTestId('indicator')).toHaveAttribute('hidden', '');
  });
  test(`${framework} fresh native CSR insertion is inert and removes script after mounting`, async ({
    page,
  }) => {
    await observeParser(page);
    await open(page, framework, 'selected-last-prehydrate-fresh-client');
    await expect(page.getByTestId('indicator')).toBeVisible();
    expect((await geometry(page)).width).toBe(100);
    expect(
      await page.evaluate(
        () => (window as unknown as { tabsParser: unknown }).tabsParser,
      ),
    ).toEqual({ executions: 0, nonce: [] });
    await expect(
      page.locator('script').filter({ hasText: 'previousElementSibling' }),
    ).toHaveCount(0);
  });
  test(`${framework} real SSR without JavaScript retains native selection and hidden unresolved indicator`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false }),
      page = await context.newPage();
    await page.goto(`/tabs-ssr?framework=${framework}`);
    await expect(selected(page)).toHaveAttribute('data-testid', 'tab-2');
    await expect(page.getByTestId('panel-2')).toBeVisible();
    await expect(page.getByTestId('indicator')).toBeHidden();
    await expect(page.locator('main')).toHaveAttribute(
      'data-hydrated',
      'false',
    );
    await context.close();
  });
}
