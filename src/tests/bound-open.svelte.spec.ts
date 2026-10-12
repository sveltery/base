import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BoundOpenHarness from './BoundOpenHarness.svelte';

describe.each(['popover', 'dialog'] as const)('%s opened through bind:open', (part) => {
	it('marks its only trigger expanded', async () => {
		render(BoundOpenHarness, { part });
		const trigger = page.getByRole('button', { name: 'Trigger', exact: true }).element();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		await page.getByRole('button', { name: 'Open from parent' }).click();
		await expect.element(page.getByText('Content')).toBeVisible();
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true');
		(page.getByText('Close from parent').element() as HTMLElement).click();
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('false');
	});
});
