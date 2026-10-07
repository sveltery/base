// Each case runs against the Svelte Input and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/input?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
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
			const label = page.getByTestId('label');
			const control = page.getByTestId('control');
			await expect(control).toHaveAttribute('id', /^base-ui-/);
			const id = await control.getAttribute('id');
			await expect(label).toHaveAttribute('for', id!);
			await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
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

		test('disables the input', async ({ page }) => {
			await open(page, 'disabled', reference);
			await expect(page.getByTestId('field')).toHaveAttribute('data-disabled', '');
			await expect(page.getByTestId('control')).toBeDisabled();
			await expect(page.getByTestId('control')).toHaveAttribute('data-disabled', '');
		});

		test('marks an invalid field', async ({ page }) => {
			await open(page, 'invalid', reference);
			await expect(page.getByTestId('field')).toHaveAttribute('data-invalid', '');
			await expect(page.getByTestId('control')).toHaveAttribute('data-invalid', '');
			await expect(page.getByTestId('control')).toHaveAttribute('aria-invalid', 'true');
		});

		test('blocks submit and shows the required error', async ({ page }) => {
			await open(page, 'required', reference);
			await expect(page.getByTestId('error')).toHaveCount(0);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByText('Required')).toBeVisible();
			await expect(page.getByTestId('submitted')).toHaveText('0');
			await expect(page.getByTestId('control')).toHaveAttribute('aria-invalid', 'true');
		});

		test('submits the root name and the input value', async ({ page }) => {
			await open(page, 'values', reference);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByTestId('values')).toHaveText(JSON.stringify({ username: 'ada' }));
		});
	});
}

test('svelte SSR associates the label before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/input?case=labelled')).text();
	expect(html).toContain('data-hydrated="false"');
	const labelFor = html.match(/<label\b[^>]*\sfor="([^"]+)"/)?.[1];
	const controlId = html.match(/<input\b[^>]*\sid="([^"]+)"/)?.[1];
	expect(labelFor).toMatch(/^base-ui-/);
	expect(controlId).toBe(labelFor);
});
