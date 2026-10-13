// Scenario 4: TanStack Form owns values and validation, Base shows its state.
import { expect, test } from '@playwright/test';
import { control, debug, error, field, open } from '../shared/helpers.js';

test('TanStack errors and values reach the Fields, and a submit gets typed values', async ({
	page
}) => {
	const errors = await open(page, '/fixtures/form/tanstack');
	await control(page, 'username').pressSequentially('al');
	await expect(error(page, 'username')).toHaveCount(0);
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(error(page, 'username')).toHaveText('At least 3 characters');
	await expect(field(page, 'username')).toHaveAttribute('data-invalid', '');
	await expect(field(page, 'username')).toHaveAttribute('data-touched', '');
	await expect(field(page, 'username')).toHaveAttribute('data-dirty', '');
	await expect(error(page, 'email')).toHaveText('Invalid email address');
	await expect(error(page, 'seats')).toHaveCount(0);
	await expect(control(page, 'seats')).toHaveValue('1');
	await expect(control(page, 'seats')).toHaveAttribute('type', 'number');

	// revalidateLogic switches to change mode after the first submit.
	await control(page, 'username').fill('ali');
	await expect(error(page, 'username')).toHaveCount(0);
	await control(page, 'seats').fill('0');
	await expect(error(page, 'seats')).toHaveText('At least one seat');
	await control(page, 'seats').fill('4');
	await expect(error(page, 'seats')).toHaveCount(0);
	await control(page, 'email').fill('ok@example.com');
	await expect(error(page, 'agree')).toHaveText('Accept the terms');
	await field(page, 'agree').getByRole('checkbox').click();
	await expect(error(page, 'agree')).toHaveCount(0);
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect
		.poll(() => debug(page))
		.toEqual({ submitted: { username: 'ali', email: 'ok@example.com', seats: 4, agree: true } });
	expect(errors).toEqual([]);
});

test('a native reset resets the TanStack fields', async ({ page }) => {
	await open(page, '/fixtures/form/tanstack');
	await control(page, 'username').fill('al');
	await control(page, 'seats').fill('7');
	await field(page, 'agree').getByRole('checkbox').click();
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(error(page, 'username')).toHaveText('At least 3 characters');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect(control(page, 'username')).toHaveValue('');
	await expect(control(page, 'seats')).toHaveValue('1');
	await expect(field(page, 'agree').getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
	await expect(error(page, 'username')).toHaveCount(0);
	await expect(field(page, 'username')).not.toHaveAttribute('data-dirty', '');
});
