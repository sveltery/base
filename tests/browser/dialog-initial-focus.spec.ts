import { test, expect } from '@playwright/test';
// Complete leaf assertion ports; source pin and fixture/assertion mapping in
// parity/dialog/initial-focus-ports.md. MIT: parity/dialog/UPSTREAM_LICENSE.
for (const reference of [false, true]) {
  for (const [sourceLine, scenario] of [[92, 'ref'], [287, 'true'], [310, 'null'], [333, 'count']] as const) {
    test(`P:${sourceLine} ${reference ? 'React reference' : 'Svelte'} initialFocus ${scenario}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`/initial-focus?case=${scenario}${reference ? '&reference' : ''}`);
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      const trigger = page.getByRole('button', { name: 'Open', exact: true });
      // P:92 uses trigger.click() inside act; retain the programmatic click.
      if (scenario === 'ref') await trigger.evaluate((button: HTMLButtonElement) => button.click());
      else await trigger.click();
      await expect(page.getByTestId(scenario === 'ref' || scenario === 'count' ? 'input-2' : 'input-1')).toBeFocused();
      if (scenario === 'count') {
        await expect(page.getByTestId('focus-calls')).toHaveText('1');
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        await expect(trigger).toBeFocused();
        await expect(page.getByTestId('focus-calls')).toHaveText('1');
      }
      expect(errors).toEqual([]);
    });
  }
}
