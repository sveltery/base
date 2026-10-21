// Each case runs against the Svelte Form and the React Base UI 1.9.0 reference. Base UI renders
// `novalidate` by default; the Svelte Form leaves the browser's constraint check on unless asked.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

/** A form with no `novalidate` prop: Base UI adds it, the Svelte Form does not. */
async function expectDefaultNovalidate(form: Locator, reference: boolean) {
	if (reference) await expect(form).toHaveAttribute('novalidate');
	else await expect(form).not.toHaveAttribute('novalidate');
}

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'form', scenario, reference);
	return {
		form: page.locator('#tested-form'),
		submitted: page.getByTestId('submitted'),
		values: page.getByTestId('values'),
		errors: opened.errors
	};
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('default form cancels native validation and reports a submit', async ({ page }) => {
			const { form, submitted, errors } = await open(page, 'default', reference);
			await expect(form).toHaveAttribute('novalidate');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(submitted).toHaveText('1');
			expect(errors).toEqual([]);
		});

		test('an unregistered required input still submits', async ({ page }) => {
			const { form, submitted } = await open(page, 'unregistered', reference);
			await expect(form).toHaveAttribute('novalidate');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(submitted).toHaveText('1');
			await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('');
		});

		test('novalidate false lets the browser block an empty required input', async ({ page }) => {
			const { form, submitted } = await open(page, 'browser', reference);
			await expect(form).not.toHaveAttribute('novalidate');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(submitted).toHaveText('0');
		});

		test('onFormSubmit receives an empty value map when no fields are registered', async ({
			page
		}) => {
			const { values } = await open(page, 'values', reference);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(values).toHaveText('{}');
			await expectDefaultNovalidate(page.locator('#tested-form'), reference);
		});

		test('a custom render host keeps the form contract and its children', async ({ page }) => {
			const { form, submitted } = await open(page, 'render', reference);
			await expectDefaultNovalidate(form, reference);
			await expect(form).toHaveAttribute('data-custom', 'true');
			await expect(form.getByText('Inside')).toBeVisible();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(submitted).toHaveText('1');
		});
	});
}

test('svelte SSR renders novalidate only when asked', async ({ request }) => {
	for (const [scenario, novalidate] of [
		['default', true],
		['browser', false]
	] as const) {
		const html = await (await request.get(`/fixtures/form?case=${scenario}`)).text();
		expect(html).toContain('data-hydrated="false"');
		const formTag = html.match(/<form\b[^>]*>/)?.[0] ?? '';
		expect(formTag).toContain('id="tested-form"');
		expect(formTag.includes('novalidate')).toBe(novalidate);
	}
});
