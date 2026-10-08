// Each case runs against the Svelte Field and the React Base UI 1.8.0 reference.
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
	return openFixture(page, 'field', scenario, reference);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('associates the label with the control', async ({ page }) => {
			const { errors } = await open(page, 'labelled', reference);
			await expectAssociatedLabel(page, 'Email');
			expect(errors).toEqual([]);
		});

		test('adds the description id to aria-describedby', async ({ page }) => {
			await open(page, 'described', reference);
			const description = page.getByTestId('description');
			const describedBy = await page.getByTestId('control').getAttribute('aria-describedby');
			const id = await description.getAttribute('id');
			expect(describedBy?.split(' ')).toEqual(['author', id]);
		});

		test('blocks submit and shows the required error', async ({ page }) => {
			await open(page, 'required', reference);
			await expectRequiredBlocked(page);
		});

		registerDisabledAndInvalid('control', open, reference);

		test('submits the root name and the control value', async ({ page }) => {
			await open(page, 'values', reference);
			await expectUsernameValues(page);
		});
	});
}

test('svelte SSR associates the label before hydration', async ({ request }) => {
	await expectLabelHydration(request, 'field');
});
