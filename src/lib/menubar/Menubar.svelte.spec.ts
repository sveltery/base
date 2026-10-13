// Assertions follow Base UI v1.9.0 packages/react/src/menubar/Menubar.test.tsx and the
// `Menubar parent` cases of packages/react/src/menu/positioner/MenuPositioner.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenubarHarness from '../../tests/menubar/MenubarHarness.svelte';
import MenubarCasesHarness from '../../tests/menubar/MenubarCasesHarness.svelte';
import MenubarOrphan from '../../tests/menubar/MenubarOrphan.svelte';
import { clickElement, mouse, pointer } from '../../tests/menu/mouse.js';
import { parkPointer } from '../../tests/pointer.js';

function byTestId(id: string) {
	return document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
}

function get(id: string) {
	const element = byTestId(id);
	if (!element) throw new Error(`no element with data-testid="${id}"`);
	return element;
}

function menubar() {
	return document.querySelector('[role="menubar"]') as HTMLElement;
}

function focused() {
	return document.activeElement;
}

async function settle() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

/** Upstream `pressWithTouch`: a touch pointerdown, then the compatibility mousedown. */
function pressWithTouch(target: Element) {
	pointer(target, 'pointerdown', { pointerType: 'touch' });
	mouse(target, 'mousedown', { detail: 1 });
}

/**
 * A whole tap. The shared dismiss logic remembers a press that started inside a popup until its
 * pointerup, so a press inside must end before the next press outside can dismiss.
 */
function tapWithTouch(target: Element) {
	pressWithTouch(target);
	pointer(target, 'pointerup', { pointerType: 'touch' });
	mouse(target, 'mouseup', { detail: 1 });
	mouse(target, 'click', { detail: 1 });
}

function touchClick(target: Element) {
	target.dispatchEvent(
		new PointerEvent('click', { bubbles: true, cancelable: true, pointerType: 'touch' })
	);
}

function isScrollLocked() {
	const html = document.documentElement;
	return (
		html.hasAttribute('data-base-ui-scroll-locked') ||
		html.style.overflowY === 'hidden' ||
		document.body.style.overflowY === 'hidden'
	);
}

const shown = (id: string) => () => byTestId(id) !== null;

beforeEach(parkPointer);

