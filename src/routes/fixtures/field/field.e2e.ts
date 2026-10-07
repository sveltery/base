// Each case runs against the Svelte Field and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/field?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('associates the label with the control', async ({ page }) => {
			const { errors } = await open(page, 'labelled', reference);
			const label = page.getByTestId('label');
			const control = page.getByTestId('control');
			await expect(control).toHaveAttribute('id', /^base-ui-/);
			const id = await control.getAttribute('id');
			await expect(label).toHaveAttribute('for', id!);
			await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
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
			await expect(page.getByTestId('error')).toHaveCount(0);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByText('Required')).toBeVisible();
			await expect(page.getByTestId('submitted')).toHaveText('0');
			await expect(page.getByTestId('control')).toHaveAttribute('aria-invalid', 'true');
		});

		test('disables the control', async ({ page }) => {
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

		test('submits the root name and the control value', async ({ page }) => {
			await open(page, 'values', reference);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByTestId('values')).toHaveText(JSON.stringify({ username: 'ada' }));
		});
	});
}

test('svelte SSR associates the label before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/field?case=labelled')).text();
	expect(html).toContain('data-hydrated="false"');
	const labelFor = html.match(/<label\b[^>]*\sfor="([^"]+)"/)?.[1];
	const controlId = html.match(/<input\b[^>]*\sid="([^"]+)"/)?.[1];
	expect(labelFor).toMatch(/^base-ui-/);
	expect(controlId).toBe(labelFor);
});
