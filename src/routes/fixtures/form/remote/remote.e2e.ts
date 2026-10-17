// Scenario 1: a remote form on Base's Form, its issues passed once as `errors`.
import { expect, test, type Page } from '@playwright/test';
import { control, countPosts, error, field, open } from '../shared/helpers.js';

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

test('a server issue reaches Field.Error through `errors`, and editing clears it', async ({
	page
}) => {
	const errors = await open(page, url);
	await control(page, 'name').fill('Ada');
	await control(page, 'email').fill('taken@example.com');
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

test('preflight issues reach Field.Error through `errors`', async ({ page }) => {
	await open(page, url);
	await control(page, 'name').fill('A');
	await control(page, 'email').fill('ada@example.com');
	await submit(page).click();
	await expect(error(page, 'name')).toHaveText('Use at least 2 characters');
	await expect(field(page, 'name')).toHaveAttribute('data-invalid', '');
});
