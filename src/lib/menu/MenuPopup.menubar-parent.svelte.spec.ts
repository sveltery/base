// Assertions follow Base UI v1.9.0 packages/react/src/menu/popup/MenuPopup.tsx, the default
// `returnFocus` of a triggerless menu under a menubar
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuMenubarParentHarness from '../../tests/menu/MenuMenubarParentHarness.svelte';
import { parkPointer } from '../../tests/pointer.js';

async function settle() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

async function openFromButton() {
	const button = page.getByRole('button', { name: 'Open' }).element() as HTMLElement;
	await userEvent.click(button);
	await expect.poll(() => document.querySelector('[role="menu"][data-open]')).not.toBeNull();
	await expect.poll(() => document.activeElement?.closest('[role="menu"]') != null).toBe(true);
	return button;
}

describe('Menu.Popup without a trigger under a menubar', () => {
	beforeEach(parkPointer);

	it('does not return focus after an outside press', async () => {
		const changed = vi.fn();
		render(MenuMenubarParentHarness, { onOpenChange: changed });
		await openFromButton();
		await userEvent.click(page.getByTestId('blank'));
		await expect.poll(() => document.querySelector('[role="menu"]')).toBeNull();
		await settle();
		expect(changed.mock.calls.at(-1)?.[1].reason).toBe('outside-press');
		expect(document.activeElement).toBe(document.body);
	});

	it('returns focus after Escape', async () => {
		const changed = vi.fn();
		render(MenuMenubarParentHarness, { onOpenChange: changed });
		const button = await openFromButton();
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => document.querySelector('[role="menu"]')).toBeNull();
		await settle();
		expect(changed.mock.calls.at(-1)?.[1].reason).toBe('escape-key');
		expect(document.activeElement).toBe(button);
	});
});
