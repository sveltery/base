import { test, expect, type Page } from '@playwright/test';
// Supplemental audit regressions against pinned Base UI v1.8.0 (47b40521).
// Browser input is trusted; each test waits for hydration and actual focus entry.
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/native-tabbables?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const trigger = page.getByRole('button', { name: 'Open native dialog' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Native tab stops' })).toBeVisible();
  await expect(page.locator('#native-close')).toBeFocused();
}
async function tabTo(page: Page, id: string, reverse = false) {
  await page.keyboard.press(reverse ? 'Shift+Tab' : 'Tab');
  await expect(page.locator(`#${id}`)).toBeFocused();
}
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  for (const scenario of ['summary-only', 'details', 'shadow'])
    test(`${framework}: ${scenario} retains native summaries and wraps only at the composed boundary`, async ({
      page,
    }) => {
      await setup(page, scenario, reference);
      const order =
        scenario === 'summary-only'
          ? ['native-summary']
          : scenario === 'shadow'
            ? ['native-summary', 'details-child', 'slotted-editable']
            : ['native-summary', 'details-child'];
      for (const id of [...order, 'native-close']) await tabTo(page, id);
      for (const id of [...order].reverse().concat('native-close')) await tabTo(page, id, true);
      // Native Enter collapses/expands details; hidden descendants disappear from
      // the boundary without losing the summary itself (including a shadow root).
      await tabTo(page, 'native-summary');
      await page.keyboard.press('Enter');
      await tabTo(page, scenario === 'shadow' ? 'slotted-editable' : 'native-close');
      if (scenario === 'shadow') await tabTo(page, 'native-close');
      await tabTo(page, 'native-summary');
      await page.keyboard.press('Enter');
      await tabTo(page, scenario === 'summary-only' ? 'native-close' : 'details-child');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Open native dialog' })).toBeFocused();
    });
  test(`${framework}: closed details skip body controls and open with trusted Enter`, async ({
    page,
  }) => {
    await setup(page, 'closed', reference);
    await tabTo(page, 'native-summary');
    await tabTo(page, 'native-close');
    await tabTo(page, 'native-summary', true);
    await page.keyboard.press('Enter');
    await tabTo(page, 'details-child');
    await tabTo(page, 'native-close');
  });
  test(`${framework}: valid editable values participate in both Tab directions`, async ({
    page,
  }) => {
    await setup(page, 'editable', reference);
    for (const id of ['editable-empty', 'editable-true', 'editable-plain', 'native-close'])
      await tabTo(page, id);
    for (const id of ['editable-plain', 'editable-true', 'editable-empty', 'native-close'])
      await tabTo(page, id, true);
  });
  test(`${framework}: implicit details summary preserves native entry and pinned reverse-focus limitation`, async ({
    page,
  }) => {
    await setup(page, 'summaryless', reference);
    await tabTo(page, 'summaryless');
    await tabTo(page, 'native-close');
    // Native Tab reaches Chromium's implicit summary, but details.focus() does
    // not focus that internal node. Pinned reverse wrapping leaves its guard
    // focused. Record the observed limitation without claiming full wrapping.
    await page.keyboard.press('Shift+Tab');
    await expect
      .poll(() =>
        page.evaluate(() => document.activeElement?.hasAttribute('data-base-ui-focus-guard')),
      )
      .toBe(true);
    await expect(page.getByRole('dialog')).toBeVisible();
  });
  test(`${framework}: embedded frame is reached after Close without premature wrapping`, async ({
    page,
  }) => {
    await setup(page, 'embedded', reference);
    await page.keyboard.press('Tab');
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('native-iframe');
    await expect(
      page.frameLocator('#native-iframe').getByRole('button', { name: 'Frame button' }),
    ).toBeFocused();
  });
  test(`${framework}: Tab leaving a terminal iframe wraps to Close in the owning document`, async ({
    page,
  }) => {
    await setup(page, 'iframe-only', reference);
    const inside = page
      .frameLocator('#native-iframe')
      .getByRole('button', { name: 'Frame button' });
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.keyboard.press('Tab');
      await expect(inside).toBeFocused();
      // This keydown belongs to the child document. The parent's native guard
      // must catch focus when traversal leaves the frame, without frame access.
      await tabTo(page, 'native-close');
    }
    await page.keyboard.press('Tab');
    await expect(inside).toBeFocused();
    await tabTo(page, 'native-close', true);
    await expect(page.getByRole('dialog')).toBeVisible();
  });
  for (const scenario of ['audio', 'video'])
    test(`${framework}: native ${scenario} controls remain reachable at the boundary`, async ({
      page,
    }) => {
      await setup(page, scenario, reference);
      await tabTo(page, 'native-media');
      // Chromium may expose several internal media controls. Every stop stays
      // in the player until native traversal reaches the modal boundary guard.
      for (let stop = 0; stop < 12; stop++) {
        await page.keyboard.press('Tab');
        await expect
          .poll(() =>
            page.evaluate(() =>
              ['native-media', 'native-close'].includes(document.activeElement?.id ?? ''),
            ),
          )
          .toBe(true);
        if (
          await page
            .locator('#native-close')
            .evaluate((element) => element === document.activeElement)
        )
          break;
      }
      await expect(page.locator('#native-close')).toBeFocused();
      await tabTo(page, 'native-media', true);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Open native dialog' })).toBeFocused();
    });
}

for (const reference of [false, true])
  test(`${reference ? 'React reference' : 'Svelte'}: arbitrary outside Tab is left to native traversal`, async ({
    page,
  }) => {
    await setup(page, 'summary-only', reference);
    await page.evaluate(() => {
      const audio = document.createElement('audio');
      audio.id = 'outside-media';
      audio.controls = true;
      audio.tabIndex = 0;
      document.body.append(audio);
    });
    const outside = page.locator('#outside-media');
    await outside.focus();
    await expect(outside).toBeFocused();
    // Synthetic dispatch observes only prevention, not trusted browser navigation.
    // Source owns actual boundary traversal through focus guards, covered above.
    const prevented = await outside.evaluate((node) => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      node.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(prevented).toBe(false);
    await expect(outside).toBeFocused();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
