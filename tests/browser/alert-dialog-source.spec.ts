// Complete original assertion evidence: parity/alert-dialog/upstream-inventory.json (MIT).
// Candidates retain ordered Source predicates; final mapping review/credit is separate.
import { expect, test, type Locator, type Page } from '@playwright/test';
type Api = Record<string, (...args: unknown[]) => unknown>;
type Snapshot = {
  changes: { open: boolean; reason: string; triggerId?: string }[];
  completed: boolean[];
  actions: boolean;
  isOpen: boolean;
};
async function api(page: Page, method: string, ...args: unknown[]) {
  return page
    .locator('main')
    .evaluate(
      (node, { method, args }) =>
        (node as HTMLElement & { alertApi: Api }).alertApi[method](...args),
      { method, args },
    );
}
const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true, includeHidden: true });
const popup = (page: Page) => page.locator('[role=alertdialog]');
// Original Testing Library user.click dispatches native DOM input even when modal isolation hides a trigger.
async function click(locator: Locator) {
  await locator.evaluate((element) => {
    const node = element as HTMLElement;
    node.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        composed: true,
        pointerType: 'mouse',
        button: 0,
        buttons: 1,
      }),
    );
    node.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, composed: true, button: 0, buttons: 1 }),
    );
    node.focus();
    node.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        composed: true,
        pointerType: 'mouse',
        button: 0,
      }),
    );
    node.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true, button: 0 }));
    node.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        composed: true,
        cancelable: true,
        button: 0,
        detail: 1,
      }),
    );
  });
}
async function openAndClose(page: Page) {
  await click(button(page, 'Trigger'));
  await expect(popup(page)).toContainText('Alert dialog content');
  await click(button(page, 'Close'));
  await expect(popup(page)).toHaveCount(0);
}
const lines = [
  32, 57, 78, 97, 121, 136, 165, 196, 216, 236, 281, 320, 366, 390, 436, 469, 497, 600, 649, 708,
  726, 744, 777, 795, 833, 868, 902, 931, 965, 1006, 1047, 1064, 1094, 1147, 1177,
];
for (const reference of [true, false])
  for (const line of lines)
    test(`${reference ? 'Actual Source React' : line === 1147 ? 'Native framework witness (zero Source credit)' : 'Native candidate'} AlertDialogRoot:${line}`, async ({
      page,
    }) => {
      await page.goto(`/alert-dialog-source?line=${line}${reference ? '&reference' : ''}`);
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      if (line === 32) {
        await expect(popup(page)).toHaveCount(1);
        expect(await page.getByText('title text').getAttribute('id')).toBe(
          await popup(page).getAttribute('aria-labelledby'),
        );
        expect(await page.getByText('description text').getAttribute('id')).toBe(
          await popup(page).getAttribute('aria-describedby'),
        );
      } else if (line === 57) {
        await expect(button(page, 'Trigger 1')).toHaveAttribute('aria-expanded', 'false');
        await expect(button(page, 'Trigger 1')).not.toHaveAttribute('aria-controls');
        await expect(button(page, 'Trigger 2')).toHaveAttribute('aria-expanded', 'true');
        expect(await button(page, 'Trigger 2').getAttribute('aria-controls')).toBe(
          await popup(page).getAttribute('id'),
        );
      } else if (line === 78 || line === 97) {
        await expect(button(page, 'Open')).toHaveAttribute('aria-expanded', 'true');
        expect(await button(page, 'Open').getAttribute('aria-controls')).toBe(
          await popup(page).getAttribute('id'),
        );
        if (line === 97) expect(await api(page, 'isOpen')).toBe(true);
      } else if (line === 121) {
        await expect(page.getByTestId('viewport').locator('[role=alertdialog]')).toHaveCount(1);
      } else if (line === 136 || line === 165) {
        expect(((await api(page, 'snapshot')) as Snapshot).changes).toHaveLength(0);
        await click(button(page, 'Open'));
        const opened = ((await api(page, 'snapshot')) as Snapshot).changes;
        expect(opened).toHaveLength(1);
        if (line === 136) expect(opened[0].open).toBe(true);
        else {
          expect(opened[0].reason).toBe('trigger-press');
          expect(opened[0].triggerId).toBe('trigger');
        }
        await click(button(page, 'Close'));
        const closed = ((await api(page, 'snapshot')) as Snapshot).changes;
        expect(closed).toHaveLength(2);
        if (line === 136) expect(closed[1].open).toBe(false);
        else {
          expect(closed[1].reason).toBe('close-press');
          expect(closed[1].triggerId).toBe('trigger');
        }
      } else if (line === 196) {
        await expect(popup(page)).toBeVisible();
        await page.keyboard.press('Escape');
        const calls = ((await api(page, 'snapshot')) as Snapshot).changes;
        expect(calls).toHaveLength(1);
        expect(calls[0].reason).toBe('escape-key');
      } else if (line === 216) {
        await click(page.locator('[role=presentation]').first());
        expect(((await api(page, 'snapshot')) as Snapshot).changes).toHaveLength(0);
        await expect(popup(page)).toHaveCount(1);
      } else if (line === 236) {
        await click(button(page, 'Open'));
        await expect(popup(page)).toBeVisible();
        await expect(button(page, 'Open')).toHaveAttribute('data-popup-open', '');
        expect(await api(page, 'isOpen')).toBe(true);
        await click(button(page, 'Cancel'));
        await expect(popup(page)).toHaveAttribute('data-open', '');
        await expect(button(page, 'Open')).toHaveAttribute('data-popup-open', '');
        expect(await api(page, 'isOpen')).toBe(true);
      } else if (line === 281) {
        await click(button(page, 'Open'));
        await expect(popup(page)).toHaveCount(1);
        await click(button(page, 'Open'));
        await expect(popup(page)).toHaveCount(1);
        await api(page, 'unmount');
        await expect(popup(page)).toHaveCount(0);
      } else if (line === 320) {
        await click(button(page, 'Open'));
        await expect(popup(page)).toHaveCount(1);
        await click(button(page, 'Close'));
        await expect(popup(page)).toHaveCount(1);
        await api(page, 'unmount');
        await expect(popup(page)).toHaveCount(0);
        await click(button(page, 'Open'));
        await expect(popup(page)).toHaveCount(1);
        await click(button(page, 'Close'));
        await expect(popup(page)).toHaveCount(0);
      } else if (line === 366) {
        await expect(popup(page)).toHaveCount(1);
        await api(page, 'exportedClose');
        await expect(popup(page)).toHaveCount(0);
      } else if (line === 390 || line === 600) {
        await expect(popup(page)).toHaveCount(0);
        for (const value of [1, 2, 3]) {
          await click(button(page, `Trigger ${value}`));
          await expect(popup(page)).toContainText('Alert dialog content');
          if (value !== 3) {
            await click(button(page, 'Close'));
            await expect(popup(page)).toHaveCount(0);
          }
        }
      } else if (line === 436 || line === 795) {
        await click(button(page, 'Trigger 1'));
        await expect(page.getByTestId('content')).toHaveText('1');
        await click(button(page, 'Trigger 2'));
        await expect(page.getByTestId('content')).toHaveText('2');
      } else if (line === 469 || line === 833) {
        await click(button(page, 'Trigger 1'));
        const original = await popup(page).elementHandle();
        await click(button(page, 'Trigger 2'));
        expect(await popup(page).evaluate((node, original) => node === original, original)).toBe(
          true,
        );
      } else if (line === 497) {
        await expect(button(page, 'Trigger 1')).toHaveAttribute('aria-expanded', 'false');
        await expect(button(page, 'Trigger 2')).toHaveAttribute('aria-expanded', 'false');
        await click(button(page, 'Trigger 1'));
        await expect(popup(page)).toHaveCount(1);
        const controls = await button(page, 'Trigger 1').getAttribute('aria-controls');
        expect(controls).not.toBeNull();
        expect(await popup(page).getAttribute('id')).toBe(controls);
        await expect(button(page, 'Trigger 1')).toHaveAttribute('aria-expanded', 'true');
        await expect(button(page, 'Trigger 2')).toHaveAttribute('aria-expanded', 'false');
      } else if (line === 649) {
        await click(button(page, 'Trigger'));
        await expect(popup(page)).toBeVisible();
        expect(await button(page, 'Trigger').getAttribute('aria-controls')).toBe(
          await popup(page).getAttribute('id'),
        );
        await click(button(page, 'Unmount root'));
        await expect(popup(page)).toHaveCount(0);
        await click(button(page, 'Remount root'));
        await expect(popup(page)).toHaveCount(0);
        await click(button(page, 'Trigger'));
        await expect(popup(page)).toBeVisible();
        expect(await button(page, 'Trigger').getAttribute('aria-controls')).toBe(
          await popup(page).getAttribute('id'),
        );
        await click(page.locator('[role=presentation]').first());
        await expect(popup(page)).toHaveCount(1);
        expect(await api(page, 'isOpen')).toBe(true);
      } else if (line === 708 || line === 726 || line === 777) {
        await openAndClose(page);
        for (const value of line === 726 ? [1, 2, 3] : [2, 1, 0]) {
          await api(page, 'wrappers', value, line === 777);
          await openAndClose(page);
        }
      } else if (line === 744) {
        async function cycle() {
          await click(button(page, 'Open'));
          await expect(popup(page)).toContainText('Alert dialog content');
          await click(button(page, 'Close'));
          await expect(popup(page)).toHaveCount(0);
        }
        await cycle();
        await api(page, 'recreate');
        await cycle();
        await api(page, 'recreate');
        await cycle();
      } else if (line === 868) {
        await expect(page.getByTestId('alert-dialog-state')).toHaveAttribute('data-modal', 'true');
        await expect(page.getByTestId('alert-dialog-state')).toHaveAttribute(
          'data-disable-pointer-dismissal',
          'true',
        );
        await expect(page.getByTestId('alert-dialog-state')).toHaveAttribute(
          'data-role',
          'alertdialog',
        );
        await click(button(page, 'Open'));
        await expect(popup(page)).toBeVisible();
        expect(await api(page, 'isOpen')).toBe(true);
        await click(page.locator('[role=presentation]').first());
        await expect(popup(page)).toHaveCount(1);
        expect(await api(page, 'isOpen')).toBe(true);
      } else if (line === 902) {
        await click(button(page, 'Open'));
        await expect(popup(page)).toBeVisible();
        await click(page.locator('[role=presentation]').first());
        await expect(popup(page)).toHaveCount(1);
        expect(await api(page, 'isOpen')).toBe(true);
      } else if (line === 931 || line === 965 || line === 1006) {
        await expect(popup(page)).toHaveCount(0);
        await api(
          page,
          line === 1006 ? 'payload' : 'open',
          line === 1006 ? 8 : line === 965 ? 'trigger-2' : 'trigger',
        );
        await expect(popup(page)).toHaveCount(1);
        await expect(page.getByTestId('content')).toHaveText(
          line === 1006 ? '8' : line === 965 ? '2' : 'Content',
        );
        if (line === 965) {
          await expect(button(page, 'Trigger 2')).toHaveAttribute('aria-expanded', 'true');
          await expect(button(page, 'Trigger 1')).not.toHaveAttribute('aria-expanded', 'true');
        } else if (line === 931)
          await expect(button(page, 'Open')).toHaveAttribute('aria-expanded', 'true');
        await api(page, 'close');
        await expect(popup(page)).toHaveCount(0);
        if (line === 931)
          await expect(button(page, 'Open')).toHaveAttribute('aria-expanded', 'false');
      } else if (line === 1047) {
        await expect(page.locator('[role=presentation]').first()).toHaveCount(1);
      } else if (line === 1064 || line === 1094) {
        await expect(popup(page)).toHaveCount(1);
        await expect
          .poll(async () => ((await api(page, 'snapshot')) as Snapshot).completed[0])
          .toBe(true);
        await click(button(page, 'Close').first());
        await expect(popup(page)).toHaveCount(0);
        expect(((await api(page, 'snapshot')) as Snapshot).completed.at(-1)).toBe(false);
      } else if (line === 1147 || line === 1177) {
        await click(button(page, 'Open'));
        await expect(popup(page)).toHaveCount(1);
        await expect
          .poll(async () => ((await api(page, 'snapshot')) as Snapshot).completed[0])
          .toBe(true);
        // Preserve strict Source replay count; native once-only witness is separate and earns zero credit.
        if (line === 1147)
          expect(((await api(page, 'snapshot')) as Snapshot).completed).toHaveLength(
            reference ? 2 : 1,
          );
      }
    });

