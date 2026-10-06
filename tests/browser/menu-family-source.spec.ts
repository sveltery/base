// Authored paired supplements using actual Base UI 1.8.0 and native Svelte.
// All declarations receive zero unchanged Original ordinary assertion credit.
import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, reference: boolean, options: Record<string, string> = {}) {
  const parameters = new URLSearchParams(options);
  if (reference) parameters.set('reference', '');
  await page.goto(`/menu-family?${parameters}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  test.info().annotations.push({
    type: 'browser-version',
    description: page.context().browser()?.version() ?? 'unavailable',
  });
}
async function command(page: Page, value: string) {
  await page.locator('main').evaluate((element, argument) => {
    (element as HTMLElement & { menuCommand(value: string): void }).menuCommand(argument);
  }, value);
}
async function calls(page: Page) {
  return page.locator('main').evaluate((element) => {
    return (element as HTMLElement & { menuSnapshot(): { calls: unknown[] } }).menuSnapshot().calls;
  });
}
for (const reference of [false, true]) {
  const framework = reference ? 'Original React' : 'native Svelte';
  test(`${framework}: trusted mouse opens, navigates disabled items, typeahead and selection`, async ({
    page,
  }) => {
    await setup(page, reference);
    await page.locator('#opener').click();
    await expect(page.locator('[data-testid=popup]')).toBeVisible();
    await expect(page.locator('#opener')).toHaveAttribute('aria-haspopup', 'menu');
    await expect(page.locator('#group')).toHaveAttribute('aria-labelledby', 'group-label');
    await expect(page.locator('#radio-group')).toHaveAttribute('aria-labelledby', 'radio-label');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#alpha')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#disabled')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid=popup]')).toBeVisible();
    await page.keyboard.press('b');
    await expect(page.locator('#bravo')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
    await expect(page.locator('#opener')).toBeFocused();
    expect(await calls(page)).toContainEqual(['open', false, 'item-press']);
  });
  for (const key of ['Enter', 'Space', 'ArrowDown', 'ArrowUp'])
    test(`${framework}: keyboard ${key} trigger opening`, async ({ page }) => {
      await setup(page, reference);
      await page.locator('#opener').focus();
      await page.keyboard.press(key);
      await expect(page.locator('[data-testid=popup]')).toBeVisible();
      await expect(page.locator(key === 'ArrowUp' ? '#two' : '#alpha')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
      await expect(page.locator('#opener')).toBeFocused();
    });
  for (const cancel of ['', 'check', 'radio'])
    test(`${framework}: selection callback cancellation ${cancel || 'accepted'}`, async ({
      page,
    }) => {
      await setup(page, reference, { open: '', cancel });
      await page.locator('#check').click();
      await expect(page.locator('#check')).toHaveAttribute(
        'aria-checked',
        cancel === 'check' ? 'false' : 'true',
      );
      await page.locator('#two').click();
      await expect(page.locator('#two')).toHaveAttribute(
        'aria-checked',
        cancel === 'radio' ? 'false' : 'true',
      );
      await expect(page.locator('[data-testid=popup]')).toBeVisible();
    });
  for (const cancel of ['open', 'close'])
    test(`${framework}: root ${cancel} cancellation`, async ({ page }) => {
      await setup(page, reference, { ...(cancel === 'close' ? { open: '' } : {}), cancel });
      await page.locator('#opener').click();
      await expect(page.locator('[data-testid=popup]')).toHaveCount(cancel === 'close' ? 1 : 0);
    });
  for (const direction of ['ltr', 'rtl'])
    test(`${framework}: three nested levels and ${direction} arrow relay`, async ({ page }) => {
      await setup(page, reference, { mode: 'nested', open: '', direction });
      await page.locator('#sub').focus();
      await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(page.locator('#sub-first')).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('#deep')).toBeFocused();
      await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(page.locator('#deep-first')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('#deep-first')).toHaveCount(0);
      await expect(page.locator('#deep')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid=sub-popup]')).toHaveCount(0);
      await expect(page.locator('[data-testid=popup]')).toBeVisible();
      await expect(page.locator('#sub')).toBeFocused();
    });
  for (const orientation of ['horizontal', 'vertical'])
    for (const direction of ['ltr', 'rtl'])
      test(`${framework}: ${direction}/${orientation} Menubar sibling navigation`, async ({
        page,
      }) => {
        await setup(page, reference, { mode: 'menubar', orientation, direction });
        await page.locator('#opener').click();
        await expect(page.locator('[data-testid=popup]')).toBeVisible();
        await page.locator('#second').hover();
        await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
        await expect(page.locator('[data-testid=edit-popup]')).toBeVisible();
        await expect(page.locator('#menubar')).toHaveAttribute('data-has-submenu-open', '');
        await page.keyboard.press('Escape');
        await expect(page.locator('[data-testid=edit-popup]')).toHaveCount(0);
        await expect(page.locator('#second')).toBeFocused();
        await page.keyboard.press(
          orientation === 'vertical' ? 'ArrowUp' : direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft',
        );
        await expect(page.locator('#opener')).toBeFocused();
      });
  test(`${framework}: retained actions keep mounted exit until unmount`, async ({ page }) => {
    await setup(page, reference, { mode: 'retain' });
    await page.locator('#opener').click();
    await expect(page.locator('[data-testid=popup]')).toBeVisible();
    await command(page, 'close');
    await expect(page.locator('[data-testid=popup]')).toHaveAttribute('data-closed', '');
    await command(page, 'unmount');
    await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
  });
  test(`${framework}: detached handle trigger ownership and payload viewport remount`, async ({
    page,
  }) => {
    await setup(page, reference, { mode: 'viewport' });
    await command(page, 'open');
    await expect(page.locator('#payload')).toHaveText('7');
    await expect(page.locator('#opener')).toHaveAttribute('aria-expanded', 'true');
    await command(page, 'second');
    await expect(page.locator('[data-current] #payload')).toHaveText('9');
    await expect(page.locator('[data-previous]')).toHaveAttribute('inert', '');
    await expect(page.locator('[data-previous] #payload')).toHaveText('7');
    await expect(page.locator('#second')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#opener')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[data-previous]')).toHaveCount(0);
    await command(page, 'close');
    await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
  });
  test(`${framework}: ContextMenu uses trusted pointer anchor, outside release and Escape`, async ({
    page,
  }) => {
    await setup(page, reference, { mode: 'context' });
    await page.locator('#opener').click({ button: 'right', position: { x: 15, y: 10 } });
    await expect(page.locator('[data-testid=popup]')).toBeVisible();
    await expect(page.locator('[data-testid=positioner]')).toHaveCSS('position', 'fixed');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#alpha')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
  });
  test(`${framework}: hover opens after rest and mouse exit dismisses`, async ({ page }) => {
    await setup(page, reference, { mode: 'hover' });
    await page.locator('#opener').hover();
    await expect(page.locator('[data-testid=popup]')).toBeVisible();
    await page.mouse.move(600, 400);
    await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
  });
  test(`${framework}: Toolbar menu restores composite focus and arrow relay`, async ({ page }) => {
    await setup(page, reference, { mode: 'toolbar' });
    await page.locator('#opener').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#alpha')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#opener')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#after')).toBeFocused();
  });
  test(`${framework}: modal menu locks scroll and outside pointer dismisses`, async ({ page }) => {
    await setup(page, reference, { mode: 'modal' });
    await page.locator('#opener').click();
    await expect(page.locator('[data-testid=popup]')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.style.overflow || document.body.style.overflow,
      ),
    ).toBe('hidden');
    await page.mouse.click(600, 400);
    await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
  });
}

for (const reference of [true, false]) {
  test(`${reference ? 'Original React' : 'native Svelte'}: replacing a render host preserves the current ref and registration`, async ({
    page,
  }) => {
    await page.goto(`/menu-trigger-host-overlap${reference ? '?reference' : ''}`);
    const main = page.locator('main');
    await expect(main).toHaveAttribute('data-hydrated', 'true');
    test.info().annotations.push({
      type: 'browser-version',
      description: page.context().browser()?.version() ?? 'unavailable',
    });
    const snapshot = () =>
      main.evaluate((element) =>
        (
          element as HTMLElement & {
            hostSnapshot(): {
              boundHost: string | null;
              registeredHost: string | null;
              oldOutroEnded: boolean;
              beforeConnected: boolean;
              currentConnected: boolean;
              boundIsReplacement?: boolean;
              registeredIsReplacement?: boolean;
            };
          }
        ).hostSnapshot(),
      );
    const run = (value: string) =>
      main.evaluate(
        (element, command) =>
          (element as HTMLElement & { hostCommand(value: string): unknown }).hostCommand(command),
        value,
      );
    const record = async (phase: string) => {
      const value = {
        ...(await snapshot()),
        beforeHostCount: await page.locator('[data-host="before"]').count(),
        afterHostCount: await page.locator('[data-host="after"]').count(),
      };
      await test.info().attach(`host-${phase}`, {
        body: JSON.stringify(
          { framework: reference ? 'Original' : 'native', phase, ...value },
          null,
          2,
        ),
        contentType: 'application/json',
      });
      return value;
    };
    expect(await record('before')).toMatchObject({ boundHost: 'before', registeredHost: 'before' });
    if (!reference) {
      const readPhases = () =>
        main.evaluate((element) =>
          (
            element as HTMLElement & {
              hostRecordedPhases(): {
                phase: string;
                boundHost: string | null;
                registeredHost: string | null;
                boundIsPrevious: boolean;
                registeredIsPrevious: boolean;
                boundIsReplacement: boolean;
                registeredIsReplacement: boolean;
                beforeConnected: boolean;
                replacementConnected: boolean;
                beforeHostCount: number;
                afterHostCount: number;
              }[];
            }
          ).hostRecordedPhases(),
        );
      let phases: Awaited<ReturnType<typeof readPhases>>;
      try {
        // Issue the native swap without adopting an asynchronous browser command result.
        await main.evaluate((element) => {
          (element as HTMLElement & { hostCommand(value: string): void }).hostCommand('swap');
        });
        await expect
          .poll(async () => (await readPhases()).some((value) => value.phase === 'outrostart'), {
            timeout: 2000,
            message:
              'actual native outrostart must be recorded before interpreting overlap evidence',
          })
          .toBe(true);
      } finally {
        // Missing-event instrumentation still preserves all phases collected before failure.
        phases = await readPhases();
        await test.info().attach('native-causal-host-phases', {
          body: JSON.stringify(phases, null, 2),
          contentType: 'application/json',
        });
      }
      expect(phases.find((value) => value.phase === 'before-swap')).toMatchObject({
        boundIsPrevious: true,
        registeredIsPrevious: true,
        beforeHostCount: 1,
        afterHostCount: 0,
      });
      // Saved inside the actual native outrostart event, after native publication flush.
      // A missing overlap is an instrumentation failure, not evidence of a product defect.
      const overlap = phases.find((value) => value.phase === 'outrostart');
      expect(
        overlap,
        'native outrostart overlap must be confirmed by fixture-collected evidence',
      ).toMatchObject({
        beforeConnected: true,
        replacementConnected: true,
        beforeHostCount: 1,
        afterHostCount: 1,
      });
      expect(overlap).toMatchObject({
        boundHost: 'after',
        registeredHost: 'after',
        boundIsReplacement: true,
        registeredIsReplacement: true,
      });
      expect(
        phases.find((value) => value.phase === 'replacement-published-after-flush'),
      ).toMatchObject({
        boundHost: 'after',
        registeredHost: 'after',
        boundIsReplacement: true,
        registeredIsReplacement: true,
      });
    } else {
      await run('swap');
      expect(await record('replacement-published')).toMatchObject({
        boundHost: 'after',
        registeredHost: 'after',
      });
    }
    await expect(page.locator('[data-host="before"]')).toHaveCount(0);
    await expect(page.locator('[data-host="after"]')).toHaveCount(1);
    const afterOldRemoval = await record('previous-host-removed');
    expect(afterOldRemoval).toMatchObject({
      afterHostCount: 1,
      boundHost: 'after',
      registeredHost: 'after',
    });
    if (!reference)
      expect(afterOldRemoval).toMatchObject({
        boundIsReplacement: true,
        registeredIsReplacement: true,
      });
    await run('remove');
    await expect(page.locator('[data-host="after"]')).toHaveCount(0);
    expect(await record('trigger-removed')).toMatchObject({
      boundHost: null,
      registeredHost: null,
    });
  });
}
