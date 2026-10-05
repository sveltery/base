// Authored actual-pin/native paired browser supplements; zero unchanged Original credit.
import { expect, test, type Page } from '@playwright/test';
async function setup(
  page: Page,
  reference: boolean,
  family: string,
  options: Record<string, string> = {},
) {
  const parameters = new URLSearchParams({ family, ...options });
  if (reference) parameters.set('reference', '');
  await page.goto(`/popup-family?${parameters}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  test.info().annotations.push({
    type: 'browser-version',
    description: page.context().browser()?.version() ?? 'unavailable',
  });
}
async function command(page: Page, value: string) {
  await page
    .locator('main')
    .evaluate(
      (element, argument) =>
        (element as HTMLElement & { popupCommand(value: string): void }).popupCommand(argument),
      value,
    );
}
async function open(page: Page, family: string) {
  if (family === 'popover') await page.locator('#opener').click();
  else await page.locator('#opener').focus();
}
for (const reference of [false, true])
  for (const family of ['popover', 'preview-card', 'tooltip']) {
    const label = `${reference ? 'Original React' : 'native Svelte'} ${family}`;
    test(`${label}: trusted trigger, default hosts, popup labels and Escape`, async ({ page }) => {
      await setup(page, reference, family);
      await open(page, family);
      await expect(page.locator('[data-testid=popup]')).toBeVisible();
      await expect(page.locator('#payload')).toHaveText('Content 7');
      await expect(page.locator('[data-testid=arrow]')).toHaveAttribute('aria-hidden', 'true');
      if (family === 'popover') {
        await expect(page.locator('[role=dialog]')).toHaveAttribute('aria-labelledby', 'title');
        await expect(page.locator('[role=dialog]')).toHaveAttribute(
          'aria-describedby',
          'description',
        );
      }
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
    });
    test(`${label}: trusted hover respects opening delay`, async ({ page }) => {
      await setup(page, reference, family, { mode: 'hover', delay: '150', closeDelay: '0' });
      await page.locator('#opener').hover();
      await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
      await expect(page.locator('[data-testid=popup]')).toBeVisible();
      await page.locator('#outside').hover();
      await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
    });
    for (const cancel of ['open', 'close'])
      test(`${label}: Root ${cancel} cancellation`, async ({ page }) => {
        await setup(page, reference, family, {
          cancel,
          ...(cancel === 'close' ? { open: '' } : {}),
        });
        if (cancel === 'open') await open(page, family);
        else await command(page, 'close');
        await expect(page.locator('[data-testid=popup]')).toHaveCount(cancel === 'close' ? 1 : 0);
      });
    test(`${label}: detached handle owns both trigger payloads`, async ({ page }) => {
      await setup(page, reference, family, { mode: 'detached' });
      await command(page, 'open');
      await expect(page.locator('#payload')).toHaveText('Content 7');
      await expect(page.locator('#opener')).toHaveAttribute('data-popup-open', '');
      await command(page, 'second');
      await expect(page.locator('#payload')).toHaveText('Content 9');
      await expect(page.locator('#second')).toHaveAttribute('data-popup-open', '');
      await expect(page.locator('#opener')).not.toHaveAttribute('data-popup-open');
      await command(page, 'close');
      await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
    });
    test(`${label}: retained close and explicit unmount`, async ({ page }) => {
      await setup(page, reference, family, { mode: 'retain' });
      await command(page, 'open');
      await expect(page.locator('[data-testid=popup]')).toBeVisible();
      await command(page, 'close');
      await expect(page.locator('[data-testid=popup]')).toHaveAttribute('data-ending-style', '');
      await expect(page.locator('#opener')).not.toHaveAttribute('data-popup-open');
      await command(page, 'unmount');
      await expect(page.locator('[data-testid=popup]')).toHaveCount(0);
    });
    test(`${label}: actual viewport morph preserves previous content and host keys`, async ({
      page,
    }) => {
      await setup(page, reference, family, { mode: 'viewport' });
      await command(page, 'open');
      await expect(page.locator('[data-current] #payload')).toHaveText('Content 7');
      await command(page, 'second');
      await expect(page.locator('[data-current] #payload')).toHaveText('Content 9');
      await expect(page.locator('[data-previous]')).toHaveAttribute('inert', '');
      await expect(page.locator('[data-previous] #payload')).toHaveText('Content 7');
      await expect(page.locator('[data-previous]')).toHaveCount(0);
    });
    test(`${label}: kept-mounted portal follows native hydration and reopening`, async ({
      page,
    }) => {
      await setup(page, reference, family, { keep: '' });
      await expect(page.locator('[data-testid=positioner]')).toHaveAttribute('hidden', '');
      await open(page, family);
      await expect(page.locator('[data-testid=popup]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid=positioner]')).toHaveAttribute('hidden', '');
      await command(page, 'open');
      await expect(page.locator('[data-testid=popup]')).toBeVisible();
    });
  }
