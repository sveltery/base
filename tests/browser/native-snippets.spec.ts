// Actual native public component acceptance; no unchanged React renderer credit.
import { expect, test, type Page } from '@playwright/test';

type API = {
  snapshot(): { ref: HTMLElement | null; calls: string[]; pressed: boolean };
  setMode(value: 'default' | 'span' | 'same-span' | 'section'): void;
  setClass(value: string): void;
  setPressed(value: boolean): void;
  setCanceled(value: boolean): void;
  setPrevention(value: 'none' | 'default' | 'base'): void;
  updateAttachment(): void;
  hide(): void;
};
async function command(
  page: Page,
  name: Exclude<keyof API, 'snapshot'>,
  value?: unknown,
) {
  await page.locator('main').evaluate(
    (node, [method, argument]) => {
      const api = (node as HTMLElement & { nativeSnippet: API }).nativeSnippet;
      (
        api[method as Exclude<keyof API, 'snapshot'>] as (
          value?: unknown,
        ) => void
      )(argument);
    },
    [name, value] as const,
  );
}
async function snapshot(page: Page) {
  return page.locator('main').evaluate((node) => {
    const { ref, calls, pressed } = (
      node as HTMLElement & { nativeSnippet: API }
    ).nativeSnippet.snapshot();
    return {
      ref: ref
        ? {
            tag: ref.tagName,
            id: ref.id,
            connected: ref.isConnected,
            same: ref === node.querySelector('#native-toggle'),
          }
        : null,
      calls,
      pressed,
    };
  });
}
test.beforeEach(async ({ page }) => {
  await page.goto('/native-snippets');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
});
test('native-snippets SSR hydrates the actual Toggle host and preserves its children and binding', async ({
  page,
  request,
}) => {
  const response = await request.get('/native-snippets');
  const markup = await response.text();
  expect(response.ok()).toBe(true);
  expect(markup).toMatch(/<button[^>]*id="native-toggle"/);
  expect(markup).toContain('type="button"');
  expect(markup).toContain('Native children idle');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (
      message.type() === 'error' ||
      message.text().includes('hydration_mismatch')
    )
      errors.push(message.text());
  });
  await page.reload();
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  expect((await snapshot(page)).ref).toEqual({
    tag: 'BUTTON',
    id: 'native-toggle',
    connected: true,
    same: true,
  });
  await page.locator('#native-toggle').click();
  await expect(page.locator('#native-toggle')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#native-toggle')).toHaveText(
    'Native children pressed',
  );
  expect(errors).toEqual([]);
});
test('native-snippets spreads real component props, attachment symbols, state and children onto a replacement', async ({
  page,
}) => {
  await command(page, 'setMode', 'span');
  const host = page.locator('#native-toggle');
  await expect(host).toHaveJSProperty('tagName', 'SPAN');
  await expect(host).toHaveClass('owned before');
  await expect(host).toHaveCSS('padding', '10px');
  await expect(host).toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(host).toHaveAttribute('role', 'button');
  await expect(host).toHaveText('Native children idle');
  expect((await snapshot(page)).ref?.same).toBe(true);
  await host.evaluate((node) =>
    Object.assign(document.querySelector('main')!, { initialHost: node }),
  );
  await command(page, 'setClass', 'updated');
  await command(page, 'setPressed', true);
  await expect(host).toHaveClass('owned updated');
  await expect(host).toHaveAttribute('data-snippet-pressed', 'true');
  expect(
    await host.evaluate(
      (node) =>
        node ===
        (
          document.querySelector('main') as HTMLElement & {
            initialHost: Element;
          }
        ).initialHost,
    ),
  ).toBe(true);
});
for (const mode of ['default', 'span'] as const)
  test(`native-snippets ${mode} preserves event-detail cancellation`, async ({
    page,
  }) => {
    await command(page, 'setMode', mode);
    await command(page, 'setCanceled', true);
    await page.locator('#native-toggle').click();
    await expect(page.locator('#native-toggle')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(
      (await snapshot(page)).calls.filter(
        (call) => call.startsWith('consumer') || call.startsWith('change'),
      ),
    ).toEqual(['consumer:false', 'change:true:false:click']);
  });
for (const prevention of ['none', 'default', 'base'] as const)
  test(`native-snippets distinguishes native and Base cancellation (${prevention})`, async ({
    page,
  }) => {
    await command(page, 'setMode', 'span');
    await command(page, 'setPrevention', prevention);
    const prevented = await page.locator('#native-toggle').evaluate((node) => {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      node.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(prevented).toBe(prevention === 'default');
    expect((await snapshot(page)).pressed).toBe(prevention !== 'base');
  });
test('native-snippets honors native identity replacement and independent authored attachment teardown', async ({
  page,
}) => {
  await command(page, 'setMode', 'span');
  await page
    .locator('#native-toggle')
    .evaluate((node) =>
      Object.assign(document.querySelector('main')!, { initialHost: node }),
    );
  await command(page, 'updateAttachment');
  expect((await snapshot(page)).ref?.same).toBe(true);
  expect((await snapshot(page)).calls).toContain(
    'cleanup:0:SPAN:true:owned before',
  );
  await command(page, 'setMode', 'same-span');
  expect(
    await page
      .locator('#native-toggle')
      .evaluate(
        (node) =>
          node ===
          (
            document.querySelector('main') as HTMLElement & {
              initialHost: Element;
            }
          ).initialHost,
      ),
  ).toBe(false);
  expect((await snapshot(page)).calls).toContain(
    'cleanup:1:SPAN:false:owned before',
  );
  await command(page, 'hide');
  await expect(page.locator('#native-toggle')).toHaveCount(0);
  expect((await snapshot(page)).ref).toBeNull();
});
