// The two forms in mapping-table.md, run as written: value submits, a server issue shows and
// clears, nothing throws, and both work without JS.
import { expect, test } from '@playwright/test';
import { countPosts, error, field, open } from '../form/shared/helpers.js';

const signup = '/fixtures/remote-mapping/table/signup';
const plan = '/fixtures/remote-mapping/table/plan';

test('signup', async ({ page }) => {
	const errors = await open(page, signup);
	const posts = countPosts(page);
	await page.getByLabel('Name').fill('Ada');
	await page.getByLabel('Email').fill('taken@example.com');
	await page.getByRole('button', { name: 'Sign up' }).click();
	await expect(error(page, 'email')).toHaveText('Email already taken');
	await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
	await page.getByLabel('Email').fill('ada@example.com');
	await expect(error(page, 'email')).toHaveCount(0);
	await expect(page.getByLabel('Email')).not.toHaveAttribute('aria-invalid');
	await page.getByRole('button', { name: 'Sign up' }).click();
	await expect(page.getByTestId('welcome')).toHaveText('Welcome, Ada.');
	expect(posts).toHaveLength(2);
	expect(errors).toEqual([]);
});

test('plan (Radio Group)', async ({ page }) => {
	const errors = await open(page, plan);
	await page.getByText('free', { exact: true }).click();
	await page.getByRole('button', { name: 'Choose' }).click();
	await expect(error(page, 'plan')).toHaveText('The free plan is full');
	await page.getByText('pro', { exact: true }).click();
	await expect(error(page, 'plan')).toHaveCount(0);
	await page.getByRole('button', { name: 'Choose' }).click();
	await expect(page.getByTestId('result')).toHaveText('Plan: pro');
	expect(errors).toEqual([]);
});

test.describe('without JS', () => {
	test.use({ javaScriptEnabled: false });

	test('signup: the issue shows and the values come back', async ({ page }) => {
		await page.goto(signup);
		await page.getByLabel('Name').fill('Ada');
		await page.getByLabel('Email').fill('taken@example.com');
		await page.getByRole('button', { name: 'Sign up' }).click();
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await expect(page.getByLabel('Email')).toHaveValue('taken@example.com');
		await expect(page.getByLabel('Name')).toHaveValue('Ada');
	});

	test('plan: the issue shows and the choice comes back', async ({ page }) => {
		await page.goto(plan);
		await page.getByText('free', { exact: true }).click();
		await page.getByRole('button', { name: 'Choose' }).click();
		await expect(error(page, 'plan')).toHaveText('The free plan is full');
		await expect(page.locator('input[type="radio"][value="free"]')).toBeChecked();
	});
});
