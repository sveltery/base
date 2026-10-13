// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useListNavigation.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `fireEvent` becomes a dispatched DOM event followed by `flushSync`. Grid cases are not ported.

import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import AutocompleteHarness from './AutocompleteHarness.svelte';
import ListboxFocusHarness from './ListboxFocusHarness.svelte';
import ListNavigationHarness from './ListNavigationHarness.svelte';
import NestedMenuHarness from './NestedMenuHarness.svelte';

afterEach(() => {
	vi.restoreAllMocks();
});

const el = (testId: string) => page.getByTestId(testId).element() as HTMLElement;
const reference = () => page.getByRole('button', { name: 'Open' }).element() as HTMLElement;
const menu = () => page.getByRole('menu').element() as HTMLElement;
const queryMenu = () => document.querySelector('[role="menu"]');
const focusedTestId = () => document.activeElement?.getAttribute('data-testid') ?? null;
const selected = (index: number) => el(`item-${index}`).getAttribute('aria-selected');

function keyDown(target: Element, key: string, init: KeyboardEventInit = {}) {
	target.dispatchEvent(
		new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
	);
	flushSync();
}

function click(target: HTMLElement) {
	target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
	flushSync();
}

function mouseMove(target: Element) {
	target.dispatchEvent(
		new MouseEvent('mousemove', { bubbles: true, movementX: 10, movementY: 10 })
	);
	flushSync();
}

function pointerLeave(target: Element, init: PointerEventInit = {}) {
	target.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse', ...init }));
	flushSync();
}

/** Lets queued microtasks, effects, and focus frames run. */
async function settle() {
	for (let frame = 0; frame < 3; frame += 1) {
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	}
	flushSync();
}

async function expectFocused(testId: string) {
	await settle();
	expect(focusedTestId()).toBe(testId);
}

