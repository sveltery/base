// Each case runs against the Svelte Input and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';
import {
	expectAssociatedLabel,
	registerDisabledAndInvalid,
	expectLabelHydration,
	expectRequiredBlocked,
	expectUsernameValues
} from '../field-asserts.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'input', scenario, reference);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('renders an input', async ({ page }) => {
			const { errors } = await open(page, 'plain', reference);
			const control = page.getByTestId('control');
			await expect(control).toBeVisible();
			await expect(control).toHaveAttribute('id', 'tested-input');
			await expect(control).toHaveAttribute('placeholder', 'Name');
			expect(errors).toEqual([]);
		});

		test('associates the label with the input', async ({ page }) => {
			const { errors } = await open(page, 'labelled', reference);
			await expectAssociatedLabel(page, 'Email');
			expect(errors).toEqual([]);
		});

		test('keeps a bound value in sync', async ({ page }) => {
			await open(page, 'bound', reference);
			const control = page.getByTestId('control');
			await expect(control).toHaveValue('a');
			await expect(page.getByTestId('value')).toHaveText('a');
			await control.fill('typed');
			await expect(control).toHaveValue('typed');
			await expect(page.getByTestId('value')).toHaveText('typed');
		});

		registerDisabledAndInvalid('input', open, reference);

		test('blocks submit and shows the required error', async ({ page }) => {
			await open(page, 'required', reference);
			await expectRequiredBlocked(page);
		});

		test('submits the root name and the input value', async ({ page }) => {
			await open(page, 'values', reference);
			await expectUsernameValues(page);
		});
	});
}

test('svelte SSR associates the label before hydration', async ({ request }) => {
	await expectLabelHydration(request, 'input');
});
