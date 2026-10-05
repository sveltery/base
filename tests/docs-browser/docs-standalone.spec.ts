import { test, expect } from '@playwright/test';

test('standalone navigation, source code copy/selection and reference hashes', async ({
  page,
  context,
}, testInfo) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/docs/components/dialog/');
  const active = page.locator('.SideNavLink[aria-current="page"]');
  await expect(active).toHaveText('Dialog');
  await expect(page.locator('.QuickNav')).toBeVisible();
  await page.getByRole('button', { name: 'Show code', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Hide code', exact: true }),
  ).toBeVisible();
  const example = page.locator('.DemoSourceBrowser');
  const source = await example.textContent();
  await page.locator('.DemoCodeBlockCopyButton').click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(source);
  await page.getByRole('button', { name: 'Hide code', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Show code', exact: true }),
  ).toBeVisible();
  const viewport = page.locator('.CodeBlockViewport').first();
  await viewport.focus();
  await page.keyboard.press('Control+a');
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString()))
    .toBe(await viewport.textContent());
  const reference = page.locator('.ReferenceTrigger').first();
  const id = await reference.getAttribute('id');
  await page.goto('/docs/components/dialog/#' + id);
  await expect(
    page.locator('.ReferenceTrigger').first().locator('..'),
  ).toHaveAttribute('open', '');
  await page.locator('.SideNavLink', { hasText: /^Button$/ }).click();
  await expect(page).toHaveURL(/\/docs\/components\/button\/?$/);
  await expect(page.locator('.SideNavLink[aria-current="page"]')).toHaveText(
    'Button',
  );
  await page.screenshot({
    path: testInfo.outputPath('desktop-button.png'),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test('cold search suppresses defaults while pending, native focus and IME', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/src/lib/docs/search/sitemap.ts*', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/docs/');
  await page.getByRole('button', { name: /^Search/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Search documentation' });
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);
  const input = dialog.getByRole('textbox', { name: 'Search', exact: true });
  await input.fill('button');
  await expect(dialog.locator('[aria-busy="true"]')).toBeVisible();
  await expect(dialog.locator('.SearchOptionItem')).toHaveCount(0);
  release();
  await expect(dialog.locator('.SearchOptionItem').first()).toBeVisible();
  await expect(dialog.locator('.SearchOptionItem').first()).toContainText(
    'Button',
  );
  const link = dialog.locator('.SearchOptionItem').first();
  await link.focus();
  const popupPromise = page.waitForEvent('popup');
  await page.keyboard.press('Control+Enter');
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/\/docs\/components\/button\/?$/);
  await popup.close();
  await input.focus();
  await input.dispatchEvent('keydown', {
    key: 'Enter',
    ctrlKey: true,
    isComposing: true,
  });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.keyboard.press('Control+k');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('mobile navigation stays within viewport and uses real routes', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/components/dialog/');
  await expect(page.locator('.SideNavRoot')).not.toBeVisible();
  await expect(page.locator('.QuickNav')).not.toBeVisible();
  await page.getByRole('button', { name: 'Navigation', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Docs navigation' });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole('textbox', { name: 'Search', exact: true })
    .fill('avatar');
  await expect(dialog.locator('.SearchOptionItem').first()).toContainText(
    'Avatar',
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('textbox', { name: 'Search', exact: true }),
  ).toHaveValue('');
  await dialog.getByRole('link', { name: 'Avatar', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/components\/avatar\/?$/);
  await expect(dialog).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('mobile-avatar.png'),
    fullPage: true,
  });
});
