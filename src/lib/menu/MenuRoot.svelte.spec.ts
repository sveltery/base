// Assertions follow Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { cdp, page, userEvent } from 'vitest/browser';
import { platform } from '@sveltery/utils';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuDialogHarness from '../../tests/menu/MenuDialogHarness.svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import MenuLateItemsHarness from '../../tests/menu/MenuLateItemsHarness.svelte';
import { testMenu } from '../../tests/menu/test-menu.js';
import { enterWithMouse, mouse, moveMouse, pointer } from '../../tests/menu/mouse.js';
import { items } from '../../tests/menu/types.js';
import { parkPointer } from '../../tests/pointer.js';

function menus() {
	return [...document.querySelectorAll('[role="menu"]')];
}

function byTestId(id: string) {
	return document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
}

function toggle() {
	return page.getByRole('button', { name: 'Toggle' }).element() as HTMLElement;
}

function focused() {
	return document.activeElement;
}

async function settle() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

/**
 * The compatibility mousedown of a tap. A real one has `detail: 1`. The open method reads
 * `detail: 0` as a keyboard press, where upstream reads the pointerdown before it.
 */
function tapMouseDown(target: Element) {
	mouse(target, 'mousedown', { detail: 1 });
}

/**
 * A real pointer leaving the item `from` toward `to` crosses the popup between them. That hands
 * focus back to the popup before `to` takes it, which the submenu's focus-out check relies on.
 */
function leaveFor(from: Element, to: Element) {
	const rect = to.getBoundingClientRect();
	const init = {
		relatedTarget: from.closest('[role="menu"]'),
		clientX: rect.x + rect.width / 2,
		clientY: rect.y + rect.height / 2,
		bubbles: false
	};
	pointer(from, 'pointerleave', { pointerType: 'mouse', ...init });
	mouse(from, 'mouseleave', init);
}

function isScrollLocked() {
	const html = document.documentElement;
	return (
		html.hasAttribute('data-base-ui-scroll-locked') ||
		html.style.overflowY === 'hidden' ||
		document.body.style.overflowY === 'hidden'
	);
}

/** Advances fake timers, then lets Svelte flush. */
async function advance(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);
	await tick();
}

const PATIENT_CLICK_THRESHOLD = 500;
/** The closed popup unmounts after one frame checks for exit animations. */
const FRAME = 16;

describe('Menu.Root', () => {
	it('returns focus on Escape after a controlled root ignores a Shift+Tab close', async () => {
		// A controlled root that ignores the request: `bind:open` with a setter that drops writes.
		let open = $state(false);
		render(MenuHarness, {
			bindOpen: true,
			get open() {
				return open;
			},
			set open(_next: boolean) {},
			triggerLabel: 'Toggle',
			rootProps: {
				modal: false,
				onOpenChange(next: boolean, details: { reason: string }) {
					if (details.reason !== 'focus-out') open = next;
				}
			},
			items: items('Item')
		});
		await userEvent.click(toggle());
		await expect.poll(() => focused()?.getAttribute('role')).toBe('menu');
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		expect(focused()).toBe(toggle());
		expect(toggle().getAttribute('aria-expanded')).toBe('true');
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => focused()?.getAttribute('role')).toBe('menuitem');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => menus().length).toBe(0);
		expect(focused()).toBe(toggle());
	});

	it('keeps focus in the menu when a Shift+Tab close is canceled', async () => {
		render(MenuHarness, {
			open: true,
			triggerLabel: 'Toggle',
			rootProps: {
				onOpenChange(next: boolean, details: { cancel(): void }) {
					if (!next) details.cancel();
				}
			},
			items: items('Item')
		});
		const menu = menus()[0];
		await expect.poll(() => focused()).toBe(menu);
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		await settle();
		expect(focused()).toBe(menu);
		expect(toggle().getAttribute('aria-expanded')).toBe('true');
	});

	it('stays open while the pointer crosses the gap from the trigger to the popup', async () => {
		render(MenuHarness, {
			rootProps: { modal: false },
			trigger: { openOnHover: true, delay: 0 },
			positionerProps: { sideOffset: 24 },
			popupProps: { 'data-testid': 'popup' },
			items: [{ type: 'item', label: 'One', props: { 'data-testid': 'item' } }]
		});
		const trigger = page.getByRole('button', { name: 'Open' }).element();
		await userEvent.hover(trigger);
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true');
		await settle();
		const triggerRect = trigger.getBoundingClientRect();
		const item = byTestId('item')!;
		const itemRect = item.getBoundingClientRect();
		expect(itemRect.top - triggerRect.bottom).toBeGreaterThanOrEqual(20);
		const x = Math.min(triggerRect.right, itemRect.right) - 5;
		mouse(trigger, 'mouseleave', {
			clientX: x,
			clientY: triggerRect.bottom + 1,
			relatedTarget: document.body,
			bubbles: false
		});
		for (let y = triggerRect.bottom + 4; y < itemRect.top; y += 4) {
			mouse(document.body, 'mousemove', { clientX: x, clientY: y });
		}
		mouse(item, 'mouseenter', { clientX: x, clientY: itemRect.top + 2, bubbles: false });
		mouse(item, 'mousemove', { clientX: x, clientY: itemRect.top + 2 });
		await settle();
		await settle();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(byTestId('popup')).not.toBeNull();
	});

	it('highlights the first item when the items render a microtask after a keyboard opening', async () => {
		render(MenuLateItemsHarness);
		byTestId('trigger')!.focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => focused()?.textContent).toBe('One');
	});

	it('warns that nested menus ignore the modal prop', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		try {
			render(MenuHarness, {
				open: true,
				trigger: false,
				items: [
					{
						type: 'submenu',
						label: 'More',
						rootProps: { open: true, modal: false },
						items: []
					}
				]
			});
			expect(warn).toHaveBeenCalledWith(
				'Base UI: The `modal` prop is not supported on nested menus. It will be ignored.'
			);
		} finally {
			warn.mockRestore();
		}
	});
});

function item(name: string) {
	return page.getByRole('menuitem', { name, exact: true }).element() as HTMLElement;
}

async function press(...keys: string[]) {
	for (const key of keys) await userEvent.keyboard(key);
}

/** Playwright types no keydown for a character outside the US layout, so dispatch it. */
async function pressChar(key: string) {
	document.activeElement?.dispatchEvent(
		new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
	);
	await settle();
}

