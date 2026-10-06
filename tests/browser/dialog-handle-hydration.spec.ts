import { expect, test } from '@playwright/test';
// Complete D:19 ordered assertions with actual server rendering and same-node hydration.
// The fixture adapter is pending independent native lifecycle review. MIT: parity/dialog/UPSTREAM_LICENSE.
for (const reference of [false, true])
  test(`D:19 ${reference ? 'React reference' : 'Svelte'} stable fallback SSR then owning Root hydration`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const trigger = document.getElementById('trigger');
        if (trigger) {
          Object.assign(window, {
            dialogServerTrigger: trigger,
            dialogServerAttributes: {
              expanded: trigger.getAttribute('aria-expanded'),
              popupOpen: trigger.hasAttribute('data-popup-open'),
            },
          });
          observer.disconnect();
        }
      });
      observer.observe(document, { subtree: true, childList: true });
    });
    const response = await page.goto(`/dialog-handles-ssr${reference ? '?reference' : ''}`);
    const html = await response!.text();
    expect(html).toContain('aria-expanded="false"'); // source initial SSR assertion
    expect(html).not.toContain('data-popup-open'); // source initial SSR assertion
    const snapshot = await page.evaluate(
      () =>
        (
          window as typeof window & {
            dialogServerAttributes: { expanded: string | null; popupOpen: boolean };
          }
        ).dialogServerAttributes,
    );
    expect(snapshot).toEqual({ expanded: 'false', popupOpen: false });
    const trigger = page.getByRole('button', { name: 'Trigger', exact: true });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true'); // source hydrate() then waitFor
    await expect(trigger).toHaveAttribute('data-popup-open'); // source final assertion
    expect(
      await trigger.evaluate(
        (node) =>
          node ===
          (window as typeof window & { dialogServerTrigger: HTMLElement }).dialogServerTrigger,
      ),
    ).toBe(true);
    expect(errors).toEqual([]); // supplemental hydration diagnostics
  });
