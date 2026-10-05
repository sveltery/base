// Full source Button helper/composition witnesses over actual React 19.2.8 and native Svelte. MIT.
// Supplements retain ordinary source predicate expectations and earn zero new ordinary credit.
import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/button-source?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main[data-hydrated=true]')).toHaveCount(1);
  return page.locator('#source-button');
}
const calls = async (page: Page) => (JSON.parse(await page.getByTestId('source-calls').textContent() ?? '[]') as string[]).filter(call => call !== 'attach' && call !== 'detach');
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  for (const scenario of ['composite-custom', 'composite-native', 'composite-link', 'nested-custom']) test(`source Button ${framework} Space keydown activates once (${scenario})`, async ({ page }) => {
    const button = await setup(page, scenario, reference); await button.focus(); await expect(button).toBeFocused();
    await page.keyboard.down('Space'); expect((await calls(page)).filter(call => call === 'click')).toHaveLength(1);
    expect((await calls(page)).indexOf('keydown')).toBeLessThan((await calls(page)).indexOf('click'));
    await page.keyboard.up('Space'); expect((await calls(page)).filter(call => call === 'click')).toHaveLength(1);
    if (scenario === 'composite-link') await expect(page).toHaveURL(/#source-target$/);
    if (scenario === 'nested-custom') { await page.keyboard.press('Enter'); expect((await calls(page)).filter(call => call === 'click')).toHaveLength(2); }
  });
  for (const scenario of ['composite-menuitem', 'composite-option', 'composite-gridcell', 'composite-cancel']) test(`source Button ${framework} preserves composite cancellation (${scenario})`, async ({ page }) => {
    const button = await setup(page, scenario, reference); await button.focus(); await page.keyboard.press('Space'); expect((await calls(page)).filter(call => call === 'click')).toHaveLength(0);
  });
  test(`source Button ${framework} switch role activates despite default prevention`, async ({ page }) => {
    const button = await setup(page, 'composite-switch', reference); await button.focus(); await page.keyboard.down('Space'); expect((await calls(page)).filter(call => call === 'click')).toHaveLength(1); await page.keyboard.up('Space'); expect((await calls(page)).filter(call => call === 'click')).toHaveLength(1);
  });
  for (const scenario of ['composite-submit', 'composite-reset']) test(`source Button ${framework} composite click retains native form default (${scenario})`, async ({ page }) => {
    const button = await setup(page, scenario, reference); await button.focus(); await page.keyboard.down('Space'); expect((await calls(page)).filter(call => call === scenario.replace('composite-', ''))).toHaveLength(1); await page.keyboard.up('Space'); expect((await calls(page)).filter(call => call === scenario.replace('composite-', ''))).toHaveLength(1);
  });
  for (const scenario of ['nested-disabled', 'override-disabled']) test(`source Button ${framework} actual refs preserve source composite disabled repair (${scenario})`, async ({ page }) => {
    const button = await setup(page, scenario, reference); await expect(button).not.toHaveAttribute('disabled'); await expect(button).toHaveAttribute('aria-disabled', 'true'); await expect(page.getByTestId('source-ref')).toHaveText('source-button');
    if (scenario === 'nested-disabled') await expect(page.getByTestId('source-inner-ref')).toHaveText('source-button');
    await button.focus(); await expect(button).toBeFocused(); await page.keyboard.press('Space'); expect(await calls(page)).toEqual([]);
    if (scenario === 'nested-disabled') {
      await page.locator('#enable-button').click(); await expect(button).not.toHaveAttribute('data-disabled'); await expect(button).toHaveCSS('opacity', '1');
      await button.focus(); await page.keyboard.press('Space'); expect((await calls(page)).filter(call => call === 'click')).toHaveLength(1);
    }
    await page.locator('#remove-button').click(); await expect(button).toHaveCount(0); await expect(page.getByTestId('source-ref')).toHaveText('null');
    if (scenario === 'nested-disabled') await expect(page.getByTestId('source-inner-ref')).toHaveText('null');
    await page.locator('#remove-button').click(); await expect(button).toHaveCount(1); await expect(page.getByTestId('source-ref')).toHaveText('source-button');
  });
  test(`source Button ${framework} native-mode mismatched host excludes composite synthesis`, async ({ page }) => {
    const button = await setup(page, 'native-mismatch', reference); await button.focus(); await page.keyboard.press('Space'); expect((await calls(page)).filter(call => call === 'click')).toHaveLength(0);
  });
  test(`source Button ${framework} composed shadow event activates retargeted host`, async ({ page }) => {
    const button = await setup(page, 'shadow', reference);
    await button.evaluate(host => {
      const inner = host.shadowRoot!.querySelector('span')!; inner.focus(); inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true }));
    });
    expect((await calls(page)).filter(call => call === 'click')).toHaveLength(1);
  });
  test(`source Button ${framework} SSR markup hydrates with the same source host`, async ({ page, request }) => {
    const response = await request.get(`/button-source?case=nested-disabled${reference ? '&reference' : ''}`); const html = await response.text(); expect(html).toContain('id="source-button"'); expect(html).toContain('data-hydrated="false"');
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    const button = await setup(page, 'nested-disabled', reference); await expect(button).toHaveText('Source action'); await expect(button).not.toHaveAttribute('disabled'); await expect(page.getByTestId('source-ref')).toHaveText('source-button'); expect(errors).toEqual([]);
  });
}