for (const detached of [false, true]) {
	describe(`Menu.Root with ${detached ? 'detached' : 'contained'} triggers`, () => {
		const menu = (options: Parameters<typeof testMenu>[0] = {}) =>
			testMenu({ detached, ...options });

		it('sets aria-orientation on a horizontal popup', async () => {
			render(MenuHarness, menu({ rootProps: { orientation: 'horizontal' } }));
			await userEvent.click(toggle());
			expect(byTestId('menu')?.getAttribute('aria-orientation')).toBe('horizontal');
		});

		describe('keyboard navigation', () => {
			it('changes the highlighted item using the arrow keys', async () => {
				render(MenuHarness, menu());
				toggle().focus();
				await press('[Enter]');
				await expect.poll(focused).toBe(byTestId('item-1'));
				await press('{ArrowDown}');
				await expect.poll(focused).toBe(byTestId('item-2'));
				await press('{ArrowDown}');
				await expect.poll(focused).toBe(byTestId('item-3'));
				await press('{ArrowUp}');
				await expect.poll(focused).toBe(byTestId('item-2'));
			});

			it('navigates across grouped items with arrow keys and text', async () => {
				render(
					MenuHarness,
					menu({
						items: [
							{ type: 'group', items: items('Apple', 'Banana') },
							{ type: 'group', items: items('Cherry') }
						]
					})
				);
				toggle().focus();
				await press('[Enter]');
				await expect.poll(focused).toBe(item('Apple'));
				await press('{ArrowDown}');
				await expect.poll(focused).toBe(item('Banana'));
				await press('{ArrowDown}');
				await expect.poll(focused).toBe(item('Cherry'));
				item('Apple').focus();
				await press('c');
				await expect.poll(focused).toBe(item('Cherry'));
			});

			it('closes with a detail 0 click on keyboard item activation', async () => {
				const onOpenChange = vi.fn();
				render(MenuHarness, menu({ rootProps: { onOpenChange } }));
				toggle().focus();
				await press('[Enter]');
				await expect.poll(focused).toBe(byTestId('item-1'));
				await press('[Enter]');
				await expect.poll(() => onOpenChange.mock.lastCall?.[0]).toBe(false);
				expect(onOpenChange.mock.lastCall?.[1].reason).toBe('item-press');
				expect((onOpenChange.mock.lastCall?.[1].event as MouseEvent).detail).toBe(0);
			});

			it('changes the highlighted item using the Home and End keys', async () => {
				render(MenuHarness, menu());
				toggle().focus();
				await press('[Enter]');
				await expect.poll(focused).toBe(byTestId('item-1'));
				await press('{End}');
				await expect.poll(focused).toBe(byTestId('item-5'));
				await press('{Home}');
				await expect.poll(focused).toBe(byTestId('item-1'));
			});

			it('includes disabled items during keyboard navigation', async () => {
				render(MenuHarness, menu());
				toggle().focus();
				await press('[Enter]');
				await expect.poll(focused).toBe(byTestId('item-1'));
				await press('{ArrowDown}', '{ArrowDown}');
				await expect.poll(focused).toBe(byTestId('item-3'));
				expect(byTestId('item-3')?.getAttribute('aria-disabled')).toBe('true');
			});

			it('skips items hidden with CSS during keyboard navigation', async () => {
				render(
					MenuHarness,
					menu({
						items: [
							{
								type: 'item',
								label: 'Item 1',
								props: { 'data-testid': 'item-1', style: 'display: none' }
							},
							{ type: 'item', label: 'Item 2', props: { 'data-testid': 'item-2' } },
							{ type: 'item', label: 'Item 3', props: { 'data-testid': 'item-3' } }
						]
					})
				);
				toggle().focus();
				await press('[Enter]');
				await expect.poll(focused).toBe(byTestId('item-2'));
				expect(byTestId('item-1')?.getAttribute('tabindex')).toBe('-1');
				await press('{ArrowDown}');
				await expect.poll(focused).toBe(byTestId('item-3'));
				await press('{ArrowUp}');
				await expect.poll(focused).toBe(byTestId('item-2'));
			});

			describe('text navigation', () => {
				it('changes the highlighted item', async () => {
					render(
						MenuHarness,
						menu({ open: true, items: items('Aa', 'Ba', 'Bb', 'Ca', 'Cb', 'Cd') })
					);
					item('Aa').focus();
					await press('c');
					await expect.poll(focused).toBe(item('Ca'));
					expect(item('Ca').getAttribute('tabindex')).toBe('0');
					await press('d');
					await expect.poll(focused).toBe(item('Cd'));
					expect(item('Cd').getAttribute('tabindex')).toBe('0');
				});

				it('skips items hidden with CSS', async () => {
					render(
						MenuHarness,
						menu({
							open: true,
							items: [
								{
									type: 'item',
									label: 'Apple',
									props: { 'data-testid': 'item-hidden', style: 'display: none' }
								},
								{ type: 'item', label: 'Apricot', props: { 'data-testid': 'item-apricot' } },
								{ type: 'item', label: 'Banana', props: { 'data-testid': 'item-banana' } }
							]
						})
					);
					byTestId('item-banana')!.focus();
					await press('a');
					await expect.poll(focused).toBe(byTestId('item-apricot'));
					expect(byTestId('item-hidden')?.getAttribute('tabindex')).toBe('-1');
				});

				it('skips natively disabled items', async () => {
					render(
						MenuHarness,
						menu({
							open: true,
							items: [
								{ type: 'item', label: 'Apple' },
								{
									type: 'item',
									label: 'Banana',
									as: 'button',
									props: { 'data-testid': 'item-banana', buttonProps: { disabled: true } }
								},
								{ type: 'item', label: 'Blueberry', props: { 'data-testid': 'item-blueberry' } }
							]
						})
					);
					item('Apple').focus();
					await press('b');
					await expect.poll(focused).toBe(byTestId('item-blueberry'));
					expect(byTestId('item-banana')?.getAttribute('tabindex')).toBe('-1');
					expect(byTestId('item-banana')?.hasAttribute('data-highlighted')).toBe(false);
				});

				it('matches the label prop', async () => {
					render(
						MenuHarness,
						menu({
							items: ['Aa', 'Ba', 'Bb', 'Ca'].map((label, index) => ({
								type: 'item' as const,
								label: String(index + 1),
								props: { label }
							}))
						})
					);
					await userEvent.click(toggle());
					await expect.poll(() => focused()?.getAttribute('role')).toBe('menu');
					await press('b');
					await expect.poll(focused).toBe(item('2'));
					expect(item('2').getAttribute('tabindex')).toBe('0');
					await press('b');
					await expect.poll(focused).toBe(item('3'));
					await press('b');
					await expect.poll(focused).toBe(item('3'));
				});

				it('skips items without text', async () => {
					render(
						MenuHarness,
						menu({
							open: true,
							items: [
								...items('Aa', 'Ba'),
								{ type: 'item', label: '' },
								{ type: 'item', label: '' },
								...items('Bc')
							]
						})
					);
					item('Aa').focus();
					await press('b');
					await expect.poll(focused).toBe(item('Ba'));
					await press('c');
					await expect.poll(focused).toBe(item('Bc'));
					expect(item('Bc').getAttribute('tabindex')).toBe('0');
				});

				it('navigates to items with diacritic characters', async () => {
					render(MenuHarness, menu({ open: true, items: items('Aa', 'Ba', 'Bb', 'Bą') }));
					item('Aa').focus();
					await press('b');
					await expect.poll(focused).toBe(item('Ba'));
					await pressChar('ą');
					await expect.poll(focused).toBe(item('Bą'));
				});

				it('navigates to items that begin with diacritic characters', async () => {
					render(MenuHarness, menu({ open: true, items: items('Aa', 'ąa', 'ąb', 'ąc') }));
					item('Aa').focus();
					await pressChar('ą');
					await expect.poll(focused).toBe(item('ąa'));
					expect(item('ąa').getAttribute('tabindex')).toBe('0');
				});

				it('does not click an item when Space is pressed during text navigation', async () => {
					const onclick = vi.fn();
					render(
						MenuHarness,
						menu({
							open: true,
							items: ['Item One', 'Item Two', 'Item Three'].map((label) => ({
								type: 'item' as const,
								label,
								props: { onclick }
							}))
						})
					);
					item('Item One').focus();
					await press('Item T');
					expect(onclick).not.toHaveBeenCalled();
					await expect.poll(focused).toBe(item('Item Two'));
				});

				it('does not open a submenu when Space is pressed during typeahead', async () => {
					render(
						MenuHarness,
						menu({
							open: true,
							items: [
								{
									type: 'submenu',
									label: 'Add to Playlist',
									triggerProps: { 'data-testid': 'submenu-trigger' },
									popupProps: { 'data-testid': 'submenu' },
									items: items('Add now')
								}
							]
						})
					);
					byTestId('submenu-trigger')!.focus();
					await press('Add to p');
					await expect.poll(focused).toBe(byTestId('submenu-trigger'));
					await press('[Space]');
					expect(byTestId('submenu')).toBeNull();
					await press('[Space]');
					expect(byTestId('submenu')).toBeNull();
				});

				it('opens a focused submenu trigger with Space when not typing', async () => {
					render(MenuHarness, menu({ open: true }));
					byTestId('submenu-trigger')!.focus();
					await press('[Space]');
					await expect.poll(() => byTestId('submenu')).not.toBeNull();
				});

				it('matches "Item 2" after "Item " matched "Item 1"', async () => {
					render(
						MenuHarness,
						menu({
							open: true,
							items: [
								{ type: 'item', label: 'Item 1' },
								{ type: 'item', label: 'Item 2', props: { 'data-testid': 'item-2' } },
								{ type: 'item', label: 'Item 3' }
							]
						})
					);
					item('Item 1').focus();
					await press('Item 2');
					expect(focused()).toBe(byTestId('item-2'));
				});

				it('matches a submenu trigger label after a space and a digit', async () => {
					render(
						MenuHarness,
						menu({
							open: true,
							items: [
								{ type: 'item', label: 'Item 1' },
								{
									type: 'submenu',
									label: 'Item 2',
									triggerProps: { 'data-testid': 'submenu-trigger' },
									popupProps: { 'data-testid': 'submenu' },
									items: items('Nested 2.1')
								},
								{ type: 'item', label: 'Item 3' }
							]
						})
					);
					item('Item 1').focus();
					await press('Item 2');
					expect(focused()).toBe(byTestId('submenu-trigger'));
					expect(byTestId('submenu')).toBeNull();
				});
			});
		});

		describe('nested menus', () => {
			for (const [orientation, direction, openKey, closeKey] of [
				['vertical', 'ltr', 'ArrowRight', 'ArrowLeft'],
				['vertical', 'rtl', 'ArrowLeft', 'ArrowRight'],
				['horizontal', 'ltr', 'ArrowDown', 'ArrowUp'],
				['horizontal', 'rtl', 'ArrowDown', 'ArrowUp']
			] as const) {
				it(`opens a submenu of a ${orientation} ${direction} menu with ${openKey} and closes it with ${closeKey}`, async () => {
					render(MenuHarness, {
						...menu({ open: true, rootProps: { orientation }, submenuProps: { orientation } }),
						direction
					});
					const submenuTrigger = byTestId('submenu-trigger')!;
					submenuTrigger.focus();
					await expect.poll(focused).toBe(submenuTrigger);
					await press(`[${openKey}]`);
					await expect.poll(focused).toBe(byTestId('item-4_1'));
					await press(`[${closeKey}]`);
					await expect.poll(() => byTestId('submenu')).toBeNull();
					expect(focused()).toBe(submenuTrigger);
				});
			}

			it('opens a submenu on click when openOnHover is false', async () => {
				render(MenuHarness, menu({ submenuTriggerProps: { openOnHover: false } }));
				await userEvent.click(toggle());
				expect(byTestId('submenu')).toBeNull();
				await userEvent.click(byTestId('submenu-trigger')!);
				await expect.poll(() => byTestId('item-4_1')?.textContent).toBe('Item 4.1');
				expect(byTestId('menu')).not.toBeNull();
			});

			it('keeps the root menu open when a submenu opens and the trigger has a custom id', async () => {
				const onOpenChange = vi.fn();
				render(
					MenuHarness,
					menu({
						rootProps: { onOpenChange },
						trigger: { id: 'custom-trigger' },
						submenuTriggerProps: { openOnHover: false }
					})
				);
				await userEvent.click(toggle());
				await userEvent.click(byTestId('submenu-trigger')!);
				await expect.poll(() => byTestId('submenu')).not.toBeNull();
				expect(byTestId('menu')).not.toBeNull();
				expect(onOpenChange).not.toHaveBeenCalledWith(
					false,
					expect.objectContaining({ reason: 'sibling-open' })
				);
			});

			it('closes submenus when shift-tabbing from a nested menu', async () => {
				render(MenuHarness, menu());
				await userEvent.click(toggle());
				expect(byTestId('submenu')).toBeNull();
				await userEvent.hover(byTestId('submenu-trigger')!);
				await expect.poll(() => byTestId('submenu')).not.toBeNull();
				byTestId('item-4_1')!.focus();
				await expect.poll(focused).toBe(byTestId('item-4_1'));
				await press('{Shift>}{Tab}{/Shift}');
				await expect.poll(() => byTestId('submenu')).toBeNull();
				expect(focused()).toBe(byTestId('submenu-trigger'));
				expect(byTestId('menu')).not.toBeNull();
			});

			it('closes the entire tree when clicking outside the deepest submenu', async () => {
				render(MenuHarness, menu());
				await userEvent.click(toggle());
				await expect.poll(focused).toBe(byTestId('menu'));
				await press('[ArrowDown]', '[ArrowDown]', '[ArrowDown]', '[ArrowDown]');
				await expect.poll(focused).toBe(byTestId('submenu-trigger'));
				await press('[ArrowRight]');
				await expect.poll(focused).toBe(byTestId('item-4_1'));
				await press('[ArrowDown]', '[ArrowDown]');
				await expect.poll(focused).toBe(byTestId('nested-submenu-trigger'));
				await press('[ArrowRight]');
				await expect.poll(() => byTestId('nested-submenu')).not.toBeNull();
				await userEvent.click(page.getByRole('button', { name: 'Outside' }), { force: true });
				await expect.poll(() => byTestId('menu')).toBeNull();
				expect(byTestId('submenu')).toBeNull();
				expect(byTestId('nested-submenu')).toBeNull();
			});

			it('calls onOpenChange with false once per menu when a submenu item is clicked', async () => {
				const rootOnOpenChange = vi.fn();
				const submenuOnOpenChange = vi.fn();
				render(
					MenuHarness,
					menu({
						rootProps: { onOpenChange: rootOnOpenChange },
						submenuProps: { onOpenChange: submenuOnOpenChange },
						submenuTriggerProps: { delay: 0, closeDelay: 50 }
					})
				);
				await userEvent.click(toggle());
				const submenuTrigger = byTestId('submenu-trigger')!;
				await userEvent.hover(submenuTrigger);
				await expect.poll(() => byTestId('submenu')).not.toBeNull();
				mouse(submenuTrigger, 'mouseleave', { bubbles: false });
				byTestId('item-4_1')!.click();
				await expect.poll(() => byTestId('menu')).toBeNull();
				await new Promise((resolve) => setTimeout(resolve, 100));
				const rootCloses = rootOnOpenChange.mock.calls.filter(([open]) => open === false);
				const submenuCloses = submenuOnOpenChange.mock.calls.filter(([open]) => open === false);
				expect(rootCloses.length).toBe(1);
				expect(submenuCloses.length).toBe(1);
				expect(submenuCloses.filter(([, details]) => details.reason === 'trigger-hover')).toEqual(
					[]
				);
			});

			it('returns focus to submenu triggers when closing nested menus', async () => {
				render(MenuHarness, menu());
				await userEvent.click(toggle());
				await expect.poll(focused).toBe(byTestId('menu'));
				await press('[ArrowDown]', '[ArrowDown]', '[ArrowDown]', '[ArrowDown]');
				await expect.poll(focused).toBe(byTestId('submenu-trigger'));
				await press('[ArrowRight]');
				await expect.poll(focused).toBe(byTestId('item-4_1'));
				await press('[ArrowDown]', '[ArrowDown]');
				await expect.poll(focused).toBe(byTestId('nested-submenu-trigger'));
				await press('[ArrowRight]');
				await expect.poll(focused).toBe(byTestId('item-4_3_1'));
				await press('[ArrowLeft]');
				await expect.poll(() => byTestId('nested-submenu')).toBeNull();
				expect(focused()).toBe(byTestId('nested-submenu-trigger'));
				await press('[ArrowLeft]');
				await expect.poll(() => byTestId('submenu')).toBeNull();
				expect(focused()).toBe(byTestId('submenu-trigger'));
			});
		});

		describe('focus management', () => {
			it('makes the first item tabbable after a keyboard opening', async () => {
				render(MenuHarness, menu());
				toggle().focus();
				await press('[Enter]');
				await expect
					.poll(() => (page.getByRole('menuitem').elements()[0] as HTMLElement)?.tabIndex)
					.toBe(0);
				const [, ...others] = page.getByRole('menuitem').elements() as HTMLElement[];
				expect(others.map((node) => node.tabIndex)).toEqual(others.map(() => -1));
			});

			it('focuses the first item when ArrowDown opens the menu', async () => {
				render(MenuHarness, menu());
				toggle().focus();
				await press('[ArrowDown]');
				await expect.poll(focused).toBe(byTestId('item-1'));
				expect(byTestId('item-1')?.tabIndex).toBe(0);
			});

			it('focuses the last item when ArrowUp opens the menu', async () => {
				render(MenuHarness, menu());
				toggle().focus();
				await press('[ArrowUp]');
				await expect.poll(focused).toBe(byTestId('item-5'));
				const all = page.getByRole('menuitem').elements() as HTMLElement[];
				expect(all.map((node) => node.tabIndex)).toEqual([-1, -1, -1, -1, 0]);
			});

			it('focuses the trigger after the menu is closed', async () => {
				render(MenuHarness, menu());
				await userEvent.click(toggle());
				await userEvent.click(byTestId('item-1')!);
				await expect.poll(focused).toBe(toggle());
			});

			it('focuses the trigger after Escape when the closing menu receives mouseleave', async () => {
				const style = document.createElement('style');
				style.textContent =
					'.transition-test-indicator { transition: transform 100ms ease-out, opacity 100ms ease-out; } .transition-test-indicator[data-ending-style] { opacity: 0; transform: scale(0.98); }';
				document.head.append(style);
				try {
					render(MenuHarness, menu({ popupProps: { class: 'transition-test-indicator' } }));
					await userEvent.click(toggle());
					await userEvent.hover(byTestId('item-1')!);
					await expect.poll(focused).toBe(byTestId('item-1'));
					await press('[Escape]');
					mouse(byTestId('menu-positioner')!, 'mouseleave', {
						relatedTarget: document.body,
						bubbles: false
					});
					await expect.poll(() => menus().length).toBe(0);
					expect(focused()).toBe(toggle());
				} finally {
					style.remove();
				}
			});

			it('focuses the trigger after the menu is closed but kept mounted', async () => {
				render(MenuHarness, menu({ portalProps: { keepMounted: true } }));
				await userEvent.click(toggle());
				await userEvent.click(byTestId('item-1')!);
				await expect.poll(focused).toBe(toggle());
			});
		});

		describe('focus guards', () => {
			it('closes the menu and moves focus to the next control when tabbing forward', async () => {
				render(MenuHarness, { ...menu({ rootProps: { modal: false } }), after: true });
				await userEvent.click(toggle());
				byTestId('item-1')!.focus();
				await press('{Tab}');
				await expect.poll(focused).toBe(page.getByRole('button', { name: 'After' }).element());
				await expect.poll(() => byTestId('menu')).toBeNull();
			});

			it('closes the menu and moves focus to the trigger when shift-tabbing', async () => {
				render(MenuHarness, { ...menu(), before: true });
				await userEvent.click(toggle());
				byTestId('item-1')!.focus();
				await press('{Shift>}{Tab}{/Shift}');
				await expect.poll(focused).toBe(toggle());
				await expect.poll(() => byTestId('menu')).toBeNull();
			});
		});

		describe('prop: closeParentOnEsc', () => {
			async function openSubmenu() {
				toggle().focus();
				await press('[ArrowDown]');
				await expect.poll(focused).toBe(byTestId('item-1'));
				await press('[ArrowDown]', '[ArrowDown]', '[ArrowDown]');
				await expect.poll(focused).toBe(byTestId('submenu-trigger'));
				await press('[ArrowRight]');
				await expect.poll(focused).toBe(byTestId('item-4_1'));
			}

			it('closes only the submenu on Escape by default', async () => {
				render(MenuHarness, menu());
				await openSubmenu();
				await press('[Escape]');
				await expect.poll(() => menus().length).toBe(1);
				expect(menus()[0].getAttribute('data-testid')).toBe('menu');
			});

			it('closes the parent menu on Escape with closeParentOnEsc', async () => {
				render(MenuHarness, menu({ submenuProps: { closeParentOnEsc: true } }));
				await openSubmenu();
				await press('[Escape]');
				await expect.poll(() => menus().length).toBe(0);
			});
		});

		describe('prop: modal', () => {
			it('renders an internal backdrop when true', async () => {
				render(MenuHarness, menu({ rootProps: { modal: true } }));
				await userEvent.click(toggle());
				const positioner = byTestId('menu-positioner')!;
				expect(positioner.previousElementSibling?.getAttribute('role')).toBe('presentation');
			});

			it('does not render an internal backdrop when false', async () => {
				render(MenuHarness, menu({ rootProps: { modal: false } }));
				await userEvent.click(toggle());
				const positioner = byTestId('menu-positioner')!;
				expect(positioner.previousElementSibling).toBeNull();
			});
		});

		it('does not close after hovering out of a popup opened without trigger hover', async () => {
			render(MenuHarness, menu({ open: true }));
			const positioner = byTestId('menu-positioner')!;
			mouse(positioner, 'mouseenter', { bubbles: false });
			mouse(positioner, 'mouseleave', { bubbles: false });
			await settle();
			expect(menus().length).toBe(1);
		});

		describe('controlled open interactions', () => {
			it('does not close after hovering out of a popup opened externally', async () => {
				render(MenuHarness, { ...menu(), bindOpen: true, opener: true });
				await userEvent.click(page.getByRole('button', { name: 'Show' }));
				await expect.poll(() => menus().length).toBe(1);
				const positioner = byTestId('menu-positioner')!;
				mouse(positioner, 'mouseenter', { bubbles: false });
				mouse(positioner, 'mouseleave', { bubbles: false });
				await settle();
				expect(menus().length).toBe(1);
			});

			it('closes after hovering out of a popup opened by its trigger', async () => {
				await parkPointer();
				render(MenuHarness, {
					...menu({ rootProps: { modal: false }, trigger: { openOnHover: true, delay: 0 } }),
					bindOpen: true
				});
				mouse(toggle(), 'mouseenter', { bubbles: false });
				mouse(toggle(), 'mousemove');
				await expect.poll(() => menus().length).toBe(1);
				// The popup is the floating element here. Upstream listens on the positioner.
				const popup = byTestId('menu')!;
				mouse(popup, 'mouseenter', { bubbles: false });
				mouse(popup, 'mouseleave', { bubbles: false });
				await expect.poll(() => menus().length).toBe(0);
			});
		});

		describe('scroll locking', () => {
			it('does not lock scroll when opened by touch', async () => {
				render(MenuHarness, menu({ rootProps: { modal: true } }));
				pointer(toggle(), 'pointerdown', { pointerType: 'touch' });
				tapMouseDown(toggle());
				await expect.poll(() => menus().length).toBe(1);
				await settle();
				expect(isScrollLocked()).toBe(false);
			});

			it('locks scroll when opened by mouse', async () => {
				render(MenuHarness, menu({ rootProps: { modal: true } }));
				await userEvent.click(toggle());
				await expect.poll(() => menus().length).toBe(1);
				await expect.poll(isScrollLocked).toBe(true);
			});

			it('locks scroll when a touch-opened popup covers the viewport width', async () => {
				render(
					MenuHarness,
					menu({
						rootProps: { modal: true },
						positionerProps: { style: 'width: calc(100vw - 10px)' },
						items: items('1')
					})
				);
				pointer(toggle(), 'pointerdown', { pointerType: 'touch' });
				tapMouseDown(toggle());
				await expect.poll(() => menus().length).toBe(1);
				await expect.poll(isScrollLocked).toBe(true);
			});

			it('does not lock scroll when a touch-opened popup is narrower than the viewport', async () => {
				render(
					MenuHarness,
					menu({
						rootProps: { modal: true },
						positionerProps: { style: 'width: 240px' },
						items: items('1')
					})
				);
				pointer(toggle(), 'pointerdown', { pointerType: 'touch' });
				tapMouseDown(toggle());
				await expect.poll(() => menus().length).toBe(1);
				await settle();
				expect(isScrollLocked()).toBe(false);
			});
		});

		describe('unmount export', () => {
			it('unmounts a menu kept mounted by preventUnmountOnClose', async () => {
				const view = render(
					MenuHarness,
					menu({
						rootProps: {
							onOpenChange(_open: boolean, details: { preventUnmountOnClose(): void }) {
								details.preventUnmountOnClose();
							}
						}
					})
				);
				toggle().focus();
				await userEvent.keyboard('{Enter}');
				await expect.poll(() => menus().length).toBe(1);
				await userEvent.click(toggle());
				await expect.poll(() => toggle().getAttribute('aria-expanded')).toBe('false');
				expect(menus().length).toBe(1);
				await settle();
				view.component.actions().unmount();
				await expect.poll(() => menus().length).toBe(0);
			});
		});

		describe('prop: openOnHover', () => {
			it('opens when the trigger is hovered and closes when it is no longer hovered', async () => {
				await parkPointer();
				render(MenuHarness, menu({ trigger: { openOnHover: true, delay: 0 } }));
				toggle().focus();
				enterWithMouse(toggle());
				await expect.poll(() => menus().length).toBe(1);
				moveMouse(toggle(), document.body);
				await expect.poll(() => menus().length).toBe(0);
			});

			it('opens the submenu on hover with zero delay', async () => {
				render(MenuHarness, menu({ open: true, submenuTriggerProps: { delay: 0 } }));
				await userEvent.hover(byTestId('submenu-trigger')!);
				await expect.poll(() => byTestId('submenu')).not.toBeNull();
			});

			it('does not clear body pointer-events styles when closing a scoped submenu', async () => {
				render(MenuHarness, menu({ open: true, submenuTriggerProps: { delay: 0, closeDelay: 0 } }));
				await userEvent.hover(byTestId('submenu-trigger')!);
				await expect.poll(() => byTestId('submenu')).not.toBeNull();
				const previous = document.body.style.pointerEvents;
				try {
					document.body.style.pointerEvents = 'none';
					mouse(byTestId('item-2')!, 'mousemove');
					await expect.poll(() => byTestId('submenu')).toBeNull();
					expect(document.body.style.pointerEvents).toBe('none');
				} finally {
					document.body.style.pointerEvents = previous;
				}
			});

			it('scopes submenu safePolygon pointer events to the parent menu with a keepMounted portal', async () => {
				render(
					MenuHarness,
					menu({
						open: true,
						items: [
							{ type: 'item', label: 'Item 1', props: { 'data-testid': 'item-1' } },
							{
								type: 'submenu',
								label: 'Item 2',
								triggerProps: { 'data-testid': 'submenu-trigger', delay: 0 },
								portalProps: { keepMounted: true },
								positionerProps: { 'data-testid': 'submenu-positioner' },
								popupProps: { 'data-testid': 'submenu' },
								items: items('Item 2.1')
							},
							{ type: 'item', label: 'Item 3', props: { 'data-testid': 'item-3' } }
						]
					})
				);
				await userEvent.hover(byTestId('submenu-trigger')!);
				await expect.poll(() => byTestId('submenu')?.getAttribute('data-open')).toBe('');
				await expect.poll(() => byTestId('menu')!.style.pointerEvents).toBe('none');
				// Upstream asserts `pointer-events: auto` on the submenu positioner. Svelte rewrites the
				// popup's style attribute when it changes, so this asserts the effect: the submenu
				// still takes the pointer while its parent does not.
				const nested = item('Item 2.1').getBoundingClientRect();
				expect(
					document.elementFromPoint(nested.x + nested.width / 2, nested.y + nested.height / 2)
				).toBe(item('Item 2.1'));
				expect(byTestId('item-3')!.style.pointerEvents).toBe('');
			});

			it('does not close when the submenu is hovered after the root menu', async () => {
				await parkPointer();
				render(
					MenuHarness,
					menu({ trigger: { openOnHover: true, delay: 0 }, submenuTriggerProps: { delay: 0 } })
				);
				toggle().focus();
				await userEvent.hover(toggle());
				await expect.poll(() => byTestId('menu')).not.toBeNull();
				const popup = byTestId('menu')!;
				await userEvent.hover(popup);
				await userEvent.hover(item('Item 4'));
				await expect.poll(() => byTestId('submenu')).not.toBeNull();
				const submenu = byTestId('submenu')!;
				mouse(popup, 'mousemove');
				mouse(popup, 'mouseleave', { bubbles: false });
				await userEvent.hover(submenu);
				await settle();
				expect(byTestId('menu')).not.toBeNull();
				expect(byTestId('submenu')).not.toBeNull();
			});

			it('keeps the parent submenu open after a third-level submenu closes on sibling hover', async () => {
				await parkPointer();
				render(
					MenuHarness,
					menu({ trigger: { openOnHover: true, delay: 0 }, submenuTriggerProps: { delay: 0 } })
				);
				toggle().focus();
				await userEvent.hover(toggle());
				await expect.poll(() => byTestId('menu')).not.toBeNull();
				await userEvent.hover(item('Item 4'));
				await expect.poll(() => byTestId('submenu')).not.toBeNull();
				await userEvent.hover(item('Item 4.3'));
				await expect.poll(() => byTestId('nested-submenu')).not.toBeNull();
				mouse(item('Item 4.2'), 'mousemove');
				await expect.poll(() => byTestId('nested-submenu')).toBeNull();
				mouse(byTestId('submenu')!, 'mouseleave', { bubbles: false });
				await settle();
				expect(byTestId('submenu')).not.toBeNull();
			});

			describe('modal behavior', () => {
				it('reopens on hover after an impatient click closes via item press', async () => {
					await parkPointer();
					vi.useFakeTimers();
					try {
						render(MenuHarness, menu({ trigger: { openOnHover: true, delay: 100 } }));
						pointer(toggle(), 'pointerenter', { pointerType: 'mouse', bubbles: false });
						mouse(toggle(), 'mouseenter', { bubbles: false });
						mouse(toggle(), 'mousemove', { movementX: 10 });
						await advance(100);
						expect(menus().length).toBe(1);
						await advance(PATIENT_CLICK_THRESHOLD - 1);
						mouse(toggle(), 'click');
						await advance(0);
						mouse(byTestId('item-1')!, 'click');
						await advance(FRAME);
						expect(menus().length).toBe(0);
						mouse(toggle(), 'mouseenter', { bubbles: false });
						mouse(toggle(), 'mousemove', { movementX: 10 });
						await advance(100);
						expect(menus().length).toBe(1);
					} finally {
						vi.useRealTimers();
					}
				});

				it('treats hover-opened menus as modal after a click', async () => {
					await parkPointer();
					vi.useFakeTimers();
					try {
						render(
							MenuHarness,
							menu({ trigger: { openOnHover: true, delay: 0 }, items: items('Item 1') })
						);
						mouse(toggle(), 'mouseenter', { bubbles: false });
						mouse(toggle(), 'mousemove');
						await advance(0);
						expect(menus().length).toBe(1);
						const positioner = byTestId('menu-positioner')!;
						expect(positioner.previousElementSibling).toBeNull();
						await advance(PATIENT_CLICK_THRESHOLD - 1);
						mouse(toggle(), 'click');
						await advance(0);
						expect(positioner.previousElementSibling?.getAttribute('role')).toBe('presentation');
					} finally {
						vi.useRealTimers();
					}
				});
			});
		});

		describe('prop: closeDelay', () => {
			it('closes after the delay', async () => {
				await parkPointer();
				vi.useFakeTimers();
				try {
					render(MenuHarness, menu({ trigger: { openOnHover: true, delay: 0, closeDelay: 100 } }));
					mouse(toggle(), 'mouseenter', { bubbles: false });
					mouse(toggle(), 'mousemove');
					await advance(0);
					expect(item('Item 1')).not.toBeNull();
					mouse(toggle(), 'mouseleave', { bubbles: false });
					await advance(50);
					expect(menus().length).toBe(1);
					await advance(50);
					await advance(FRAME);
					expect(menus().length).toBe(0);
				} finally {
					vi.useRealTimers();
				}
			});

			it('closes a submenu after the delay when a sibling item is hovered', async () => {
				await parkPointer();
				vi.useFakeTimers();
				try {
					render(
						MenuHarness,
						menu({
							trigger: { openOnHover: true, delay: 0 },
							submenuTriggerProps: { delay: 0, closeDelay: 100 }
						})
					);
					mouse(toggle(), 'mouseenter', { bubbles: false });
					mouse(toggle(), 'mousemove');
					await advance(0);
					mouse(item('Item 4'), 'mouseenter', { bubbles: false });
					mouse(item('Item 4'), 'mousemove');
					await advance(0);
					expect(byTestId('submenu')).not.toBeNull();
					leaveFor(item('Item 4'), item('Item 1'));
					mouse(item('Item 1'), 'mousemove');
					await advance(50);
					expect(byTestId('submenu')).not.toBeNull();
					await advance(50);
					await advance(FRAME);
					expect(byTestId('submenu')).toBeNull();
				} finally {
					vi.useRealTimers();
				}
			});

			it('does not restart closeDelay on repeated mousemove over sibling items', async () => {
				await parkPointer();
				vi.useFakeTimers();
				try {
					render(
						MenuHarness,
						menu({
							trigger: { openOnHover: true, delay: 0 },
							submenuTriggerProps: { delay: 0, closeDelay: 100 }
						})
					);
					mouse(toggle(), 'mouseenter', { bubbles: false });
					mouse(toggle(), 'mousemove');
					await advance(0);
					mouse(item('Item 4'), 'mouseenter', { bubbles: false });
					mouse(item('Item 4'), 'mousemove');
					await advance(0);
					expect(byTestId('submenu')).not.toBeNull();
					const sibling = item('Item 1');
					leaveFor(item('Item 4'), sibling);
					mouse(sibling, 'mousemove');
					await advance(80);
					expect(byTestId('submenu')).not.toBeNull();
					mouse(sibling, 'mousemove');
					await advance(20);
					await advance(FRAME);
					expect(byTestId('submenu')).toBeNull();
				} finally {
					vi.useRealTimers();
				}
			});
		});

		describe('submenu hover open', () => {
			it('opens a submenu after a plain delay without waiting for the pointer to rest', async () => {
				await parkPointer();
				vi.useFakeTimers();
				try {
					render(MenuHarness, menu({ open: true, submenuTriggerProps: { delay: 100 } }));
					const submenuTrigger = byTestId('submenu-trigger')!;
					mouse(submenuTrigger, 'mouseenter', { bubbles: false });
					mouse(submenuTrigger, 'mousemove', { movementX: 10 });
					await advance(40);
					mouse(submenuTrigger, 'mousemove', { movementX: 10 });
					await advance(40);
					mouse(submenuTrigger, 'mousemove', { movementX: 10 });
					await advance(40);
					expect(byTestId('submenu')).not.toBeNull();
				} finally {
					vi.useRealTimers();
				}
			});

			it('cancels a pending submenu hover-open when the pointer leaves via mouseout', async () => {
				await parkPointer();
				vi.useFakeTimers();
				try {
					render(MenuHarness, menu({ open: true, submenuTriggerProps: { delay: 100 } }));
					const submenuTrigger = byTestId('submenu-trigger')!;
					mouse(submenuTrigger, 'mousemove', { movementX: 10 });
					mouse(submenuTrigger, 'mouseenter', { bubbles: false });
					mouse(submenuTrigger, 'mouseout', { relatedTarget: byTestId('item-1') });
					await advance(200);
					expect(byTestId('submenu')).toBeNull();
				} finally {
					vi.useRealTimers();
				}
			});

			it('keeps a pending submenu hover-open when mouseout stays within the trigger', async () => {
				await parkPointer();
				vi.useFakeTimers();
				try {
					render(MenuHarness, menu({ open: true, submenuTriggerProps: { delay: 100 } }));
					const submenuTrigger = byTestId('submenu-trigger')!;
					mouse(submenuTrigger, 'mousemove', { movementX: 10 });
					mouse(submenuTrigger, 'mouseenter', { bubbles: false });
					mouse(submenuTrigger, 'mouseout', { relatedTarget: submenuTrigger });
					await advance(200);
					expect(byTestId('submenu')).not.toBeNull();
				} finally {
					vi.useRealTimers();
				}
			});
		});

		describe('mouse interaction', () => {
			it('triggers a menu item and closes the menu on click, drag, release', async () => {
				const onOpenChange = vi.fn();
				const onclick = vi.fn();
				render(
					MenuHarness,
					menu({
						rootProps: { onOpenChange },
						items: [
							{ type: 'item', label: '1', props: { 'data-testid': 'item-1' } },
							{ type: 'item', label: '2', props: { 'data-testid': 'item-2', onclick } },
							{ type: 'item', label: '3', props: { 'data-testid': 'item-3' } }
						]
					})
				);
				mouse(toggle(), 'mousedown');
				await expect.poll(() => byTestId('menu')).not.toBeNull();
				await new Promise((resolve) => setTimeout(resolve, 200));
				mouse(byTestId('item-2')!, 'mouseup');
				await expect.poll(() => byTestId('menu')).toBeNull();
				expect(onclick).toHaveBeenCalledTimes(1);
				expect(onOpenChange).toHaveBeenCalledTimes(2);
				expect(onOpenChange.mock.calls[0][0]).toBe(true);
				expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
				expect(onOpenChange.mock.lastCall?.[1].reason).toBe('item-press');
				expect((onOpenChange.mock.lastCall?.[1].event as MouseEvent).detail).toBe(1);
			});

			it('closes the menu on click, drag outside, release', async () => {
				const onOpenChange = vi.fn();
				render(MenuHarness, menu({ rootProps: { onOpenChange }, items: items('1', '2', '3') }));
				await userEvent.dragAndDrop(toggle(), page.getByRole('presentation').first());
				await expect.poll(() => byTestId('menu')).toBeNull();
				expect(onOpenChange).toHaveBeenCalledTimes(2);
				expect(onOpenChange.mock.calls[0][0]).toBe(true);
				expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
				expect(onOpenChange.mock.lastCall?.[1].reason).toBe('cancel-open');
			});
		});

		describe('change event details', () => {
			it('unmounts on a later normal close after a preventUnmountOnClose cycle and reopen', async () => {
				let preventNextUnmount = true;
				render(
					MenuHarness,
					menu({
						rootProps: {
							onOpenChange(open: boolean, details: { preventUnmountOnClose(): void }) {
								if (!open && preventNextUnmount) {
									preventNextUnmount = false;
									details.preventUnmountOnClose();
								}
							}
						}
					})
				);
				await userEvent.click(toggle());
				await expect.poll(() => menus().length).toBe(1);
				await userEvent.click(toggle());
				await expect.poll(() => toggle().hasAttribute('data-popup-open')).toBe(false);
				expect(menus().length).toBe(1);
				await userEvent.click(toggle());
				await expect.poll(() => toggle().hasAttribute('data-popup-open')).toBe(true);
				await userEvent.click(toggle());
				await expect.poll(() => menus().length).toBe(0);
			});
		});
	});
}

