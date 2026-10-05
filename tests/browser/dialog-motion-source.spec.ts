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
  await expect(page.getByTestId('popup')).toHaveCSS('opacity', '1');
}
async function captureExitAnimation(page: Page, pause: boolean) {
  await page.getByTestId('popup').evaluate((node, shouldPause) => {
    const result = { observed: false, animations: 0, paused: false };
    (window as Window & { dialogExitAnimation?: typeof result }).dialogExitAnimation = result;
    const observer = new MutationObserver(() => {
      if (!node.hasAttribute('data-ending-style')) return;
      // Force style resolution in this mutation task, before the 200 ms exit can finish.
      const animations = node.getAnimations();
      if (shouldPause) animations.forEach(animation => animation.pause());
      result.observed = true;
      result.animations = animations.length;
      result.paused = shouldPause && animations.every(animation => animation.playState === 'paused');
      observer.disconnect();
    });
    observer.observe(node, { attributes: true, attributeFilter: ['data-ending-style'] });
  }, pause);
}
async function exitAnimation(page: Page) {
  return page.evaluate(() => (window as Window & { dialogExitAnimation?: { observed: boolean; animations: number; paused: boolean } }).dialogExitAnimation!);
}
for (const route of ['/dialog', '/reference']) {
  test(`${route}: returned focus marks a completed close before keyboard reopening starts another close cycle`, async ({ page }) => {
    await setup(page, route);
    await captureExitAnimation(page, false);
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await exitAnimation(page)).observed).toBe(true);
    expect((await exitAnimation(page)).animations).toBeGreaterThan(0);
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
    await captureExitAnimation(page, true);
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await exitAnimation(page)).observed).toBe(true);
    expect((await exitAnimation(page)).animations).toBeGreaterThan(0);
    expect((await exitAnimation(page)).paused).toBe(true);
    await expect(page.getByTestId('popup')).toHaveAttribute('data-ending-style', '');
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
