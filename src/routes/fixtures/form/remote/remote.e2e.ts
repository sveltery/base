// Scenario 1: a remote form on Base's Form, each Field.Root named by the path its issues sit at.
import { expect, test, type Page } from '@playwright/test';
import { control, countPosts, error, field, open } from '../shared/helpers.js';
import { CLOSED_EMAIL, CLOSED_MESSAGE, TAKEN_EMAIL } from '../shared/schemas.js';

const url = '/fixtures/form/remote';
const submit = (page: Page) => page.getByRole('button', { name: 'Sign up' });

test('Form forwards the remote form attributes and its enhance attachment', async ({ page }) => {
	const posts = countPosts(page);
	await open(page, url);
	const form = page.locator('form');
	await expect(form).toHaveAttribute('method', 'POST');
	await expect(form).toHaveAttribute('action', /remote=/);
	await control(page, 'name').fill('Ada');
	await control(page, 'email').fill('ada@example.com');
	await submit(page).click();
	// The enhance attachment keeps the page and shows the result in place.
	await expect(page.getByTestId('welcome')).toHaveText('Welcome, Ada.');
	expect(posts).toHaveLength(1);
});

test('a server issue reaches the Field named by its path, and editing hides it', async ({
	page
}) => {
	const errors = await open(page, url);
	await control(page, 'name').fill('Ada');
	await control(page, 'email').fill(TAKEN_EMAIL);
	await submit(page).click();
	await expect(error(page, 'email')).toHaveText('Email already taken');
	await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
	await expect(control(page, 'email')).toHaveAttribute('aria-invalid', 'true');
	await page.locator('main').screenshot({ path: test.info().outputPath('server-issue.png') });

	await control(page, 'email').fill('new@example.com');
	await expect(error(page, 'email')).toHaveCount(0);
	await expect(field(page, 'email')).not.toHaveAttribute('data-invalid', '');
	expect(errors).toEqual([]);
});

test('preflight issues reach the Field named by their path', async ({ page }) => {
	await open(page, url);
	await control(page, 'name').fill('A');
	await control(page, 'email').fill('ada@example.com');
	await submit(page).click();
	await expect(error(page, 'name')).toHaveText('Use at least 2 characters');
	await expect(field(page, 'name')).toHaveAttribute('data-invalid', '');
});

test('a form-level issue reaches Form.Error, and the form lists it in aria-describedby', async ({
	page
}) => {
	await open(page, url);
	await control(page, 'name').fill('Ada');
	await control(page, 'email').fill(CLOSED_EMAIL);
	await submit(page).click();
	const formError = page.getByTestId('form-error');
	await expect(formError).toHaveText(CLOSED_MESSAGE);
	const id = await formError.getAttribute('id');
	await expect(page.locator('form')).toHaveAttribute('aria-describedby', id!);
	await expect(page.locator('form')).toHaveAttribute('data-invalid', '');
	await expect(field(page, 'email')).not.toHaveAttribute('data-invalid', '');
});

test('the browser blocks an empty submit, with no bubble and focus on the first control', async ({
	page
}) => {
	const posts = countPosts(page);
	await open(page, url);
	await submit(page).click();
	await expect(field(page, 'name')).toHaveAttribute('data-invalid', '');
	await expect(control(page, 'name')).toBeFocused();
	expect(posts).toEqual([]);
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('the server renders the issue on the named Field after a failed post', async ({ page }) => {
		await page.goto(url);
		await control(page, 'name').fill('Ada');
		await control(page, 'email').fill(TAKEN_EMAIL);
		await submit(page).click();
		await page.waitForLoadState('load');

		await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
		await expect(field(page, 'email').locator('label')).toHaveAttribute('data-invalid', '');
		await expect(control(page, 'email')).toHaveAttribute('data-invalid', '');
		await expect(control(page, 'email')).toHaveAttribute('aria-invalid', 'true');
		await expect(control(page, 'email')).toHaveValue(TAKEN_EMAIL);
		await expect(error(page, 'email')).toHaveText('Email already taken');
		const errorId = await error(page, 'email').getAttribute('id');
		await expect(control(page, 'email')).toHaveAttribute(
			'aria-describedby',
			new RegExp(`(^| )${errorId}( |$)`)
		);
		await expect(field(page, 'name')).not.toHaveAttribute('data-invalid', '');
		await expect(control(page, 'name')).toHaveValue('Ada');
	});

	test('the server renders a form-level issue in Form.Error', async ({ page }) => {
		await page.goto(url);
		await control(page, 'name').fill('Ada');
		await control(page, 'email').fill(CLOSED_EMAIL);
		await submit(page).click();
		await page.waitForLoadState('load');
		await expect(page.getByTestId('form-error')).toHaveText(CLOSED_MESSAGE);
	});
});