describe('Menu.Root keepMounted', () => {
	it('does not leave a tabbable item after tabbing out of a keepMounted menu before close', async () => {
		const view = render(
			MenuHarness,
			testMenu({
				detached: true,
				before: true,
				after: true,
				rootProps: { modal: false },
				portalProps: { keepMounted: true }
			})
		);
		toggle().focus();
		await userEvent.keyboard('{Enter}');
		const first = byTestId('item-1')!;
		await expect.poll(focused).toBe(first);
		expect(first.getAttribute('tabindex')).toBe('0');
		await userEvent.tab();
		await expect.poll(focused).toBe(page.getByRole('button', { name: 'After' }).element());
		view.component.actions().close();
		await expect.poll(() => byTestId('menu')!.hasAttribute('data-open')).toBe(false);
		expect(first.getAttribute('tabindex')).toBe('-1');
	});
});

describe.skipIf(!platform.engine.blink)('Menu.Root opening a dialog from an item', () => {
	it('keeps the dialog open after a press-drag-release activation', async () => {
		const onDialogOpenChange = vi.fn();
		const documentClicks: MouseEvent[] = [];
		render(MenuDialogHarness, { onDialogOpenChange });
		const trigger = page.getByRole('button', { name: 'Open menu' }).element();
		const frame = window.frameElement as HTMLIFrameElement | null;
		const frameRect = frame?.getBoundingClientRect();
		// The runner scales the test iframe down. CDP takes top-level page coordinates.
		const scale = frameRect && frame ? frameRect.width / frame.offsetWidth : 1;
		const offset = {
			x: (frameRect?.left ?? 0) + (frame?.clientLeft ?? 0) * scale,
			y: (frameRect?.top ?? 0) + (frame?.clientTop ?? 0) * scale
		};
		function centerOf(element: Element) {
			const rect = element.getBoundingClientRect();
			return {
				x: offset.x + (rect.left + rect.width / 2) * scale,
				y: offset.y + (rect.top + rect.height / 2) * scale
			};
		}
		const session = cdp();
		const recordClick = (event: MouseEvent) => documentClicks.push(event);
		document.addEventListener('click', recordClick, true);
		try {
			const start = centerOf(trigger);
			await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...start });
			await session.send('Input.dispatchMouseEvent', {
				type: 'mousePressed',
				...start,
				button: 'left',
				buttons: 1,
				clickCount: 1
			});
			await expect.poll(() => document.querySelector('[role="menu"][data-open]')).not.toBeNull();
			// Past the impatient-click window, so the release activates the item.
			await new Promise((resolve) => setTimeout(resolve, 200));
			const end = centerOf(page.getByRole('menuitem', { name: 'Open dialog' }).element());
			await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...end, buttons: 1 });
			await session.send('Input.dispatchMouseEvent', {
				type: 'mouseReleased',
				...end,
				button: 'left',
				buttons: 0,
				clickCount: 1
			});
			await expect.poll(() => document.querySelector('[role="menu"][data-open]')).toBeNull();
			await expect.poll(() => byTestId('dialog-popup')).not.toBeNull();
			// The browser sends the gesture's click to the common ancestor after the dialog opens.
			await expect.poll(() => documentClicks.some((event) => event.isTrusted)).toBe(true);
			await settle();
			expect(byTestId('dialog-popup')).not.toBeNull();
			expect(onDialogOpenChange).not.toHaveBeenCalledWith(false, 'outside-press');
		} finally {
			document.removeEventListener('click', recordClick, true);
		}
	});
});