// All active popupConformanceTests helper variants are separate from ordinary declaration counts.
for (const reference of [true, false])
  for (const variant of [
    'controlled',
    'trigger',
    'role',
    'controls',
    'expanded',
    'haspopup',
    'custom-id',
    'no-exit',
  ] as const)
    test(`${reference ? 'Actual Source React' : 'Native'} AlertDialog popup conformance ${variant}`, async ({
      page,
    }) => {
      const line =
        variant === 'custom-id' ? 10 : variant === 'controlled' || variant === 'no-exit' ? 11 : 136;
      await page.goto(`/alert-dialog-source?line=${line}${reference ? '&reference' : ''}`);
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      if (line === 11) {
        await expect(popup(page)).toHaveCount(0);
        await api(page, 'owner', true);
      } else {
        await expect(popup(page)).toHaveCount(0);
        if (variant === 'expanded')
          await expect(button(page, 'Open')).toHaveAttribute('aria-expanded', 'false');
        await click(button(page, 'Open'));
      }
      await expect(popup(page)).toHaveCount(1);
      if (variant === 'role') await expect(popup(page)).toHaveAttribute('role', 'alertdialog');
      if (variant === 'controls' || variant === 'custom-id')
        expect(await button(page, 'Open').getAttribute('aria-controls')).toBe(
          await popup(page).getAttribute('id'),
        );
      if (variant === 'expanded') {
        await expect(popup(page)).toHaveAttribute('data-open', '');
        await expect(button(page, 'Open')).toHaveAttribute('aria-expanded', 'true');
      }
      if (variant === 'haspopup')
        await expect(button(page, 'Open')).toHaveAttribute('aria-haspopup', 'dialog');
      if (variant === 'no-exit') {
        await api(page, 'owner', false);
        await expect(popup(page)).toHaveCount(0);
      }
    });

