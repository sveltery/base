import { expect, test, type Locator, type Page } from '@playwright/test';
import type { HandleFixtureApi } from '../../apps/fixtures/src/lib/dialog-handle-cases.js';
// Full ordered source predicates for portable D declarations. MIT: parity/dialog/UPSTREAM_LICENSE.
// Original isJSDOM guards remain in the feature ledger; browser-only groups run in real Chromium.
// Testing Library user.click in the pin dispatches DOM input; these helpers retain that channel.
async function click(locator: Locator) {
  await locator.evaluate((element) => {
    const button = element as HTMLElement;
    button.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        composed: true,
        pointerType: 'mouse',
        button: 0,
        buttons: 1,
      }),
    );
    button.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, composed: true, button: 0, buttons: 1 }),
    );
    button.focus();
    button.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        composed: true,
        pointerType: 'mouse',
        button: 0,
      }),
    );
    button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true, button: 0 }));
    button.dispatchEvent(
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
type Method = Exclude<keyof HandleFixtureApi, 'warnings'>;
async function api(page: Page, method: Method, ...args: unknown[]) {
  return page.locator('main').evaluate(
    (node, { method, args }) => {
      const fixture = (node as HTMLElement & { api: HandleFixtureApi }).api;
      return (fixture[method] as (...args: unknown[]) => unknown)(...args);
    },
    { method, args },
  );
}
const content = (page: Page, text: string) =>
  page.locator('[role=dialog]').filter({ hasText: text });
const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true, includeHidden: true });
const lines = [
  99, 126, 159, 186, 249, 412, 490, 549, 612, 641, 700, 738, 775, 845, 871, 939, 987, 1020, 1048,
  1078, 1100, 1157, 1274, 1323, 1389, 1444, 1518, 1579, 1646, 1664, 1682, 1711, 1746, 1764, 1802,
  1835, 1891, 1921, 1955, 2028, 2088, 2129,
];
async function openAndClose(page: Page) {
  await click(button(page, 'Trigger'));
  await expect(content(page, 'Dialog Content')).toBeVisible();
  await click(button(page, 'Close'));
  await expect(content(page, 'Dialog Content')).toHaveCount(0);
}
for (const reference of [false, true])
  for (const line of lines)
    test(`D:${line} ${reference ? 'React reference' : 'Svelte'} complete portable handle body`, async ({
      page,
    }) => {
      const warnings: string[] = [];
      const errors: string[] = [];
      const consoleErrors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'warning') warnings.push(message.text());
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      if ([700, 738, 775, 845, 871].includes(line)) {
        const time = new Date('2026-01-01T00:00:00Z');
        await page.clock.install({ time });
        await page.clock.pauseAt(time);
      }
      await page.goto(`/dialog-handles?line=${line}${reference ? '&reference' : ''}`);
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      const popup = page.getByRole('dialog');
      const trigger = button(page, 'Trigger');
      const payload = page.getByTestId('payload');
      if ([99, 126, 159].includes(line)) {
        expect(
          warnings.some((message) => message.includes('no root using this handle is mounted')),
        ).toBe(false);
        expect(await api(page, 'isOpen')).toBe(line !== 159);
        if (line === 126) await expect(payload).toHaveText('8');
      } else if (line === 186 || line === 249) {
        if (line === 249) {
          await click(trigger);
          await expect(popup).toBeVisible();
          await expect(payload).toHaveText('1');
          await click(popup.getByRole('button', { name: 'Unmount root' }));
          expect(await api(page, 'isOpen')).toBe(false);
          await expect(popup).toHaveCount(0);
        }
        const before = warnings.length;
        if (line === 186) {
          await api(page, 'open', 'trigger');
          await api(page, 'payload', 8);
        } else {
          await api(page, 'payload', 8);
          await api(page, 'open', 'trigger');
        }
        await api(page, 'close');
        expect(await api(page, 'isOpen')).toBe(false);
        expect(
          warnings
            .slice(before)
            .filter((message) => message.includes('no root using this handle is mounted')),
        ).toHaveLength(3);
        if (line === 186) await api(page, 'mount');
        else await click(button(page, 'Remount root'));
        await expect(popup).toHaveCount(0);
        await expect(payload).toHaveText('No payload');
        await click(trigger);
        await expect(popup).toBeVisible();
        await expect(payload).toHaveText('1');
      } else if (line === 412) {
        await api(page, 'payload', 8, 'B');
        await expect(content(page, 'Dirty dialog')).toBeVisible();
        await expect(page.getByTestId('dirty-payload')).toHaveText('8');
        await click(button(page, 'Unmount dirty root'));
        expect(await api(page, 'isOpen', 'B')).toBe(false);
        await expect(popup).toHaveCount(0);
        await expect(payload).toHaveText('No payload');
        await click(button(page, 'Switch to handle B'));
        expect(await api(page, 'isOpen', 'B')).toBe(false);
        await expect(popup).toHaveCount(0);
        await expect(payload).toHaveText('No payload');
        await click(trigger);
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(payload).toHaveText('1');
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      } else if (line === 490) {
        await click(trigger);
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await click(button(page, 'Use handle B'));
        await expect(content(page, 'Dialog Content')).toBeVisible();
        expect(await api(page, 'isOpen', 'B')).toBe(true);
        expect(await api(page, 'isOpen', 'A')).toBe(false);
        await expect(trigger).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
        await click(button(page, 'Use handle A'));
        await expect(content(page, 'Dialog Content')).toBeVisible();
        expect(await api(page, 'isOpen', 'A')).toBe(true);
        expect(await api(page, 'isOpen', 'B')).toBe(false);
        await api(page, 'close', 'A');
        await expect(content(page, 'Dialog Content')).toHaveCount(0);
      } else if (line === 549) {
        await api(page, 'open', 'trigger');
        expect(await api(page, 'isOpen')).toBe(false);
        await expect(popup).toHaveCount(0);
        await click(button(page, 'Toggle handle'));
        await api(page, 'open', 'trigger');
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
        await api(page, 'close');
        await expect(popup).toHaveCount(0);
        await click(button(page, 'Toggle handle'));
        await api(page, 'open', 'trigger');
        expect(await api(page, 'isOpen')).toBe(false);
        await expect(popup).toHaveCount(0);
        expect(
          warnings.filter((message) => message.includes('no root using this handle is mounted')),
        ).toHaveLength(2);
      } else if (line === 612 || line === 641) {
        if (line === 612) await click(trigger);
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(trigger).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
        if (line === 641) {
          await expect(button(page, 'Other')).not.toHaveAttribute('aria-controls');
          await expect(payload).toHaveText('5');
        }
      } else if ([700, 738, 775, 845, 871].includes(line)) {
        if (line === 845) {
          await page.clock.runFor(20);
          expect(warnings.some((message) => message.includes('more than one mounted root'))).toBe(
            true,
          );
        } else {
          await api(page, 'phase', 'overlap');
          if (line === 871) {
            expect(warnings.some((message) => message.includes('No trigger found'))).toBe(false);
            expect(await api(page, 'isOpen')).toBe(true);
            await expect(trigger).toHaveAttribute('aria-expanded', 'true');
            await api(page, 'phase', 'incoming');
            expect(await api(page, 'isOpen')).toBe(true);
          } else {
            await api(page, 'phase', line === 775 ? 'outgoing' : 'incoming');
            await page.clock.runFor(20);
            if (line !== 700) {
              await api(page, 'open', null);
              await expect(content(page, line === 775 ? 'Outgoing' : 'Incoming')).toBeVisible();
              await expect(content(page, line === 775 ? 'Incoming' : 'Outgoing')).toHaveCount(0);
              expect(await api(page, 'isOpen')).toBe(true);
            }
            if (line === 700 || line === 775)
              expect(
                warnings.some((message) => message.includes('more than one mounted root')),
              ).toBe(false);
          }
        }
      } else if (line === 939 || line === 1274) {
        await expect(content(page, 'Dialog Content')).toHaveCount(0);
        for (const number of [1, 2, 3]) {
          await click(button(page, `Trigger ${number}`));
          await expect(content(page, 'Dialog Content')).toHaveCount(1);
          if (number !== 3) {
            await click(button(page, 'Close'));
            await expect(content(page, 'Dialog Content')).toHaveCount(0);
          }
        }
      } else if (line === 987 || line === 1764) {
        await click(button(page, 'Trigger 1'));
        await expect(page.getByTestId('content')).toHaveText('1');
        await click(button(page, 'Trigger 2'));
        await expect(page.getByTestId('content')).toHaveText('2');
      } else if (line === 1020 || line === 1802) {
        await click(button(page, 'Trigger 1'));
        await page.getByTestId('dialog-popup').evaluate((node) => {
          Object.assign(window, { retainedDialogPopup: node });
        });
        await click(button(page, 'Trigger 2'));
        expect(
          await page
            .getByTestId('dialog-popup')
            .evaluate(
              (node) =>
                node ===
                (window as typeof window & { retainedDialogPopup: HTMLElement })
                  .retainedDialogPopup,
            ),
        ).toBe(true);
      } else if (line === 1048) {
        const first = button(page, 'Trigger 1');
        const second = button(page, 'Trigger 2');
        await expect(first).toHaveAttribute('aria-expanded', 'false');
        await expect(second).toHaveAttribute('aria-expanded', 'false');
        await click(first);
        await expect(popup).toHaveCount(1);
        const controls = await first.getAttribute('aria-controls');
        expect(controls).not.toBeNull();
        expect(await popup.getAttribute('id')).toBe(controls);
        await expect(first).toHaveAttribute('aria-expanded', 'true');
        await expect(second).toHaveAttribute('aria-expanded', 'false');
      } else if (line === 1078) {
        const first = button(page, 'Trigger 1');
        const second = button(page, 'Trigger 2');
        await expect(popup).toHaveCount(1);
        await expect(first).toHaveAttribute('aria-expanded', 'false');
        await expect(first).not.toHaveAttribute('aria-controls');
        await expect(second).toHaveAttribute('aria-expanded', 'true');
        await expect(second).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
      } else if (line === 1100) {
        const external = button(page, 'Open programmatically');
        await click(external);
        await expect(page.getByTestId('content')).toHaveText('2');
        await click(button(page, 'Close'));
        await expect(page.getByTestId('content')).toHaveCount(0);
        await expect(external).toBeFocused();
      } else if (line === 1157 || line === 1835) {
        await click(button(page, 'Dialog 1'));
        await expect(page.getByTestId('content')).toHaveText('1');
        await click(button(page, 'Update payloads'));
        await expect(page.getByTestId('content')).toHaveText('8');
      } else if (line === 1323) {
        const first = button(page, 'Trigger 1');
        const second = button(page, 'Trigger 2');
        await click(first);
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await click(popup.getByRole('button', { name: 'Unmount root' }));
        await expect(content(page, 'Dialog Content')).toHaveCount(0);
        await click(button(page, 'Remount root'));
        await expect(content(page, 'Dialog Content')).toHaveCount(0);
        await expect(first).toHaveAttribute('aria-expanded', 'false');
        await click(first);
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(first).toHaveAttribute('aria-expanded', 'true');
        await expect(first).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
        await expect(second).toHaveAttribute('aria-expanded', 'false');
      } else if (line === 1389) {
        await expect(payload).toHaveText('No payload');
        await api(page, 'payload', 8);
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(payload).toHaveText('8');
        await click(popup.getByRole('button', { name: 'Unmount root' }));
        await expect(payload).toHaveCount(0);
        await click(button(page, 'Remount root'));
        await expect(popup).toHaveCount(0);
        await expect(payload).toHaveText('No payload');
      } else if (line === 1444) {
        await click(trigger);
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(trigger).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
        await click(popup.getByRole('button', { name: 'Unmount root' }));
        await expect(content(page, 'Dialog Content')).toHaveCount(0);
        await click(button(page, 'Remount root'));
        await expect(content(page, 'Dialog Content')).toHaveCount(0);
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger).not.toHaveAttribute('aria-controls');
      } else if (line === 1518 || line === 1579) {
        if (line === 1518) {
          await expect(content(page, 'Dialog Content')).toBeVisible();
          await click(popup.getByRole('button', { name: 'Unmount root' }));
        } else await click(button(page, 'Unmount root'));
        await expect(content(page, 'Dialog Content')).toHaveCount(0);
        await click(
          button(page, line === 1518 ? 'Remount uncontrolled root' : 'Remount controlled root'),
        );
        if (line === 1518) await expect(content(page, 'Dialog Content')).toHaveCount(0);
        else {
          await expect(content(page, 'Dialog Content')).toBeVisible();
          expect(
            consoleErrors.some(
              (message) =>
                message.includes('controlled state of openProp') && message.includes('controlled'),
            ),
          ).toBe(false);
        }
      } else if ([1646, 1664, 1682, 1746].includes(line)) {
        await openAndClose(page);
        const sequence = line === 1664 ? [1, 2, 3] : line === 1682 ? [0, 0] : [2, 1, 0];
        for (const nesting of sequence) {
          if (line === 1682) await api(page, 'recreate');
          else await api(page, 'wrappers', nesting, line === 1746);
          await openAndClose(page);
        }
      } else if (line === 1711) {
        await expect(page.getByTestId('dialog-popup')).toHaveCount(1);
        await expect(trigger).toHaveAttribute(
          'aria-controls',
          (await page.getByTestId('dialog-popup').getAttribute('id'))!,
        );
        await api(page, 'recreate');
        await expect(page.getByTestId('dialog-popup')).toHaveCount(1);
        await expect(trigger).toHaveAttribute(
          'aria-controls',
          (await page.getByTestId('dialog-popup').getAttribute('id'))!,
        );
      } else if (line === 1891) {
        await click(button(page, 'Trigger 1'));
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await button(page, 'Trigger 2').focus();
        await page.keyboard.press('Escape');
        await expect(content(page, 'Dialog Content')).toHaveCount(0);
      } else if (line === 1921) {
        await expect(popup).toHaveCount(0);
        await api(page, 'open', 'trigger');
        await expect(popup).toHaveCount(1);
        await expect(page.getByTestId('content')).toHaveText('Content');
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await api(page, 'close');
        await expect(popup).toHaveCount(0);
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      } else if (line === 1955) {
        await api(page, 'open', 'trigger');
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(trigger).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
        await expect(payload).toHaveText('7');
        await click(popup.getByRole('button', { name: 'Unmount root' }));
        await expect(popup).toHaveCount(0);
        await click(button(page, 'Remount root'));
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await api(page, 'open', 'trigger');
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(trigger).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
        await expect(payload).toHaveText('7');
      } else if (line === 2028) {
        const a = button(page, 'A trigger');
        await api(page, 'open', 'a', 'A');
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(a).toHaveAttribute('aria-expanded', 'true');
        await api(page, 'close', 'A');
        await expect(content(page, 'Dialog Content')).toHaveCount(0);
        await click(button(page, 'Switch root to B'));
        const before = warnings.length;
        await api(page, 'open', 'a', 'B');
        await expect(content(page, 'Dialog Content')).toBeVisible();
        await expect(a).toHaveAttribute('aria-expanded', 'false');
        expect(warnings.slice(before).some((message) => message.includes('No trigger found'))).toBe(
          true,
        );
      } else if (line === 2088 || line === 2129) {
        const first = button(page, 'Trigger 1');
        const second = button(page, 'Trigger 2');
        await expect(popup).toHaveCount(0);
        if (line === 2088) await api(page, 'open', 'trigger2');
        else await api(page, 'payload', 8);
        await expect(popup).toHaveCount(1);
        await expect(page.getByTestId('content')).toHaveText(line === 2088 ? '2' : '8');
        if (line === 2088) {
          await expect(second).toHaveAttribute('aria-expanded', 'true');
          await expect(first).not.toHaveAttribute('aria-expanded', 'true');
        } else {
          await expect(first).not.toHaveAttribute('aria-expanded', 'true');
          await expect(second).not.toHaveAttribute('aria-expanded', 'true');
        }
        await api(page, 'close');
        await expect(popup).toHaveCount(0);
        if (line === 2088) await expect(second).toHaveAttribute('aria-expanded', 'false');
      }
      expect(errors).toEqual([]); // Supplemental diagnostics, separate from original predicates.
    });