describe('Menubar', () => {
	it('throws when the menubar context is missing', () => {
		expect(() => render(MenubarOrphan)).toThrow(
			'Base UI: MenubarContext is missing. Menubar parts must be placed within <Menubar>.'
		);
	});

	it('ignores a delayed touch click immediately after focus opens another menu', async () => {
		render(MenubarHarness);
		clickElement(get('file-trigger'));
		await expect.poll(shown('file-menu')).toBe(true);

		const editTrigger = get('edit-trigger');
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
		try {
			editTrigger.focus();
			await tick();
			expect(byTestId('edit-menu')).not.toBe(null);

			touchClick(editTrigger);
			await tick();
			expect(byTestId('edit-menu')).not.toBe(null);

			await vi.advanceTimersByTimeAsync(310);
		} finally {
			vi.useRealTimers();
		}

		touchClick(editTrigger);
		await expect.poll(shown('edit-menu')).toBe(false);
	});

	it('closes on a touch item click immediately after focus opens another menu', async () => {
		render(MenubarHarness);
		clickElement(get('file-trigger'));
		await expect.poll(shown('file-menu')).toBe(true);

		// Only timeouts are frozen. The closed popup unmounts on a real animation frame.
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
		try {
			get('edit-trigger').focus();
			await tick();
			touchClick(get('edit-item-1'));
			await tick();
		} finally {
			vi.useRealTimers();
		}

		await expect.poll(shown('edit-menu')).toBe(false);
	});

	it('keeps focus on an outside target when a triggerless menubar menu closes', async () => {
		render(MenubarCasesHarness, { scenario: 'triggerless' });
		const outside = get('outside');
		clickElement(outside);
		await expect.poll(() => get('triggerless-menu').hasAttribute('data-open')).toBe(false);
		expect(focused()).toBe(outside);
	});

	describe.each([
		{ name: 'contained triggers', variant: 'contained' },
		{ name: 'detached triggers', variant: 'detached' },
		{ name: 'multiple contained triggers', variant: 'multiple' }
	] as const)('when using $name', ({ variant }) => {
		describe('click interactions', () => {
			it('opens the menu on a trigger click and closes it on the next click', async () => {
				render(MenubarHarness, { variant });
				const fileTrigger = get('file-trigger');
				await userEvent.click(fileTrigger, { delay: 30 });
				await expect.poll(shown('file-menu')).toBe(true);

				await userEvent.click(fileTrigger, { delay: 30 });
				await expect.poll(shown('file-menu')).toBe(false);
			});
		});

		describe('hover behavior', () => {
			it('does not open a menu on hover when no menu is open', async () => {
				render(MenubarHarness, { variant });
				await userEvent.hover(get('file-trigger'));
				await settle();
				expect(byTestId('file-menu')).toBe(null);
			});

			it('opens menus on hover when another menu is already open', async () => {
				render(MenubarHarness, { variant });
				await userEvent.click(get('file-trigger'));
				await expect.poll(shown('file-menu')).toBe(true);
				await expect.poll(() => menubar().hasAttribute('data-has-submenu-open')).toBe(true);

				await userEvent.hover(get('edit-trigger'));
				await expect.poll(shown('edit-menu')).toBe(true);
				expect(byTestId('file-menu')).toBe(null);

				await userEvent.hover(get('view-trigger'));
				await expect.poll(shown('view-menu')).toBe(true);
				expect(byTestId('edit-menu')).toBe(null);
			});

			it('opens a nested submenu on hover while its parent menu is open', async () => {
				render(MenubarHarness, { variant });
				await userEvent.click(get('file-trigger'));
				await expect.poll(shown('file-menu')).toBe(true);
				await expect.poll(() => menubar().hasAttribute('data-has-submenu-open')).toBe(true);
				await new Promise((resolve) => setTimeout(resolve, 50));

				await userEvent.hover(get('share-trigger'));
				await expect.poll(shown('share-menu')).toBe(true);
			});

			it('opens another menu on hover while a nested submenu is open', async () => {
				render(MenubarHarness, { variant });
				await userEvent.click(get('file-trigger'));
				await expect.poll(shown('file-menu')).toBe(true);
				await expect.poll(() => menubar().hasAttribute('data-has-submenu-open')).toBe(true);

				await userEvent.hover(get('share-trigger'));
				await expect.poll(shown('share-menu')).toBe(true);
				await userEvent.hover(get('share-item-1'));

				await userEvent.hover(get('edit-trigger'));
				await expect.poll(shown('edit-menu')).toBe(true);
				expect(byTestId('file-menu')).toBe(null);
				expect(byTestId('share-menu')).toBe(null);
			});
		});

		describe('focus behavior', () => {
			it('focuses a menubar item without immediately opening the menu', async () => {
				render(MenubarHarness, { variant });
				await userEvent.tab();
				const fileTrigger = get('file-trigger');
				await expect.poll(focused).toBe(fileTrigger);
				expect(byTestId('file-menu')).toBe(null);

				await new Promise((resolve) => setTimeout(resolve, 50));
				await userEvent.keyboard('{Enter}');
				await expect.poll(shown('file-menu')).toBe(true);
			});
		});

		describe('closeOnClick on nested items', () => {
			it('keeps a nested menu open on an item click when the menu was opened on click', async () => {
				render(MenubarHarness, { variant });
				await userEvent.click(get('view-trigger'), { delay: 30 });
				await expect.poll(shown('view-menu')).toBe(true);

				await userEvent.hover(get('layout-trigger'));
				await expect.poll(shown('layout-menu')).toBe(true);

				await userEvent.click(get('layout-item-2'), { delay: 30 });
				await settle();
				expect(byTestId('layout-menu')).not.toBe(null);
				expect(get('layout-item-2').getAttribute('aria-checked')).toBe('true');
			});

			// https://github.com/mui/base-ui/issues/2092
			it('keeps a nested menu open on an item click when the menu was opened on hover', async () => {
				render(MenubarHarness, { variant });
				await userEvent.click(get('file-trigger'), { delay: 30 });
				await expect.poll(shown('file-menu')).toBe(true);

				await userEvent.hover(get('view-trigger'));
				await expect.poll(shown('view-menu')).toBe(true);

				await userEvent.hover(get('layout-trigger'));
				await expect.poll(shown('layout-menu')).toBe(true);

				await userEvent.click(get('layout-item-2'), { delay: 30 });
				await settle();
				expect(byTestId('layout-menu')).not.toBe(null);
				expect(get('layout-item-2').getAttribute('aria-checked')).toBe('true');
			});
		});

		describe('keyboard interactions', () => {
			it('moves between menubar items with the arrow keys', async () => {
				render(MenubarHarness, { variant });
				get('file-trigger').focus();
				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(focused).toBe(get('edit-trigger'));
			});

			it('moves focus to the first and last triggers with Home and End', async () => {
				render(MenubarHarness, { variant });
				get('file-trigger').focus();
				await userEvent.keyboard('{End}');
				await expect.poll(focused).toBe(get('view-trigger'));
				await userEvent.keyboard('{Home}');
				await expect.poll(focused).toBe(get('file-trigger'));
			});

			it('opens the menu with the Space key', async () => {
				render(MenubarHarness, { variant });
				get('file-trigger').focus();
				await userEvent.keyboard(' ');
				await expect.poll(shown('file-menu')).toBe(true);
			});

			it('moves within the menu with the arrow keys', async () => {
				render(MenubarHarness, { variant });
				get('file-trigger').focus();
				await userEvent.keyboard('{Enter}');
				await expect.poll(shown('file-menu')).toBe(true);
				await expect.poll(focused).toBe(get('file-item-1'));

				await userEvent.keyboard('{ArrowDown}');
				await expect.poll(focused).toBe(get('file-item-2'));
				await userEvent.keyboard('{ArrowDown}');
				await expect.poll(focused).toBe(get('share-trigger'));
			});

			it('opens the submenu with the right arrow key', async () => {
				render(MenubarHarness, { variant });
				get('file-trigger').focus();
				await userEvent.keyboard('{Enter}');
				await expect.poll(focused).toBe(get('file-item-1'));
				await userEvent.keyboard('{ArrowDown}');
				await expect.poll(focused).toBe(get('file-item-2'));
				await userEvent.keyboard('{ArrowDown}');
				await expect.poll(focused).toBe(get('share-trigger'));

				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(shown('share-menu')).toBe(true);
				await expect.poll(focused).toBe(get('share-item-1'));
			});

			it('closes the menu with the Escape key', async () => {
				render(MenubarHarness, { variant });
				get('file-trigger').focus();
				await userEvent.keyboard('{Enter}');
				await expect.poll(shown('file-menu')).toBe(true);

				await userEvent.keyboard('{Escape}');
				await expect.poll(shown('file-menu')).toBe(false);
			});

			it('closes a submenu with the left arrow key and returns focus to its trigger', async () => {
				render(MenubarHarness, { variant });
				get('file-trigger').focus();
				await userEvent.keyboard('{Enter}');
				await expect.poll(focused).toBe(get('file-item-1'));
				await userEvent.keyboard('{ArrowDown}');
				await expect.poll(focused).toBe(get('file-item-2'));
				await userEvent.keyboard('{ArrowDown}');
				const shareTrigger = get('share-trigger');
				await expect.poll(focused).toBe(shareTrigger);

				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(shown('share-menu')).toBe(true);
				await expect.poll(focused).toBe(get('share-item-1'));

				await userEvent.keyboard('{ArrowLeft}');
				await expect.poll(shown('share-menu')).toBe(false);
				expect(focused()).toBe(shareTrigger);
			});

			it('moves to the next menu with the left and right arrow keys while a menu is open', async () => {
				render(MenubarHarness, { variant });
				get('file-trigger').focus();
				await userEvent.keyboard('{Enter}');
				await expect.poll(shown('file-menu')).toBe(true);
				await expect.poll(focused).toBe(get('file-item-1'));

				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(shown('file-menu')).toBe(false);
				await expect.poll(shown('edit-menu')).toBe(true);
			});
		});

		describe('mixed mouse and keyboard interactions', () => {
			it('moves through the menu from the keyboard after a click opens it', async () => {
				render(MenubarHarness, { variant });
				await userEvent.click(get('file-trigger'));
				await expect.poll(shown('file-menu')).toBe(true);

				await userEvent.keyboard('{ArrowDown}');
				await expect.poll(focused).toBe(get('file-item-1'));
				await userEvent.keyboard('{ArrowDown}');
				await expect.poll(focused).toBe(get('file-item-2'));
			});

			it('moves to another menu from the keyboard after a click opens one', async () => {
				render(MenubarHarness, { variant });
				await userEvent.click(get('file-trigger'));
				await expect.poll(shown('file-menu')).toBe(true);

				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(shown('file-menu')).toBe(false);
				await expect.poll(shown('edit-menu')).toBe(true);
			});
		});

		describe('touch interactions', () => {
			it('closes the entire tree on a single outside press after opening a submenu', async () => {
				render(MenubarHarness, { variant, outside: true });
				pressWithTouch(get('file-trigger'));
				await expect.poll(shown('file-menu')).toBe(true);

				await expect.poll(shown('share-trigger')).toBe(true);
				tapWithTouch(get('share-trigger'));
				await expect.poll(shown('share-menu')).toBe(true);

				pressWithTouch(get('outside'));
				await expect.poll(shown('file-menu')).toBe(false);
				expect(byTestId('share-menu')).toBe(null);
			});
		});

		describe('prop: loopFocus', () => {
			it('loops to the first item after the last one', async () => {
				render(MenubarHarness, { variant, menubarProps: { loopFocus: true } });
				const fileTrigger = get('file-trigger');
				fileTrigger.focus();
				await userEvent.keyboard('{ArrowRight}');
				await userEvent.keyboard('{ArrowRight}');
				expect(focused()).toBe(get('view-trigger'));
				await userEvent.keyboard('{ArrowRight}');
				expect(focused()).toBe(fileTrigger);
			});

			it('loops to the last item before the first one', async () => {
				render(MenubarHarness, { variant, menubarProps: { loopFocus: true } });
				get('file-trigger').focus();
				await userEvent.keyboard('{ArrowLeft}');
				await expect.poll(focused).toBe(get('view-trigger'));
			});

			it('stays on the last item when loopFocus is false', async () => {
				render(MenubarHarness, { variant, menubarProps: { loopFocus: false } });
				get('file-trigger').focus();
				await userEvent.keyboard('{ArrowRight}');
				await userEvent.keyboard('{ArrowRight}');
				const lastItem = get('view-trigger');
				await expect.poll(focused).toBe(lastItem);
				await userEvent.keyboard('{ArrowRight}');
				await settle();
				expect(focused()).toBe(lastItem);
			});

			it('stays on the first item when loopFocus is false', async () => {
				render(MenubarHarness, { variant, menubarProps: { loopFocus: false } });
				const firstItem = get('file-trigger');
				firstItem.focus();
				await userEvent.keyboard('{ArrowLeft}');
				expect(focused()).toBe(firstItem);
			});
		});

		describe('prop: disabled', () => {
			it('disables child menus when the menubar is disabled', async () => {
				render(MenubarHarness, { variant, menubarProps: { disabled: true } });
				const fileTrigger = get('file-trigger');
				expect(fileTrigger.hasAttribute('disabled')).toBe(true);

				await userEvent.tab();
				expect(focused()).toBe(document.body);

				await userEvent.click(fileTrigger, { force: true });
				await settle();
				expect(byTestId('file-menu')).toBe(null);
			});
		});

		it('opens a new menu on hover after clicking its trigger and entering from hover (#2222)', async () => {
			render(MenubarHarness, { variant });
			const fileTrigger = get('file-trigger');
			const editTrigger = get('edit-trigger');
			await userEvent.click(fileTrigger);
			await expect.poll(shown('file-menu')).toBe(true);
			await expect.poll(() => menubar().hasAttribute('data-has-submenu-open')).toBe(true);

			await userEvent.hover(editTrigger);
			await expect.poll(shown('edit-menu')).toBe(true);

			await userEvent.click(editTrigger);
			await expect.poll(shown('edit-menu')).toBe(false);
			await expect.poll(() => menubar().hasAttribute('data-has-submenu-open')).toBe(false);

			await userEvent.click(fileTrigger);
			await expect.poll(shown('file-menu')).toBe(true);
			await expect.poll(() => menubar().hasAttribute('data-has-submenu-open')).toBe(true);

			await userEvent.hover(editTrigger);
			await expect.poll(shown('edit-menu')).toBe(true);
		});

		describe('role', () => {
			it('sets role="menubar" on the root element', () => {
				render(MenubarHarness, { variant });
				expect(menubar()).not.toBe(null);
			});

			it('sets role="menuitem" on menu triggers', () => {
				render(MenubarHarness, { variant });
				const triggers = [...menubar().querySelectorAll('[role="menuitem"]')];
				expect(triggers.map((trigger) => trigger.textContent)).toEqual(['File', 'Edit', 'View']);
			});
		});
	});

	describe('role', () => {
		it('sets aria-orientation on the root element', () => {
			render(MenubarCasesHarness, { scenario: 'empty', menubarProps: { orientation: 'vertical' } });
			expect(menubar().getAttribute('aria-orientation')).toBe('vertical');
			expect(menubar().getAttribute('data-orientation')).toBe('vertical');
		});

		it('moves between triggers with the main-axis arrow keys when vertical', async () => {
			render(MenubarCasesHarness, { scenario: 'two', menubarProps: { orientation: 'vertical' } });
			get('first-trigger').focus();
			await userEvent.keyboard('[ArrowDown]');
			expect(focused()).toBe(get('second-trigger'));
			await settle();
			expect(document.querySelector('[role="menu"]')).toBe(null);
		});

		it.each([
			{ direction: 'ltr', openKey: 'ArrowRight', oppositeKey: 'ArrowLeft' },
			{ direction: 'rtl', openKey: 'ArrowLeft', oppositeKey: 'ArrowRight' }
		] as const)(
			'opens a menu of a vertical $direction menubar with $openKey',
			async ({ direction, openKey, oppositeKey }) => {
				render(MenubarCasesHarness, {
					scenario: 'one',
					direction,
					menubarProps: { orientation: 'vertical' }
				});
				get('first-trigger').focus();
				await userEvent.keyboard(`[${oppositeKey}]`);
				await settle();
				expect(document.querySelector('[role="menu"]')).toBe(null);

				await userEvent.keyboard(`[${openKey}]`);
				await expect.poll(() => document.querySelector('[role="menu"]')).not.toBe(null);
			}
		);
	});

	describe('state attributes', () => {
		it('marks a modal horizontal menubar and an open menu', async () => {
			render(MenubarHarness);
			const bar = menubar();
			expect(bar.getAttribute('data-orientation')).toBe('horizontal');
			expect(bar.getAttribute('data-modal')).toBe('');
			expect(bar.hasAttribute('data-has-submenu-open')).toBe(false);
			expect(bar.getAttribute('id')).toMatch(/^base-ui-/);

			await userEvent.click(get('file-trigger'));
			await expect.poll(() => bar.getAttribute('data-has-submenu-open')).toBe('');
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => bar.hasAttribute('data-has-submenu-open')).toBe(false);
		});

		it('drops data-modal on a non-modal menubar', () => {
			render(MenubarHarness, { menubarProps: { modal: false } });
			expect(menubar().hasAttribute('data-modal')).toBe(false);
		});

		it('keeps the consumer id', () => {
			render(MenubarHarness, { menubarProps: { id: 'app-menubar' } });
			expect(menubar().id).toBe('app-menubar');
		});

		it('passes props and state to the render snippet', () => {
			render(MenubarCasesHarness, { scenario: 'render' });
			const host = get('rendered');
			expect(host.tagName).toBe('NAV');
			expect(host.getAttribute('role')).toBe('menubar');
			expect(host.getAttribute('data-state')).toBe('horizontal modal');
		});
	});

	describe('scroll locking', () => {
		it('locks scroll when a touch-opened menu covers the viewport width', async () => {
			render(MenubarCasesHarness, { scenario: 'scroll-wide' });
			pressWithTouch(get('file-trigger'));
			await expect.poll(() => document.querySelector('[role="menu"]')).not.toBe(null);
			await expect.poll(isScrollLocked).toBe(true);
		});

		it('does not lock scroll when a touch-opened menu is narrower than the viewport', async () => {
			render(MenubarCasesHarness, { scenario: 'scroll-narrow' });
			pressWithTouch(get('file-trigger'));
			await expect.poll(() => document.querySelector('[role="menu"]')).not.toBe(null);
			await settle();
			expect(isScrollLocked()).toBe(false);
		});

		it('updates scroll lock when handing off between top-level touch-opened menus', async () => {
			render(MenubarCasesHarness, { scenario: 'scroll-handoff' });
			pressWithTouch(get('file-trigger'));
			await expect.poll(shown('file-menu')).toBe(true);
			await expect.poll(isScrollLocked).toBe(true);

			pressWithTouch(get('edit-trigger'));
			await expect.poll(shown('edit-menu')).toBe(true);
			await expect.poll(shown('file-menu')).toBe(false);
			await expect.poll(isScrollLocked).toBe(false);
		});
	});

	describe('disabled state', () => {
		it('keeps the menubar reachable when the first trigger is disabled', async () => {
			render(MenubarCasesHarness, { scenario: 'first-disabled' });
			const fileTrigger = get('file-trigger');
			const editTrigger = get('edit-trigger');
			expect(fileTrigger.hasAttribute('disabled')).toBe(true);
			expect(fileTrigger.getAttribute('tabindex')).toBe('-1');
			expect(editTrigger.getAttribute('tabindex')).toBe('0');

			await userEvent.tab();
			expect(focused()).toBe(editTrigger);
		});

		it('skips a disabled trigger with the arrow keys', async () => {
			render(MenubarCasesHarness, { scenario: 'first-disabled' });
			get('edit-trigger').focus();
			await userEvent.keyboard('{ArrowRight}');
			expect(focused()).toBe(get('view-trigger'));
			await userEvent.keyboard('{ArrowRight}');
			expect(focused()).toBe(get('edit-trigger'));
		});

		it('disables menu items while the menubar is disabled', async () => {
			const onclick = vi.fn();
			render(MenubarCasesHarness, { scenario: 'disabled-open', onItemClick: onclick });
			const item = get('file-item');
			expect(item.getAttribute('aria-disabled')).toBe('true');

			await userEvent.click(item, { force: true });
			expect(onclick).not.toHaveBeenCalled();
		});
	});

	describe('positioner', () => {
		it('uses bottom as the default side when the menubar is horizontal', async () => {
			render(MenubarCasesHarness, { scenario: 'open' });
			await expect.poll(() => get('open-positioner').getAttribute('data-side')).toBe('bottom');
			expect(get('open-positioner').getAttribute('data-align')).toBe('start');
		});

		it('uses inline-end as the default side when the menubar is vertical', async () => {
			render(MenubarCasesHarness, {
				scenario: 'open',
				menubarProps: { orientation: 'vertical' }
			});
			await expect.poll(() => get('open-positioner').getAttribute('data-side')).toBe('inline-end');
		});
	});

	describe('modal', () => {
		function centerOf(element: Element) {
			const rect = element.getBoundingClientRect();
			return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
		}

		it('covers the page with a backdrop that leaves the menubar interactive', async () => {
			render(MenubarHarness, { outside: true });
			clickElement(get('file-trigger'));
			await expect.poll(shown('file-menu')).toBe(true);
			await expect.poll(isScrollLocked).toBe(true);

			expect(centerOf(get('edit-trigger'))).toBe(get('edit-trigger'));
			const covering = centerOf(get('outside'));
			expect(covering).not.toBe(get('outside'));
			expect(covering?.getAttribute('role')).toBe('presentation');

			clickElement(get('edit-trigger'));
			await expect.poll(shown('edit-menu')).toBe(true);
			await expect.poll(shown('file-menu')).toBe(false);
		});

		it('neither locks scroll nor covers the page when the menubar is not modal', async () => {
			render(MenubarHarness, { outside: true, menubarProps: { modal: false } });
			clickElement(get('file-trigger'));
			await expect.poll(shown('file-menu')).toBe(true);
			await settle();
			expect(isScrollLocked()).toBe(false);
			expect(centerOf(get('outside'))).toBe(get('outside'));
		});
	});
});
