import { expect, type Locator, type Page } from '@playwright/test';
import { readChecked } from './read-output.js';

/** The owner checkbox and the control both end unchecked after a click. */
export async function expectOwnerCleared(page: Page, control: Locator) {
	await expect(control).toHaveAttribute('aria-checked', 'false');
	await expect(page.getByRole('checkbox', { name: 'Owner checked' })).not.toBeChecked();
	expect(await readChecked(page)).toEqual([{ checked: false, reason: 'none', canceled: false }]);
}
