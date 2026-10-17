import { expect, type Page } from '@playwright/test';

export async function openBeforeHydration(page: Page, fixture: string, scenario: string) {
	let release!: () => void;
	const held = new Promise<void>((resolve) => (release = resolve));
	await page.route(/\.js(\?.*)?$/, async (route) => {
		await held;
		await route.continue();
	});
	await page.goto(`/fixtures/${fixture}?case=${scenario}`, { waitUntil: 'commit' });
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'false');
	return {
		async hydrate() {
			release();
			await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
		}
	};
}
