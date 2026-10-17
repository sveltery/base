// Kit's `.as('radio', option)` spread straight onto RadioGroup. The spread's `value` is one
// option, so it becomes the group's starting selection; overriding it with the field's value works.
import { expect, test, type Page } from '@playwright/test';
import { debug, error, field, open } from '../form/shared/helpers.js';

const url = (v: string) => `/fixtures/remote-mapping/radio-spread?v=${v}`;
const radio = (page: Page, plan: string) => page.locator(`input[type="radio"][value="${plan}"]`);
const group = (page: Page) => page.getByTestId('group');
const submit = (page: Page) => page.getByRole('button', { name: 'Submit' }).click();
/** The form's entries as `name=value`, with Kit's form id cut from the name. */
const entries = (page: Page) =>
	page
		.locator('form')
		.evaluate((form: HTMLFormElement) =>
			[...new FormData(form)].map(([key, value]) => `${key.split('/')[0]}=${value}`)
		);

test.describe('with JS', () => {
	test('spread: the option passed to .as() starts selected and submits untouched', async ({
		page
	}) => {
		await open(page, url('spread-free'));
		await expect(radio(page, 'free')).toBeChecked();
		expect(await entries(page)).toEqual(['plan=free']);
		expect((await debug(page)).kit).toEqual({});
		await submit(page);
		await expect(error(page, 'plan')).toHaveText('The free plan is full');
	});

	test('spread: a click still moves the selection, and the issue shows and clears', async ({
		page
	}) => {
		const errors = await open(page, url('spread-pro'));
		await expect(radio(page, 'pro')).toBeChecked();
		await page.getByTestId('radio-free').click();
		await expect(radio(page, 'free')).toBeChecked();
		expect(await entries(page)).toEqual(['plan=free']);
		await submit(page);
		await expect(error(page, 'plan')).toHaveText('The free plan is full');
		await expect(group(page)).toHaveAttribute('aria-invalid', 'true');
		await expect(radio(page, 'free')).toBeChecked();
		await page.getByTestId('radio-pro').click();
		await expect(error(page, 'plan')).toHaveCount(0);
		await submit(page);
		await expect
			.poll(async () => (await debug(page)).result)
			.toEqual({ received: { plan: 'pro' } });
		expect(errors, 'no page errors, including form_field_unbound').toEqual([]);
	});

	test('spread: type and checked land on the group element', async ({ page }) => {
		await open(page, url('spread-pro'));
		await expect(group(page)).toHaveAttribute('type', 'radio');
		await page.getByTestId('radio-free').click();
		await expect(group(page)).toHaveAttribute('checked', 'false');
	});

	test('spread + value: nothing starts selected, and the round trip works', async ({ page }) => {
		const errors = await open(page, url('spread-value'));
		await expect(radio(page, 'free')).not.toBeChecked();
		await expect(radio(page, 'pro')).not.toBeChecked();
		expect(await entries(page)).toEqual([]);
		await page.getByTestId('radio-free').click();
		await expect.poll(async () => (await debug(page)).kit).toEqual({ plan: 'free' });
		await submit(page);
		await expect(error(page, 'plan')).toHaveText('The free plan is full');
		await page.getByTestId('radio-pro').click();
		await expect(error(page, 'plan')).toHaveCount(0);
		await submit(page);
		await expect
			.poll(async () => (await debug(page)).result)
			.toEqual({ received: { plan: 'pro' } });
		expect(errors, 'no page errors, including form_field_unbound').toEqual([]);
	});

	test('spread + value={undefined}: nothing starts selected, and the round trip works', async ({
		page
	}) => {
		const errors = await open(page, url('spread-undefined'));
		await expect(radio(page, 'free')).not.toBeChecked();
		await expect(radio(page, 'pro')).not.toBeChecked();
		await page.getByTestId('radio-free').click();
		await submit(page);
		await expect(error(page, 'plan')).toHaveText('The free plan is full');
		await expect(radio(page, 'free')).toBeChecked();
		await page.getByTestId('radio-pro').click();
		await expect(error(page, 'plan')).toHaveCount(0);
		await submit(page);
		await expect
			.poll(async () => (await debug(page)).result)
			.toEqual({ received: { plan: 'pro' } });
		expect(errors).toEqual([]);
	});

	test('spread + defaultValue: the spread value still wins', async ({ page }) => {
		await open(page, url('spread-default'));
		await expect(radio(page, 'free')).toBeChecked();
		await expect(radio(page, 'pro')).not.toBeChecked();
	});
});

test.describe('without JS', () => {
	test.use({ javaScriptEnabled: false });

	test('spread: a rejected choice comes back as the option passed to .as()', async ({ page }) => {
		await page.goto(url('spread-pro'));
		await page.getByText('free', { exact: true }).click();
		await submit(page);
		// Kit's aria-invalid getter marks the group; Field.Error stays empty here, as it does
		// for the name={...} pattern without JS.
		await expect(group(page)).toHaveAttribute('aria-invalid', 'true');
		await expect(radio(page, 'pro')).toBeChecked();
		await expect(radio(page, 'free')).not.toBeChecked();
	});

	test('spread + value: a rejected choice comes back as submitted', async ({ page }) => {
		await page.goto(url('spread-value'));
		await page.getByText('free', { exact: true }).click();
		await submit(page);
		await expect(group(page)).toHaveAttribute('aria-invalid', 'true');
		await expect(radio(page, 'free')).toBeChecked();
	});

	test('spread + value: an accepted choice submits', async ({ page }) => {
		await page.goto(url('spread-value'));
		await page.getByText('pro', { exact: true }).click();
		await submit(page);
		await expect(field(page, 'plan')).toBeVisible();
		expect((await debug(page)).result).toEqual({ received: { plan: 'pro' } });
	});

	test('spread + value={undefined}: a rejected choice comes back unselected', async ({ page }) => {
		await page.goto(url('spread-undefined'));
		await page.getByText('free', { exact: true }).click();
		await submit(page);
		await expect(group(page)).toHaveAttribute('aria-invalid', 'true');
		await expect(radio(page, 'free')).not.toBeChecked();
		await expect(radio(page, 'pro')).not.toBeChecked();
	});
});
