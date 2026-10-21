// Select, Slider and NumberField in a SvelteKit remote form, spread and bound, with and without
// JavaScript. Each submits through its native input, so the server sees and echoes its value.
import { expect, test, type Page } from '@playwright/test';
import { debug, field, open } from '../shared/helpers.js';
import { SEATS_MESSAGE } from '../shared/schemas.js';

const url = '/fixtures/form/remote-controls';
const submit = (page: Page) => page.getByRole('button', { name: 'Order' });
const hiddenSelect = (page: Page, name: string) => field(page, name).locator('select');
const ranges = (page: Page, name: string) => field(page, name).locator('input[type="range"]');
const hiddenNumber = (page: Page, name: string) =>
	field(page, name).locator('input[type="number"]');
const numberText = (page: Page, name: string) => field(page, name).getByRole('textbox');

/** The `name` of every form control, in document order. */
const names = (page: Page) =>
	page
		.locator('form [name]')
		.evaluateAll((elements) => elements.map((element) => element.getAttribute('name')));

async function choose(page: Page, name: string, label: string) {
	await field(page, name).getByTestId('trigger').click();
	await page.getByRole('option', { name: label }).click();
	await expect(field(page, name).getByTestId('trigger')).toHaveText(label);
}

test('submits what the user picks through each native input', async ({ page }) => {
	const errors = await open(page, url);
	await choose(page, 'language', 'Français');
	await choose(page, 'region', 'Asia');
	await field(page, 'volume').getByRole('slider').focus();
	await page.keyboard.press('ArrowRight');
	await field(page, 'price').getByRole('slider', { name: 'Maximum price' }).focus();
	await page.keyboard.press('ArrowLeft');
	await page.getByRole('button', { name: 'More seats' }).click();
	await page.getByRole('button', { name: 'Fewer guests' }).click();

	// Every control names one input, so the form submits each value once.
	const submitted = await names(page);
	expect(new Set(submitted).size).toBe(submitted.length);

	await submit(page).click();
	await expect
		.poll(async () => (await debug(page)).result)
		.toEqual({
			language: 'fr',
			region: 'asia',
			volume: 51,
			price: [0, 990],
			seats: 2,
			guests: 1
		});
	expect(errors).toEqual([]);
});

test('a server issue on seats keeps every value the user picked', async ({ page }) => {
	await open(page, url);
	await choose(page, 'language', 'Deutsch');
	await numberText(page, 'seats').fill('9');
	await numberText(page, 'seats').blur();
	await submit(page).click();
	await expect(field(page, 'seats').getByTestId('error')).toHaveText(SEATS_MESSAGE);
	await expect(field(page, 'seats')).toHaveAttribute('data-invalid', '');
	await expect(numberText(page, 'seats')).toHaveValue('9');
	await expect(hiddenNumber(page, 'seats')).toHaveValue('9');
	await expect(field(page, 'language').getByTestId('trigger')).toHaveText('Deutsch');
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('the server renders every control with the values of a failed post', async ({ page }) => {
		await page.goto(url);
		// Server HTML renders each control's native input with its default.
		await expect(ranges(page, 'volume')).toHaveValue('50');
		await expect(ranges(page, 'price').nth(0)).toHaveValue('0');
		await expect(ranges(page, 'price').nth(1)).toHaveValue('1000');
		await expect(hiddenNumber(page, 'seats')).toHaveValue('1');
		await expect(hiddenNumber(page, 'guests')).toHaveValue('2');
		await expect(hiddenSelect(page, 'region')).toHaveValue('eu');
		const rendered = await names(page);
		expect(new Set(rendered).size).toBe(rendered.length);

		await hiddenSelect(page, 'language').selectOption('de', { force: true });
		await hiddenSelect(page, 'region').selectOption('us', { force: true });
		await ranges(page, 'volume').fill('70', { force: true });
		await ranges(page, 'price').nth(0).fill('200', { force: true });
		await ranges(page, 'price').nth(1).fill('800', { force: true });
		await hiddenNumber(page, 'seats').fill('9', { force: true });
		await hiddenNumber(page, 'guests').fill('4', { force: true });
		await submit(page).click();
		await page.waitForLoadState('load');

		await expect(field(page, 'seats').getByTestId('error')).toHaveText(SEATS_MESSAGE);
		await expect(hiddenSelect(page, 'language')).toHaveValue('de');
		await expect(field(page, 'language').getByTestId('trigger')).toHaveText('Deutsch');
		await expect(hiddenSelect(page, 'region')).toHaveValue('us');
		await expect(field(page, 'region').getByTestId('trigger')).toHaveText('United States');
		await expect(ranges(page, 'volume')).toHaveValue('70');
		await expect(ranges(page, 'price').nth(0)).toHaveValue('200');
		await expect(ranges(page, 'price').nth(1)).toHaveValue('800');
		await expect(field(page, 'price').getByTestId('indicator')).toHaveAttribute(
			'style',
			/inset-inline-start: 20%; width: 60%/
		);
		await expect(hiddenNumber(page, 'seats')).toHaveValue('9');
		await expect(numberText(page, 'seats')).toHaveValue('9');
		await expect(hiddenNumber(page, 'guests')).toHaveValue('4');
		await expect(numberText(page, 'guests')).toHaveValue('4');
	});
});
