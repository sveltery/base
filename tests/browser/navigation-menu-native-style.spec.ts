// Bare native Svelte SSR/hydration/style witnesses; no Base/Original parity credit.
import { expect, test, type Locator } from '@playwright/test';
const route = '/navigation-menu/native-style';
async function sample(host: Locator) {
  return host.evaluate((element) => {
    const host = element as HTMLElement;
    return {
      connected: host.isConnected,
      color: host.style.color,
      pointer: host.style.pointerEvents,
      popupWidth: host.style.getPropertyValue('--popup-width'),
      popupHeight: host.style.getPropertyValue('--popup-height'),
      positionerWidth: host.style.getPropertyValue('--positioner-width'),
      positionerHeight: host.style.getPropertyValue('--positioner-height'),
    };
  });
}
for (const representation of ['attribute', 'spread']) {
  test(`bare native ${representation} SSR then hydration replaces imperative pointer and sizing`, async ({
    page,
    request,
  }) => {
    const response = await request.get(route);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html).toContain(`data-testid="bare-${representation}-host"`);
    expect(html).toContain('style="color:red;"');
    expect(html).toContain('data-hydrated="false"');
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (/hydration/i.test(message.text())) errors.push(message.text());
    });
    await page.goto(route);
    await expect(page.getByTestId('bare-style-witness')).toHaveAttribute('data-hydrated', 'true');
    const host = page.getByTestId(`bare-${representation}-host`);
    // Keep the same actual host throughout native state updates.
    const captured = await host.elementHandle();
    expect(captured).not.toBeNull();
    await page.getByTestId('bare-write').click();
    expect(await sample(host)).toEqual({
      connected: true,
      color: 'red',
      pointer: 'auto',
      popupWidth: '250px',
      popupHeight: '120px',
      positionerWidth: '250px',
      positionerHeight: '120px',
    });
    await page.getByTestId('bare-update').click();
    expect(await sample(host)).toEqual({
      connected: true,
      color: 'blue',
      pointer: '',
      popupWidth: '',
      popupHeight: '',
      positionerWidth: '',
      positionerHeight: '',
    });
    await page.getByTestId('bare-author').click();
    expect(await sample(host)).toEqual({
      connected: true,
      color: 'blue',
      pointer: 'auto',
      popupWidth: '375px',
      popupHeight: '160px',
      positionerWidth: '375px',
      positionerHeight: '160px',
    });
    expect(
      await captured!.evaluate(
        (element, id) => element === document.querySelector(`[data-testid="${id}"]`),
        `bare-${representation}-host`,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
