import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import { items } from '../../tests/menu/types.js';

// The focus return and the positioning both finish after the popup unmounts. Neither may read
// state the unmount destroyed, which Svelte reports as `derived_inert`.
describe('Menu without Svelte warnings', () => {
	let warn: MockInstance<typeof console.warn>;

	beforeEach(() => {
		warn = vi.spyOn(console, 'warn');
	});

	afterEach(() => {
		warn.mockRestore();
	});

	function svelteWarnings() {
		return warn.mock.calls
			.map((args) => String(args[0]))
			.filter((text) => text.includes('[svelte]'));
	}

	async function settled() {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	const open = () => userEvent.click(page.getByRole('button', { name: 'Open' }));

	it('opens and closes by Escape, an item, an outside press and the trigger', async () => {
		render(MenuHarness, { items: items('One', 'Two') });

		await open();
		await settled();
		await userEvent.keyboard('{Escape}');
		await settled();
		await open();
		await settled();
		await userEvent.click(page.getByRole('menuitem', { name: 'One' }));
		await settled();
		await open();
		await settled();
		await userEvent.click(document.body, { position: { x: 1, y: 1 } });
		await settled();
		await open();
		await settled();
		await open();
		await settled();

		expect(page.getByRole('menu').elements()).toHaveLength(0);
		expect(svelteWarnings()).toEqual([]);
	});

	it('closes an open submenu and its parent by Escape', async () => {
		render(MenuHarness, {
			items: [
				{ type: 'item', label: 'One' },
				{ type: 'submenu', label: 'More', items: items('Sub A', 'Sub B') }
			]
		});

		await open();
		await settled();
		await userEvent.click(page.getByRole('menuitem', { name: 'More' }));
		await settled();
		expect(page.getByRole('menu').elements()).toHaveLength(2);
		await userEvent.keyboard('{Escape}');
		await settled();
		await userEvent.keyboard('{Escape}');
		await settled();

		expect(page.getByRole('menu').elements()).toHaveLength(0);
		expect(svelteWarnings()).toEqual([]);
	});
});
