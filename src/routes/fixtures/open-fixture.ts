import { expect, type Page } from '@playwright/test';

/** Opens one fixture case and records page errors until the host is hydrated. */
export async function openFixture(
	page: Page,
	fixture: string,
	scenario: string,
	reference: boolean,
	waitUntil?: 'load' | 'domcontentloaded' | 'commit'
) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	const url = `/fixtures/${fixture}?case=${scenario}${reference ? '&reference' : ''}`;
	await (waitUntil ? page.goto(url, { waitUntil }) : page.goto(url));
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
}