describe('ListNavigation', () => {
	it('does not add role-dependent aria-orientation', async () => {
		render(ListNavigationHarness, { options: { orientation: 'horizontal' } });

		keyDown(reference(), 'ArrowRight');
		await expectFocused('item-0');

		expect(menu().hasAttribute('aria-orientation')).toBe(false);
	});

	it('opens on ArrowDown and focuses first item', async () => {
		render(ListNavigationHarness);

		keyDown(reference(), 'ArrowDown');
		expect(queryMenu()).not.toBe(null);
		await expectFocused('item-0');
	});

	it('opens on ArrowUp and focuses last item', async () => {
		render(ListNavigationHarness);

		keyDown(reference(), 'ArrowUp');
		expect(queryMenu()).not.toBe(null);
		await expectFocused('item-2');
	});

	it('navigates down on ArrowDown', async () => {
		render(ListNavigationHarness);

		keyDown(reference(), 'ArrowDown');
		await expectFocused('item-0');

		keyDown(menu(), 'ArrowDown');
		await expectFocused('item-1');

		keyDown(menu(), 'ArrowDown');
		await expectFocused('item-2');

		// Reached the end of the list.
		keyDown(menu(), 'ArrowDown');
		await expectFocused('item-2');
	});

	it('navigates up on ArrowUp', async () => {
		render(ListNavigationHarness);

		keyDown(reference(), 'ArrowUp');
		await expectFocused('item-2');

		keyDown(menu(), 'ArrowUp');
		await expectFocused('item-1');

		keyDown(menu(), 'ArrowUp');
		await expectFocused('item-0');

		// Reached the end of the list.
		keyDown(menu(), 'ArrowUp');
		await expectFocused('item-0');
	});

	it('skips disabled item on initial navigation', async () => {
		render(ListNavigationHarness, {
			disableFirstItem: true,
			options: { loopFocus: true, disabledIndices: [] }
		});

		keyDown(reference(), 'ArrowDown');
		await expectFocused('item-1');

		keyDown(menu(), 'ArrowDown');
		await expectFocused('item-2');

		keyDown(menu(), 'ArrowUp');
		await expectFocused('item-1');

		// An empty `disabledIndices` keeps the aria-disabled item navigable after open.
		keyDown(menu(), 'ArrowUp');
		await expectFocused('item-0');
	});

	it('skips items hidden with CSS in navigation', async () => {
		render(ListNavigationHarness, {
			hideFirstItem: true,
			options: { loopFocus: true, disabledIndices: [] }
		});

		keyDown(reference(), 'ArrowDown');
		await expectFocused('item-1');

		keyDown(menu(), 'ArrowUp');
		await expectFocused('item-2');
	});

	it('skips visibility:hidden items in navigation', async () => {
		render(ListNavigationHarness, {
			firstItemStyle: 'visibility: hidden',
			options: { loopFocus: true, disabledIndices: [] }
		});

		keyDown(reference(), 'ArrowDown');
		await expectFocused('item-1');

		keyDown(menu(), 'ArrowUp');
		await expectFocused('item-2');
	});

	it('resets the active index to null upon close', async () => {
		render(AutocompleteHarness);
		const input = el('reference');
		const activeIndex = () => el('active-index').textContent;

		input.focus();
		await userEvent.keyboard('a');

		await expect.element(page.getByTestId('floating')).toBeInTheDocument();
		expect(activeIndex()).toBe('');

		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowDown}');
		expect(activeIndex()).toBe('2');

		await userEvent.keyboard('{Escape}');
		await settle();
		expect(activeIndex()).toBe('');

		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('a');
		await expect.element(page.getByTestId('floating')).toBeInTheDocument();
		expect(activeIndex()).toBe('');

		await userEvent.keyboard('{ArrowDown}');
		expect(activeIndex()).toBe('0');
	});

	describe('prop: loopFocus', () => {
		it('ArrowDown looping', async () => {
			render(ListNavigationHarness, { options: { loopFocus: true } });

			keyDown(reference(), 'ArrowDown');
			await expectFocused('item-0');

			keyDown(menu(), 'ArrowDown');
			await expectFocused('item-1');

			keyDown(menu(), 'ArrowDown');
			await expectFocused('item-2');

			// Reached the end of the list and loops.
			keyDown(menu(), 'ArrowDown');
			await expectFocused('item-0');
		});

		it('ArrowUp looping', async () => {
			render(ListNavigationHarness, { options: { loopFocus: true } });

			keyDown(reference(), 'ArrowUp');
			await expectFocused('item-2');

			keyDown(menu(), 'ArrowUp');
			await expectFocused('item-1');

			keyDown(menu(), 'ArrowUp');
			await expectFocused('item-0');

			// Reached the end of the list and loops.
			keyDown(menu(), 'ArrowUp');
			await expectFocused('item-2');
		});
	});

	describe('prop: orientation', () => {
		it('navigates down on ArrowRight', async () => {
			render(ListNavigationHarness, { options: { orientation: 'horizontal' } });

			keyDown(reference(), 'ArrowRight');
			expect(queryMenu()).not.toBe(null);
			await expectFocused('item-0');

			keyDown(menu(), 'ArrowRight');
			await expectFocused('item-1');

			keyDown(menu(), 'ArrowRight');
			await expectFocused('item-2');

			keyDown(menu(), 'ArrowRight');
			await expectFocused('item-2');
		});

		it('navigates up on ArrowLeft', async () => {
			render(ListNavigationHarness, { options: { orientation: 'horizontal' } });

			keyDown(reference(), 'ArrowLeft');
			expect(queryMenu()).not.toBe(null);
			await expectFocused('item-2');

			keyDown(menu(), 'ArrowLeft');
			await expectFocused('item-1');

			keyDown(menu(), 'ArrowLeft');
			await expectFocused('item-0');

			keyDown(menu(), 'ArrowLeft');
			await expectFocused('item-0');
		});
	});

	describe('prop: rtl', () => {
		it('navigates down on ArrowLeft', async () => {
			render(ListNavigationHarness, { options: { rtl: true, orientation: 'horizontal' } });

			keyDown(reference(), 'ArrowLeft');
			expect(queryMenu()).not.toBe(null);
			await expectFocused('item-0');

			keyDown(menu(), 'ArrowLeft');
			await expectFocused('item-1');

			keyDown(menu(), 'ArrowLeft');
			await expectFocused('item-2');

			keyDown(menu(), 'ArrowLeft');
			await expectFocused('item-2');
		});

		it('navigates up on ArrowRight', async () => {
			render(ListNavigationHarness, { options: { rtl: true, orientation: 'horizontal' } });

			keyDown(reference(), 'ArrowRight');
			expect(queryMenu()).not.toBe(null);
			await expectFocused('item-2');

			keyDown(menu(), 'ArrowRight');
			await expectFocused('item-1');

			keyDown(menu(), 'ArrowRight');
			await expectFocused('item-0');

			keyDown(menu(), 'ArrowRight');
			await expectFocused('item-0');
		});
	});

	describe('prop: focusItemOnOpen', () => {
		it('focuses the first item on click when true', async () => {
			render(ListNavigationHarness, { options: { focusItemOnOpen: true } });
			click(reference());
			await expectFocused('item-0');
		});

		it('does not focus the first item on click when false', async () => {
			render(ListNavigationHarness, { options: { focusItemOnOpen: false } });
			reference().focus();
			click(reference());
			await settle();
			expect(queryMenu()).not.toBe(null);
			expect(document.activeElement).toBe(reference());
		});
	});

	describe('prop: selectedIndex', () => {
		it('scrolls the selected item into view on open', async () => {
			const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');

			render(ListNavigationHarness, { options: { selectedIndex: 0 } });
			click(reference());
			await settle();

			expect(scrollIntoView.mock.contexts).toEqual([el('item-0')]);
			expect(scrollIntoView.mock.calls).toEqual([[{ block: 'nearest', inline: 'nearest' }]]);
		});
	});

	describe('allowEscape + virtual', () => {
		it('when true', async () => {
			render(ListNavigationHarness, {
				options: { allowEscape: true, virtual: true, loopFocus: true }
			});
			reference().focus();
			keyDown(reference(), 'ArrowDown');
			await settle();
			expect(selected(0)).toBe('true');
			keyDown(reference(), 'ArrowUp');
			expect(selected(0)).toBe('false');
			keyDown(reference(), 'ArrowDown');
			expect(selected(0)).toBe('true');
			keyDown(reference(), 'ArrowDown');
			expect(selected(1)).toBe('true');
			keyDown(reference(), 'ArrowDown');
			expect(selected(2)).toBe('true');
			keyDown(reference(), 'ArrowDown');
			expect(selected(2)).toBe('false');
			expect(document.activeElement).toBe(reference());
		});

		it('when false', async () => {
			render(ListNavigationHarness, {
				options: { allowEscape: false, virtual: true, loopFocus: true }
			});
			keyDown(reference(), 'ArrowDown');
			await settle();
			expect(selected(0)).toBe('true');
			keyDown(reference(), 'ArrowDown');
			expect(selected(1)).toBe('true');
		});

		it('true - onNavigate is called with `null` when escaped', async () => {
			const onNavigate = vi.fn();
			render(ListNavigationHarness, {
				options: { allowEscape: true, virtual: true, loopFocus: true, onNavigate }
			});
			keyDown(reference(), 'ArrowDown');
			await settle();
			keyDown(reference(), 'ArrowUp');
			expect(onNavigate.mock.calls.map(([index]) => index)).toEqual([0, null]);
		});

		it('points aria-activedescendant at the active item while open', async () => {
			render(ListNavigationHarness, {
				options: { virtual: true, id: 'list', loopFocus: true }
			});
			expect(reference().hasAttribute('aria-activedescendant')).toBe(false);

			keyDown(reference(), 'ArrowDown');
			await settle();
			expect(reference().getAttribute('aria-activedescendant')).toBe('list-0');
			expect(menu().getAttribute('aria-activedescendant')).toBe('list-0');

			keyDown(reference(), 'ArrowDown');
			expect(reference().getAttribute('aria-activedescendant')).toBe('list-1');
		});
	});

	describe('reference focus', () => {
		it('clears ordinary item focus when the open reference receives focus', async () => {
			render(ListNavigationHarness);

			keyDown(reference(), 'ArrowDown');
			await expectFocused('item-0');
			expect(selected(0)).toBe('true');

			reference().focus();
			flushSync();

			expect(selected(0)).toBe('false');
		});
	});

	describe('prop: openOnArrowKeyDown', () => {
		it('opens on ArrowDown when true', () => {
			render(ListNavigationHarness, { options: { openOnArrowKeyDown: true } });
			keyDown(reference(), 'ArrowDown');
			expect(queryMenu()).not.toBe(null);
		});

		it('opens on ArrowUp when true', () => {
			render(ListNavigationHarness, { options: { openOnArrowKeyDown: true } });
			keyDown(reference(), 'ArrowUp');
			expect(queryMenu()).not.toBe(null);
		});

		it('does not open on ArrowDown when false', () => {
			render(ListNavigationHarness, { options: { openOnArrowKeyDown: false } });
			keyDown(reference(), 'ArrowDown');
			expect(queryMenu()).toBe(null);
		});

		it('does not open on ArrowUp when false', () => {
			render(ListNavigationHarness, { options: { openOnArrowKeyDown: false } });
			keyDown(reference(), 'ArrowUp');
			expect(queryMenu()).toBe(null);
		});
	});

	describe('prop: disabledIndices', () => {
		it('indices are skipped in focus order', async () => {
			render(ListNavigationHarness, { options: { disabledIndices: [0] } });
			keyDown(reference(), 'ArrowDown');
			await expectFocused('item-1');
			keyDown(menu(), 'ArrowUp');
			await expectFocused('item-1');
		});
	});

	describe('prop: focusItemOnHover', () => {
		it('cancels pending item focus when the pointer leaves before focus lands', async () => {
			const onNavigate = vi.fn();
			render(ListNavigationHarness, { options: { focusItemOnOpen: true, onNavigate } });

			const frames = new Map<number, FrameRequestCallback>();
			let frameId = 0;
			vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
				frameId += 1;
				frames.set(frameId, callback);
				return frameId;
			});
			vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
				frames.delete(id);
			});

			click(reference());
			await Promise.resolve();
			flushSync();

			const item = el('item-0');
			expect(item.getAttribute('aria-selected')).toBe('true');
			expect(document.activeElement).not.toBe(item);

			pointerLeave(item, { relatedTarget: document.body });

			const callbacks = [...frames.values()];
			frames.clear();
			for (const callback of callbacks) callback(performance.now());
			flushSync();

			expect(document.activeElement).not.toBe(item);
			expect(document.activeElement).not.toBe(menu());
			expect(item.getAttribute('aria-selected')).toBe('false');
			expect(onNavigate.mock.calls.at(-1)?.[0]).toBe(null);
		});

		it('true - focuses item on hover and syncs the active index', async () => {
			const onNavigate = vi.fn();
			render(ListNavigationHarness, { options: { onNavigate } });
			click(reference());
			mouseMove(el('item-1'));
			expect(focusedTestId()).toBe('item-1');
			pointerLeave(el('item-1'));
			expect(document.activeElement).toBe(menu());
			expect(onNavigate.mock.calls.map(([index]) => index)).toEqual([1, null]);
		});

		it('true - syncs an item on hover when activeIndex is null but selectedIndex matches', async () => {
			const onNavigate = vi.fn();
			render(ListNavigationHarness, {
				options: { focusItemOnOpen: false, selectedIndex: 1, onNavigate }
			});

			click(reference());
			mouseMove(el('item-1'));

			expect(focusedTestId()).toBe('item-1');
			expect(onNavigate.mock.calls.map(([index]) => index)).toEqual([1]);
		});

		it('false - does not focus item on hover and does not sync the active index', async () => {
			const onNavigate = vi.fn();
			render(ListNavigationHarness, {
				options: { onNavigate, focusItemOnOpen: false, focusItemOnHover: false }
			});
			reference().focus();
			click(reference());
			mouseMove(el('item-1'));
			await settle();
			expect(document.activeElement).toBe(reference());
			expect(onNavigate.mock.calls).toEqual([]);
		});

		it('clears the active item when the pointer leaves for an element outside the list', async () => {
			const onNavigate = vi.fn();
			render(ListNavigationHarness, { options: { onNavigate } });

			click(reference());
			const item = el('item-1');
			mouseMove(item);
			expect(focusedTestId()).toBe('item-1');

			pointerLeave(item, { clientX: 50, clientY: 60, relatedTarget: document.body });

			expect(item.getAttribute('aria-selected')).toBe('false');
			expect(onNavigate.mock.calls.at(-1)?.[0]).toBe(null);
		});
	});

	it('selectedIndex changing does not steal focus', async () => {
		render(ListboxFocusHarness);

		await settle();
		expect(document.activeElement?.textContent?.trim()).toBe('Blueberry');

		await userEvent.click(page.getByTestId('reference'));
		await settle();

		expect(focusedTestId()).toBe('reference');
	});

	describe('nested lists', () => {
		const item = (name: string) => page.getByRole('menuitem', { name, exact: true });

		it('opens a submenu with the cross-axis key and returns focus to its trigger', async () => {
			render(NestedMenuHarness);

			(page.getByRole('button', { name: 'Edit' }).element() as HTMLElement).focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(item('Undo')).toHaveFocus();

			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(item('Copy as')).toHaveFocus();

			await userEvent.keyboard('{ArrowRight}');
			await expect.element(item('Text')).toHaveFocus();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(item('Video')).toHaveFocus();

			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(item('Copy as')).toHaveFocus();
			expect(document.querySelector('[aria-label="Copy as"]')).toBe(null);
			await expect.element(page.getByRole('menu', { name: 'Edit' })).toBeInTheDocument();
		});

		it("reads the parent's orientation from the floating tree", async () => {
			render(NestedMenuHarness, { orientation: 'horizontal' });

			(page.getByRole('button', { name: 'Edit' }).element() as HTMLElement).focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(item('Undo')).toHaveFocus();

			await userEvent.keyboard('{ArrowRight}');
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(item('Copy as')).toHaveFocus();

			// A horizontal parent opens a vertical submenu with ArrowDown, not ArrowRight.
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(item('Text')).toHaveFocus();

			// ArrowLeft closes the submenu and, as the parent's main key, also moves the parent.
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(item('Redo')).toHaveFocus();
			expect(document.querySelector('[aria-label="Copy as"]')).toBe(null);
		});
	});

	it('Home or End key press is ignored for typeable combobox reference', async () => {
		render(ListNavigationHarness, { reference: 'combobox' });

		(page.getByRole('combobox').element() as HTMLElement).focus();

		await userEvent.keyboard('{ArrowDown}');
		await expectFocused('item-0');

		await userEvent.keyboard('{End}');
		await expectFocused('item-0');

		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Home}');
		await expectFocused('item-1');
	});
});
