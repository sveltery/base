// Scenario 2: a SvelteKit form action with `use:enhance`, wired as the Forms handbook shows.
import { expect, test, type Page } from '@playwright/test';
import { control, countPosts, debug, error, field, open } from '../shared/helpers.js';

const url = '/fixtures/form/action';
const submit = (page: Page) => page.getByRole('button', { name: 'Sign up' });

test('use:enhance sends no request for a submit Form blocked, then posts a valid one', async ({
	page
}) => {
	const posts = countPosts(page);
	const errors = await open(page, url);
	await submit(page).click();
	await expect(control(page, 'email')).toBeFocused();
	await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
	await expect(field(page, 'name')).toHaveAttribute('data-invalid', '');
	expect(posts).toEqual([]);

	await control(page, 'email').fill('ada@example.com');
	await control(page, 'name').fill('A');
	await submit(page).click();
	await expect(error(page, 'name')).toHaveText('Use at least 2 characters');
	await expect(control(page, 'name')).toBeFocused();
	expect(posts).toHaveLength(1);

	await control(page, 'name').fill('Ada');
	await expect(error(page, 'name')).toHaveCount(0);
	await submit(page).click();
	await expect.poll(() => debug(page)).toEqual({ welcome: 'Ada' });
	expect(posts).toHaveLength(2);
	expect(errors).toEqual([]);
});
