import { test, expect, type Page } from '@playwright/test';
// Paired source-derived supplements, not complete upstream declaration ports.
async function setup(page: Page, reference: boolean, scenario = 'ordinary', trigger = 'A') {
  await page.goto(`/nonmodal-focus?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await page.getByRole('button', { name: `Trigger ${trigger}` }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator(scenario === 'entry' ? '#nonmodal-a' : '#first')).toBeFocused();
}
async function requests(page: Page) {
  return JSON.parse(await page.getByTestId('requests').innerText()) as {
    open: boolean;
    reason: string;
    trigger: string;
    type: string;
    target: string | null;
    related: string | null;
  }[];
}
async function command(page: Page, command: string) {
  await page
    .locator('main')
    .evaluate(
      (host: HTMLElement & { nonmodalCommand(command: string): void }, command) =>
        host.nonmodalCommand(command),
      command,
    );
}
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  test(`${framework}: forward Tab enters at Portal position then exits and dismisses`, async ({
    page,
  }) => {
    await setup(page, reference, 'entry');
    await page.keyboard.press('Tab');
    await expect(page.locator('#first')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#last')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#after')).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await requests(page)).map((x) => [x.open, x.reason, x.trigger])).toEqual([
      [true, 'trigger-press', 'nonmodal-a'],
      [false, 'focus-out', 'nonmodal-a'],
    ]);
    expect((await requests(page)).at(-1)).toMatchObject({
      type: 'focusin',
      guard: 'outside',
      relatedGuard: 'inside',
      trusted: true,
    });
    await page.keyboard.press('Tab');
    await expect(page.locator('#end')).toBeFocused();
    await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
  });
  test(`${framework}: reverse Tab returns to Trigger then dismisses at preceding outside`, async ({
    page,
  }) => {
    await setup(page, reference);
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#nonmodal-a')).toBeFocused();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await requests(page)).toHaveLength(1);
    await page.keyboard.press('Tab');
    await expect(page.locator('#first')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#nonmodal-a')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#before')).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await requests(page)).at(-1)).toMatchObject({
      open: false,
      reason: 'focus-out',
      type: 'focusout',
      target: 'nonmodal-a',
      related: 'before',
    });
  });
  for (const trigger of ['A', 'B'])
    test(`${framework}: multiple contained Triggers keep Portal order (${trigger})`, async ({
      page,
    }) => {
      await setup(page, reference, 'multiple', trigger);
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('#nonmodal-b')).toBeFocused();
      await expect(page.getByRole('dialog')).toBeVisible();
      expect(await requests(page)).toHaveLength(1);
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('#nonmodal-a')).toBeFocused();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(page.locator('#nonmodal-b')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.locator('#first')).toBeFocused();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(page.locator('#after')).toBeFocused();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect((await requests(page)).at(-1)).toMatchObject({
        open: false,
        reason: 'focus-out',
        trigger: `nonmodal-${trigger.toLowerCase()}`,
      });
    });
  test(`${framework}: trap-focus cycles while permitting outside pointer dismissal`, async ({
    page,
  }) => {
    await setup(page, reference, 'trap');
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#last')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#first')).toBeFocused();
    expect(
      await page.locator('#after').evaluate((node) => !!node.closest('[aria-hidden="true"]')),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
    await page.locator('#after').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await requests(page)).at(-1)?.reason).toBe('outside-press');
  });
  test(`${framework}: disabled dismissal still moves through logical Portal order`, async ({
    page,
  }) => {
    await setup(page, reference, 'disabled');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator('#after')).toBeFocused();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await requests(page)).toHaveLength(1);
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#last')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#first')).toBeFocused();
    await command(page, 'close');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
  });
  test(`${framework}: keepMounted restores tabindex and guards across reopen and removal`, async ({
    page,
  }) => {
    await setup(page, reference, 'keep');
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(page.locator('#after')).toBeFocused();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
      await page.locator('#nonmodal-a').click();
      await expect(page.locator('#first')).toBeFocused();
      await expect(page.locator('#first')).toHaveAttribute('tabindex', '0');
      await expect(page.locator('#last')).toHaveAttribute('tabindex', '0');
    }
    await command(page, 'remove');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
    await expect(page.locator('[data-tabindex]')).toHaveCount(0);
  });
  test(`${framework}: programmatic Popup exit preserves the tree; owner Trigger exit dismisses`, async ({
    page,
  }) => {
    await setup(page, reference);
    await page.locator('#after').focus();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#end').focus();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await requests(page)).toHaveLength(1);
    await page.locator('#nonmodal-a').focus();
    await page.locator('#after').focus();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#after')).toBeFocused();
    expect((await requests(page)).at(-1)).toMatchObject({
      open: false,
      reason: 'focus-out',
      type: 'focusout',
      target: 'nonmodal-a',
      related: 'after',
    });
  });
  for (const target of ['first', 'nonmodal-a'])
    test(`${framework}: null relatedTarget alone does not dismiss (${target})`, async ({
      page,
    }) => {
      await setup(page, reference);
      await page.locator(`#${target}`).focus();
      await page.locator(`#${target}`).evaluate((node) => (node as HTMLElement).blur());
      await expect(page.getByRole('dialog')).toBeVisible();
      expect(await requests(page)).toHaveLength(1);
    });
  test(`${framework}: inactive Trigger is inside without gaining the owner focusout listener`, async ({
    page,
  }) => {
    await setup(page, reference, 'multiple');
    await page.locator('#nonmodal-b').focus();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await requests(page)).toHaveLength(1);
    await page.locator('#after').focus();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await requests(page)).toHaveLength(1);
  });
  test(`${framework}: nested modal traps, returns to parent, and preserves parent guard order`, async ({
    page,
  }) => {
    await setup(page, reference, 'nested');
    await page.locator('#child-trigger').click();
    await expect(page.locator('#child-first')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Child close' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#child-first')).toBeFocused();
    expect(await requests(page)).toHaveLength(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('#child-trigger')).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    expect(await requests(page)).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
    await page.keyboard.press('Tab');
    await expect(page.locator('#last')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#after')).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
  });
  test(`${framework}: forward document edge falls back to the owning Trigger`, async ({ page }) => {
    await setup(page, reference, 'edge');
    await page.keyboard.press('Tab');
    await expect(page.locator('#last')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#nonmodal-a')).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await requests(page)).at(-1)).toMatchObject({
      open: false,
      reason: 'focus-out',
      trigger: 'nonmodal-a',
      type: 'focusin',
    });
    await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
  });
  test(`${framework}: consumer focusout stopPropagation preserves native owner dismissal`, async ({
    page,
  }) => {
    await setup(page, reference, 'stop-blur');
    await page.locator('#nonmodal-a').focus();
    await page.locator('#after').focus();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#after')).toBeFocused();
    expect((await requests(page)).at(-1)).toMatchObject({
      open: false,
      reason: 'focus-out',
      type: 'focusout',
      target: 'nonmodal-a',
      related: 'after',
    });
  });
}
