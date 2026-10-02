// Actual SvelteKit 2.70.3 spreads and direct native comparator; supplemental evidence only.
import { expect, test } from '@playwright/test';
for (const native of [true, false]) {
  const framework = native ? 'native' : 'Input'; const suffix = native ? '?native' : '';
  test(`${framework} direct checked descriptors receive trusted edits and programmatic props`, async ({ page }) => {
    await page.goto(`/input-checked-remote${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await expect(page.getByTestId('checkbox')).toBeChecked();
    await page.getByTestId('checkbox').click(); await expect(page.getByTestId('checkbox')).not.toBeChecked();
    await expect(page.getByTestId('events')).toHaveText(JSON.stringify([{ checked: false, type: native ? 'input' : 'click', trusted: true }]));
    await page.getByTestId('second').click(); await expect(page.getByTestId('owner')).toHaveText('{"enabled":false,"choice":"second"}');
    await expect(page.getByTestId('second')).toBeChecked(); await expect(page.getByTestId('first')).not.toBeChecked();
    await page.getByRole('button', { name: 'Programmatic', exact: true }).click();
    await expect(page.getByTestId('first')).toBeChecked(); await expect(page.getByTestId('second')).not.toBeChecked();
    await expect(page.getByTestId('owner')).toHaveText('{"enabled":false,"choice":"first"}');
  });
  test(`${framework} direct checked descriptor successful remote submit resets`, async ({ page }) => {
    await page.goto(`/input-checked-remote${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('checkbox').click(); await page.getByTestId('second').click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByTestId('result')).toHaveText('{"enabled":false,"choice":"second"}');
    await expect(page.getByTestId('checkbox')).toBeChecked();
    await expect(page.getByTestId('first')).not.toBeChecked(); await expect(page.getByTestId('second')).not.toBeChecked();
  });
  test(`${framework} canceled descriptor reset retains Kit checkbox fallback behavior`, async ({ page }) => {
    await page.goto(`/input-checked-remote?canceled-reset${native ? '&native' : ''}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('checkbox').click(); await page.getByTestId('second').click();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    // Kit snapshots unchecked FormData without this boolean key, then its descriptor
    // falls back to initial checked=true. The actual native comparator does the same.
    await expect(page.getByTestId('checkbox')).toBeChecked(); await expect(page.getByTestId('second')).toBeChecked();
    await expect(page.getByTestId('owner')).toHaveText('{"choice":"second"}');
  });
}
