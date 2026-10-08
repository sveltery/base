// Each case runs against the Svelte NumberField and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';
import { expectAssociatedLabel, expectRequiredBlocked } from '../field-asserts.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'number-field', scenario, reference);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('steps the value from the increment button', async ({ page }) => {
			const { errors } = await open(page, 'plain', reference);
			const control = page.getByTestId('control');
			await expect(control).toHaveValue('4');
			await page.getByRole('button', { name: 'Increase' }).click();
			await expect(control).toHaveValue('5');
			await page.getByRole('button', { name: 'Decrease' }).click();
			await expect(control).toHaveValue('4');
			expect(errors).toEqual([]);
		});

		test('associates the label with the input', async ({ page }) => {
			const { errors } = await open(page, 'labelled', reference);
			await expectAssociatedLabel(page, 'Amount');
			expect(errors).toEqual([]);
		});

		test('keeps a bound value in sync', async ({ page }) => {
			await open(page, 'bound', reference);
			const control = page.getByTestId('control');
			await expect(control).toHaveValue('4');
			await expect(page.getByTestId('value')).toHaveText('4');
			await page.getByRole('button', { name: 'Increase' }).click();
			await expect(control).toHaveValue('5');
			await expect(page.getByTestId('value')).toHaveText('5');
		});

		test('submits the raw number from the hidden input', async ({ page }) => {
			await open(page, 'formatted', reference);
			const control = page.getByTestId('control');
			await expect(control).not.toHaveValue('54.5');
			await expect(page.locator('input[type="number"][name="price"]')).toHaveValue('54.5');
		});

		test('does not change a disabled field', async ({ page }) => {
			await open(page, 'disabled', reference);
			await expect(page.getByTestId('root')).toHaveAttribute('data-disabled', '');
			await expect(page.getByTestId('control')).toBeDisabled();
			await page.getByRole('button', { name: 'Increase' }).click({ force: true });
			await expect(page.getByTestId('control')).toHaveValue('4');
		});

		test('blocks submit and shows the required error', async ({ page }) => {
			await open(page, 'required', reference);
			await expectRequiredBlocked(page);
		});
	});
}

test('svelte SSR associates the label before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/number-field?case=labelled')).text();
	expect(html).toContain('data-hydrated="false"');
	const labelFor = html.match(/<label\b[^>]*\sfor="([^"]+)"/)?.[1];
	const inputId = html.match(/<input\b[^>]*\sid="([^"]+)"/)?.[1];
	expect(labelFor).toBeTruthy();
	expect(inputId).toBe(labelFor);
	expect(inputId).toMatch(/^base-ui-/);
});
