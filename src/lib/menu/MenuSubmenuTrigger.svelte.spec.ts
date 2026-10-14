// Assertions follow Base UI v1.9.0 packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import MenuOrphan from '../../tests/menu/MenuOrphan.svelte';
import { items, type MenuItemSpec } from '../../tests/menu/types.js';

function byTestId(id: string, root: ParentNode = document) {
	return root.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
}

function item(name: string) {
	return page.getByRole('menuitem', { name, exact: true }).element() as HTMLElement;
}

function focused() {
	return document.activeElement;
}

async function frame() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

function dispatch(target: Element, event: Event) {
	target.dispatchEvent(event);
}

/** A touch tap: the pointer events, then the compatibility mouse events with `detail: 1`. */
function tap(target: Element) {
	const pointer = { bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: true };
	dispatch(target, new PointerEvent('pointerdown', pointer));
	dispatch(target, new PointerEvent('pointerup', pointer));
	const mouse = { bubbles: true, cancelable: true, detail: 1 };
	dispatch(target, new MouseEvent('mousedown', mouse));
	dispatch(target, new MouseEvent('mouseup', mouse));
	dispatch(target, new MouseEvent('click', mouse));
}

function more(extra: Partial<Extract<MenuItemSpec, { type: 'submenu' }>> = {}): MenuItemSpec {
	return {
		type: 'submenu',
		label: 'More',
		popupProps: { 'data-testid': 'submenu' },
		items: items('Alpha'),
		...extra
	};
}

