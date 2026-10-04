import { expect, test, type Page } from '@playwright/test';
// Actual public composition/native framework supplements, zero ordinary declaration credit.
async function command(page: Page, value: string) {
  await page.locator('main').evaluate((node: HTMLElement & { closureCommand(value: string): void }, value) => node.closureCommand(value), value);
}
for (const reference of [false, true]) for (const keep of [false, true]) test(`${reference ? 'React reference' : 'Svelte'}: replacement Portal/Viewport owns payload, focus, remount, presence and teardown (${keep ? 'kept' : 'removed'})`, async ({ page }) => {
  await page.goto(`/dialog-source-closure?${reference ? 'reference&' : ''}${keep ? 'keep' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await page.getByRole('button', { name: 'Open closure' }).click();
  const popup = page.getByRole('dialog', { name: 'Source closure' });
  await expect(popup).toBeVisible(); await expect(page.locator('#closure-close')).toBeFocused();
  await expect(page.getByTestId('closure-payload')).toHaveText('7');
  await expect(page.getByTestId('closure-first').locator('[data-testid=closure-wrapper] > section > [role=presentation]')).toHaveClass('viewport active');
  // React inspects the outer replacement element; its wrapper has no ID.
  // Native snippets are opaque, so the native boundary observes the actual host.
  if (reference) await expect(page.locator('[aria-owns]')).toHaveCount(0);
  else await expect(page.locator('[aria-owns]')).toHaveAttribute('aria-owns', 'closure-portal');
  const original = await page.getByTestId('closure-portal').elementHandle();
  await command(page, 'id');
  if (reference) await expect(page.locator('[aria-owns]')).toHaveCount(0);
  else await expect(page.locator('[aria-owns]')).toHaveAttribute('aria-owns', 'closure-renamed');
  await command(page, 'clear-id'); await expect(page.locator('[aria-owns]')).toHaveCount(0);
  await command(page, 'second');
  await expect(page.getByTestId('closure-first').locator('[data-testid=closure-wrapper]')).toHaveCount(0);
  await expect(page.getByTestId('closure-second').locator('[data-testid=closure-wrapper] > section > [role=presentation]')).toHaveClass('viewport active');
  expect(await original!.evaluate(node => node.isConnected)).toBe(false);
  await expect(page.locator('#closure-close')).toBeFocused(); await expect(page.getByTestId('closure-completed')).toHaveText('[true,true]');
  await page.getByRole('button', { name: 'Close closure' }).click();
  await expect(popup).toHaveAttribute('data-closed', ''); await expect(page.locator('#closure-close')).toBeFocused();
  await command(page, 'unmount'); await expect(popup).toHaveCount(0); await expect(page.locator('#closure-trigger')).toBeFocused();
  if (keep) await expect(page.getByTestId('closure-portal')).toHaveCount(1); else await expect(page.getByTestId('closure-portal')).toHaveCount(0);
  await expect(page.getByTestId('closure-completed')).toHaveText('[true,true,false]');
  await command(page, 'remove');
  await expect.poll(() => page.locator('main').evaluate((node: HTMLElement & { closureRefs(): object }) => node.closureRefs())).toEqual({ portal: false, viewport: false, actions: false });
  await expect(page.getByTestId('closure-wrapper')).toHaveCount(0); await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
});
