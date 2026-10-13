// Scenario 5: composite controls bound to a remote form through their native inputs.
import { expect, test, type Page } from '@playwright/test';
import { debug, error, field, open } from '../shared/helpers.js';

const save = (page: Page) => page.getByRole('button', { name: 'Save' });
// What Kit reads from the form after a reset: unticked checkboxes send nothing.
const defaults = { plan: 'free', seats: 1, volume: 30 };

test('composites submit typed values', async ({ page }) => {
	const errors = await open(page, '/fixtures/form/composite');
	await page.getByRole('radio', { name: 'Pro' }).click();
	await page.getByRole('checkbox', { name: 'Svelte', exact: true }).click();
	await page.getByRole('checkbox', { name: 'SvelteKit' }).click();
	await page.getByRole('button', { name: 'Increase' }).click();
	await page.getByRole('button', { name: 'Increase' }).click();
	await field(page, 'agree').getByRole('checkbox').click();
	await field(page, 'newsletter').getByRole('switch').click();
	await page.getByRole('slider').focus();
	await page.keyboard.press('ArrowRight');
	const chosen = {
		plan: 'pro',
		tags: ['svelte', 'kit'],
		seats: 3,
		agree: true,
		newsletter: true,
		volume: 31
	};
	await expect.poll(async () => (await debug(page)).input).toEqual(chosen);
	await save(page).click();
	await expect.poll(async () => (await debug(page)).result).toEqual({ saved: chosen });
	expect(errors).toEqual([]);
});

test('issues land on the composite Fields', async ({ page }) => {
	await open(page, '/fixtures/form/composite');
	await page.getByRole('slider').focus();
	await page.keyboard.press('End');
	await save(page).click();
	await expect(error(page, 'tags')).toHaveText('Pick at least one topic');
	await expect(error(page, 'agree')).toHaveText('Accept the terms');
	await expect(error(page, 'volume')).toHaveText('Keep the volume at 80 or below');
	await expect(field(page, 'tags')).toHaveAttribute('data-invalid', '');
	await expect(error(page, 'plan')).toHaveCount(0);
	await expect(error(page, 'seats')).toHaveCount(0);
	await page.getByRole('checkbox', { name: 'SvelteKit' }).click();
	await expect(error(page, 'tags')).toHaveCount(0);
	await field(page, 'agree').getByRole('checkbox').click();
	await expect(error(page, 'agree')).toHaveCount(0);
});

test('a native reset restores every composite and the source input', async ({ page }) => {
	await open(page, '/fixtures/form/composite');
	await page.getByRole('radio', { name: 'Pro' }).click();
	await page.getByRole('checkbox', { name: 'Svelte', exact: true }).click();
	await page.getByRole('button', { name: 'Increase' }).click();
	await field(page, 'agree').getByRole('checkbox').click();
	await field(page, 'newsletter').getByRole('switch').click();
	await page.getByRole('slider').focus();
	await page.keyboard.press('ArrowRight');
	await expect.poll(async () => (await debug(page)).input).not.toEqual(defaults);
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect(page.getByRole('radio', { name: 'Free' })).toHaveAttribute('aria-checked', 'true');
	await expect(page.getByRole('radio', { name: 'Pro' })).toHaveAttribute('aria-checked', 'false');
	await expect(page.getByRole('checkbox', { name: 'Svelte', exact: true })).toHaveAttribute(
		'aria-checked',
		'false'
	);
	await expect(field(page, 'seats').getByRole('textbox')).toHaveValue('1');
	await expect(field(page, 'agree').getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
	await expect(field(page, 'newsletter').getByRole('switch')).toHaveAttribute(
		'aria-checked',
		'false'
	);
	await expect(page.getByRole('slider')).toHaveValue('30');
	await expect.poll(async () => (await debug(page)).input).toEqual(defaults);
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('the defaults submit and issues render', async ({ page }) => {
		await page.goto('/fixtures/form/composite');
		await save(page).click();
		await expect(error(page, 'agree')).toHaveText('Accept the terms');
		await expect(error(page, 'tags')).toHaveText('Pick at least one topic');
		await expect(error(page, 'plan')).toHaveCount(0);
		await expect(error(page, 'seats')).toHaveCount(0);
		await expect(field(page, 'plan').locator('input[value="free"]')).toBeChecked();
		await expect(field(page, 'seats').locator('input[name^="n:seats/"]')).toHaveValue('1');
		await expect(field(page, 'seats').getByRole('textbox')).toHaveValue('1');
		await expect(field(page, 'volume').locator('input[name^="n:volume/"]')).toHaveValue('30');
	});
});
