// Supplemental Svelte framework binding regressions; no upstream declaration credit.
import { test, expect } from '@playwright/test';
const kinds = ['element', 'button', 'dialog-trigger', 'dialog-portal', 'dialog-popup', 'dialog-backdrop', 'dialog-title', 'dialog-description', 'dialog-close', 'toast-viewport', 'toast-root', 'toast-title', 'toast-description', 'toast-content', 'toast-action', 'toast-close'];
for (const kind of kinds) for (const initial of ['undefined', 'null']) {
  test(`${kind}: ${initial} ref attaches and clears after component removal`, async ({page}) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`/ref-contract?kind=${kind}${initial === 'null' ? '&null' : ''}`);
    await expect(page.locator('main[data-hydrated]')).toHaveAttribute('data-hydrated', 'true');
    await expect(page.getByTestId('ref-state')).not.toHaveText(/^(undefined|null)$/);
    await page.getByRole('button', {name: 'Remove component', exact: true}).click();
    await expect(page.getByTestId('ref-state')).toHaveText('null'); expect(errors).toEqual([]);
  });
}
for (const kind of ['element', 'button', 'dialog-trigger']) {
  test(`${kind}: replacement render ref uses the actual span host`, async ({page}) => {
    await page.goto(`/ref-contract?kind=${kind}&custom`);
    await expect(page.getByTestId('ref-state')).toHaveText('SPAN');
    await page.getByRole('button', {name: 'Remove component', exact: true}).click();
    await expect(page.getByTestId('ref-state')).toHaveText('null');
  });
}
