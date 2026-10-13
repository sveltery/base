// Assertions follow Base UI v1.9.0
// packages/react/src/menu/filter-submenu-root/MenuFilterSubmenuRoot.pointerFocus.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import { mouse, pointer } from '../../tests/menu/mouse.js';
import { parkPointer } from '../../tests/pointer.js';
import { items } from '../../tests/menu/types.js';

async function frame() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

function renderMenu(filteredParent: boolean, openOnHover?: boolean) {
	const parentList = { 'data-testid': 'parent-list' };
	render(MenuHarness, {
		triggerLabel: 'Actions',
		open: true,
		rootProps: { modal: false },
		...(filteredParent ? { filter: { listProps: parentList } } : { list: parentList }),
		items: [
			{
				type: 'submenu',
				label: 'More',
				triggerProps: { openOnHover, delay: 0 },
				filter: { inputLabel: 'Filter more actions' },
				items: items('Share')
			}
		]
	});
}

async function waitForParentFocus(filteredParent: boolean) {
	const owner = filteredParent
		? page.getByRole('searchbox', { name: 'Filter actions' })
		: page.getByTestId('parent-list');
	await expect.poll(() => document.activeElement).toBe(owner.element());
}

function moreTrigger() {
	return page.getByRole('menuitem', { name: 'More' }).element() as HTMLElement;
}

function submenuInput() {
	return document.querySelector<HTMLInputElement>('input[aria-label="Filter more actions"]');
}

async function press(trigger: HTMLElement, pointerType: string) {
	pointer(trigger, 'pointerdown', { pointerType, width: 10, height: 10, pressure: 0.5 });
	mouse(trigger, 'mousedown', { detail: 1 });
	await frame();
	pointer(trigger, 'pointerup', { pointerType });
	mouse(trigger, 'mouseup', { detail: 1 });
	mouse(trigger, 'click', { detail: 1 });
}

describe.each([false, true])('submenu pointer focus with filteredParent=%s', (filteredParent) => {
	beforeEach(parkPointer);

	it.each(['mouse', 'touch', 'pen'])('handles a %s press without hover opening', async (type) => {
		renderMenu(filteredParent, false);
		await waitForParentFocus(filteredParent);
		await press(moreTrigger(), type);
		await expect.poll(submenuInput).not.toBe(null);
		await frame();
		await expect.poll(() => submenuInput()!.matches(':focus')).toBe(type === 'mouse');
	});

	it('does not focus the input after a touch press with hover opening enabled', async () => {
		renderMenu(filteredParent);
		await waitForParentFocus(filteredParent);
		await press(moreTrigger(), 'touch');
		await expect.poll(submenuInput).not.toBe(null);
		await frame();
		expect(document.activeElement).not.toBe(submenuInput());
	});

	it.each(['mouse', 'touch', 'pen'])(
		'does not focus a hover-opened input on a %s press',
		async (type) => {
			renderMenu(filteredParent);
			await waitForParentFocus(filteredParent);
			const trigger = moreTrigger();
			await userEvent.hover(trigger);
			await expect.poll(submenuInput).not.toBe(null);
			const input = submenuInput()!;
			await frame();
			expect(document.activeElement).not.toBe(input);
			await press(trigger, type);
			await frame();
			expect(document.activeElement).not.toBe(input);
		}
	);

	it('lets keyboard activation enter a hover-opened submenu', async () => {
		renderMenu(filteredParent);
		await waitForParentFocus(filteredParent);
		const trigger = moreTrigger();
		await userEvent.hover(trigger);
		await expect.poll(submenuInput).not.toBe(null);
		const input = submenuInput()!;
		await frame();
		expect(document.activeElement).not.toBe(input);
		mouse(trigger, 'click', { detail: 0 });
		await expect.poll(() => document.activeElement).toBe(input);
	});
});
