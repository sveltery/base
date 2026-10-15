// A `finalFocus` function runs on every close, as upstream's FloatingFocusManager resolves
// `returnFocus` before it checks whether the return is prevented
// (floating-ui-react/components/FloatingFocusManager.tsx:846-852,898). A pointer leaving a hover
// menu prevents the return (:801-806), so focus stays where it was. The expected calls and focus
// are what @base-ui/react 1.9.0 reports for the same tree and events.
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Harness from '../../tests/menu/MenuFinalFocusHarness.svelte';

function get(id: string) {
	const element = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`no ${id}`);
	return element;
}
const isOpen = (id: string) =>
	document.querySelector(`[data-testid="${id}"]`)?.hasAttribute('data-open') ?? false;

async function closed() {
	await expect.poll(() => document.querySelector('[data-testid="popup"]')).toBe(null);
	await new Promise((resolve) => setTimeout(resolve, 100));
	const active = document.activeElement as HTMLElement | null;
	return active === document.body ? 'BODY' : (active?.dataset.testid ?? null);
}

describe('Menu.Popup finalFocus', () => {
	it('runs on an Escape close and focuses its target', async () => {
		const calls: string[] = [];
		render(Harness, { calls });
		await userEvent.click(get('trigger'));
		await expect.poll(() => isOpen('popup')).toBe(true);
		await userEvent.keyboard('{Escape}');
		expect({ active: await closed(), calls }).toEqual({ active: 'target', calls: ['keyboard'] });
	});

	it('runs on an item click and focuses its target', async () => {
		const calls: string[] = [];
		render(Harness, { calls });
		await userEvent.click(get('trigger'));
		await expect.poll(() => isOpen('popup')).toBe(true);
		await userEvent.click(get('item'));
		expect({ active: await closed(), calls }).toEqual({ active: 'target', calls: ['mouse'] });
	});

	it('runs when the pointer leaves a hover menu, which moves no focus', async () => {
		const calls: string[] = [];
		render(Harness, { calls });
		await userEvent.hover(get('trigger'));
		await expect.poll(() => isOpen('popup')).toBe(true);
		await userEvent.hover(get('target'));
		expect({ active: await closed(), calls }).toEqual({ active: 'BODY', calls: ['keyboard'] });
	});
});
