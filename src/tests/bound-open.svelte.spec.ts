import { flushSync } from 'svelte';
import { page, userEvent } from 'vitest/browser';
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

describe.each(['popover', 'dialog'] as const)('%s reopened through bind:open', (part) => {
	it('unmounts on the next close after a close kept it mounted', async () => {
		const { component } = render(BoundOpenHarness, { part, preventUnmount: true });
		const content = page.getByText('Content');
		await page.getByRole('button', { name: 'Trigger', exact: true }).click();
		await expect.element(content).toBeVisible();
		await userEvent.keyboard('{Escape}');
		await expect.element(content).toHaveAttribute('data-closed', '');

		flushSync(() => component.setOpenFromParent(true));
		await expect.element(content).toHaveAttribute('data-open', '');
		flushSync(() => component.setOpenFromParent(false));

		await expect.poll(() => content.elements().length).toBe(0);
	});
});
