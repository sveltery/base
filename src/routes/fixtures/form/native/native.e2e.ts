// Scenario 3: Base's own validation with no SvelteKit API.
import { expect, test } from '@playwright/test';
import { control, debug, error, field, open } from '../shared/helpers.js';

const url = '/fixtures/form/native';

test('onSubmit stays quiet until submit, then revalidates on change', async ({ page }) => {
	await open(page, url);
	await control(page, 'username').pressSequentially('ab');
	await control(page, 'website').focus();
	await expect(error(page, 'username')).toHaveCount(0);
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(error(page, 'username')).toHaveText(/3 characters|lengthen|at least/i);
	await expect(control(page, 'username')).toBeFocused();
	await control(page, 'username').fill('admin');
	await expect(error(page, 'username')).toHaveText('Reserved for system use');
	await control(page, 'username').fill('alice');
	await expect(error(page, 'username')).toHaveCount(0);
	await control(page, 'website').fill('http://x');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(error(page, 'website')).toHaveText('Use an https:// address');
	await control(page, 'website').fill('https://x.dev');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect
		.poll(() => debug(page))
		.toEqual({ submitted: { username: 'alice', website: 'https://x.dev' } });
});

test('onBlur validates when focus leaves', async ({ page }) => {
	await open(page, `${url}?mode=onBlur`);
	await control(page, 'username').pressSequentially('ab');
	await expect(error(page, 'username')).toHaveCount(0);
	await control(page, 'website').focus();
	await expect(error(page, 'username')).toHaveText(/3 characters|lengthen|at least/i);
});

test('onChange validates while typing, after the debounce', async ({ page }) => {
	await open(page, `${url}?mode=onChange`);
	await control(page, 'username').pressSequentially('admin');
	await expect(error(page, 'username')).toHaveText('Reserved for system use');
	await control(page, 'username').pressSequentially('x');
	await expect(error(page, 'username')).toHaveCount(0);
});

test('a native reset clears values and Field state', async ({ page }) => {
	await open(page, url);
	await control(page, 'username').pressSequentially('ab');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(field(page, 'username')).toHaveAttribute('data-invalid', '');
	await expect(field(page, 'username')).toHaveAttribute('data-dirty', '');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect(control(page, 'username')).toHaveValue('');
	await expect(error(page, 'username')).toHaveCount(0);
	await expect(field(page, 'username')).not.toHaveAttribute('data-invalid', '');
	await expect(field(page, 'username')).not.toHaveAttribute('data-dirty', '');
	await expect(field(page, 'username')).not.toHaveAttribute('data-touched', '');
	// The form is pristine again: typing does not validate until the next submit.
	await control(page, 'username').pressSequentially('ab');
	await expect(error(page, 'username')).toHaveCount(0);
});
