// The five gaps between Kit's remote form and Base's Form, each shown on the bare pattern and
// handled by a workaround that uses only Base UI props and Kit's own API.
import { expect, test, type Page } from '@playwright/test';
import { countPosts, error, field, open } from '../form/shared/helpers.js';

const gaps = (variant: string) => `/fixtures/remote-mapping/gaps?v=${variant}`;
const email = (page: Page) => page.getByLabel('Email');
const submit = (page: Page) => page.getByRole('button', { name: 'Submit' }).click();

test.describe('1. Kit sends a submit that Base blocked', () => {
	test('the bare pattern posts an empty required field', async ({ page }) => {
		const posts = countPosts(page);
		await open(page, gaps('base'));
		await submit(page);
		await expect(error(page, 'email')).toHaveText('Enter a valid email');
		expect(posts).toHaveLength(1);
	});

	for (const variant of ['enhance', 'full']) {
		test(`${variant}: checking validity in enhance keeps it on the client`, async ({ page }) => {
			const posts = countPosts(page);
			await open(page, gaps(variant));
			await submit(page);
			await expect(error(page, 'email')).toHaveText('Please fill out this field.');
			await email(page).fill('blocked@example.com');
			await submit(page);
			await expect(error(page, 'email')).toHaveText('This address is blocked');
			expect(posts).toHaveLength(0);
		});
	}
});

test('2. a server issue moves focus to its control', async ({ page }) => {
	await open(page, gaps('full'));
	await email(page).fill('taken@example.com');
	await submit(page);
	await expect(error(page, 'email')).toHaveText('Email already taken');
	await expect(email(page)).toBeFocused();
});

test.describe('3. an edited server issue comes back on the next blocked submit', () => {
	const fillAndSubmit = async (page: Page) => {
		await page.getByLabel('Name').fill('Ada');
		await email(page).fill('taken@example.com');
		await submit(page);
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await email(page).fill('new@example.com');
		await expect(error(page, 'email')).toHaveCount(0);
		await page.getByLabel('Name').fill('A');
		await submit(page);
		await expect(error(page, 'name')).toHaveText('Use at least 2 characters');
	};

	test("with Kit's preflight it does", async ({ page }) => {
		await open(page, '/fixtures/remote-mapping/gaps-two?v=preflight');
		await fillAndSubmit(page);
		await expect(error(page, 'email')).toHaveText('Email already taken');
	});

	test("with Base's validation and the enhance check it does not", async ({ page }) => {
		const posts = countPosts(page);
		await open(page, '/fixtures/remote-mapping/gaps-two?v=base');
		await fillAndSubmit(page);
		await expect(error(page, 'email')).toHaveCount(0);
		expect(posts).toHaveLength(1);
	});
});

test.describe('4. aria-invalid after an edit', () => {
	const issueThenEdit = async (page: Page, variant: string) => {
		await open(page, gaps(variant));
		await email(page).fill('taken@example.com');
		await submit(page);
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await email(page).fill('new@example.com');
		await expect(field(page, 'email')).not.toHaveAttribute('data-invalid', '');
	};

	test("spreading .as() keeps Kit's aria-invalid", async ({ page }) => {
		await issueThenEdit(page, 'spread');
		await expect(email(page)).toHaveAttribute('aria-invalid', 'true');
	});

	test('a Field.Root name leaves aria-invalid to Base', async ({ page }) => {
		await issueThenEdit(page, 'full');
		await expect(email(page)).not.toHaveAttribute('aria-invalid');
	});
});

test.describe('5. without JS', () => {
	test.use({ javaScriptEnabled: false });

	test('the bare pattern posts unchecked and loses the value', async ({ page }) => {
		const posts = countPosts(page);
		await page.goto(gaps('base'));
		await expect(page.locator('form')).toHaveAttribute('novalidate');
		await email(page).fill('taken@example.com');
		await submit(page);
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await expect(email(page)).toHaveValue('');
		expect(posts).toHaveLength(1);
	});

	test('full: the browser validates, and the value comes back', async ({ page }) => {
		const posts = countPosts(page);
		await page.goto(gaps('full'));
		await expect(page.locator('form')).not.toHaveAttribute('novalidate');
		await submit(page);
		expect(posts).toHaveLength(0);
		await email(page).fill('taken@example.com');
		await submit(page);
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await expect(email(page)).toHaveValue('taken@example.com');
		expect(posts).toHaveLength(1);
	});
});

test('full: with JS, Base validates once hydrated', async ({ page }) => {
	await open(page, gaps('full'));
	await expect(page.locator('form')).toHaveAttribute('novalidate');
});
