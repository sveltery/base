// A ContextMenu or a plain Menu.Root inside a menubar menu's popup. The expected open states and
// reasons are what @base-ui/react 1.9.0 reports for the same tree and events, where
// packages/react/src/menu/root/MenuRoot.tsx:283-300 makes a context menu root the context menu's
// and keeps the parent node of a root that a menu encloses.
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenubarNestedHarness from '../../tests/menubar/MenubarNestedHarness.svelte';
import MenubarDetachedInDialogHarness from '../../tests/menubar/MenubarDetachedInDialogHarness.svelte';
import { contextMenu } from '../../tests/context-menu/events.js';
import { clickElement, moveMouse } from '../../tests/menu/mouse.js';

function get(id: string) {
	const element = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`no ${id}`);
	return element;
}
const isOpen = (id: string) =>
	document.querySelector(`[data-testid="${id}"]`)?.hasAttribute('data-open') ?? false;

async function settle() {
	for (let i = 0; i < 3; i++) {
		await new Promise(requestAnimationFrame);
		await tick();
	}
}

describe('a menu inside a menubar menu', () => {
	it('opens a context menu and keeps the menubar menu open', async () => {
		const log: string[] = [];
		render(MenubarNestedHarness, { log, scenario: 'context-menu' });
		clickElement(get('file-trigger'));
		await expect.poll(() => isOpen('file')).toBe(true);
		contextMenu(get('ctx-trigger'), { clientX: 30, clientY: 30 });
		await expect.poll(() => isOpen('ctx')).toBe(true);
		await settle();
		expect({ file: isOpen('file'), log }).toEqual({
			file: true,
			log: ['file:open:trigger-press', 'ctx:open:trigger-press']
		});
	});

	it('opens a plain menu without closing the menubar menu, and an item press closes both', async () => {
		const log: string[] = [];
		render(MenubarNestedHarness, { log, scenario: 'menu' });
		clickElement(get('file-trigger'));
		await expect.poll(() => isOpen('file')).toBe(true);
		clickElement(get('inner-trigger'));
		await expect.poll(() => isOpen('inner')).toBe(true);
		await settle();
		expect(isOpen('file')).toBe(true);

		clickElement(get('inner').querySelector<HTMLElement>('[role="menuitem"]')!);
		await expect.poll(() => isOpen('file')).toBe(false);
		expect({ inner: isOpen('inner'), log }).toEqual({
			inner: false,
			log: [
				'file:open:trigger-press',
				'inner:open:trigger-focus',
				'inner:open:trigger-press',
				'file:close:item-press',
				'inner:close:item-press'
			]
		});
	});
});

describe('detached menus whose roots sit inside a dialog', () => {
	it('stay siblings of the menubar', async () => {
		const log: string[] = [];
		render(MenubarDetachedInDialogHarness, { log });
		await expect.poll(() => document.querySelector('[data-testid="file-trigger"]')).not.toBe(null);
		clickElement(get('file-trigger'));
		await expect.poll(() => isOpen('file')).toBe(true);
		expect(get('menubar').hasAttribute('data-has-submenu-open')).toBe(true);
		moveMouse(get('file-trigger'), get('edit-trigger'));
		await expect.poll(() => isOpen('edit')).toBe(true);
		await expect.poll(() => isOpen('file')).toBe(false);
		expect(log).toEqual([
			'file:open:trigger-press',
			'edit:open:trigger-hover',
			'edit:open:trigger-focus',
			'file:close:sibling-open'
		]);
	});
});
