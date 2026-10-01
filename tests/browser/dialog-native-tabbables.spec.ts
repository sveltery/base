import { test, expect, type Page } from '@playwright/test';
// Supplemental audit regressions against pinned Base UI v1.8.0 (47b40521).
// Browser input is trusted; each test waits for hydration and actual focus entry.
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/native-tabbables?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const trigger = page.getByRole('button', { name: 'Open native dialog' });
  await trigger.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Native tab stops' })).toBeVisible();
  await expect(page.locator('#native-close')).toBeFocused();
}
async function tabTo(page: Page, id: string, reverse = false) {
  await page.keyboard.press(reverse ? 'Shift+Tab' : 'Tab');
  await expect(page.locator(`#${id}`)).toBeFocused();
}
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  for (const scenario of ['summary-only', 'details', 'shadow']) test(`${framework}: ${scenario} retains native summaries and wraps only at the composed boundary`, async ({ page }) => {
    await setup(page, scenario, reference);
    const order = scenario === 'summary-only' ? ['native-summary'] : scenario === 'shadow' ? ['native-summary', 'details-child', 'slotted-editable'] : ['native-summary', 'details-child'];
    for (const id of [...order, 'native-close']) await tabTo(page, id);
    for (const id of [...order].reverse().concat('native-close')) await tabTo(page, id, true);
    // Native Enter collapses/expands details; hidden descendants disappear from
    // the boundary without losing the summary itself (including a shadow root).
    await tabTo(page, 'native-summary'); await page.keyboard.press('Enter');
    await tabTo(page, scenario === 'shadow' ? 'slotted-editable' : 'native-close');
    if (scenario === 'shadow') await tabTo(page, 'native-close');
    await tabTo(page, 'native-summary'); await page.keyboard.press('Enter');
    await tabTo(page, scenario === 'summary-only' ? 'native-close' : 'details-child');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open native dialog' })).toBeFocused();
  });
  test(`${framework}: closed details skip body controls and open with trusted Enter`, async ({ page }) => {
    await setup(page, 'closed', reference);
    await tabTo(page, 'native-summary'); await tabTo(page, 'native-close');
    await tabTo(page, 'native-summary', true); await page.keyboard.press('Enter');
    await tabTo(page, 'details-child'); await tabTo(page, 'native-close');
  });
  test(`${framework}: valid editable values participate in both Tab directions`, async ({ page }) => {
    await setup(page, 'editable', reference);
    for (const id of ['editable-empty', 'editable-true', 'editable-plain', 'native-close']) await tabTo(page, id);
    for (const id of ['editable-plain', 'editable-true', 'editable-empty', 'native-close']) await tabTo(page, id, true);
  });
  test(`${framework}: implicit details summary participates in wrapping`, async ({ page }) => {
    await setup(page, 'summaryless', reference);
    await tabTo(page, 'summaryless'); await tabTo(page, 'native-close');
    await tabTo(page, 'summaryless', true); await tabTo(page, 'native-close', true);
  });
  test(`${framework}: embedded frame is reached after Close without premature wrapping`, async ({ page }) => {
    await setup(page, 'embedded', reference);
    await page.keyboard.press('Tab');
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('native-iframe');
    await expect(page.frameLocator('#native-iframe').getByRole('button', { name: 'Frame button' })).toBeFocused();
  });
  for (const scenario of ['audio', 'video']) test(`${framework}: native ${scenario} controls remain reachable at the boundary`, async ({ page }) => {
    await setup(page, scenario, reference);
    await tabTo(page, 'native-media');
    await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open native dialog' })).toBeFocused();
  });
}
