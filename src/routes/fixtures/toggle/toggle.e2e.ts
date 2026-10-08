// Each case runs against the Svelte Toggle and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'toggle', scenario, reference);
	return { toggle: page.getByRole('button', { name: 'Bold' }), errors: opened.errors };
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as {
		pressed: boolean;
		reason: string;
		canceled: boolean;
	}[];
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('click toggles aria-pressed and data-pressed', async ({ page }) => {
			const { toggle, errors } = await open(page, 'standalone', reference);
			await expect(toggle).toHaveAttribute('aria-pressed', 'false');
			await expect(toggle).not.toHaveAttribute('data-pressed');
			await toggle.click();
			await expect(toggle).toHaveAttribute('aria-pressed', 'true');
			await expect(toggle).toHaveAttribute('data-pressed', '');
			expect(await calls(page)).toEqual([{ pressed: true, reason: 'none', canceled: false }]);
			await toggle.click();
			await expect(toggle).toHaveAttribute('aria-pressed', 'false');
			expect(await calls(page)).toHaveLength(2);
			expect(errors).toEqual([]);
		});

		test('keyboard Space and Enter activate the native button', async ({ page }) => {
			const { toggle } = await open(page, 'standalone', reference);
			await toggle.focus();
			await page.keyboard.press('Space');
			await expect(toggle).toHaveAttribute('aria-pressed', 'true');
			await page.keyboard.press('Enter');
			await expect(toggle).toHaveAttribute('aria-pressed', 'false');
		});

		test('owner-held state follows the owner and receives clicks', async ({ page }) => {
			const { toggle } = await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner pressed' });
			await expect(toggle).toHaveAttribute('aria-pressed', 'false');
			await owner.check();
			await expect(toggle).toHaveAttribute('aria-pressed', 'true');
			await toggle.click();
			await expect(toggle).toHaveAttribute('aria-pressed', 'false');
			await expect(owner).not.toBeChecked();
			expect(await calls(page)).toEqual([{ pressed: false, reason: 'none', canceled: false }]);
		});

		test('canceling onPressedChange keeps the state', async ({ page }) => {
			const { toggle } = await open(page, 'cancel', reference);
			await toggle.click();
			await expect(toggle).toHaveAttribute('aria-pressed', 'false');
			expect(await calls(page)).toEqual([{ pressed: true, reason: 'none', canceled: true }]);
		});

		test('disabled is natively disabled and never calls back', async ({ page }) => {
			const { toggle } = await open(page, 'disabled', reference);
			await expect(toggle).toBeDisabled();
			await expect(toggle).toHaveAttribute('data-disabled', '');
			await toggle.click({ force: true });
			await expect(toggle).toHaveAttribute('aria-pressed', 'false');
			expect(await calls(page)).toEqual([]);
		});

		// Svelte calls event.preventDefault(); React calls event.preventBaseUIHandler().
		test('consumer onclick can skip the toggle handler', async ({ page }) => {
			const { toggle } = await open(page, 'prevented', reference);
			await toggle.click();
			await expect(toggle).toHaveAttribute('aria-pressed', 'false');
			expect(await calls(page)).toEqual([]);
		});
	});
}

test('svelte SSR renders a non-submit button before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/toggle?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toMatch(
		/<button[^>]*type="button"[^>]*aria-pressed="false"|<button[^>]*aria-pressed="false"[^>]*type="button"/
	);
});
