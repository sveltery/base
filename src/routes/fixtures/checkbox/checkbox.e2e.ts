// Each case runs against the Svelte Checkbox and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/checkbox?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { checkbox: page.getByRole('checkbox', { name: 'Notifications' }), errors };
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as {
		checked: boolean;
		reason: string;
		canceled: boolean;
	}[];
}

async function values(page: Page) {
	return JSON.parse(await page.getByTestId('values').innerText()) as (string | null)[];
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('click toggles aria-checked and data-checked', async ({ page }) => {
			const { checkbox, errors } = await open(page, 'standalone', reference);
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			await expect(checkbox).toHaveAttribute('data-unchecked', '');
			await checkbox.click();
			await expect(checkbox).toHaveAttribute('aria-checked', 'true');
			await expect(checkbox).toHaveAttribute('data-checked', '');
			expect(await calls(page)).toEqual([{ checked: true, reason: 'none', canceled: false }]);
			await checkbox.click();
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toHaveLength(2);
			expect(errors).toEqual([]);
		});

		test('Space ticks the checkbox and Enter does not', async ({ page }) => {
			const { checkbox } = await open(page, 'standalone', reference);
			await checkbox.focus();
			await page.keyboard.press('Space');
			await expect(checkbox).toHaveAttribute('aria-checked', 'true');
			await page.keyboard.press('Enter');
			await expect(checkbox).toHaveAttribute('aria-checked', 'true');
		});

		test('owner-held state follows the owner and receives clicks', async ({ page }) => {
			const { checkbox } = await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			await owner.check();
			await expect(checkbox).toHaveAttribute('aria-checked', 'true');
			await checkbox.click();
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			await expect(owner).not.toBeChecked();
			expect(await calls(page)).toEqual([{ checked: false, reason: 'none', canceled: false }]);
		});

		test('canceling onCheckedChange keeps the state', async ({ page }) => {
			const { checkbox } = await open(page, 'cancel', reference);
			await checkbox.click();
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([{ checked: true, reason: 'none', canceled: true }]);
		});

		test('disabled uses aria-disabled and never calls back', async ({ page }) => {
			const { checkbox } = await open(page, 'disabled', reference);
			await expect(checkbox).toHaveAttribute('aria-disabled', 'true');
			await expect(checkbox).toHaveAttribute('data-disabled', '');
			await expect(checkbox).not.toHaveAttribute('disabled');
			await checkbox.click({ force: true });
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([]);
		});

		test('readOnly does not toggle', async ({ page }) => {
			const { checkbox } = await open(page, 'readonly', reference);
			await expect(checkbox).toHaveAttribute('aria-readonly', 'true');
			await expect(checkbox).toHaveAttribute('data-readonly', '');
			await checkbox.click();
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([]);
		});

		test('a wrapping label toggles the checkbox once', async ({ page }) => {
			const { checkbox } = await open(page, 'label', reference);
			await page.getByText('Toggle').click();
			await expect(checkbox).toHaveAttribute('aria-checked', 'true');
			expect(await calls(page)).toEqual([{ checked: true, reason: 'none', canceled: false }]);
		});

		test('form submission cycles uncheckedValue and value', async ({ page }) => {
			const { checkbox } = await open(page, 'form', reference);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => values(page)).toEqual(['no']);
			await checkbox.click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => values(page)).toEqual(['no', 'yes']);
			await checkbox.click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => values(page)).toEqual(['no', 'yes', 'no']);
		});

		test('Enter submits the form and leaves the checkbox unticked', async ({ page }) => {
			const { checkbox } = await open(page, 'enter', reference);
			await checkbox.focus();
			await page.keyboard.press('Enter');
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			await expect.poll(async () => values(page)).toEqual(['no']);
			expect(await calls(page)).toEqual([]);
		});

		test('native button keeps the id and Space ticks it', async ({ page }) => {
			const { checkbox } = await open(page, 'native', reference);
			await expect(checkbox).toHaveAttribute('id', 'tested-checkbox');
			expect(await checkbox.evaluate((element) => element.tagName)).toBe('BUTTON');
			await checkbox.focus();
			await page.keyboard.press('Enter');
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			await page.keyboard.press('Space');
			await expect(checkbox).toHaveAttribute('aria-checked', 'true');
		});

		test('indeterminate stays mixed and shows the indicator', async ({ page }) => {
			const { checkbox } = await open(page, 'indeterminate', reference);
			await expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
			await expect(checkbox).toHaveAttribute('data-indeterminate', '');
			await expect(page.getByTestId('indicator')).toHaveAttribute('data-indeterminate', '');
			await checkbox.click();
			await expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
			await expect(page.getByTestId('indicator')).toHaveCount(1);
		});

		// Svelte calls event.preventDefault(); React calls event.preventBaseUIHandler().
		test('consumer onclick can skip the checkbox handler', async ({ page }) => {
			const { checkbox } = await open(page, 'prevented', reference);
			await checkbox.click();
			await expect(checkbox).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([]);
		});
	});
}

test('svelte SSR renders an unticked checkbox before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/checkbox?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="checkbox"');
	expect(html).toContain('aria-checked="false"');
	expect(html).toContain('data-unchecked');
	expect(html).toContain('type="checkbox"');
});

test('svelte SSR renders a mixed checkbox before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/checkbox?case=indeterminate')).text();
	expect(html).toContain('aria-checked="mixed"');
	expect(html).toContain('data-indeterminate');
});
