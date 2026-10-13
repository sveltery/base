// Scenario 1: a remote form with a preflight schema.
import { expect, test } from '@playwright/test';
import { control, countPosts, error, field, open } from '../shared/helpers.js';
import { describeSignup } from '../shared/signup-specs.js';

describeSignup('remote');

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
