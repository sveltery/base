import { test, expect, type Page } from '@playwright/test';
// Complete source ports, MIT: parity/button/UPSTREAM_LICENSE. See ports.json for immutable assertions.
const cases = [
  ['B', 17, 'link'],
  ['B', 42, 'custom'],
  ['B', 78, 'modifier'],
  ['B', 100, 'native-disabled'],
  ['B', 135, 'custom-disabled'],
  ['B', 175, 'native-focusable'],
  ['B', 212, 'hover'],
  ['B', 243, 'becomes-disabled'],
  ['B', 284, 'custom-focusable'],
  ['U', 281, 'space-order'],
  ['U', 596, 'cancel-base'],
  ['U', 634, 'cancel-enter'],
  ['U', 661, 'cancel-space'],
  ['U', 786, 'enter-order'],
  ['U', 169, 'focus-blur'],
] as const;
async function calls(page: Page) {
  return JSON.parse(await page.getByTestId('calls').innerText()) as Record<string, number>;
}
async function pointerClick(page: Page) {
  const box = await page.locator('#tested-button').boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
}
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/button?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return page.locator('#tested-button');
}
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  for (const [part, line, scenario] of cases)
    test(`${part}:${line} ${framework} Button ${scenario}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const button = await setup(page, scenario, reference);
      if (scenario === 'link') {
        expect(await button.evaluate((node) => node.tagName)).toBe('A'); // B:27
        await page.keyboard.press('Tab');
        await expect(button).toBeFocused(); // :30
        expect(
          await button.evaluate((node) =>
            node.dispatchEvent(
              new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
            ),
          ),
        ).toBe(false); // :33
        await button.evaluate((node) =>
          node.dispatchEvent(
            new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }),
          ),
        );
        expect((await calls(page)).click).toBe(1); // :36
        await expect.poll(() => new URL(page.url()).hash).toBe('#target'); // :38
      } else if (scenario === 'custom') {
        expect(await button.evaluate((node) => node.tagName)).toBe('SPAN'); // :62
        await expect(button).toHaveAttribute('role', 'button');
        await expect(button).toHaveAttribute('tabindex', '0'); // :63/64
        await page.keyboard.press('Tab');
        await expect(button).toBeFocused(); // :67
        await page.keyboard.press('Enter');
        await page.keyboard.press('Space');
        for (const channel of ['capture', 'render', 'click', 'ancestor'])
          expect((await calls(page))[channel]).toBe(2); // :72–75
      } else if (scenario === 'modifier') {
        await page.keyboard.press('Tab');
        await expect(button).toBeFocused(); // :90
        await page.keyboard.press('Shift+Enter');
        expect((await calls(page)).click).toBe(1); // :94
        expect(JSON.parse(await page.getByTestId('clicks').innerText())[0].shiftKey).toBe(true); // :95
      } else if (scenario === 'hover') {
        await expect(button).not.toHaveAttribute('disabled');
        await expect(button).toHaveAttribute('data-disabled');
        await expect(button).toHaveAttribute('aria-disabled', 'true'); // :229–231
        await button.hover();
        expect((await calls(page)).hover).toBeGreaterThan(0); // :235; retained browser-only guard
        await pointerClick(page);
        expect((await calls(page)).click).toBe(0); // :239
      } else if (scenario === 'becomes-disabled') {
        await page.keyboard.press('Tab');
        await expect(button).toBeFocused(); // :268
        await button.click();
        expect((await calls(page)).click).toBe(1);
        await expect(button).toBeFocused();
        await expect(button).toHaveAttribute('aria-disabled', 'true'); // :272–274
        await pointerClick(page);
        await page.keyboard.press('Enter');
        await page.keyboard.press('Space');
        expect((await calls(page)).click).toBe(1);
        await expect(button).toBeFocused(); // :280/281
      } else if (scenario === 'focus-blur') {
        await expect(button).not.toBeFocused();
        expect((await calls(page)).focus).toBe(0); // U:199/201
        await page.keyboard.press('Tab');
        await expect(button).toBeFocused();
        expect((await calls(page)).focus).toBe(1); // :203/204
        await page.keyboard.press('Enter');
        expect((await calls(page)).keydown).toBe(0);
        expect((await calls(page)).click).toBe(0); // :207/208
        await page.keyboard.press('Space');
        expect((await calls(page)).keyup).toBe(0);
        expect((await calls(page)).click).toBe(0); // :211/212
        await pointerClick(page);
        for (const channel of ['keydown', 'keyup', 'click'])
          expect((await calls(page))[channel]).toBe(0); // :215–217
        expect((await calls(page)).blur).toBe(0);
        await page.keyboard.press('Tab');
        expect((await calls(page)).blur).toBe(1);
        await expect(button).not.toBeFocused(); // :219/221/222
      } else if (scenario.startsWith('cancel-')) {
        await button.focus();
        await expect(button).toBeFocused(); // U:622/654/681
        if (scenario !== 'cancel-space') {
          await page.keyboard.press('Enter');
          expect((await calls(page)).click).toBe(0);
        } // :626/658
        if (scenario !== 'cancel-enter') {
          await page.keyboard.press('Space');
          expect((await calls(page)).click).toBe(0);
        } // :631/685
      } else if (scenario.endsWith('-order')) {
        await button.focus();
        await expect(button).toBeFocused(); // U:299/801
        if (scenario === 'enter-order') expect((await calls(page)).keydown).toBe(0); // :803
        await button.evaluate(
          (node, key) =>
            node.dispatchEvent(
              new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
            ),
          scenario === 'space-order' ? ' ' : 'Enter',
        );
        expect((await calls(page)).keydown).toBe(1);
        expect((await calls(page)).click).toBe(scenario === 'space-order' ? 0 : 1); // :302/303 or :805/806
        if (scenario === 'space-order') {
          await button.evaluate((node) =>
            node.dispatchEvent(
              new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }),
            ),
          );
          expect((await calls(page)).keyup).toBe(1);
          expect((await calls(page)).click).toBe(1);
        } // :306/307
      } else {
        const nativeDisabled = scenario === 'native-disabled';
        const focusable = scenario.endsWith('focusable');
        if (nativeDisabled) await expect(button).toHaveAttribute('disabled');
        else await expect(button).not.toHaveAttribute('disabled');
        await expect(button).toHaveAttribute('data-disabled');
        if (nativeDisabled) await expect(button).not.toHaveAttribute('aria-disabled');
        else await expect(button).toHaveAttribute('aria-disabled', 'true');
        if (!nativeDisabled)
          await expect(button).toHaveAttribute('tabindex', focusable ? '0' : '-1');
        await page.keyboard.press('Tab');
        if (focusable) await expect(button).toBeFocused();
        else await expect(button).not.toBeFocused();
        await pointerClick(page);
        await page.keyboard.press('Space');
        await page.keyboard.press('Enter');
        for (const channel of ['click', 'mouse', 'pointer', 'keydown'])
          expect((await calls(page))[channel]).toBe(0);
      }
      expect(errors).toEqual([]);
    });
  for (const scenario of ['default', 'submit', 'reset', 'undefined-type'])
    test(`supplement: ${framework} Button native ${scenario} form behavior`, async ({ page }) => {
      const button = await setup(page, scenario, reference);
      if (scenario === 'undefined-type') await expect(button).not.toHaveAttribute('type');
      else
        await expect(button).toHaveAttribute('type', scenario === 'default' ? 'button' : scenario);
      if (scenario === 'reset')
        await page.getByRole('textbox', { name: 'Reset field' }).fill('changed');
      await button.focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');
      expect((await calls(page)).click).toBe(2);
      expect((await calls(page)).submit).toBe(
        ['submit', 'undefined-type'].includes(scenario) ? 2 : 0,
      );
      expect((await calls(page)).reset).toBe(scenario === 'reset' ? 2 : 0);
      if (scenario === 'reset')
        await expect(page.getByRole('textbox', { name: 'Reset field' })).toHaveValue('initial');
    });
  test(`supplement: ${framework} Button ignores ordinary descendant keyboard activation`, async ({
    page,
  }) => {
    await setup(page, 'descendant', reference);
    await page.getByRole('textbox', { name: 'Inner input' }).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    expect((await calls(page)).click).toBe(0);
  });
  for (const scenario of ['render-cancel', 'click-cancel'])
    test(`supplement: ${framework} Button ${scenario} composition`, async ({ page }) => {
      const button = await setup(page, scenario, reference);
      await button.focus();
      await page.keyboard.press('Enter');
      expect((await calls(page)).render).toBe(1);
      expect((await calls(page)).click).toBe(scenario === 'render-cancel' ? 0 : 1);
      expect((await calls(page)).ancestor).toBe(1);
    });
}
test('supplement: Svelte Button render attachments and bound DOM ref survive hydration', async ({
  page,
}) => {
  const button = await setup(page, 'attachment', false);
  await expect(button).toHaveAttribute('data-consumer-attached');
  await expect(page.getByTestId('ref')).toHaveText('tested-button');
  expect((await calls(page)).attached).toBe(1);
});
// Supplemental pinned-source restoration: chorded left mousedown has no new pointerdown.
// Pointer Events §4.1.1.1: https://www.w3.org/TR/pointerevents3/#chorded-button-interactions
for (const reference of [false, true])
  for (const scenario of ['custom-disabled', 'native-focusable'])
    test(`supplement: ${reference ? 'React reference' : 'Svelte'} Button disabled chorded mouse fallback ${scenario}`, async ({
      page,
    }) => {
      const button = await setup(page, scenario, reference);
      await button.evaluate((node) => {
        node.dataset.pointerdowns = '0';
        node.addEventListener(
          'pointerdown',
          () => {
            node.dataset.pointerdowns = String(Number(node.dataset.pointerdowns) + 1);
          },
          { capture: true },
        );
        node.addEventListener(
          'mousedown',
          (event) => {
            node.dataset.mousedownTrusted = String(event.isTrusted);
            node.dataset.mousedownButton = String(event.button);
            // Trusted input can run microtasks between listeners; sample after the
            // full dispatch, including delegated handlers and the browser default.
            setTimeout(() => {
              node.dataset.mousedownPrevented = String(event.defaultPrevented);
            }, 0);
          },
          { capture: true },
        );
      });
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      // Hold a secondary button outside, then press primary on the host. Chromium
      // generates trusted mousedown for the additional press without pointerdown.
      await page.mouse.move(700, 500);
      await page.mouse.down({ button: 'right' });
      try {
        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.down({ button: 'left' });
        await expect(button).toHaveAttribute('data-pointerdowns', '0');
        await expect(button).toHaveAttribute('data-mousedown-trusted', 'true');
        await expect(button).toHaveAttribute('data-mousedown-button', '0');
        // Preserve the pinned business quirk: callback suppression leaves default focus uncanceled.
        // This supplemental restoration earns no ordinary source declaration credit.
        await expect(button).toBeFocused();
        await expect(button).toHaveAttribute('data-mousedown-prevented', 'false');
        expect((await calls(page)).mouse).toBe(0);
      } finally {
        await page.mouse.up({ button: 'left' });
        await page.mouse.up({ button: 'right' });
      }
    });
