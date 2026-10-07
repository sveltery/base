// Each case runs against the Svelte Switch and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/switch?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { switchEl: page.getByRole('switch', { name: 'Notifications' }), errors };
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
			const { switchEl, errors } = await open(page, 'standalone', reference);
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			await expect(switchEl).toHaveAttribute('data-unchecked', '');
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
			await expect(switchEl).toHaveAttribute('data-checked', '');
			expect(await calls(page)).toEqual([{ checked: true, reason: 'none', canceled: false }]);
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toHaveLength(2);
			expect(errors).toEqual([]);
		});

		test('keyboard Space and Enter activate the switch', async ({ page }) => {
			const { switchEl } = await open(page, 'standalone', reference);
			await switchEl.focus();
			await page.keyboard.press('Space');
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
			await page.keyboard.press('Enter');
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
		});

		test('owner-held state follows the owner and receives clicks', async ({ page }) => {
			const { switchEl } = await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			await owner.check();
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			await expect(owner).not.toBeChecked();
			expect(await calls(page)).toEqual([{ checked: false, reason: 'none', canceled: false }]);
		});

		test('canceling onCheckedChange keeps the state', async ({ page }) => {
			const { switchEl } = await open(page, 'cancel', reference);
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([{ checked: true, reason: 'none', canceled: true }]);
		});

		test('disabled uses aria-disabled and never calls back', async ({ page }) => {
			const { switchEl } = await open(page, 'disabled', reference);
			await expect(switchEl).toHaveAttribute('aria-disabled', 'true');
			await expect(switchEl).toHaveAttribute('data-disabled', '');
			await expect(switchEl).not.toHaveAttribute('disabled');
			await switchEl.click({ force: true });
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([]);
		});

		test('readOnly does not toggle', async ({ page }) => {
			const { switchEl } = await open(page, 'readonly', reference);
			await expect(switchEl).toHaveAttribute('aria-readonly', 'true');
			await expect(switchEl).toHaveAttribute('data-readonly', '');
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([]);
		});

		test('a wrapping label toggles the switch once', async ({ page }) => {
			const { switchEl } = await open(page, 'label', reference);
			await page.getByText('Toggle').click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
			expect(await calls(page)).toEqual([{ checked: true, reason: 'none', canceled: false }]);
		});

		test('form submission cycles uncheckedValue and value', async ({ page }) => {
			const { switchEl } = await open(page, 'form', reference);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => values(page)).toEqual(['no']);
			await switchEl.click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => values(page)).toEqual(['no', 'yes']);
			await switchEl.click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => values(page)).toEqual(['no', 'yes', 'no']);
		});

		test('native button keeps the id and activates from the keyboard', async ({ page }) => {
			const { switchEl } = await open(page, 'native', reference);
			await expect(switchEl).toHaveAttribute('id', 'tested-switch');
			expect(await switchEl.evaluate((element) => element.tagName)).toBe('BUTTON');
			await switchEl.focus();
			await page.keyboard.press('Enter');
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
			await page.keyboard.press('Space');
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
		});

		// Svelte calls event.preventDefault(); React calls event.preventBaseUIHandler().
		test('consumer onclick can skip the switch handler', async ({ page }) => {
			const { switchEl } = await open(page, 'prevented', reference);
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([]);
		});
	});
}

test('svelte SSR renders an unchecked switch before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/switch?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="switch"');
	expect(html).toContain('aria-checked="false"');
	expect(html).toContain('data-unchecked');
	expect(html).toContain('type="checkbox"');
});
