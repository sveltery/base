// Each case runs against the Svelte OTP Field and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';
import { expectRequiredBlocked } from '../field-asserts.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'otp-field', scenario, reference);
}

function slots(page: Page) {
	return page.getByRole('textbox');
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('types a digit into the next slot', async ({ page }) => {
			const { errors } = await open(page, 'plain', reference);
			const first = slots(page).nth(0);
			const second = slots(page).nth(1);
			await first.focus();
			await first.press('1');
			await expect(first).toHaveValue('1');
			await expect(second).toBeFocused();
			expect(errors).toEqual([]);
		});

		test('associates the label with the first slot', async ({ page }) => {
			const { errors } = await open(page, 'labelled', reference);
			const label = page.getByTestId('label');
			const first = slots(page).nth(0);
			await expect(first).toHaveAttribute('id', /^base-ui-/);
			const id = await first.getAttribute('id');
			await expect(label).toHaveAttribute('for', id!);
			await expect(page.getByRole('textbox', { name: 'Code' })).toHaveCount(6);
			expect(errors).toEqual([]);
		});

		test('keeps a bound value in sync', async ({ page }) => {
			await open(page, 'bound', reference);
			const first = slots(page).nth(0);
			await first.focus();
			await first.press('4');
			await expect(first).toHaveValue('4');
			await expect(page.getByTestId('value')).toHaveText('4');
		});

		test('splits a grouped default value around the separator', async ({ page }) => {
			await open(page, 'grouped', reference);
			await expect(slots(page)).toHaveCount(6);
			await expect(slots(page).nth(0)).toHaveValue('1');
			await expect(slots(page).nth(5)).toHaveValue('6');
			await expect(page.getByText('-')).toBeVisible();
			await expect(page.getByTestId('root')).toHaveAttribute('data-complete', '');
		});

		test('does not change a disabled field', async ({ page }) => {
			await open(page, 'disabled', reference);
			await expect(page.getByTestId('root')).toHaveAttribute('data-disabled', '');
			await expect(slots(page).nth(0)).toBeDisabled();
			await slots(page).nth(0).press('1');
			await expect(slots(page).nth(0)).toHaveValue('');
		});

		test('blocks submit and shows the required error', async ({ page }) => {
			await open(page, 'required', reference);
			await expectRequiredBlocked(page, false);
		});
	});
}

test('svelte SSR associates the label before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/otp-field?case=labelled')).text();
	expect(html).toContain('data-hydrated="false"');
	const labelFor = html.match(/<label\b[^>]*\sfor="([^"]+)"/)?.[1];
	const inputId = html.match(/<input\b[^>]*\sid="([^"]+)"/)?.[1];
	expect(labelFor).toBeTruthy();
	expect(inputId).toBe(labelFor);
	expect(inputId).toMatch(/^base-ui-/);
});
