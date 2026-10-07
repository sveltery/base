// Each case runs against the Svelte Meter and the React Base UI 1.8.0 reference.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { ariaValueText } from './cases.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/meter?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		meter: page.getByRole('meter'),
		value: page.locator('#meter-value'),
		indicator: page.locator('#meter-indicator'),
		errors
	};
}

async function inlineWidth(indicator: Locator) {
	return indicator.evaluate((element) => (element as HTMLElement).style.width);
}

async function formatted(
	page: Page,
	value: number,
	options: Intl.NumberFormatOptions,
	locale: string
) {
	return page.evaluate(
		({ value: next, options: format, locale: tag }) =>
			new Intl.NumberFormat(tag, format).format(next),
		{ value, options, locale }
	);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('basic meter exposes range, percent text, label and indicator width', async ({ page }) => {
			const { meter, value, indicator, errors } = await open(page, 'basic', reference);
			const expected = await formatted(page, 0.4, { style: 'percent' }, 'en-US');

			await expect(meter).toHaveAttribute('aria-valuenow', '40');
			await expect(meter).toHaveAttribute('aria-valuemin', '0');
			await expect(meter).toHaveAttribute('aria-valuemax', '100');
			await expect(meter).toHaveAttribute('aria-valuetext', expected);
			await expect(value).toHaveText(expected);
			expect(await inlineWidth(indicator)).toBe('40%');

			const label = page.getByText('Storage');
			await expect(meter).toHaveAttribute(
				'aria-labelledby',
				(await label.getAttribute('id')) ?? ''
			);
			await expect(label).toHaveAttribute('role', 'presentation');
			await expect(
				meter.locator('span[role="presentation"]').filter({ hasText: /^x$/ })
			).toHaveCount(1);
			expect(errors).toEqual([]);
		});

		test('custom range formats the position and sizes the indicator', async ({ page }) => {
			const { meter, value, indicator } = await open(page, 'range', reference);
			const expected = await formatted(page, 0.5, { style: 'percent' }, 'en-US');

			await expect(meter).toHaveAttribute('aria-valuemin', '20');
			await expect(meter).toHaveAttribute('aria-valuemax', '40');
			await expect(meter).toHaveAttribute('aria-valuenow', '30');
			await expect(meter).toHaveAttribute('aria-valuetext', expected);
			await expect(value).toHaveText(expected);
			expect(await inlineWidth(indicator)).toBe('50%');
		});

		test('parent-owned value updates the meter', async ({ page }) => {
			const { meter, value, indicator } = await open(page, 'live', reference);
			await page.getByRole('button', { name: 'Set 77' }).click();
			const expected = await formatted(page, 0.77, { style: 'percent' }, 'en-US');

			await expect(meter).toHaveAttribute('aria-valuenow', '77');
			await expect(meter).toHaveAttribute('aria-valuetext', expected);
			await expect(value).toHaveText(expected);
			expect(await inlineWidth(indicator)).toBe('77%');
		});

		test('currency format is shared by the visible value and aria-valuetext', async ({ page }) => {
			const { meter, value, indicator } = await open(page, 'currency', reference);
			const expected = await formatted(page, 30, { style: 'currency', currency: 'USD' }, 'en-US');

			await expect(value).toHaveText(expected);
			await expect(meter).toHaveAttribute('aria-valuetext', expected);
			await expect(meter).toHaveAttribute('aria-valuenow', '30');
			expect(await inlineWidth(indicator)).toBe('30%');
		});

		test('values outside the range clamp the indicator, text and aria-valuenow', async ({
			page
		}) => {
			const { meter, value, indicator } = await open(page, 'clamp', reference);
			const expected = await formatted(page, 1, { style: 'percent' }, 'en-US');

			await expect(meter).toHaveAttribute('aria-valuenow', '100');
			await expect(meter).toHaveAttribute('aria-valuetext', expected);
			await expect(value).toHaveText(expected);
			expect(await inlineWidth(indicator)).toBe('100%');
		});

		test('changing and removing the label updates aria-labelledby', async ({ page }) => {
			const { meter } = await open(page, 'label', reference);

			await expect(meter).toHaveAttribute('aria-labelledby', 'label-a');
			await page.getByRole('button', { name: 'Change id' }).click();
			await expect(meter).toHaveAttribute('aria-labelledby', 'label-b');
			await expect(page.getByText('Battery level')).toHaveAttribute('id', 'label-b');
			await page.getByRole('button', { name: 'Remove label' }).click();
			await expect(meter).not.toHaveAttribute('aria-labelledby');
		});

		test('locale formats the value and the accessible text the same way', async ({ page }) => {
			const { meter, value } = await open(page, 'locale', reference);
			const expected = await formatted(page, 0.3, { style: 'percent' }, 'de-DE');

			await expect(meter).toHaveAttribute('aria-valuetext', expected);
			// toHaveText collapses the narrow no-break space in de-DE percent formatting.
			expect(await value.textContent()).toBe(expected);
		});

		test('getAriaValueText replaces only the spoken text', async ({ page }) => {
			const { meter, value } = await open(page, 'aria', reference);
			const formattedValue = await formatted(page, 0.3, { style: 'percent' }, 'en-US');

			await expect(value).toHaveText(formattedValue);
			await expect(meter).toHaveAttribute('aria-valuetext', ariaValueText(formattedValue, 30));
		});
	});
}

test('svelte SSR renders meter semantics before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/meter?case=basic')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="meter"');
	expect(html).toContain('aria-valuenow="40"');
	expect(html).toContain('aria-valuemin="0"');
	expect(html).toContain('aria-valuemax="100"');
	expect(html).toContain('aria-valuetext="40%"');
	expect(html).toContain('aria-hidden="true"');
	expect(html).toMatch(/>\s*40%\s*</);
	expect(html).toMatch(/>\s*x\s*</);
});
