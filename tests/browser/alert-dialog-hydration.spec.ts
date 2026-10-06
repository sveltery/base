import { expect, test } from '@playwright/test';
// Native framework/actual Source SSR hydration supplements; zero ordinary declaration credit.
for (const reference of [true, false])
  test(`${reference ? 'Actual React' : 'Native'} AlertDialog same-node generated-ID SSR, Portal and payload hydration`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const trigger = document.querySelector('[data-testid=ssr-trigger]');
        if (trigger) {
          Object.assign(window, {
            alertServerNode: trigger,
            alertServerSnapshot: {
              id: trigger.id,
              expanded: trigger.getAttribute('aria-expanded'),
              popupOpen: trigger.hasAttribute('data-popup-open'),
            },
          });
          observer.disconnect();
        }
      });
      observer.observe(document, { subtree: true, childList: true });
    });
    const response = await page.goto(`/alert-dialog-ssr${reference ? '?reference' : ''}`);
    const html = await response!.text();
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('data-popup-open');
    const before = await page.evaluate(
      () =>
        (
          window as typeof window & {
            alertServerSnapshot: { id: string; expanded: string; popupOpen: boolean };
          }
        ).alertServerSnapshot,
    );
    expect(before.expanded).toBe('false');
    expect(before.popupOpen).toBe(false);
    const trigger = page.getByTestId('ssr-trigger');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('data-popup-open', '');
    await expect(trigger).toHaveAttribute('id', before.id);
    expect(
      await trigger.evaluate(
        (node) =>
          node === (window as typeof window & { alertServerNode: HTMLElement }).alertServerNode,
      ),
    ).toBe(true);
    const popup = page.getByRole('alertdialog', { name: 'Hydrated confirmation' });
    await expect(popup).toBeVisible();
    expect(await trigger.getAttribute('aria-controls')).toBe(await popup.getAttribute('id'));
    await expect(page.getByTestId('ssr-payload')).toHaveText('7');
    await expect(page.getByRole('button', { name: 'Close hydrated' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });
