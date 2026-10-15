// Scenario 1: a remote form with a preflight schema.
import { expect, test, type Page } from '@playwright/test';
import { CLOSED_MESSAGE } from '../shared/schemas.js';
import { control, countPosts, error, field, open } from '../shared/helpers.js';

const url = '/fixtures/form/remote';
const submit = (page: Page) => page.getByRole('button', { name: 'Sign up' });

test.describe('remote', () => {
	test('native constraints block before preflight and the network', async ({ page }) => {
		const posts = countPosts(page);
		await open(page, url);
		await expect(page.locator('form')).toHaveAttribute('novalidate', '');
		await submit(page).click();
		await expect(error(page, 'email')).toHaveText(/fill out|fill in/i);
		await expect(control(page, 'email')).toBeFocused();
		await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
		await expect(control(page, 'email')).toHaveAttribute('aria-invalid', 'true');
		// After a submit, each edit revalidates, and a source issue outranks the native message.
		await control(page, 'email').fill('bad');
		await expect(error(page, 'email')).toHaveText('Enter a valid email');
		await submit(page).click();
		await expect(control(page, 'email')).toBeFocused();
		expect(
			await control(page, 'email').evaluate(
				(input: HTMLInputElement) => input.validity.typeMismatch
			)
		).toBe(true);
		expect(posts).toEqual([]);
	});

	test('preflight issues, then a server issue that does not block, then success', async ({
		page
	}) => {
		const posts = countPosts(page);
		const errors = await open(page, url);
		await control(page, 'email').fill('taken@example.com');
		await control(page, 'name').fill('x');
		await control(page, 'age').fill('10');
		await submit(page).click();
		await expect(error(page, 'name')).toHaveText('Use at least 2 characters');
		await expect(error(page, 'age')).toHaveText('You must be 18 or older');
		await expect(error(page, 'email')).toHaveCount(0);
		await expect(control(page, 'name')).toBeFocused();
		expect(posts, 'schema issues need no request').toEqual([]);

		// After a submit, onSubmit mode revalidates each change.
		await control(page, 'name').fill('Al');
		await expect(error(page, 'name')).toHaveCount(0);
		await control(page, 'age').fill('12');
		await expect(error(page, 'age')).toHaveText('You must be 18 or older');
		await control(page, 'age').fill('30');
		await expect(error(page, 'age')).toHaveCount(0);

		await submit(page).click();
		await expect(submit(page)).toBeDisabled();
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
		await expect(control(page, 'email')).toBeFocused();
		expect(posts).toHaveLength(1);

		// Only the server can clear its issue, so it never blocks a resubmit.
		await submit(page).click();
		await expect.poll(() => posts.length, { message: 'resubmit reaches the server' }).toBe(2);
		await expect(error(page, 'email')).toHaveText('Email already taken');

		// Base UI clears a server error once its field changes.
		await control(page, 'email').fill('new@example.com');
		await expect(error(page, 'email')).toHaveCount(0);
		await expect(field(page, 'email')).not.toHaveAttribute('data-invalid', '');

		await submit(page).click();
		await expect(page.getByTestId('welcome')).toHaveText('Welcome, Al');
		// Kit's default after a successful submit: reset the form.
		await expect(control(page, 'email')).toHaveValue('');
		await expect(control(page, 'name')).toHaveValue('');
		await expect(field(page, 'email')).not.toHaveAttribute('data-touched', '');
		await expect(field(page, 'email')).not.toHaveAttribute('data-dirty', '');
		expect(posts).toHaveLength(3);
		expect(errors).toEqual([]);
	});

	test('a reset clears server issues', async ({ page }) => {
		await open(page, url);
		await control(page, 'email').fill('taken@example.com');
		await control(page, 'name').fill('Al');
		await control(page, 'age').fill('30');
		await submit(page).click();
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await page.getByRole('button', { name: 'Reset' }).click();
		await expect(control(page, 'email')).toHaveValue('');
		await expect(error(page, 'email')).toHaveCount(0);
		await expect(field(page, 'email')).not.toHaveAttribute('data-invalid', '');
	});

	test('Form.Error shows an issue on the whole form as an alert', async ({ page }) => {
		await open(page, url);
		await expect(page.getByTestId('form-error')).toHaveCount(0);
		await control(page, 'email').fill('closed@example.com');
		await control(page, 'name').fill('Al');
		await control(page, 'age').fill('30');
		await submit(page).click();
		const formError = page.getByTestId('form-error');
		await expect(formError).toHaveText(CLOSED_MESSAGE);
		await expect(formError).toHaveAttribute('role', 'alert');
		await expect(page.getByRole('alert')).toHaveText(CLOSED_MESSAGE);
		await expect(error(page, 'email')).toHaveCount(0);
	});
});

