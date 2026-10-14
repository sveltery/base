// Assertions follow the context-menu cases of Base UI v1.9.0
// packages/react/src/menu/positioner/MenuPositioner.test.tsx and the context-menu branches of
// packages/react/src/menu/** (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// Upstream's positioner cases spy on `useAnchorPositioning` arguments. These cases assert the
// placement those arguments produce instead.
import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContextMenuHarness from '../../tests/context-menu/ContextMenuHarness.svelte';
import ContextMenuInPopupHarness from '../../tests/context-menu/ContextMenuInPopupHarness.svelte';
import { contextMenu } from '../../tests/context-menu/events.js';
import { clickElement, mouse, pointer } from '../../tests/menu/mouse.js';
import { parkPointer } from '../../tests/pointer.js';
import type { ContextMenuRootChangeEventDetails } from './types.js';

function byTestId(id: string) {
	return document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
}

function get(id: string) {
	const element = byTestId(id);
	if (!element) throw new Error(`no element with data-testid="${id}"`);
	return element;
}

const shown = (id: string) => () => byTestId(id) !== null;

function corner(id: string) {
	const rect = get(id).getBoundingClientRect();
	return [Math.round(rect.left), Math.round(rect.top)];
}

function isScrollLocked() {
	const html = document.documentElement;
	return (
		html.hasAttribute('data-base-ui-scroll-locked') ||
		html.style.overflowY === 'hidden' ||
		document.body.style.overflowY === 'hidden'
	);
}

function pressOutside() {
	pointer(document.body, 'pointerdown', { pointerType: 'mouse', button: 0 });
	mouse(document.body, 'mousedown', { button: 0 });
}

beforeEach(parkPointer);

describe('ContextMenu.Positioner', () => {
	it('opens at the pointer below and after it, with fixed positioning', async () => {
		render(ContextMenuHarness);
		contextMenu(get('trigger'), { clientX: 100, clientY: 120 });
		await expect.poll(shown('positioner')).toBe(true);

		const positioner = get('positioner');
		expect(positioner.style.position).toBe('fixed');
		expect(positioner.getAttribute('data-side')).toBe('bottom');
		expect(positioner.getAttribute('data-align')).toBe('start');
		// alignOffset 2 and sideOffset -5 put the popup's corner just under the cursor.
		await expect.poll(() => corner('positioner')).toEqual([102, 115]);
	});

	it('keeps explicit context-menu placement and offsets', async () => {
		render(ContextMenuHarness, {
			positionerProps: { side: 'right', align: 'center', sideOffset: 11, alignOffset: 13 }
		});
		contextMenu(get('trigger'), { clientX: 100, clientY: 200 });
		await expect.poll(shown('positioner')).toBe(true);

		const positioner = get('positioner');
		await expect
			.poll(() => {
				const rect = positioner.getBoundingClientRect();
				return [Math.round(rect.left), Math.round(rect.top + rect.height / 2)];
			})
			.toEqual([111, 213]);
		expect(positioner.getAttribute('data-side')).toBe('right');
		expect(positioner.getAttribute('data-align')).toBe('center');
	});

	it('aligns a menu opened at the viewport edge to end at the pointer', async () => {
		const x = window.innerWidth - 10;
		render(ContextMenuHarness, { positionerProps: { style: 'width: 200px' } });
		contextMenu(get('trigger'), { clientX: x, clientY: 50 });
		await expect.poll(shown('positioner')).toBe(true);

		await expect
			.poll(() => Math.round(get('positioner').getBoundingClientRect().right))
			.toBe(x - 2);
		expect(get('positioner').getAttribute('data-align')).toBe('end');
	});

	it('keeps a root context menu inside the layout viewport, not the visual viewport', async () => {
		// A pinch zoom shrinks the visual viewport only. The test viewport cannot zoom, so a
		// stand-in half as wide as the page plays that part.
		const real = Object.getOwnPropertyDescriptor(window, 'visualViewport');
		const visual = Object.assign(new EventTarget(), {
			width: window.innerWidth / 2,
			height: window.innerHeight,
			offsetLeft: 0,
			offsetTop: 0,
			pageLeft: 0,
			pageTop: 0,
			scale: 2
		});
		Object.defineProperty(window, 'visualViewport', { value: visual, configurable: true });
		try {
			const x = Math.round(window.innerWidth * 0.75);
			render(ContextMenuHarness, { positionerProps: { style: 'width: 100px' } });
			contextMenu(get('trigger'), { clientX: x, clientY: 50 });
			await expect.poll(shown('positioner')).toBe(true);

			// The pointer is past the visual viewport edge. The menu stays beside it, where a
			// visual viewport boundary would shift it back under that edge.
			await expect
				.poll(() => Math.round(get('positioner').getBoundingClientRect().right) > visual.width)
				.toBe(true);
		} finally {
			if (real) Object.defineProperty(window, 'visualViewport', real);
			else delete (window as { visualViewport?: unknown }).visualViewport;
		}
	});

	it('positions a context menu submenu against its trigger', async () => {
		render(ContextMenuHarness, { scenario: 'open-submenu', submenuProps: { open: true } });
		contextMenu(get('trigger'), { clientX: 40, clientY: 40 });
		await expect.poll(shown('submenu-positioner')).toBe(true);
		const submenu = get('submenu-positioner');
		await expect.poll(() => submenu.getAttribute('data-side')).toBe('inline-end');
		expect(submenu.getAttribute('data-align')).toBe('start');
		await expect
			.poll(() => {
				const own = submenu.getBoundingClientRect();
				const trigger = get('submenu-trigger').getBoundingClientRect();
				return [Math.round(own.left - trigger.right), Math.round(own.top - trigger.top)];
			})
			.toEqual([0, 0]);
	});
});

