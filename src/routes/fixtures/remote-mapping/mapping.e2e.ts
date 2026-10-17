// Each Base control on a SvelteKit remote form: the value submits under Kit's name, the typed
// value reaches the remote function, a server issue shows and clears on edit, and Kit never
// throws `form_field_unbound`.
import { expect, test, type Page } from '@playwright/test';
import { countPosts, debug, error, field, open } from '../form/shared/helpers.js';

interface Case {
	control: string;
	field: string;
	variants: string[];
	/** Puts in the value the server rejects. */
	bad: (page: Page) => Promise<void>;
	/** Edits it to a value the server accepts. */
	good: (page: Page) => Promise<void>;
	issue: string;
	received: Record<string, unknown>;
}

const pick = async (page: Page, trigger: string, option: string) => {
	await page.getByTestId(trigger).click();
	await page.getByRole('option', { name: option }).click();
};

const cases: Case[] = [
	{
		control: 'field-control',
		field: 'email',
		variants: ['root-name', 'errors'],
		bad: (page) => page.getByLabel('Email').fill('taken@example.com'),
		good: (page) => page.getByLabel('Email').fill('ada@example.com'),
		issue: 'Email already taken',
		received: { email: 'ada@example.com' }
	},
	{
		control: 'checkbox',
		field: 'agree',
		variants: ['root-name', 'spread', 'name', 'controlled'],
		bad: async () => {},
		good: (page) => page.getByTestId('control').click(),
		issue: 'Accept the terms',
		received: { agree: true }
	},
	{
		control: 'switch',
		field: 'notify',
		variants: ['root-name', 'spread', 'name', 'controlled'],
		bad: async () => {},
		good: (page) => page.getByTestId('control').click(),
		issue: 'Turn notifications on',
		received: { notify: true }
	},
	{
		control: 'number-field',
		field: 'age',
		variants: ['root-name', 'spread', 'name', 'controlled'],
		bad: async (page) => {
			await page.getByTestId('control').fill('12');
			await page.getByTestId('control').blur();
		},
		good: async (page) => {
			await page.getByTestId('control').fill('20');
			await page.getByTestId('control').blur();
		},
		issue: 'You must be 18 or older',
		received: { age: 20 }
	},
	{
		control: 'radio-group',
		field: 'plan',
		variants: ['root-name', 'group-name', 'controlled'],
		bad: (page) => page.getByTestId('radio-free').click(),
		good: (page) => page.getByTestId('radio-pro').click(),
		issue: 'The free plan is full',
		received: { plan: 'pro' }
	},
	{
		control: 'select',
		field: 'country',
		variants: ['root-name', 'name', 'spread', 'controlled'],
		bad: (page) => pick(page, 'control', 'France'),
		good: (page) => pick(page, 'control', 'United States'),
		issue: 'We do not ship to France',
		received: { country: 'us' }
	},
	{
		control: 'checkbox-group',
		field: 'toppings',
		variants: ['root-name'],
		bad: (page) => page.getByTestId('box-olives').click(),
		good: async (page) => {
			await page.getByTestId('box-olives').click();
			await page.getByTestId('box-cheese').click();
		},
		issue: 'Olives are sold out',
		received: { toppings: ['cheese'] }
	},
	{
		control: 'combobox',
		field: 'fruit',
		variants: ['root-name', 'name', 'controlled'],
		bad: async (page) => {
			await page.getByTestId('control').fill('Dur');
			await page.getByRole('option', { name: 'Durian' }).click();
		},
		good: async (page) => {
			await page.getByTestId('control').fill('App');
			await page.getByRole('option', { name: 'Apple' }).click();
		},
		issue: 'Durian is not allowed',
		received: { fruit: 'Apple' }
	},
	{
		control: 'slider',
		field: 'volume',
		variants: ['root-name', 'name', 'controlled'],
		bad: async (page) => {
			await page.getByRole('slider').focus();
			await page.keyboard.press('End');
		},
		good: (page) => page.keyboard.press('Home'),
		issue: 'Keep the volume at 80 or below',
		received: { volume: 0 }
	}
];

