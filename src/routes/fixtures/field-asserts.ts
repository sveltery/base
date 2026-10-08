import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

export async function expectAssociatedLabel(page: Page, name: string) {
	const label = page.getByTestId('label');
	const control = page.getByTestId('control');
	await expect(control).toHaveAttribute('id', /^base-ui-/);
	const id = await control.getAttribute('id');
	await expect(label).toHaveAttribute('for', id!);
	await expect(page.getByRole('textbox', { name })).toBeVisible();
}

export async function expectRequiredBlocked(page: Page, checkInvalid = true) {
	await expect(page.getByTestId('error')).toHaveCount(0);
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(page.getByText('Required')).toBeVisible();
	await expect(page.getByTestId('submitted')).toHaveText('0');
	if (checkInvalid) {
		await expect(page.getByTestId('control')).toHaveAttribute('aria-invalid', 'true');
	}
}

export function registerDisabledAndInvalid(
	noun: string,
	open: (page: Page, scenario: string, reference: boolean) => Promise<unknown>,
	reference: boolean
) {
	test(`disables the ${noun}`, async ({ page }) => {
		await open(page, 'disabled', reference);
		await expectDisabledControl(page);
	});

	test('marks an invalid field', async ({ page }) => {
		await open(page, 'invalid', reference);
		await expectInvalidControl(page);
	});
}

export async function expectDisabledControl(page: Page) {
	await expect(page.getByTestId('field')).toHaveAttribute('data-disabled', '');
	await expect(page.getByTestId('control')).toBeDisabled();
	await expect(page.getByTestId('control')).toHaveAttribute('data-disabled', '');
}

export async function expectInvalidControl(page: Page) {
	await expect(page.getByTestId('field')).toHaveAttribute('data-invalid', '');
	await expect(page.getByTestId('control')).toHaveAttribute('data-invalid', '');
	await expect(page.getByTestId('control')).toHaveAttribute('aria-invalid', 'true');
}

export async function expectUsernameValues(page: Page) {
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(page.getByTestId('values')).toHaveText(JSON.stringify({ username: 'ada' }));
}

export async function expectLabelHydration(request: APIRequestContext, fixture: string) {
	const html = await (await request.get(`/fixtures/${fixture}?case=labelled`)).text();
	expect(html).toContain('data-hydrated="false"');
	const labelFor = html.match(/<label\b[^>]*\sfor="([^"]+)"/)?.[1];
	const controlId = html.match(/<input\b[^>]*\sid="([^"]+)"/)?.[1];
	expect(labelFor).toMatch(/^base-ui-/);
	expect(controlId).toBe(labelFor);
}
