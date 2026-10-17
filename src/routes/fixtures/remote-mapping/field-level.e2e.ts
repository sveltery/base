// Server issues passed per field (no Form `errors`). Only `revalidate` (Kit's `validate()` on
// input) clears an issue on edit; the other variants are pinned here as the probe found them.
import { expect, test, type Page } from '@playwright/test';
import { countPosts, error, open } from '../form/shared/helpers.js';

const signup = (v: string) => `/fixtures/remote-mapping/field-level/signup?v=${v}`;
const plan = (v: string) => `/fixtures/remote-mapping/field-level/plan?v=${v}`;

async function submitTaken(page: Page) {
	await page.getByLabel('Name').fill('Ada');
	await page.getByLabel('Email').fill('taken@example.com');
	await page.getByRole('button', { name: 'Sign up' }).click();
}

test('signup, revalidate: shows, clears on edit, submits', async ({ page }) => {
	const errors = await open(page, signup('revalidate'));
	const posts = countPosts(page);
	await submitTaken(page);
	await expect(error(page, 'email')).toHaveText('Email already taken');
	await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
	await page.getByLabel('Email').fill('ada@example.com');
	await expect(error(page, 'email')).toHaveCount(0);
	await expect(page.getByLabel('Email')).not.toHaveAttribute('aria-invalid');
	await page.getByRole('button', { name: 'Sign up' }).click();
	await expect(page.getByTestId('welcome')).toHaveText('Welcome, Ada.');
	// Each input event sends a validate-only request on top of the two submits.
	expect(posts.length).toBeGreaterThan(2);
	expect(errors).toEqual([]);
});

test('plan, revalidate: shows, clears on edit, submits', async ({ page }) => {
	const errors = await open(page, plan('revalidate'));
	await page.getByText('free', { exact: true }).click();
	await page.getByRole('button', { name: 'Choose' }).click();
	await expect(error(page, 'plan')).toHaveText('The free plan is full');
	await page.getByText('pro', { exact: true }).click();
	await expect(error(page, 'plan')).toHaveCount(0);
	await page.getByRole('button', { name: 'Choose' }).click();
	await expect(page.getByTestId('result')).toHaveText('Plan: pro');
	expect(errors).toEqual([]);
});

for (const v of ['match', 'preflight']) {
	test(`signup, ${v}: shows but stays after an edit`, async ({ page }) => {
		const errors = await open(page, signup(v));
		await submitTaken(page);
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await page.getByLabel('Email').fill('ada@example.com');
		await page.waitForTimeout(300);
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
		expect(errors).toEqual([]);
	});

	test(`plan, ${v}: shows but stays after an edit`, async ({ page }) => {
		const errors = await open(page, plan(v));
		await page.getByText('free', { exact: true }).click();
		await page.getByRole('button', { name: 'Choose' }).click();
		await expect(error(page, 'plan')).toHaveText('The free plan is full');
		await page.getByText('pro', { exact: true }).click();
		await page.waitForTimeout(300);
		await expect(error(page, 'plan')).toHaveText('The free plan is full');
		expect(errors).toEqual([]);
	});
}

test('signup, validate: the server issue does not show after submit', async ({ page }) => {
	const errors = await open(page, signup('validate'));
	await submitTaken(page);
	await expect(page.getByLabel('Email')).toHaveValue('taken@example.com');
	await page.waitForTimeout(500);
	await expect(error(page, 'email')).toHaveCount(0);
	expect(errors).toEqual([]);
});

test.describe('without JS', () => {
	test.use({ javaScriptEnabled: false });

	test('signup, revalidate: the issue shows and the values come back', async ({ page }) => {
		await page.goto(signup('revalidate'));
		await submitTaken(page);
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await expect(page.getByLabel('Email')).toHaveValue('taken@example.com');
		await expect(page.getByLabel('Name')).toHaveValue('Ada');
	});

	test('plan, revalidate: the issue shows and the choice comes back', async ({ page }) => {
		await page.goto(plan('revalidate'));
		await page.getByText('free', { exact: true }).click();
		await page.getByRole('button', { name: 'Choose' }).click();
		await expect(error(page, 'plan')).toHaveText('The free plan is full');
		await expect(page.locator('input[type="radio"][value="free"]')).toBeChecked();
	});
});
