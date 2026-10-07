// Each case runs against the Svelte Avatar and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

const DATA_URI =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/avatar?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as string[];
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('a cached image replaces the fallback', async ({ page }) => {
			const { errors } = await open(page, 'loaded', reference);
			const image = page.getByRole('img', { name: 'Jane Doe' });

			await expect(image).toBeVisible();
			await expect(image).toHaveAttribute('src', DATA_URI);
			await expect(page.locator('#tested-fallback')).toHaveCount(0);
			await expect.poll(() => calls(page)).toContain('loaded');
			expect(await calls(page)).not.toContain('idle');
			expect(errors).toEqual([]);
		});

		test('a missing image leaves the fallback and reports error', async ({ page }) => {
			await open(page, 'error', reference);

			await expect(page.locator('#tested-fallback')).toBeVisible();
			await expect(page.locator('#tested-image')).toHaveCount(0);
			await expect.poll(() => calls(page)).toContain('error');
			expect(await calls(page)).not.toContain('idle');
		});

		test('fallback delay hides initials until the timer elapses', async ({ page }) => {
			await open(page, 'delay', reference);
			const fallback = page.locator('#tested-fallback');

			await expect(fallback).toHaveCount(0);
			await expect(fallback).toBeVisible();
		});

		test('keepMounted renders the image in place and then shows it', async ({ page }) => {
			await open(page, 'keep', reference);
			const image = page.locator('#tested-image');

			await expect(image).toBeVisible();
			await expect(image).toHaveAttribute('src', DATA_URI);
			await expect(image).not.toHaveAttribute('aria-hidden');
			await expect(page.locator('#tested-fallback')).toHaveCount(0);
			expect(await calls(page)).not.toContain('idle');
		});

		// Svelte calls event.preventDefault(); React calls event.preventBaseUIHandler().
		test('a consumer error handler can skip the status update', async ({ page }) => {
			await page.route('**/hung-avatar.png', () => {});
			await open(page, 'prevented', reference);
			const image = page.locator('#tested-image');

			await expect(image).toHaveAttribute('data-loading', '');
			await expect(image).toHaveAttribute('aria-hidden', 'true');
			await expect(page.locator('#tested-fallback')).toBeVisible();
			await image.dispatchEvent('error', { cancelable: true });
			await expect(image).toHaveAttribute('data-loading', '');
			await expect(image).not.toHaveAttribute('data-error');
			expect(await calls(page)).not.toContain('error');
		});
	});
}

test('svelte SSR omits an image that has not loaded', async ({ request }) => {
	const html = await (await request.get('/fixtures/avatar?case=loaded')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('id="tested-fallback"');
	expect(html).not.toContain('<img');
});

test('svelte SSR renders a keepMounted image hidden from assistive technology', async ({
	request
}) => {
	const html = await (await request.get('/fixtures/avatar?case=keep')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('<img');
	expect(html).toContain('aria-hidden="true"');
	expect(html).toContain('id="tested-fallback"');
	expect(html).toContain(DATA_URI);
});
