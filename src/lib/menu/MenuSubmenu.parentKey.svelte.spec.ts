// A main-axis key a vertical submenu leaves unhandled moves its horizontal parent's highlight. The
// expected focus, highlight and open states are what @base-ui/react 1.9.0 reports for the same
// tree and keys, where packages/react/src/floating-ui-react/hooks/useListNavigation.ts:644-650
// navigates the parent from its current index for keys from a nested popup.
import { tick } from 'svelte';
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Harness from '../../tests/menu/MenuHorizontalSubmenuHarness.svelte';

const get = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
const isOpen = (id: string) => get(id)?.hasAttribute('data-open') ?? false;
const focused = () => (document.activeElement as HTMLElement | null)?.dataset.testid;

async function settle() {
	for (let i = 0; i < 3; i++) {
		await new Promise(requestAnimationFrame);
		await tick();
	}
}

it("moves a horizontal parent's highlight on ArrowRight from a plain submenu item", async () => {
	const log: string[] = [];
	render(Harness, { log });
	await expect.poll(() => get('first')).not.toBe(null);
	get('first')!.focus();
	await userEvent.keyboard('{ArrowRight}');
	await expect.poll(focused).toBe('sub-trigger');
	await userEvent.keyboard('{ArrowDown}');
	await expect.poll(focused).toBe('child');

	await userEvent.keyboard('{ArrowRight}');
	await expect.poll(focused).toBe('first');
	await settle();
	expect({
		highlighted: get('menu')!.querySelector('[data-highlighted]')?.getAttribute('data-testid'),
		submenu: isOpen('sub'),
		log
	}).toEqual({ highlighted: 'first', submenu: true, log: ['sub:open:list-navigation'] });
});
