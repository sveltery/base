// Each case runs against the Svelte Form and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/form?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		form: page.locator('#tested-form'),
		submitted: page.getByTestId('submitted'),
		values: page.getByTestId('values'),
		errors
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
			await expect(page.locator('#tested-form')).toHaveAttribute('novalidate');
		});

		test('a custom render host keeps the form contract and its children', async ({ page }) => {
			const { form, submitted } = await open(page, 'render', reference);
			await expect(form).toHaveAttribute('novalidate');
			await expect(form).toHaveAttribute('data-custom', 'true');
			await expect(form.getByText('Inside')).toBeVisible();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(submitted).toHaveText('1');
		});
	});
}

test('svelte SSR renders novalidate before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/form?case=default')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('id="tested-form"');
	expect(html).toContain('novalidate');

	const browser = await (await request.get('/fixtures/form?case=browser')).text();
	const formTag = browser.match(/<form\b[^>]*>/)?.[0] ?? '';
	expect(formTag).toContain('id="tested-form"');
	expect(formTag).not.toContain('novalidate');
});
