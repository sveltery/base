// A menu group is a context menu, a menubar or an outermost root menu, with its submenus and any
// root menu inside its popups. Menus of different groups share the floating tree but not their
// open changes, item presses or item hovers, as upstream gives each group its own
// `floatingTreeRoot`.
import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContextMenuGroupHarness from '../../tests/context-menu/ContextMenuGroupHarness.svelte';
import { contextMenu } from '../../tests/context-menu/events.js';
import { clickElement, mouse } from '../../tests/menu/mouse.js';

const byTestId = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
function get(id: string) {
	const element = byTestId(id);
	if (!element) throw new Error(`no ${id}`);
	return element;
}
const isOpen = (id: string) => byTestId(id)?.hasAttribute('data-open') ?? false;

async function settle() {
	await new Promise(requestAnimationFrame);
	await new Promise((resolve) => setTimeout(resolve, 50));
	await tick();
}

async function hoverOpen(reasons: string[], scenario = 'hover') {
	const result = render(ContextMenuGroupHarness, { reasons, scenario });
	mouse(get('outer-trigger'), 'mouseenter', { bubbles: false });
	mouse(get('outer-trigger'), 'mousemove');
	await expect.poll(() => isOpen('outer')).toBe(true);
	mouse(get('outer'), 'mouseenter', { bubbles: false });
	return result;
}

async function openContextMenu() {
	contextMenu(get('ctx-trigger'), { clientX: 30, clientY: 30 });
	await expect.poll(() => isOpen('ctx-menu')).toBe(true);
	await settle();
}

describe('menu groups in one floating tree', () => {
	it('keeps the hover close of a menu after a context menu inside it opened and closed', async () => {
		const reasons: string[] = [];
		await hoverOpen(reasons);
		await openContextMenu();
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => byTestId('ctx-menu')).toBeNull();
		await settle();

		mouse(get('outer'), 'mouseenter', { bubbles: false });
		mouse(get('outer'), 'mouseleave', { bubbles: false });
		await settle();
		expect({ outer: isOpen('outer'), reasons }).toEqual({
			outer: false,
			reasons: ['ctx:escape-key', 'outer:trigger-hover']
		});
	});

	it('keeps an open submenu when a context menu opens beside it', async () => {
		const reasons: string[] = [];
		const { component } = await hoverOpen(reasons);
		component.openSub();
		await expect.poll(() => isOpen('sub')).toBe(true);
		await openContextMenu();
		expect({ sub: isOpen('sub'), ctx: isOpen('ctx-menu'), reasons }).toEqual({
			sub: true,
			ctx: true,
			reasons: []
		});
	});

	it('keeps an open context menu when a submenu opens beside it', async () => {
		const reasons: string[] = [];
		const { component } = await hoverOpen(reasons);
		await openContextMenu();
		component.openSub();
		await settle();
		expect({ sub: isOpen('sub'), ctx: isOpen('ctx-menu'), reasons }).toEqual({
			sub: true,
			ctx: true,
			reasons: []
		});
	});

	it('closes a root menu inside a menu popup when the pointer crosses an outer item', async () => {
		const reasons: string[] = [];
		await hoverOpen(reasons, 'plain');
		clickElement(get('plain-trigger'));
		await expect.poll(() => isOpen('plain')).toBe(true);
		await settle();
		mouse(get('outer-item'), 'mousemove');
		await settle();
		expect({ plain: isOpen('plain'), reasons }).toEqual({
			plain: false,
			reasons: ['plain:sibling-open']
		});
	});

	it('closes the enclosing menu on an item press in a root menu inside its popup', async () => {
		const reasons: string[] = [];
		await hoverOpen(reasons, 'plain');
		clickElement(get('plain-trigger'));
		await expect.poll(() => isOpen('plain')).toBe(true);
		await settle();
		clickElement(get('plain').querySelector<HTMLElement>('[role="menuitem"]')!);
		await settle();
		expect({ outer: isOpen('outer'), plain: isOpen('plain') }).toEqual({
			outer: false,
			plain: false
		});
		expect(reasons.toSorted()).toEqual(['outer:item-press', 'plain:item-press']);
	});
});