describe('Menu.SubmenuTrigger', () => {
	for (const key of ['Enter', 'Space']) {
		it(`keeps a hover-opened submenu open when pressing ${key}`, async () => {
			render(MenuHarness, {
				triggerLabel: 'Actions',
				popupProps: { 'data-testid': 'parent-menu' },
				items: [more()]
			});
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => document.querySelector('[role="menuitem"]')).not.toBeNull();
			const trigger = item('More');
			await userEvent.hover(trigger);
			await expect.poll(() => byTestId('submenu')).not.toBeNull();
			await expect.poll(focused).toBe(trigger);
			await userEvent.keyboard(key === 'Space' ? ' ' : '{Enter}');
			await frame();
			expect(byTestId('submenu')).not.toBeNull();
			expect(byTestId('parent-menu')).not.toBeNull();
		});
	}

	it('closes a touch-opened submenu on a second tap', async () => {
		render(MenuHarness, {
			open: true,
			trigger: false,
			popupProps: { 'data-testid': 'parent-menu' },
			items: [more()]
		});
		const trigger = item('More');
		tap(trigger);
		await expect.poll(() => byTestId('submenu')).not.toBeNull();
		await frame();
		tap(trigger);
		await expect.poll(() => byTestId('submenu')).toBeNull();
		expect(byTestId('parent-menu')).not.toBeNull();
	});

	async function openWithKeyboard() {
		await userEvent.keyboard('{Tab}{Enter}');
		const trigger = item('More');
		await expect.poll(focused).toBe(trigger);
		await userEvent.keyboard('{ArrowRight}');
		return trigger;
	}

	it('keeps a submenu open on direct trigger focus but closes it on guard return', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			popupProps: { 'data-testid': 'parent-menu' },
			items: [more(), { type: 'item', label: 'Play Next' }]
		});
		const trigger = await openWithKeyboard();
		const alpha = item('Alpha');
		await expect.poll(focused).toBe(alpha);

		trigger.focus();
		await tick();
		expect(byTestId('submenu')).not.toBeNull();

		alpha.focus();
		const guard = byTestId('submenu')!.parentElement?.querySelector<HTMLElement>(
			'[data-base-ui-focus-guard][data-type="inside"]'
		);
		expect(guard).toBeTruthy();
		guard!.focus();
		await expect.poll(focused).toBe(trigger);
		await expect.poll(() => byTestId('submenu')).toBeNull();
		expect(byTestId('parent-menu')).not.toBeNull();

		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(focused).toBe(item('Play Next'));
	});

	it('closes the menus without an error when Tab leaves a nested submenu', async () => {
		const errors: string[] = [];
		const onError = (event: ErrorEvent) => errors.push(event.message);
		window.addEventListener('error', onError);
		try {
			render(MenuHarness, {
				triggerLabel: 'Actions',
				after: true,
				rootProps: { modal: false },
				items: [
					more({
						items: [
							{
								type: 'submenu',
								label: 'Deeper',
								popupProps: { 'data-testid': 'nested-submenu' },
								items: items('Omega')
							}
						]
					})
				]
			});
			page.getByRole('button', { name: 'Actions' }).element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(focused).toBe(item('More'));
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(focused).toBe(item('Deeper'));
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(focused).toBe(item('Omega'));
			await userEvent.keyboard('{Tab}');
			await expect.poll(focused).toBe(page.getByRole('button', { name: 'After' }).element());
			await expect.poll(() => document.querySelectorAll('[role="menu"]').length).toBe(0);
			expect(errors).toEqual([]);
		} finally {
			window.removeEventListener('error', onError);
		}
	});

	it('follows a submenu trigger id change', async () => {
		let id = $state('first');
		render(MenuHarness, {
			open: true,
			trigger: false,
			get items() {
				return [more({ triggerProps: { id } })];
			}
		});
		const trigger = item('More');
		expect(trigger.id).toBe('first');
		id = 'second';
		await tick();
		expect(trigger.id).toBe('second');
		trigger.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => byTestId('submenu')).not.toBeNull();
		const submenu = byTestId('submenu')!;
		expect(trigger.getAttribute('aria-controls')).toBe(submenu.id);
		expect(submenu.getAttribute('aria-labelledby')).toBe('second');
	});

	it('throws when rendered outside Menu.SubmenuRoot', () => {
		expect(() => render(MenuOrphan, { part: 'bare-submenu-trigger' })).toThrow(
			'Base UI: <Menu.SubmenuTrigger> must be placed in <Menu.SubmenuRoot>.'
		);
	});

	it('throws when Menu.SubmenuRoot is rendered outside a menu', () => {
		expect(() => render(MenuOrphan, { part: 'submenu-root' })).toThrow(
			'Base UI: MenuRootContext is missing.'
		);
	});

	const directions = [
		{ direction: 'ltr', openKey: 'ArrowRight' },
		{ direction: 'rtl', openKey: 'ArrowLeft' }
	] as const;

	function numbered(direction: 'ltr' | 'rtl') {
		return {
			open: true,
			triggerLabel: 'Open menu',
			direction,
			items: [...items('1'), { type: 'submenu' as const, label: '2', items: items('2.1', '2.2') }]
		};
	}

	for (const { direction, openKey } of directions) {
		it(`opens the submenu with ${openKey} and highlights a single item in ${direction} direction`, async () => {
			render(MenuHarness, numbered(direction));
			const submenuTrigger = item('2');
			submenuTrigger.focus();
			await userEvent.keyboard(`{${openKey}}`);
			await expect.poll(focused).toBe(item('2.1'));
			const highlighted = [...document.querySelectorAll('[role="menuitem"]')].filter((node) =>
				node.hasAttribute('data-highlighted')
			);
			expect(highlighted).toEqual([item('2.1')]);
		});
	}

	it('sets tabindex to 0 on the submenu trigger after opening the submenu with a keydown', async () => {
		render(MenuHarness, numbered('ltr'));
		const submenuTrigger = item('2');
		submenuTrigger.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => submenuTrigger.getAttribute('tabindex')).toBe('0');
	});

	it('uses the label prop for text navigation', async () => {
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [
				...items('Alpha'),
				more({
					label: 'More',
					triggerProps: { 'data-testid': 'submenu-trigger', label: 'Reports' }
				})
			]
		});
		item('Alpha').focus();
		await userEvent.keyboard('r');
		await expect.poll(focused).toBe(byTestId('submenu-trigger'));
	});

	describe('prop: disabled', () => {
		it('renders disabled attributes when disabled', () => {
			render(MenuHarness, {
				open: true,
				triggerLabel: 'Open menu',
				items: [
					...items('1'),
					{
						type: 'submenu',
						label: 'Open submenu',
						triggerProps: { disabled: true },
						popupProps: { 'data-testid': 'submenu-popup' },
						items: items('2.1', '2.2')
					}
				]
			});
			const submenuTrigger = item('Open submenu');
			expect(submenuTrigger.hasAttribute('data-disabled')).toBe(true);
			expect(submenuTrigger.getAttribute('aria-disabled')).toBe('true');
		});

		it('does not open on hover when disabled', async () => {
			render(MenuHarness, {
				open: true,
				triggerLabel: 'Open menu',
				items: [
					...items('1'),
					{
						type: 'submenu',
						label: 'Open submenu',
						triggerProps: { disabled: true, delay: 0 },
						popupProps: { 'data-testid': 'submenu-popup' },
						items: items('2.1', '2.2')
					}
				]
			});
			await userEvent.hover(item('Open submenu'));
			await frame();
			expect(byTestId('submenu-popup')).toBeNull();
		});
	});
});
