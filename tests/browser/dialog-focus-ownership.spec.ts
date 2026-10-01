import { test, expect, type Page } from '@playwright/test';
// Supplemental audit regressions. No complete upstream declaration credit is added.
type Commands = HTMLElement & { removeDialogPart(): void; closeDialog(): void; closeAndRemove(): void };
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/focus-ownership?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await page.getByRole('button', { name: 'Trigger A' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}
async function requests(page: Page) { return JSON.parse(await page.getByTestId('requests').innerText()); }
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  test(`${framework}: inactive Trigger focus and trusted click preserve inside ownership`, async ({ page }) => {
    await setup(page, 'triggers', reference);
    const second = page.getByRole('button', { name: 'Trigger B' });
    await second.focus();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await requests(page)).toEqual([{ open: true, reason: 'trigger-press', trigger: 'focus-a' }]);
    await second.locator('span').click();
    expect(await requests(page)).toEqual([{ open: true, reason: 'trigger-press', trigger: 'focus-a' }, { open: true, reason: 'trigger-press', trigger: 'focus-b' }]);
    await expect(page.getByRole('dialog')).toBeVisible();
  });
  for (const scenario of ['detach', 'popup-detach', 'close-and-detach', 'close']) test(`${framework}: ${scenario} restores final focus exactly once`, async ({ page }) => {
    await setup(page, scenario, reference);
    await page.getByRole('dialog').focus();
    await page.locator('main').evaluate((host: Commands, scenario) => {
      if (scenario === 'close-and-detach') host.closeAndRemove();
      else if (scenario === 'close') host.closeDialog();
      else host.removeDialogPart();
    }, scenario);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Trigger A' })).toBeFocused();
    await expect(page.getByTestId('returns')).toHaveText('1');
    if (scenario === 'close') {
      await page.locator('main').evaluate((host: Commands) => host.removeDialogPart());
      await expect(page.getByTestId('returns')).toHaveText('1');
    }
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  });
  for (const scenario of ['final-false', 'final-none']) test(`${framework}: removal honors ${scenario}`, async ({ page }) => {
    await setup(page, scenario, reference); await page.getByRole('dialog').focus();
    await page.locator('main').evaluate((host: Commands) => host.removeDialogPart());
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('returns')).toHaveText('1');
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  });
  for (const scenario of ['radio', 'radio-empty']) test(`${framework}: trusted Tab remains inside a single named radio group (${scenario})`, async ({ page }) => {
    await setup(page, scenario, reference);
    const first = page.getByRole('radio', { name: 'First radio' });
    const second = page.getByRole('radio', { name: 'Second radio' });
    await first.focus();
    for (const key of ['Tab', 'Shift+Tab', 'Tab']) { await page.keyboard.press(key); await expect(first).toBeFocused(); }
    if (scenario === 'radio') {
      await page.keyboard.press('ArrowRight'); await expect(second).toBeChecked(); await expect(second).toBeFocused();
      for (const key of ['Tab', 'Shift+Tab']) { await page.keyboard.press(key); await expect(second).toBeFocused(); }
    }
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await requests(page)).toEqual([{ open: true, reason: 'trigger-press', trigger: 'focus-a' }]);
  });
}
