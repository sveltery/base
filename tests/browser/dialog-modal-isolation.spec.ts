import { test, expect, type Page } from '@playwright/test';
// Supplemental paired rendered accessibility and cleanup contracts; no leaf credit.
async function command(page: Page, value: string) {
  await page
    .locator('main')
    .evaluate(
      (node: HTMLElement & { isolationCommand(command: string): void }, command) =>
        node.isolationCommand(command),
      value,
    );
}
async function restored(page: Page) {
  await expect(page.getByRole('button', { name: 'Outside', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Live sibling' })).toHaveCount(1);
  await expect(page.getByTestId('owned-hidden')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByTestId('owned-inert')).toHaveAttribute('inert', '');
  await expect(page.getByTestId('owned-empty')).toHaveAttribute('aria-hidden', '');
  await expect(page.getByTestId('owned-false')).not.toHaveAttribute('aria-hidden');
  await expect(page.locator('[data-base-ui-inert]')).toHaveCount(0);
  await expect.poll(() => page.locator('body').ariaSnapshot()).toContain('Announcement');
}
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  async function setup(page: Page, scenario = 'ordinary') {
    await page.goto(`/modal-isolation?case=${scenario}${reference ? '&reference' : ''}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByRole('button', { name: 'Open first', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'First dialog' })).toBeVisible();
  }
  test(`${framework}: outside roles disappear while live regions and popup remain accessible`, async ({
    page,
  }) => {
    await setup(page);
    await expect(page.getByRole('button', { name: 'Outside', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Live sibling' })).toHaveCount(0);
    await expect.poll(() => page.locator('body').ariaSnapshot()).toContain('Announcement');
    await expect(page.getByTestId('owned-hidden')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByTestId('owned-inert')).toHaveAttribute('inert', '');
    await expect(page.getByTestId('owned-false')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByTestId('owned-empty')).toHaveAttribute('aria-hidden', '');
    await expect
      .poll(() =>
        page
          .getByTestId('outside-wrapper')
          .evaluate((node) => !!node.closest('[data-base-ui-inert]')),
      )
      .toBe(true);
    await page.getByRole('button', { name: 'Close first', exact: true }).click();
    await restored(page);
    await expect(page.getByRole('button', { name: 'Open first', exact: true })).toBeFocused();
  });
  test(`${framework}: true/trap-focus/false mode changes synchronize isolation`, async ({
    page,
  }) => {
    await setup(page);
    // Visibility precedes the delayed initial-focus frame. Settle that work
    // before selecting Popup focus that modal-mode changes must preserve.
    await expect(page.getByRole('button', { name: 'Close first', exact: true })).toBeFocused();
    await page.getByTestId('first').focus();
    for (const mode of ['false', 'trap-focus', 'true', 'false']) {
      await command(page, mode);
      await expect(page.getByRole('button', { name: 'Outside', exact: true })).toHaveCount(
        mode === 'false' ? 1 : 0,
      );
      await expect(page.getByRole('dialog', { name: 'First dialog' })).toBeVisible();
      await expect(page.getByTestId('first')).toBeFocused();
      await expect
        .poll(() =>
          page
            .getByTestId('outside-wrapper')
            .evaluate((node) => !!node.closest('[data-base-ui-inert]')),
        )
        .toBe(true);
      await expect
        .poll(() =>
          page.evaluate(() =>
            [document.documentElement, document.body].some(
              (node) => getComputedStyle(node).overflowY === 'hidden',
            ),
          ),
        )
        .toBe(mode === 'true');
    }
    await command(page, 'close');
    await restored(page);
  });
  for (const removal of ['remove', 'remove-popup'])
    test(`${framework}: ${removal} restores attributes while logically open`, async ({ page }) => {
      await setup(page);
      await command(page, removal);
      await expect(page.getByTestId('first')).toHaveCount(0);
      await restored(page);
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
    });
  for (const scenario of ['ordinary', 'nested-body', 'sibling']) {
    for (const order of ['child-first', 'parent-first'])
      test(`${framework}: ${scenario} modal ownership ${order}`, async ({ page }) => {
        await setup(page, scenario);
        await command(page, 'second');
        await expect(page.getByRole('dialog', { name: 'Second dialog' })).toBeVisible();
        await expect(page.getByRole('dialog', { name: 'First dialog' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Outside', exact: true })).toHaveCount(0);
        await expect.poll(() => page.locator('body').ariaSnapshot()).toContain('Announcement');
        if (order === 'child-first') {
          await page.getByRole('button', { name: 'Close second', exact: true }).click();
          await expect(page.getByRole('dialog', { name: 'First dialog' })).toBeVisible();
          await expect(page.getByRole('button', { name: 'Outside', exact: true })).toHaveCount(0);
          await page.getByRole('button', { name: 'Close first', exact: true }).click();
        } else {
          await command(page, 'remove');
          if (scenario === 'sibling') {
            await expect(page.getByRole('dialog', { name: 'Second dialog' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Outside', exact: true })).toHaveCount(0);
            await page.getByRole('button', { name: 'Close second', exact: true }).click();
          }
        }
        await restored(page);
      });
  }
}