describe('ContextMenu', () => {
	it('moves to the new pointer position on a context menu event while open', async () => {
		const calls: [boolean, string][] = [];
		render(ContextMenuHarness, {
			rootProps: {
				onOpenChange: (open: boolean, details: ContextMenuRootChangeEventDetails) => {
					calls.push([open, details.reason]);
				}
			}
		});
		contextMenu(get('trigger'), { clientX: 50, clientY: 60 });
		await expect.poll(() => corner('positioner')).toEqual([52, 55]);

		contextMenu(get('trigger'), { clientX: 150, clientY: 90 });
		await expect.poll(() => corner('positioner')).toEqual([152, 85]);
		// As upstream: the menu has no trigger element, so a repeat open is reported again.
		expect(calls).toEqual([
			[true, 'trigger-press'],
			[true, 'trigger-press']
		]);
	});

	it('closes on a right press over the backdrop and reopens where the pointer is', async () => {
		const calls: [boolean, string][] = [];
		render(ContextMenuHarness, {
			rootProps: {
				onOpenChange: (open: boolean, details: ContextMenuRootChangeEventDetails) => {
					calls.push([open, details.reason]);
				}
			},
			triggerProps: { style: 'margin: 40px; height: 100px; width: 200px' }
		});
		const trigger = get('trigger');
		await userEvent.click(trigger, { button: 'right', position: { x: 20, y: 30 } });
		await expect.poll(shown('popup')).toBe(true);
		const [left, top] = corner('positioner');

		// The backdrop covers the trigger, so this real right click lands on the backdrop first.
		await userEvent.click(trigger, { button: 'right', position: { x: 120, y: 70 }, force: true });
		await expect.poll(() => corner('positioner')).toEqual([left + 100, top + 40]);
		expect(calls).toEqual([
			[true, 'trigger-press'],
			[false, 'outside-press'],
			[true, 'trigger-press']
		]);
	});

	it('keeps the context menu open on a right press inside a popup opened from it', async () => {
		const calls: [boolean, string][] = [];
		render(ContextMenuHarness, {
			scenario: 'with-popover',
			rootProps: {
				onOpenChange: (open: boolean, details: ContextMenuRootChangeEventDetails) => {
					calls.push([open, details.reason]);
				}
			}
		});
		contextMenu(get('trigger'), { clientX: 20, clientY: 20 });
		await expect.poll(shown('popup')).toBe(true);
		clickElement(get('popover-trigger'));
		await expect.poll(shown('popover-popup')).toBe(true);

		await userEvent.click(get('popover-button'), { button: 'right' });
		await tick();
		expect(byTestId('popover-popup')).not.toBeNull();
		expect(byTestId('popup')).not.toBeNull();
		expect(calls).toEqual([[true, 'trigger-press']]);
	});

	it('closes an open Menu and opens the context menu on a right click elsewhere in the trigger', async () => {
		render(ContextMenuHarness, { scenario: 'with-menu' });
		clickElement(get('menu-trigger'));
		await expect.poll(shown('menu-popup')).toBe(true);
		await userEvent.click(get('trigger'), {
			button: 'right',
			position: { x: 300, y: 5 },
			force: true
		});
		await expect.poll(shown('menu-popup')).toBe(false);
		await expect.poll(shown('popup')).toBe(true);
	});

	it('is modal: locks scroll and covers the page with a backdrop that blocks native menus', async () => {
		render(ContextMenuHarness);
		expect(isScrollLocked()).toBe(false);
		contextMenu(get('trigger'), { clientX: 30, clientY: 30 });
		await expect.poll(shown('popup')).toBe(true);
		await expect.poll(isScrollLocked).toBe(true);

		const backdrop = document.querySelector('[data-base-ui-inert][role="presentation"]');
		expect(backdrop).not.toBeNull();
		expect(contextMenu(backdrop!).defaultPrevented).toBe(true);

		pressOutside();
		await expect.poll(shown('popup')).toBe(false);
		await expect.poll(isScrollLocked).toBe(false);
	});

	it('focuses the popup, moves through items with the arrow keys and closes on Escape', async () => {
		render(ContextMenuHarness, { scenario: 'surface-button' });
		const surface = document.querySelector('button') as HTMLButtonElement;
		surface.focus();
		contextMenu(surface, { clientX: 20, clientY: 20 });
		await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('menu');

		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Item');

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => document.querySelector('[role="menu"]')).toBeNull();
		expect(document.activeElement).toBe(surface);
	});

	it('closes when an item is clicked', async () => {
		const calls: [boolean, string][] = [];
		render(ContextMenuHarness, {
			rootProps: {
				onOpenChange: (open: boolean, details: ContextMenuRootChangeEventDetails) => {
					calls.push([open, details.reason]);
				}
			}
		});
		contextMenu(get('trigger'), { clientX: 30, clientY: 30 });
		await expect.poll(shown('item')).toBe(true);
		clickElement(get('item'));
		await expect.poll(shown('popup')).toBe(false);
		expect(calls).toEqual([
			[true, 'trigger-press'],
			[false, 'item-press']
		]);
	});

	it('closes and unmounts through the bound root', async () => {
		let root = $state<{ close(): void; unmount(): void }>();
		let open = $state(false);
		render(ContextMenuHarness, {
			get root() {
				return root;
			},
			set root(next) {
				root = next;
			},
			get open() {
				return open;
			},
			set open(next) {
				open = next;
			}
		});
		contextMenu(get('trigger'), { clientX: 30, clientY: 30 });
		await expect.poll(() => open).toBe(true);
		root!.close();
		await expect.poll(() => open).toBe(false);
		await expect.poll(shown('popup')).toBe(false);
	});

	it('unmounts a menu kept mounted by preventUnmountOnClose through the bound root', async () => {
		let root = $state<{ close(): void; unmount(): void }>();
		render(ContextMenuHarness, {
			get root() {
				return root;
			},
			set root(next) {
				root = next;
			},
			rootProps: {
				onOpenChange(_open: boolean, details: ContextMenuRootChangeEventDetails) {
					details.preventUnmountOnClose();
				}
			}
		});
		contextMenu(get('trigger'), { clientX: 30, clientY: 30 });
		await expect.poll(shown('popup')).toBe(true);
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => get('popup').hasAttribute('data-open')).toBe(false);
		expect(byTestId('popup')).not.toBeNull();

		root!.unmount();
		await expect.poll(shown('popup')).toBe(false);
	});

	it('opens a context menu from an item of another context menu', async () => {
		render(ContextMenuHarness, { scenario: 'in-popup' });
		contextMenu(get('outer-trigger'), { clientX: 20, clientY: 20 });
		await expect.poll(shown('outer-menu')).toBe(true);

		contextMenu(get('inner-trigger'), { clientX: 60, clientY: 70 });
		await expect.poll(shown('inner-menu')).toBe(true);
		expect(byTestId('outer-menu')).not.toBeNull();
		// The inner menu is a context menu root: it opens at the pointer, not beside the item.
		await expect.poll(() => corner('inner-positioner')).toEqual([62, 65]);
		expect(get('inner-positioner').hasAttribute('data-nested')).toBe(false);
	});

	it('closes a context menu opened from an item without closing the outer one', async () => {
		render(ContextMenuHarness, { scenario: 'in-popup' });
		contextMenu(get('outer-trigger'), { clientX: 20, clientY: 20 });
		await expect.poll(shown('outer-menu')).toBe(true);
		contextMenu(get('inner-trigger'), { clientX: 60, clientY: 70 });
		await expect.poll(shown('inner-menu')).toBe(true);

		clickElement(get('inner-item'));
		await expect.poll(shown('inner-menu')).toBe(false);
		await tick();
		expect(byTestId('outer-menu')?.hasAttribute('data-open')).toBe(true);
	});

	it('keeps both context menus open on a press inside the portaled inner popup', async () => {
		render(ContextMenuHarness, { scenario: 'in-popup' });
		contextMenu(get('outer-trigger'), { clientX: 20, clientY: 20 });
		await expect.poll(shown('outer-menu')).toBe(true);
		contextMenu(get('inner-trigger'), { clientX: 60, clientY: 70 });
		await expect.poll(shown('inner-menu')).toBe(true);
		expect(get('outer-menu').contains(get('inner-menu'))).toBe(false);

		clickElement(get('inner-menu'));
		await tick();
		expect([
			byTestId('outer-menu')?.hasAttribute('data-open'),
			byTestId('inner-menu')?.hasAttribute('data-open')
		]).toEqual([true, true]);

		clickElement(document.body);
		await expect.poll(shown('outer-menu')).toBe(false);
		expect(byTestId('inner-menu')).toBeNull();
	});

	describe.each([
		{ outer: 'popover', inBox: false },
		{ outer: 'popover', inBox: true },
		{ outer: 'dialog', inBox: false },
		{ outer: 'dialog', inBox: true },
		{ outer: 'menu', inBox: false },
		{ outer: 'menu', inBox: true },
		{ outer: 'preview-card', inBox: false },
		{ outer: 'preview-card', inBox: true },
		{ outer: 'navigation-menu', inBox: false },
		{ outer: 'navigation-menu', inBox: true }
	] as const)(
		'inside an open $outer, portaled into a box outside it: $inBox',
		({ outer, inBox }) => {
			async function openBoth() {
				const reasons: string[] = [];
				render(ContextMenuInPopupHarness, { outer, inBox, reasons });
				if (!byTestId('outer')) clickElement(get('outer-trigger'));
				await expect.poll(shown('outer')).toBe(true);
				contextMenu(get('ctx-trigger'), { clientX: 30, clientY: 30 });
				await expect.poll(shown('ctx-menu')).toBe(true);
				expect(get('box').contains(get('ctx-menu'))).toBe(inBox);
				await expect
					.poll(
						() => !!byTestId('ctx-menu')?.contains(document.activeElement) || reasons.length > 0
					)
					.toBe(true);
				await new Promise(requestAnimationFrame);
				await tick();
				expect({ open: openStates(), reasons }).toEqual({ open: [true, true], reasons: [] });
				return reasons;
			}

			const openStates = () => [
				byTestId('outer')?.hasAttribute('data-open') ?? false,
				byTestId('ctx-menu')?.hasAttribute('data-open') ?? false
			];

			it('keeps both open on a press inside the context menu', async () => {
				const reasons = await openBoth();
				clickElement(get('ctx-menu'));
				await new Promise(requestAnimationFrame);
				await tick();
				expect({ open: openStates(), reasons }).toEqual({ open: [true, true], reasons: [] });
			});

			it('closes only the context menu on Escape', async () => {
				const reasons = await openBoth();
				await userEvent.keyboard('{Escape}');
				await expect.poll(shown('ctx-menu')).toBe(false);
				await tick();
				expect(openStates()).toEqual([true, false]);
				expect(reasons).toEqual([]);
			});
		}
	);

	describe('with a menu inside the trigger', () => {
		it('opens the menu on click and the context menu on right click', async () => {
			render(ContextMenuHarness, { scenario: 'with-menu' });
			clickElement(get('menu-trigger'));
			await expect.poll(shown('menu-popup')).toBe(true);
			expect(byTestId('popup')).toBeNull();
			clickElement(get('menu-item'));
			await expect.poll(shown('menu-popup')).toBe(false);

			contextMenu(get('menu-trigger'), { clientX: 30, clientY: 30 });
			await expect.poll(shown('popup')).toBe(true);
			expect(byTestId('menu-popup')).toBeNull();
			await expect.poll(() => corner('positioner')).toEqual([32, 25]);
		});
	});

	describe('with a menubar inside the trigger', () => {
		it('keeps the menubar menus working and opens the context menu on right click', async () => {
			render(ContextMenuHarness, { scenario: 'with-menubar' });
			clickElement(get('file-trigger'));
			await expect.poll(shown('file-menu')).toBe(true);
			expect(
				document.querySelector('[role="menubar"]')!.hasAttribute('data-has-submenu-open')
			).toBe(true);
			await userEvent.keyboard('{Escape}');
			await expect.poll(shown('file-menu')).toBe(false);

			contextMenu(get('file-trigger'), { clientX: 30, clientY: 30 });
			await expect.poll(shown('popup')).toBe(true);
			expect(byTestId('file-menu')).toBeNull();
			await tick();
			expect(
				document.querySelector('[role="menubar"]')!.hasAttribute('data-has-submenu-open')
			).toBe(false);
		});
	});
});