describe('Menu.Root prop: highlightItemOnHover', () => {
	const three = [1, 2, 3].map((n) => ({
		type: 'item' as const,
		label: `Item ${n}`,
		props: { 'data-testid': `item-${n}` }
	}));

	it('highlights an item on mouse move by default', async () => {
		const onItemHighlighted = vi.fn();
		render(MenuHarness, {
			open: true,
			trigger: false,
			rootProps: { onItemHighlighted },
			items: three
		});
		const second = byTestId('item-2')!;
		mouse(second, 'mousemove');
		await expect.poll(focused).toBe(second);
		expect(onItemHighlighted).toHaveBeenLastCalledWith(second, {
			reason: 'pointer',
			label: 'Item 2',
			event: expect.any(Event)
		});
	});

	it('does not highlight items from mouse movement when disabled', async () => {
		render(MenuHarness, {
			open: true,
			trigger: false,
			rootProps: { highlightItemOnHover: false },
			items: three
		});
		const second = byTestId('item-2')!;
		mouse(second, 'mousemove');
		await settle();
		expect(focused()).not.toBe(second);
	});

	it('does not highlight submenu triggers from mouse enter when disabled', async () => {
		render(
			MenuHarness,
			testMenu({
				open: true,
				rootProps: { highlightItemOnHover: false },
				items: [
					{
						type: 'submenu',
						label: 'Submenu',
						triggerProps: { 'data-testid': 'submenu-trigger' },
						items: items('Nested item')
					}
				]
			})
		);
		const submenuTrigger = byTestId('submenu-trigger')!;
		mouse(submenuTrigger, 'mouseenter', { bubbles: false });
		await settle();
		expect(submenuTrigger.hasAttribute('data-highlighted')).toBe(false);
		expect(focused()).not.toBe(submenuTrigger);
	});
});

