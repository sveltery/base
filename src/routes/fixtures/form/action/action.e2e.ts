// Scenario 2: a SvelteKit form action posted natively, wired as the Forms handbook shows.
import { expect, test, type Page } from '@playwright/test';
import { control, countPosts, debug, error, field, open } from '../shared/helpers.js';

const url = '/fixtures/form/action';
const submit = (page: Page) => page.getByRole('button', { name: 'Sign up' });

test('Form blocks an invalid native post, and shows the action errors from `errors`', async ({
	page
}) => {
	const posts = countPosts(page);
	const errors = await open(page, url);
	// The browser's constraint check blocks the post; the Fields show the messages.
	await expect(page.locator('form')).not.toHaveAttribute('novalidate');
	await submit(page).click();
	await expect(control(page, 'email')).toBeFocused();
	await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
	await expect(field(page, 'name')).toHaveAttribute('data-invalid', '');
	expect(posts).toEqual([]);

	await control(page, 'email').fill('ada@example.com');
	await control(page, 'name').fill('A');
	await submit(page).click();
	await expect(error(page, 'name')).toHaveText('Use at least 2 characters');
	await expect(field(page, 'name')).toHaveAttribute('data-invalid', '');
	await expect(control(page, 'email')).toHaveValue('ada@example.com');
	expect(posts).toHaveLength(1);

	// Base UI clears an `errors` entry once its field changes.
	await control(page, 'name').fill('Ada');
	await expect(error(page, 'name')).toHaveCount(0);
	await submit(page).click();
	await expect.poll(() => debug(page)).toEqual({ welcome: 'Ada' });
	expect(posts).toHaveLength(2);
	expect(errors).toEqual([]);
});
