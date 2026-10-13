import { expect, type Page } from '@playwright/test';

/** The `Field.Root` marked `data-field={name}`. */
export const field = (page: Page, name: string) => page.locator(`[data-field="${name}"]`);
export const control = (page: Page, name: string) =>
	field(page, name).locator('input, textarea').first();
export const error = (page: Page, name: string) => field(page, name).getByTestId('error');

/** Opens a fixture and waits for hydration. Collects page errors. */
export async function open(page: Page, url: string) {
	const errors: string[] = [];
	page.on('pageerror', (failure) => errors.push(failure.message));
	await page.goto(url);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return errors;
}

/** URLs of every POST the page sends from now on. */
export function countPosts(page: Page) {
	const posts: string[] = [];
	page.on('request', (request) => {
		if (request.method() === 'POST') posts.push(request.url());
	});
	return posts;
}

/** The JSON the fixture renders in its debug panel. */
export async function debug(page: Page): Promise<Record<string, unknown>> {
	return JSON.parse(await page.getByTestId('debug').innerText());
}
