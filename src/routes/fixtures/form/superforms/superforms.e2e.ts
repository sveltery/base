// Scenario 5: sveltekit-superforms owns values and errors, Base shows its state.
import { expect, test } from '@playwright/test';
import { control, countPosts, debug, error, field, open } from '../shared/helpers.js';

test('superforms errors reach the Fields, and a valid submit saves the values', async ({
	page
}) => {
	const errors = await open(page, '/fixtures/form/superforms');
	await control(page, 'username').pressSequentially('al');
	await control(page, 'username').blur();
	await expect(field(page, 'username')).toHaveAttribute('data-touched', '');
	await expect(field(page, 'email')).not.toHaveAttribute('data-touched', '');
	await expect(error(page, 'username')).toHaveText('At least 3 characters');
	await expect(control(page, 'username')).toHaveAttribute('aria-invalid', 'true');
	await expect(field(page, 'username')).toHaveAttribute('data-invalid', '');
	await expect(field(page, 'username')).toHaveAttribute('data-dirty', '');

	// Superforms' enhance still sees the submit Base blocked and validates every field.
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(control(page, 'username')).toBeFocused();
	await expect(error(page, 'email')).toHaveText('Invalid email address');
	await expect(error(page, 'city')).toHaveText('At least 3 characters');
	expect(await debug(page)).toEqual({ saved: null });

	await control(page, 'username').fill('ali');
	await expect(error(page, 'username')).toHaveCount(0);
	await expect(control(page, 'username')).not.toHaveAttribute('aria-invalid');
	await expect(field(page, 'username')).not.toHaveAttribute('data-invalid', '');
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(error(page, 'email')).toHaveText('Invalid email address');
	await expect(control(page, 'email')).toHaveAttribute('aria-invalid', 'true');
	await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
	await expect(field(page, 'email')).not.toHaveAttribute('data-dirty', '');
	expect(await debug(page)).toEqual({ saved: null });

	await control(page, 'email').fill('ok@example.com');
	await expect(error(page, 'email')).toHaveCount(0);
	await control(page, 'city').fill('Oslo');
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect
		.poll(() => debug(page))
		.toEqual({ saved: { username: 'ali', email: 'ok@example.com', city: 'Oslo' } });
	expect(errors).toEqual([]);
});

test('superforms validates a Field.Control on blur, before any submit', async ({ page }) => {
	const errors = await open(page, '/fixtures/form/superforms');
	await control(page, 'username').pressSequentially('al');
	await expect(error(page, 'username')).toHaveCount(0);
	await control(page, 'username').blur();
	await expect(error(page, 'username')).toHaveText('At least 3 characters');
	await expect(control(page, 'username')).toHaveAttribute('aria-invalid', 'true');
	await expect(error(page, 'email')).toHaveCount(0);
	expect(errors).toEqual([]);
});

test('superforms validates an Autocomplete input on blur, before any submit', async ({ page }) => {
	const errors = await open(page, '/fixtures/form/superforms');
	await control(page, 'city').pressSequentially('Os');
	await expect(error(page, 'city')).toHaveCount(0);
	await control(page, 'city').blur();
	await expect(error(page, 'city')).toHaveText('At least 3 characters');
	await expect(control(page, 'city')).toHaveAttribute('aria-invalid', 'true');
	await expect(error(page, 'username')).toHaveCount(0);
	expect(errors).toEqual([]);
});

test('superforms with a form action sends no request for a submit Form blocked', async ({
	page
}) => {
	const posts = countPosts(page);
	const errors = await open(page, '/fixtures/form/superforms/server');
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(control(page, 'email')).toBeFocused();
	await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
	expect(posts).toEqual([]);

	// Native validation passes, and Superforms' client validator marks the Field invalid on blur.
	await control(page, 'email').fill('a@b');
	await control(page, 'email').blur();
	await expect(error(page, 'email')).toHaveText('Invalid email address');
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(control(page, 'email')).toBeFocused();
	expect(posts).toEqual([]);

	await control(page, 'email').fill('ok@example.com');
	await expect(error(page, 'email')).toHaveCount(0);
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect.poll(() => debug(page)).toEqual({ saved: { email: 'ok@example.com' } });
	expect(posts).toHaveLength(1);
	expect(errors).toEqual([]);
});
