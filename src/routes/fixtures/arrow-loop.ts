import { expect, type Locator, type Page } from '@playwright/test';

/** ArrowRight walks one → two → three → one. */
export async function focusArrowLoop(page: Page, one: Locator, two: Locator, three: Locator) {
	await one.focus();
	await page.keyboard.press('ArrowRight');
	await expect(two).toBeFocused();
	await page.keyboard.press('ArrowRight');
	await expect(three).toBeFocused();
	await page.keyboard.press('ArrowRight');
	await expect(one).toBeFocused();
}
