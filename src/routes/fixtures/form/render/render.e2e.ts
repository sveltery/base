// Field.Control's `render` snippet receives the bound props, so a swapped element stays wired.
import { expect, test } from '@playwright/test';
import { control, debug, error, field, open } from '../shared/helpers.js';

test('a textarea and a wrapped input submit and reset like the default control', async ({
	page
}) => {
	const errors = await open(page, '/fixtures/form/render');
	const email = control(page, 'email');
	const name = control(page, 'name');
	await expect(page.getByTestId('wrapper').locator('input')).toHaveAttribute('name', /^email\//);
	await expect(email).toHaveAttribute('type', 'email');
	await expect(page.getByRole('textbox', { name: 'Name' })).toHaveJSProperty('tagName', 'TEXTAREA');
	await expect(name).toHaveAttribute('name', /^name\//);
	await expect(name).toHaveValue('Ada');

	await page.getByRole('button', { name: 'Sign up' }).click();
	await expect(error(page, 'email')).toHaveText(/fill out|fill in/i);
	await expect(email).toBeFocused();
	await expect(email).toHaveAttribute('aria-invalid', 'true');

	await email.fill('ok@example.com');
	await name.fill('x');
	await control(page, 'age').fill('30');
	await page.getByRole('button', { name: 'Sign up' }).click();
	await expect(error(page, 'name')).toHaveText('Use at least 2 characters');
	await expect(field(page, 'name')).toHaveAttribute('data-invalid', '');
	await expect(name).toBeFocused();

	await name.fill('Grace');
	await expect(error(page, 'name')).toHaveCount(0);
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect(name).toHaveValue('Ada');
	await expect(email).toHaveValue('');
	await expect.poll(async () => (await debug(page)).input).toEqual({ email: '', name: 'Ada' });

	await email.fill('ok@example.com');
	await name.fill('Grace');
	await control(page, 'age').fill('30');
	await page.getByRole('button', { name: 'Sign up' }).click();
	await expect(page.getByTestId('welcome')).toHaveText('Welcome, Grace');
	expect(errors).toEqual([]);
});