for (const c of cases) {
	for (const variant of c.variants) {
		test(`${c.control} (${variant})`, async ({ page }) => {
			const errors = await open(page, `/fixtures/remote-mapping/${c.control}?v=${variant}`);
			const submit = page.getByRole('button', { name: 'Submit' });

			await c.bad(page);
			await submit.click();
			await expect.soft(error(page, c.field), 'server issue shows').toHaveText(c.issue);
			await expect
				.soft(field(page, c.field), 'field is invalid')
				.toHaveAttribute('data-invalid', '');

			await c.good(page);
			await expect.soft(error(page, c.field), 'issue clears on edit').toHaveCount(0);

			await submit.click();
			await expect
				.poll(async () => (await debug(page)).result, { message: 'typed value reaches the server' })
				.toEqual({ received: c.received });
			expect(errors, 'no page errors, including form_field_unbound').toEqual([]);
		});
	}
}

/** The form's entries as `name=value`, with Kit's form id cut from the name. */
const entries = (page: Page) =>
	page
		.locator('form')
		.evaluate((form: HTMLFormElement) =>
			[...new FormData(form)].map(([key, value]) => `${key.split('/')[0]}=${value}`)
		);
const serverReply = (page: Page) =>
	page.waitForResponse((response) => response.request().method() === 'POST');

test.describe('patterns that fail', () => {
	test("field-control (match): Kit's issue outlives the edit", async ({ page }) => {
		await open(page, '/fixtures/remote-mapping/field-control?v=match');
		await page.getByLabel('Email').fill('taken@example.com');
		await page.getByRole('button', { name: 'Submit' }).click();
		await expect(error(page, 'email')).toHaveText('Email already taken');
		await page.getByLabel('Email').fill('ada@example.com');
		await expect(error(page, 'email')).toHaveText('Email already taken');
	});

	test('radio-group (spread): Radio.Root takes no name, so nothing submits', async ({ page }) => {
		await open(page, '/fixtures/remote-mapping/radio-group?v=spread');
		await page.getByTestId('radio-pro').click();
		expect(await entries(page)).toEqual([]);
	});

	for (const variant of ['name', 'spread']) {
		test(`checkbox-group (${variant}): the value submits but the issue never shows`, async ({
			page
		}) => {
			await open(page, `/fixtures/remote-mapping/checkbox-group?v=${variant}`);
			await page.getByTestId('box-olives').click();
			expect(await entries(page)).toEqual(['toppings[]=olives']);
			const reply = serverReply(page);
			await page.getByRole('button', { name: 'Submit' }).click();
			await reply;
			await expect(error(page, 'toppings')).toHaveCount(0);
		});
	}

	test('checkbox-group (controlled): Kit reads the box before Base sets its value', async ({
		page
	}) => {
		await open(page, '/fixtures/remote-mapping/checkbox-group?v=controlled');
		await page.getByTestId('box-olives').click();
		await expect.poll(() => entries(page)).toEqual(['toppings[]=']);
	});

	test('slider (spread): the string value from .as() fails the server render', async ({ page }) => {
		const response = await page.goto('/fixtures/remote-mapping/slider?v=spread');
		expect(response?.status()).toBe(500);
	});
});

test("checkbox-group (root-name): Kit's client value lags the DOM", async ({ page }) => {
	const posts = countPosts(page);
	await open(page, '/fixtures/remote-mapping/checkbox-group?v=root-name');
	await page.getByTestId('box-olives').click();
	expect(await entries(page)).toEqual(['toppings[]=olives']);
	await expect.poll(async () => (await debug(page)).kit).toEqual({ toppings: [''] });
	expect(posts).toEqual([]);
});
