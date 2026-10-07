// Each case runs against the Svelte Button and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/button?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
}

async function clicks(page: Page) {
	return JSON.parse(await page.getByTestId('clicks').innerText()) as {
		detail: number;
		shiftKey: boolean;
	}[];
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('native click and keyboard activate a non-submit button', async ({ page }) => {
			const { errors } = await open(page, 'native', reference);
			const button = page.getByRole('button', { name: 'Save' });
			await expect(button).toHaveAttribute('type', 'button');
			await expect(button).toHaveAttribute('tabindex', '0');
			await expect(button).not.toHaveAttribute('data-disabled');
			await expect(button).not.toHaveAttribute('aria-disabled');

			await button.click();
			await button.focus();
			await page.keyboard.press('Space');
			await page.keyboard.press('Enter');

			await expect
				.poll(async () => clicks(page))
				.toEqual([
					{ detail: 1, shiftKey: false },
					{ detail: 0, shiftKey: false },
					{ detail: 0, shiftKey: false }
				]);
			expect(errors).toEqual([]);
		});

		test('disabled is natively disabled and never calls back', async ({ page }) => {
			await open(page, 'disabled', reference);
			const button = page.getByRole('button', { name: 'Save' });
			await expect(button).toBeDisabled();
			await expect(button).toHaveAttribute('data-disabled', '');
			await expect(button).not.toHaveAttribute('aria-disabled');
			await page.keyboard.press('Tab');
			await expect(button).not.toBeFocused();
			await button.click({ force: true });
			expect(await clicks(page)).toEqual([]);
		});

		test('focusableWhenDisabled stays in the tab order and ignores activation', async ({
			page
		}) => {
			await open(page, 'focusable', reference);
			const button = page.getByRole('button', { name: 'Save' });
			await expect(button).not.toHaveAttribute('disabled');
			await expect(button).toHaveAttribute('aria-disabled', 'true');
			await expect(button).toHaveAttribute('data-disabled', '');
			await expect(button).toHaveAttribute('tabindex', '0');
			await page.keyboard.press('Tab');
			await expect(button).toBeFocused();
			await button.hover();
			await expect
				.poll(async () => Number(await page.getByTestId('moves').innerText()))
				.toBeGreaterThan(0);
			// Playwright will not click an aria-disabled control unless forced.
			await button.click({ force: true });
			await page.keyboard.press('Enter');
			await page.keyboard.press('Space');
			expect(await clicks(page)).toEqual([]);
			await expect(button).toBeFocused();
		});

		test('custom host clicks from Enter and Shift+Enter carries shift', async ({ page }) => {
			await open(page, 'custom', reference);
			const button = page.getByRole('button', { name: 'Save' });
			await expect(button).toHaveAttribute('role', 'button');
			await expect(button).toHaveAttribute('tabindex', '0');
			expect(await button.evaluate((element) => element.tagName)).toBe('SPAN');
			await button.focus();
			await page.keyboard.press('Enter');
			await page.keyboard.press('Space');
			await page.keyboard.press('Shift+Enter');
			await expect
				.poll(async () => clicks(page))
				.toEqual([
					{ detail: 0, shiftKey: false },
					{ detail: 0, shiftKey: false },
					{ detail: 0, shiftKey: true }
				]);
		});

		test('disabled custom host is not tabbable and ignores clicks', async ({ page }) => {
			await open(page, 'custom-disabled', reference);
			const button = page.getByRole('button', { name: 'Save' });
			await expect(button).not.toHaveAttribute('disabled');
			await expect(button).toHaveAttribute('aria-disabled', 'true');
			await expect(button).toHaveAttribute('data-disabled', '');
			await expect(button).toHaveAttribute('tabindex', '-1');
			await page.keyboard.press('Tab');
			await expect(button).not.toBeFocused();
			await button.click({ force: true });
			expect(await clicks(page)).toEqual([]);
		});

		test('Space on a custom link clicks and follows the hash without scrolling', async ({
			page
		}) => {
			await open(page, 'link', reference);
			const link = page.getByRole('button', { name: 'Go' });
			await expect(link).toHaveAttribute('href', '#target');
			await link.focus();
			await page.keyboard.press('Space');
			await expect.poll(async () => clicks(page)).toEqual([{ detail: 0, shiftKey: false }]);
			expect(await page.evaluate(() => window.scrollY)).toBe(0);
			expect(await page.evaluate(() => window.location.hash)).toBe('#target');
		});

		test('preventDefault on keydown and keyup skips custom activation', async ({ page }) => {
			await open(page, 'prevented', reference);
			const button = page.getByRole('button', { name: 'Save' });
			await button.focus();
			await page.keyboard.press('Enter');
			await page.keyboard.press('Space');
			expect(await clicks(page)).toEqual([]);
		});
	});
}

test('svelte SSR renders a non-submit button before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/button?case=native')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toMatch(/<button[^>]*type="button"/);
	expect(html).not.toContain('aria-disabled');
});

test('svelte SSR renders custom button semantics', async ({ request }) => {
	const html = await (await request.get('/fixtures/button?case=custom')).text();
	expect(html).toContain('role="button"');
	expect(html).toContain('tabindex="0"');
	expect(html).not.toContain('type="button"');
});
