// A bound Checkbox or Switch submits its `uncheckedValue` under the source's name while
// unchecked, as upstream does, so the server reads `false` instead of a missing key.
import { expect, test, type Page } from '@playwright/test';
import { debug, field, open } from '../shared/helpers.js';

const save = (page: Page) => page.getByRole('button', { name: 'Save' });

test('unchecked controls submit false', async ({ page }) => {
	const errors = await open(page, '/fixtures/form/unchecked');
	await save(page).click();
	await expect
		.poll(async () => (await debug(page)).result)
		.toEqual({ saved: { agree: false, newsletter: false } });
	expect(errors).toEqual([]);
});

test('checked controls submit true', async ({ page }) => {
	await open(page, '/fixtures/form/unchecked');
	await field(page, 'agree').getByRole('checkbox').click();
	await field(page, 'newsletter').getByRole('switch').click();
	await save(page).click();
	await expect
		.poll(async () => (await debug(page)).result)
		.toEqual({ saved: { agree: true, newsletter: true } });
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('unchecked controls submit false', async ({ page }) => {
		await page.goto('/fixtures/form/unchecked');
		await save(page).click();
		await expect
			.poll(async () => (await debug(page)).result)
			.toEqual({ saved: { agree: false, newsletter: false } });
	});
});
