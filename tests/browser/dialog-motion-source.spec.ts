import { expect, test, type Page } from '@playwright/test';
// Physical CSS-animation Source/native supplements; no ordinary assertion credit.
async function completions(page: Page) {
  return JSON.parse(await page.getByTestId('log').innerText()).filter((entry: { channel: string }) => entry.channel === 'complete').map((entry: { open: boolean }) => entry.open) as boolean[];
}
async function setup(page: Page, route: string) {
  await page.goto(`${route}?keep&animate`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await page.locator('#trigger').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(() => completions(page)).toEqual([true]);
}
for (const route of ['/dialog', '/reference']) {
  test(`${route}: returned focus marks a completed close before keyboard reopening starts another close cycle`, async ({ page }) => {
    await setup(page, route);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('popup')).toHaveAttribute('data-ending-style', '');
    await expect(page.locator('#trigger')).toBeFocused();
    await expect.poll(() => completions(page)).toEqual([true, false]);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect.poll(() => completions(page)).toEqual([true, false, true]);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('popup')).toBeHidden();
    await expect.poll(() => completions(page)).toEqual([true, false, true, false]);
  });
  test(`${route}: reopening while a physical exit animation is paused aborts that incomplete close`, async ({ page }) => {
    await setup(page, route);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('popup')).toHaveAttribute('data-ending-style', '');
    expect(await page.getByTestId('popup').evaluate(node => {
      const animations = node.getAnimations(); animations.forEach(animation => animation.pause()); return animations.length;
    })).toBeGreaterThan(0);
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: 'first', exact: true })).toBeFocused();
    await page.locator('#trigger').evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByTestId('popup')).toHaveAttribute('data-open', '');
    await expect.poll(() => completions(page)).toEqual([true, true]);
    await page.waitForTimeout(250); // Beyond the canceled exit's duration, without an extra close completion.
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await completions(page)).toEqual([true, true]);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect.poll(() => completions(page)).toEqual([true, true, false]);
    await expect(page.locator('#trigger')).toBeFocused();
  });
}
