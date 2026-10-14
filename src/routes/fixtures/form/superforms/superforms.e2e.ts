// Scenario 5: sveltekit-superforms owns values and errors, Base shows its state.
import { expect, test } from '@playwright/test';
import { control, debug, error, field, open } from '../shared/helpers.js';

test('superforms errors reach the Fields, and a valid submit saves the values', async ({
	page
}) => {
	const errors = await open(page, '/fixtures/form/superforms');
	await control(page, 'username').pressSequentially('al');
	await control(page, 'username').blur();
	await expect(field(page, 'username')).toHaveAttribute('data-touched', '');
	await expect(field(page, 'email')).not.toHaveAttribute('data-touched', '');
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(error(page, 'username')).toHaveText('At least 3 characters');
	await expect(error(page, 'email')).toHaveText('Invalid email address');
	await expect(control(page, 'username')).toHaveAttribute('aria-invalid', 'true');
	await expect(control(page, 'email')).toHaveAttribute('aria-invalid', 'true');
	await expect(field(page, 'username')).toHaveAttribute('data-invalid', '');
	await expect(field(page, 'username')).toHaveAttribute('data-dirty', '');
	await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
	await expect(field(page, 'email')).not.toHaveAttribute('data-dirty', '');
	expect(await debug(page)).toEqual({ saved: null });

	await control(page, 'username').fill('ali');
	await expect(error(page, 'username')).toHaveCount(0);
	await expect(control(page, 'username')).not.toHaveAttribute('aria-invalid');
	await expect(field(page, 'username')).not.toHaveAttribute('data-invalid', '');
	await expect(error(page, 'email')).toHaveText('Invalid email address');
	await control(page, 'email').fill('ok@example.com');
	await expect(error(page, 'email')).toHaveCount(0);
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect
		.poll(() => debug(page))
		.toEqual({ saved: { username: 'ali', email: 'ok@example.com' } });
	expect(errors).toEqual([]);
});
