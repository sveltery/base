// Radio designs for Kit's `.as('radio', option)`: A spreads it on each Radio.Root,
// B gives RadioGroup group-keyed props built from the field.
import { expect, test, type Page } from '@playwright/test';
import { debug, error, field, open } from '../form/shared/helpers.js';

const designs = ['option', 'group'] as const;
const url = (v: string) => `/fixtures/remote-radio?v=${v}`;
const input = (page: Page, plan: string) => page.locator(`input[type="radio"][value="${plan}"]`);
const radio = (page: Page, plan: string) => page.getByTestId(`radio-${plan}`);
const submit = (page: Page) => page.getByRole('button', { name: 'Submit' }).click();
/** The form's entries as `name=value`, with Kit's form id cut from the name. */
const entries = (page: Page) =>
	page
		.locator('form')
		.evaluate((form: HTMLFormElement) =>
			[...new FormData(form)].map(([key, value]) => `${key.split('/')[0]}=${value}`)
		);
const checked = (page: Page) =>
	page
		.locator('input[type="radio"]')
		.evaluateAll((inputs: HTMLInputElement[]) =>
			inputs.filter((input) => input.checked).map((input) => input.value)
		);

for (const v of designs) {
	test.describe(`${v} with JS`, () => {
		test('starts empty, rejects free with an issue, clears it, and submits pro', async ({
			page
		}) => {
			const errors = await open(page, url(v));
			expect(await checked(page)).toEqual([]);
			expect(await entries(page)).toEqual([]);
			await radio(page, 'free').click();
			await expect.poll(async () => (await debug(page)).kit).toEqual({ plan: 'free' });
			expect(await entries(page)).toEqual(['plan=free']);
			await submit(page);
			await expect(error(page, 'plan')).toHaveText('The free plan is full');
			await expect(radio(page, 'free')).toHaveAttribute('aria-invalid', 'true');
			expect(await checked(page)).toEqual(['free']);
			await radio(page, 'pro').click();
			await expect(error(page, 'plan')).toHaveCount(0);
			await submit(page);
			await expect
				.poll(async () => (await debug(page)).result)
				.toEqual({ received: { plan: 'pro' } });
			expect(errors, 'no page errors, including form_field_unbound').toEqual([]);
		});

		test('arrow keys move focus and selection, and the selected radio is the tab stop', async ({
			page
		}) => {
			await open(page, url(v));
			await page.getByRole('button', { name: 'Submit' }).focus();
			await page.keyboard.press('Shift+Tab');
			await expect(radio(page, 'free')).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(radio(page, 'pro')).toBeFocused();
			await expect(radio(page, 'pro')).toHaveAttribute('aria-checked', 'true');
			await expect.poll(async () => (await debug(page)).kit).toEqual({ plan: 'pro' });
			await page.keyboard.press('ArrowDown');
			await expect(radio(page, 'team')).toHaveAttribute('aria-checked', 'true');
			await expect(radio(page, 'pro')).toHaveAttribute('aria-checked', 'false');
			await expect(radio(page, 'team')).toHaveAttribute('tabindex', '0');
			await expect(radio(page, 'free')).toHaveAttribute('tabindex', '-1');
			expect(await checked(page)).toEqual(['team']);
		});

		// Without Svelte's experimental async, Kit 3.0.1 reads the form before the browser resets
		// it, so Kit keeps its value even for plain inputs (see below). A follows Kit's `checked`;
		// B, like plain inputs, clears the DOM and leaves Kit stale. With async, all three clear.
		test('form reset', async ({ page }) => {
			await open(page, url(v));
			await radio(page, 'pro').click();
			await expect.poll(async () => (await debug(page)).kit).toEqual({ plan: 'pro' });
			await page.getByRole('button', { name: 'Reset' }).click();
			await page.waitForTimeout(100);
			expect((await debug(page)).kit).toEqual({ plan: 'pro' });
			expect(await checked(page)).toEqual(v === 'option' ? ['pro'] : []);
			await radio(page, 'team').click();
			expect(await checked(page)).toEqual(['team']);
			await expect.poll(async () => (await debug(page)).kit).toEqual({ plan: 'team' });
		});

		test('field.set() moves the selection', async ({ page }) => {
			await open(page, url(v));
			await radio(page, 'pro').click();
			await page.getByRole('button', { name: 'Set team' }).click();
			await expect(radio(page, 'team')).toHaveAttribute('aria-checked', 'true');
			expect(await checked(page)).toEqual(['team']);
			expect(await entries(page)).toEqual(['plan=team']);
		});

		test('Field sees the value: filled and dirty follow the selection', async ({ page }) => {
			await open(page, url(v));
			await expect(field(page, 'plan')).not.toHaveAttribute('data-filled');
			await radio(page, 'pro').click();
			await expect(field(page, 'plan')).toHaveAttribute('data-filled', '');
			await expect(field(page, 'plan')).toHaveAttribute('data-dirty', '');
		});
	});

	test.describe(`${v} without JS`, () => {
		test.use({ javaScriptEnabled: false });

		test('a rejected choice comes back selected and marked invalid', async ({ page }) => {
			await page.goto(url(v));
			await page.getByText('free', { exact: true }).click();
			await submit(page);
			await expect(input(page, 'free')).toBeChecked();
			await expect(radio(page, 'free')).toHaveAttribute('aria-checked', 'true');
			expect(await checked(page)).toEqual(['free']);
			await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible();
		});

		test('an accepted choice submits under Kit’s name', async ({ page }) => {
			await page.goto(url(v));
			await page.getByText('pro', { exact: true }).click();
			await submit(page);
			expect((await debug(page)).result).toEqual({ received: { plan: 'pro' } });
		});
	});
}

test('reference: plain inputs disagree with Kit after a form reset without async', async ({
	page
}) => {
	await open(page, url('native'));
	await page.getByTestId('radio-pro').click();
	await expect.poll(async () => (await debug(page)).kit).toEqual({ plan: 'pro' });
	await page.getByRole('button', { name: 'Reset' }).click();
	await page.waitForTimeout(100);
	expect((await debug(page)).kit, 'Kit 3.0.1 keeps its value').toEqual({ plan: 'pro' });
	await expect(page.getByTestId('radio-pro')).not.toBeChecked();
});

test.describe('Field.Error without JS', () => {
	test.use({ javaScriptEnabled: false });

	test('needs the name on Field.Root, as for every control', async ({ page }) => {
		for (const [v, count] of [
			['option', 0],
			['option-root-name', 1]
		] as const) {
			await page.goto(url(v));
			await page.getByText('free', { exact: true }).click();
			await submit(page);
			await expect(error(page, 'plan')).toHaveCount(count);
		}
	});
});
