// Each case runs against the Svelte Separator and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/separator?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { separator: page.getByRole('separator'), errors };
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('default separator is horizontal', async ({ page }) => {
			const { separator, errors } = await open(page, 'horizontal', reference);
			await expect(separator).toBeVisible();
			await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
			await expect(separator).toHaveAttribute('data-orientation', 'horizontal');
			await expect(separator).toHaveId('tested-separator');
			expect(errors).toEqual([]);
		});

		test('vertical orientation sets both orientation attributes', async ({ page }) => {
			const { separator } = await open(page, 'vertical', reference);
			await expect(separator).toBeVisible();
			await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
			await expect(separator).toHaveAttribute('data-orientation', 'vertical');
		});

		test('orientation follows the parent when it changes', async ({ page }) => {
			const { separator } = await open(page, 'reactive', reference);
			const flip = page.getByRole('button', { name: 'Flip orientation' });
			await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
			await expect(separator).toHaveAttribute('data-orientation', 'horizontal');
			await flip.click();
			await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
			await expect(separator).toHaveAttribute('data-orientation', 'vertical');
			await flip.click();
			await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
			await expect(separator).toHaveAttribute('data-orientation', 'horizontal');
		});
	});
}

test('svelte SSR renders separator attributes before hydration', async ({ request }) => {
	const horizontal = await (await request.get('/fixtures/separator?case=horizontal')).text();
	expect(horizontal).toContain('data-hydrated="false"');
	expect(horizontal).toContain('role="separator"');
	expect(horizontal).toContain('aria-orientation="horizontal"');
	expect(horizontal).toContain('data-orientation="horizontal"');

	const vertical = await (await request.get('/fixtures/separator?case=vertical')).text();
	expect(vertical).toContain('aria-orientation="vertical"');
	expect(vertical).toContain('data-orientation="vertical"');
});
