// Three directions for a remote form on Base UI's exact API, each with the same signup and
// profile fixtures. A: `onFormSubmit` into a command. B: A plus a form action without JS.
// C: Kit's remote form, carried to each Field by page context.
import { expect, test, type Page } from '@playwright/test';
import { countPosts, debug, error, field, open } from '../form/shared/helpers.js';

const directions = ['a-command', 'b-action', 'c-context'] as const;
const url = (direction: string, form: string) => `/fixtures/remote-mapping-2/${direction}/${form}`;
const submit = (page: Page) => page.getByRole('button', { name: 'Submit' }).click();

/** The form's entry names, with Kit's form id cut off. */
const names = (page: Page) =>
	page
		.locator('form')
		.evaluate((form: HTMLFormElement) =>
			[...new FormData(form).keys()].map((k) => k.split('/')[0])
		);

const pick = async (page: Page, trigger: string, option: string) => {
	await page.getByTestId(trigger).click();
	await page.getByRole('option', { name: option }).click();
};

for (const direction of directions) {
	test.describe(direction, () => {
		test('signup: names, typed value, server issue shows and clears', async ({ page }) => {
			const errors = await open(page, url(direction, 'signup'));
			await page.getByLabel('Name').fill('Ada');
			await page.getByLabel('Email').fill('taken@example.com');
			expect(await names(page)).toEqual(['name', 'email']);
			await submit(page);
			await expect(error(page, 'email')).toHaveText('Email already taken');
			await expect(field(page, 'email')).toHaveAttribute('data-invalid', '');
			await page.getByLabel('Email').fill('ada@example.com');
			await expect(error(page, 'email')).toHaveCount(0);
			await expect(page.getByLabel('Email')).not.toHaveAttribute('aria-invalid');
			await submit(page);
			await expect
				.poll(async () => (await debug(page)).received)
				.toEqual({ name: 'Ada', email: 'ada@example.com' });
			expect(errors).toEqual([]);
		});

		test('profile: every composite control round-trips', async ({ page }) => {
			const errors = await open(page, url(direction, 'profile'));
			await page.getByTestId('radio-free').click();
			await pick(page, 'country', 'France');
			await page.getByTestId('box-olives').click();
			await page.getByTestId('age').fill('12');
			await submit(page);
			const all = {
				plan: 'The free plan is full',
				country: 'We do not ship to France',
				toppings: 'Olives are sold out',
				agree: 'Accept the terms',
				age: 'You must be 18 or older'
			};
			for (const [name, message] of Object.entries(all)) {
				await expect(error(page, name)).toHaveText(message);
			}

			await page.getByTestId('radio-pro').click();
			await expect(error(page, 'plan')).toHaveCount(0);
			await pick(page, 'country', 'United States');
			await expect(error(page, 'country')).toHaveCount(0);
			await page.getByTestId('box-olives').click();
			await page.getByTestId('box-cheese').click();
			await expect(error(page, 'toppings')).toHaveCount(0);
			await page.getByTestId('agree').click();
			await expect(error(page, 'agree')).toHaveCount(0);
			await page.getByTestId('age').fill('20');
			await page.getByTestId('age').blur();
			await expect(error(page, 'age')).toHaveCount(0);

			await submit(page);
			await expect
				.poll(async () => (await debug(page)).received)
				.toEqual({ plan: 'pro', country: 'us', toppings: ['cheese'], agree: true, age: 20 });
			expect(errors).toEqual([]);
		});
	});
}

test.describe('without JS', () => {
	test.use({ javaScriptEnabled: false });

	test('a-command: the form has nowhere to post', async ({ page }) => {
		const posts = countPosts(page);
		await page.goto(url('a-command', 'signup'));
		await page.getByLabel('Name').fill('Ada');
		await page.getByLabel('Email').fill('taken@example.com');
		await submit(page);
		await page.waitForLoadState();
		expect(posts).toEqual([]);
		await expect(page).toHaveURL(/\?name=Ada&email=taken/);
		await expect(error(page, 'email')).toHaveCount(0);
	});

	test('b-action: the server issue shows and the values come back', async ({ page }) => {
		await page.goto(url('b-action', 'signup'));
		await page.getByLabel('Name').fill('Ada');
		await page.getByLabel('Email').fill('taken@example.com');
		await submit(page);
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await expect(page.getByLabel('Email')).toHaveValue('taken@example.com');
	});

	test('b-action: profile errors render on the server', async ({ page }) => {
		await page.goto(url('b-action', 'profile'));
		await submit(page);
		await expect(error(page, 'plan')).toHaveText('Pick a plan');
	});

	test('c-context: Kit takes the post, but no issue renders and the values are lost', async ({
		page
	}) => {
		await page.goto(url('c-context', 'signup'));
		await page.getByLabel('Name').fill('Ada');
		await page.getByLabel('Email').fill('taken@example.com');
		await submit(page);
		await expect(page).toHaveURL(/remote=/);
		await expect(page.getByLabel('Email')).toHaveValue('');
		await expect(error(page, 'email')).toHaveCount(0);
	});
});
