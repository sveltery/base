// Each case runs against the Svelte Radio and the React Base UI 1.8.0 reference.
// These cases are the standalone radio. RadioGroup is not ported, so a radio is
// selected only when its value is the empty string, matching Base UI without a group.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'radio', scenario, reference);
}

function radio(page: Page, name: string) {
	return page.getByRole('radio', { name });
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('an empty value is checked and keeps the indicator', async ({ page }) => {
			const { errors } = await open(page, 'checked', reference);
			const control = radio(page, 'Checked');
			await expect(control).toHaveAttribute('aria-checked', 'true');
			await expect(control).toHaveAttribute('data-checked', '');
			await expect(control).toHaveAttribute('data-composite-item-active', '');
			await expect(page.getByTestId('indicator')).toHaveAttribute('data-checked', '');
			await control.click();
			await expect(control).toHaveAttribute('aria-checked', 'true');
			expect(errors).toEqual([]);
		});

		test('any other value stays unchecked after click and Space', async ({ page }) => {
			const { errors } = await open(page, 'unchecked', reference);
			const control = radio(page, 'Blue');
			await expect(control).toHaveAttribute('aria-checked', 'false');
			await expect(control).toHaveAttribute('data-unchecked', '');
			await expect(control).not.toHaveAttribute('value');
			await control.click();
			await expect(control).toHaveAttribute('aria-checked', 'false');
			await control.focus();
			await page.keyboard.press('Space');
			await expect(control).toHaveAttribute('aria-checked', 'false');
			expect(errors).toEqual([]);
		});

		test('disabled uses aria-disabled and stays unchecked', async ({ page }) => {
			const { errors } = await open(page, 'disabled', reference);
			const control = radio(page, 'Blue');
			await expect(control).toHaveAttribute('aria-disabled', 'true');
			await expect(control).toHaveAttribute('data-disabled', '');
			await expect(control).not.toHaveAttribute('disabled');
			await control.click({ force: true });
			await expect(control).toHaveAttribute('aria-checked', 'false');
			expect(errors).toEqual([]);
		});

		test('readOnly sets data-readonly and stays unchecked', async ({ page }) => {
			await open(page, 'readonly', reference);
			const control = radio(page, 'Blue');
			await expect(control).not.toHaveAttribute('aria-readonly');
			await expect(control).toHaveAttribute('data-readonly', '');
			await control.click();
			await expect(control).toHaveAttribute('aria-checked', 'false');
		});

		test('a sibling label supplies aria-labelledby', async ({ page }) => {
			await open(page, 'label', reference);
			const label = page.getByText('Label', { exact: true });
			const control = page.getByRole('radio');
			await expect.poll(async () => label.getAttribute('id')).not.toBe('');
			await expect(control).toHaveAttribute(
				'aria-labelledby',
				(await label.getAttribute('id')) ?? ''
			);
		});

		test('native button keeps the id and Enter does not select it', async ({ page }) => {
			await open(page, 'native', reference);
			const control = radio(page, 'Blue');
			await expect(control).toHaveAttribute('id', 'tested-radio');
			expect(await control.evaluate((element) => element.tagName)).toBe('BUTTON');
			await control.focus();
			await page.keyboard.press('Enter');
			await expect(control).toHaveAttribute('aria-checked', 'false');
			await page.keyboard.press('Space');
			await expect(control).toHaveAttribute('aria-checked', 'false');
		});

		test('a required radio without a name still submits', async ({ page }) => {
			await open(page, 'required', reference);
			const control = radio(page, 'Blue');
			await expect(control).not.toHaveAttribute('aria-required');
			await expect(control).toHaveAttribute('data-required', '');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByTestId('submitted')).toHaveText('1');
		});

		test('Enter does not submit the form', async ({ page }) => {
			await open(page, 'enter', reference);
			const control = radio(page, 'Blue');
			await control.focus();
			await page.keyboard.press('Enter');
			await expect(control).toHaveAttribute('aria-checked', 'false');
			await expect(page.getByTestId('submitted')).toHaveText('0');
		});

		test('null serializes to an empty hidden value and stays unchecked', async ({ page }) => {
			await open(page, 'null', reference);
			const control = radio(page, 'None');
			await expect(control).toHaveAttribute('aria-checked', 'false');
			await expect(control).not.toHaveAttribute('value');
			const hiddenValue = await control.evaluate((element) => {
				const input = element.nextElementSibling;
				return input instanceof HTMLInputElement ? input.value : 'missing';
			});
			expect(hiddenValue).toBe('');
		});

		test('a click reaches ancestors once and does not select the radio', async ({ page }) => {
			await open(page, 'bubble', reference);
			const control = radio(page, 'Blue');
			await control.click();
			await expect(page.getByTestId('parent-clicks')).toHaveText('1');
			await expect(control).toHaveAttribute('aria-checked', 'false');
		});

		test('stopPropagation keeps the click off ancestors', async ({ page }) => {
			await open(page, 'stop', reference);
			await radio(page, 'Blue').click();
			await expect(page.getByTestId('parent-clicks')).toHaveText('0');
		});
	});
}

test('svelte SSR renders a checked radio before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/radio?case=checked')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="radio"');
	expect(html).toContain('aria-checked="true"');
	expect(html).toContain('data-checked');
	expect(html).toContain('type="radio"');
});

test('svelte SSR renders an unchecked radio before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/radio?case=unchecked')).text();
	expect(html).toContain('aria-checked="false"');
	expect(html).toContain('data-unchecked');
});