test.describe('remote without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('the browser validates, and server issues and values render per field', async ({ page }) => {
		await page.goto(url);
		await expect(page.locator('form')).not.toHaveAttribute('novalidate', '');
		await control(page, 'email').fill('taken@example.com');
		await control(page, 'name').fill('x');
		await control(page, 'age').fill('10');
		await submit(page).click();
		await expect(error(page, 'name')).toHaveText('Use at least 2 characters');
		await expect(error(page, 'age')).toHaveText('You must be 18 or older');
		await expect(field(page, 'name')).toHaveAttribute('data-invalid', '');
		await expect(control(page, 'name')).toHaveAttribute('aria-invalid', 'true');
		await expect(control(page, 'name')).toHaveValue('x');
		await expect(control(page, 'email')).toHaveValue('taken@example.com');
		await expect(control(page, 'age')).toHaveValue('10');

		await control(page, 'name').fill('Al');
		await control(page, 'age').fill('30');
		await submit(page).click();
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await expect(error(page, 'name')).toHaveCount(0);

		await control(page, 'email').fill('closed@example.com');
		await submit(page).click();
		await expect(page.getByTestId('form-error')).toHaveText(CLOSED_MESSAGE);

		await control(page, 'email').fill('ok@example.com');
		await submit(page).click();
		await expect(page.getByTestId('welcome')).toHaveText('Welcome, Al');
	});

	test('a required field left empty never reaches the server', async ({ page }) => {
		const posts = countPosts(page);
		await page.goto(url);
		await submit(page).click();
		await expect(control(page, 'email')).toBeFocused();
		expect(
			await control(page, 'email').evaluate(
				(input: HTMLInputElement) => input.validity.valueMissing
			)
		).toBe(true);
		expect(posts).toEqual([]);
	});
});

test.describe('remote validation modes', () => {
	test('onBlur shows schema issues for fields the user left, with no request', async ({ page }) => {
		const posts = countPosts(page);
		await open(page, '/fixtures/form/remote?mode=onBlur');
		await control(page, 'name').pressSequentially('x');
		await expect(error(page, 'name')).toHaveCount(0);
		await control(page, 'age').focus();
		await expect(error(page, 'name')).toHaveText('Use at least 2 characters');
		await expect(field(page, 'name')).toHaveAttribute('data-touched', '');
		await expect(error(page, 'email')).toHaveCount(0);
		await expect(error(page, 'age')).toHaveCount(0);
		expect(posts).toEqual([]);
	});

	test('onBlur: a corrected field submits without leaving it first', async ({ page }) => {
		const posts = countPosts(page);
		await open(page, '/fixtures/form/remote?mode=onBlur');
		await control(page, 'email').pressSequentially('bad');
		await control(page, 'name').focus();
		await expect(error(page, 'email')).toHaveText('Enter a valid email');
		await control(page, 'name').fill('Al');
		await control(page, 'age').fill('30');
		await control(page, 'email').fill('ok@example.com');
		await control(page, 'email').press('Enter');
		await expect(page.getByTestId('welcome')).toHaveText('Welcome, Al');
		expect(posts).toHaveLength(1);
	});

	test('onChange shows schema issues while typing, with no request', async ({ page }) => {
		const posts = countPosts(page);
		await open(page, '/fixtures/form/remote?mode=onChange');
		await control(page, 'age').pressSequentially('1');
		await expect(error(page, 'age')).toHaveText('You must be 18 or older');
		await expect(field(page, 'age')).toHaveAttribute('data-dirty', '');
		await expect(error(page, 'name')).toHaveCount(0);
		await control(page, 'age').pressSequentially('9');
		await expect(error(page, 'age')).toHaveCount(0);
		expect(posts).toEqual([]);
	});
});