// Physical input exercises browser focus, isolation, blocked outside presses, scroll and cleanup.
for (const reference of [true, false])
  test(`${reference ? 'Actual React' : 'Native'} AlertDialog physical focus/Escape/outside/scroll cleanup`, async ({
    page,
  }) => {
    await page.goto(`/alert-dialog-source?line=136${reference ? '&reference' : ''}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const before = await page
      .locator('body')
      .evaluate((node) => ({ overflow: node.style.overflow, padding: node.style.paddingRight }));
    await button(page, 'Open').click();
    await expect(popup(page)).toBeVisible();
    await expect(button(page, 'Close')).toBeFocused();
    await expect
      .poll(() => page.locator('body').evaluate((node) => node.style.overflow))
      .toBe('hidden');
    await page.keyboard.press('Tab');
    await expect(button(page, 'Close')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(button(page, 'Close')).toBeFocused();
    await page.mouse.click(500, 400);
    await expect(popup(page)).toBeVisible();
    expect(((await api(page, 'snapshot')) as Snapshot).changes.map((call) => call.reason)).toEqual([
      'trigger-press',
    ]);
    await page.keyboard.press('Escape');
    await expect(popup(page)).toHaveCount(0);
    await expect(button(page, 'Open')).toBeFocused();
    // Original ScrollLocker.release restores styles in a zero-delay timer, independently of focus.
    await expect
      .poll(() =>
        page.locator('body').evaluate((node) => ({
          overflow: node.style.overflow,
          padding: node.style.paddingRight,
        })),
      )
      .toEqual(before);
    await api(page, 'remove');
    expect(((await api(page, 'snapshot')) as Snapshot).actions).toBe(false);
    await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
    await expect(page.locator('[data-base-ui-portal]')).toHaveCount(0);
  });