describe('Menu.Root prop: disabled', () => {
	it('marks items as disabled when controlled open', async () => {
		render(
			MenuHarness,
			testMenu({
				open: true,
				rootProps: { disabled: true },
				items: [
					{ type: 'item', label: 'Item', props: { 'data-testid': 'item' } },
					{ type: 'checkbox', label: 'Checkbox item', props: { 'data-testid': 'checkbox-item' } },
					{
						type: 'radio-group',
						items: [{ label: 'Radio item', value: 'radio', props: { 'data-testid': 'radio-item' } }]
					}
				]
			})
		);
		expect(byTestId('item')!.hasAttribute('data-disabled')).toBe(true);
		expect(byTestId('checkbox-item')!.hasAttribute('data-disabled')).toBe(true);
		expect(byTestId('radio-item')!.hasAttribute('data-disabled')).toBe(true);
	});

	it('does not highlight items with text navigation when controlled open', async () => {
		render(
			MenuHarness,
			testMenu({
				open: true,
				rootProps: { disabled: true },
				items: [
					{ type: 'item', label: 'Alpha', props: { 'data-testid': 'alpha' } },
					{ type: 'item', label: 'Beta', props: { 'data-testid': 'beta' } }
				]
			})
		);
		byTestId('alpha')!.focus();
		await userEvent.keyboard('b');
		await settle();
		expect(byTestId('beta')!.hasAttribute('data-highlighted')).toBe(false);
		expect(focused()).not.toBe(byTestId('beta'));
	});

	it('does not close or activate items when controlled open', async () => {
		const onOpenChange = vi.fn();
		const onclick = vi.fn();
		render(
			MenuHarness,
			testMenu({
				open: true,
				rootProps: { disabled: true, onOpenChange },
				items: [{ type: 'item', label: 'Item', props: { 'data-testid': 'item', onclick } }]
			})
		);
		// `force` skips Playwright's check that the `aria-disabled` item is enabled.
		await userEvent.click(byTestId('item')!, { force: true });
		expect(onclick).not.toHaveBeenCalled();
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('disables submenu triggers when controlled open', async () => {
		render(
			MenuHarness,
			testMenu({
				open: true,
				rootProps: { disabled: true },
				items: [
					{
						type: 'submenu',
						label: 'Submenu',
						triggerProps: { 'data-testid': 'submenu-trigger', openOnHover: false },
						popupProps: { 'data-testid': 'submenu-popup' },
						items: items('Nested item')
					}
				]
			})
		);
		const submenuTrigger = byTestId('submenu-trigger')!;
		expect(submenuTrigger.hasAttribute('data-disabled')).toBe(true);
		await userEvent.click(submenuTrigger, { force: true });
		await settle();
		expect(byTestId('submenu-popup')).toBeNull();
	});
});

describe('Menu.Root dynamic items', () => {
	it('skips removed items when navigating', async () => {
		let filtered = $state(false);
		render(MenuHarness, {
			triggerLabel: 'Toggle',
			rootProps: {
				onOpenChange(next: boolean) {
					if (next) setTimeout(() => (filtered = true), 0);
				},
				onOpenChangeComplete(next: boolean) {
					if (!next) filtered = false;
				}
			},
			get items() {
				return items(
					'Add to Library',
					...(filtered ? [] : ['Add to Playlist', 'Play Next', 'Play Last']),
					'Favorite',
					'Share'
				);
			}
		});
		toggle().focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => menus().length).toBe(1);
		await expect.poll(() => document.querySelectorAll('[role="menuitem"]').length).toBe(3);
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(focused).toBe(item('Add to Library'));
	});
});

describe('Menu.Root prop: onItemHighlighted', () => {
	function highlightMenu(onItemHighlighted: unknown) {
		return {
			triggerLabel: 'Toggle',
			rootProps: { onItemHighlighted },
			items: [
				...items('One', 'Two'),
				{ type: 'submenu' as const, label: 'Three', items: items('Nested') }
			]
		};
	}

	async function openWithKeyboard() {
		toggle().focus();
		await userEvent.keyboard('{Enter}');
		await expect.poll(focused).toBe(item('One'));
	}

	it('passes the keydown event for keyboard highlights', async () => {
		const onItemHighlighted = vi.fn();
		render(MenuHarness, highlightMenu(onItemHighlighted));
		await openWithKeyboard();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(focused).toBe(item('Two'));
		const details = onItemHighlighted.mock.lastCall?.[1];
		expect(details.reason).toBe('keyboard');
		expect(details.event).toBeInstanceOf(KeyboardEvent);
		expect(details.event.key).toBe('ArrowDown');
	});

	it('passes the keydown event for typeahead highlights', async () => {
		const onItemHighlighted = vi.fn();
		render(MenuHarness, highlightMenu(onItemHighlighted));
		await openWithKeyboard();
		await userEvent.keyboard('t');
		await expect.poll(focused).toBe(item('Two'));
		const details = onItemHighlighted.mock.lastCall?.[1];
		expect(details.reason).toBe('keyboard');
		expect(details.event).toBeInstanceOf(KeyboardEvent);
		expect(details.event.key).toBe('t');
	});

	it('passes native mouse and pointer events for pointer highlights', async () => {
		const onItemHighlighted = vi.fn();
		render(MenuHarness, highlightMenu(onItemHighlighted));
		toggle().click();
		await expect.poll(() => menus().length).toBe(1);
		const two = item('Two');
		const hoverEvent = new MouseEvent('mousemove', { bubbles: true });
		two.dispatchEvent(hoverEvent);
		await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBe(two);
		let details = onItemHighlighted.mock.lastCall?.[1];
		expect(details.reason).toBe('pointer');
		expect(details.event).toBe(hoverEvent);
		expect(details.event).not.toBeInstanceOf(PointerEvent);

		// React derives `onPointerLeave` from a native `pointerout`. Svelte listens to `pointerleave`.
		const leaveEvent = new PointerEvent('pointerleave', { pointerType: 'mouse' });
		two.dispatchEvent(leaveEvent);
		await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBeUndefined();
		details = onItemHighlighted.mock.lastCall?.[1];
		expect(details.reason).toBe('pointer');
		expect(details.event).toBe(leaveEvent);
	});

	it('passes the mouse event when a submenu trigger is hovered', async () => {
		const onItemHighlighted = vi.fn();
		render(MenuHarness, highlightMenu(onItemHighlighted));
		toggle().click();
		await expect.poll(() => menus().length).toBe(1);
		const three = item('Three');
		mouse(three, 'mouseenter', { bubbles: false });
		await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBe(three);
		const details = onItemHighlighted.mock.lastCall?.[1];
		expect(details.reason).toBe('pointer');
		expect(details.event).toBeInstanceOf(MouseEvent);
	});

	describe('reporting after the callback or the list changes', () => {
		function reportingMenu(state: { onItemHighlighted?: unknown; inserted?: boolean }) {
			// Bound, because a spread that changes would reset an unbound `open` written by the menu.
			return {
				triggerLabel: 'Toggle',
				bindOpen: true,
				get rootProps() {
					return { onItemHighlighted: state.onItemHighlighted };
				},
				get items() {
					return items(...(state.inserted ? ['Archive'] : []), 'One', 'Two');
				}
			};
		}

		it('does not report a stale highlight reason for a later list change', async () => {
			const onItemHighlighted = vi.fn();
			const state = $state({ onItemHighlighted, inserted: false });
			render(MenuHarness, reportingMenu(state));
			await openWithKeyboard();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(focused).toBe(item('Two'));
			expect(onItemHighlighted.mock.lastCall?.[1].reason).toBe('keyboard');
			onItemHighlighted.mockClear();
			state.inserted = true;
			await expect.poll(() => onItemHighlighted.mock.calls.length).toBeGreaterThan(0);
			expect(onItemHighlighted.mock.lastCall?.[1].reason).toBe('none');
		});

		it('reports highlights after onItemHighlighted is removed and added back', async () => {
			const onItemHighlighted = vi.fn();
			const state = $state<{ onItemHighlighted?: unknown }>({ onItemHighlighted });
			render(MenuHarness, reportingMenu(state));
			await openWithKeyboard();
			state.onItemHighlighted = undefined;
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(focused).toBe(item('Two'));
			state.onItemHighlighted = onItemHighlighted;
			await settle();
			onItemHighlighted.mockClear();
			await userEvent.keyboard('{ArrowUp}');
			await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBe(item('One'));
			expect(onItemHighlighted.mock.lastCall?.[1].reason).toBe('keyboard');
		});

		it('reports clearing a highlight made before onItemHighlighted was added', async () => {
			const onItemHighlighted = vi.fn();
			const state = $state<{ onItemHighlighted?: unknown }>({});
			render(MenuHarness, reportingMenu(state));
			await userEvent.click(toggle());
			const one = item('One');
			await userEvent.hover(one);
			await expect.poll(() => one.hasAttribute('data-highlighted')).toBe(true);
			state.onItemHighlighted = onItemHighlighted;
			await settle();
			await userEvent.unhover(one);
			await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBeUndefined();
			expect(onItemHighlighted.mock.lastCall?.[1].reason).toBe('pointer');
		});
	});
});
