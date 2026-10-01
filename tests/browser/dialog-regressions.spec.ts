import { test, expect, type Page } from '@playwright/test';
// Review regressions; paired actual React/Svelte browser behavior, not upstream declaration ports.
async function setup(page: Page, reference: boolean, scenario: string) {
  await page.goto(`/dialog-regressions?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await page.locator('#regression-trigger').click(); await expect(page.getByRole('dialog')).toBeVisible();
}
async function command(page: Page, command: string) { await page.locator('main').evaluate((host: HTMLElement & { regressionCommand(command: string): void }, command) => host.regressionCommand(command), command); }
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  for (const scenario of ['cancel', 'controlled']) test(`${framework}: ${scenario} close deferral is discarded on cancellation`, async ({ page }) => {
    await setup(page, reference, scenario);
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(JSON.parse(await page.getByTestId('calls').innerText()).at(-1)).toMatchObject({ canceled: true });
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('completed')).toHaveText('[true,false]');
    await expect(page.locator('#regression-trigger')).toBeFocused();
  });
  test(`${framework}: accepted deferral waits for imperative unmount`, async ({ page }) => {
    await setup(page, reference, 'defer'); await command(page, 'close');
    await expect(page.getByRole('dialog')).toHaveAttribute('data-closed', '');
    await command(page, 'unmount'); await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('completed')).toHaveText('[true,false]');
  });
  for (const activation of ['pointer', 'Enter', ' ']) test(`${framework}: disabled custom anchor blocks ${activation} default action`, async ({ page }) => {
    await setup(page, reference, 'disabled');
    const link = page.getByRole('button', { name: 'Link close' });
    if (activation === 'pointer') await link.click({ force: true });
    else { await link.focus(); await page.keyboard.press(activation); }
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(new URL(page.url()).hash).toBe('');
    await expect(page.getByTestId('calls')).toHaveText('[{"open":true,"canceled":false,"trigger":"regression-trigger"}]');
  });
  test(`${framework}: enabled custom anchor retains native Enter action`, async ({ page }) => {
    await setup(page, reference, 'enabled');
    await page.getByRole('button', { name: 'Link close' }).focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toHaveCount(0); expect(new URL(page.url()).hash).toBe('#activated');
  });
  for (const scenario of ['shadow-entry', 'shadow-initial']) test(`${framework}: ${scenario} crosses shadow and slot boundaries in Portal order`, async ({ page }) => {
    await setup(page, reference, scenario);
    if (scenario === 'shadow-entry') { await expect(page.locator('#regression-trigger')).toBeFocused(); await page.keyboard.press('Tab'); }
    await expect(page.locator('#first')).toBeFocused();
    await page.keyboard.press('Tab'); await expect(page.locator('#last')).toBeFocused();
    await page.keyboard.press('Shift+Tab'); await expect(page.locator('#first')).toBeFocused();
    await page.keyboard.press('Shift+Tab'); await expect(page.locator('#regression-trigger')).toBeFocused();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Tab'); await expect(page.locator('#first')).toBeFocused();
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    await expect(page.locator('#after')).toBeFocused(); await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
  });
  test(`${framework}: shadow keepMounted restores slotted tabindex through close and teardown`, async ({ page }) => {
    await setup(page, reference, 'shadow-keep');
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.keyboard.press('Tab'); await expect(page.locator('#first')).toBeFocused();
      await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await expect(page.locator('#after')).toBeFocused();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.locator('#last')).toHaveAttribute('tabindex', '0');
      await expect(page.locator('#first')).not.toHaveAttribute('tabindex');
      await page.locator('#regression-trigger').click();
    }
    await command(page, 'remove'); await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
    await expect(page.locator('#portal-host [data-base-ui-portal]')).toHaveCount(0);
  });
}
