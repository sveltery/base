// Assertions follow Base UI v1.9.0 packages/react/src/menu/filter-root/MenuFilterParts.test.tsx,
// MenuFilterGroup.test.tsx, MenuFilterPopup.test.tsx, MenuFilterRoot.initialHighlight.test.tsx,
// useMenuFilterItem.test.tsx, useMenuFilterSubmenuTrigger.test.tsx and
// packages/react/src/filter-dropdown/clear/FilterDropdownClear.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import MenuOrphan from '../../tests/menu/MenuOrphan.svelte';
import { mouse, pointer } from '../../tests/menu/mouse.js';
import { items, type MenuFilterSpec, type MenuItemSpec } from '../../tests/menu/types.js';

type Bag = Record<string, unknown>;

function searchbox(name = 'Filter actions') {
	return document.querySelector<HTMLInputElement>(`input[aria-label="${name}"]`);
}

function item(name: string) {
	return page.getByRole('menuitem', { name, exact: true }).element() as HTMLElement;
}

function queryItem(name: string) {
	return (
		[...document.querySelectorAll<HTMLElement>('[role^="menuitem"]')].find(
			(node) => node.textContent?.trim() === name
		) ?? null
	);
}

function byTestId(id: string) {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

function focused() {
	return document.activeElement;
}

async function frame() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

function menu(entries: MenuItemSpec[], filter: MenuFilterSpec = {}, options: Bag = {}) {
	return render(MenuHarness, {
		triggerLabel: 'Actions',
		filter,
		items: entries,
		...options
	});
}

async function openMenu(entries: MenuItemSpec[], filter: MenuFilterSpec = {}, options: Bag = {}) {
	const result = menu(entries, filter, { open: true, ...options });
	await expect.poll(() => focused()).toBe(searchbox());
	return result;
}

function trigger() {
	return page.getByRole('button', { name: 'Actions' }).element() as HTMLElement;
}

describe('Menu filter parts', () => {
	for (const part of ['Input', 'Clear', 'Empty'] as const) {
		it(`throws when <Menu.${part}> is rendered without a filter provider`, () => {
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			try {
				expect(() =>
					render(MenuOrphan, { part: part.toLowerCase() as 'input' | 'clear' | 'empty' })
				).toThrow(
					`Base UI: <Menu.${part}> must be placed in a menu wrapped in <Menu.FilterProvider>.`
				);
			} finally {
				spy.mockRestore();
			}
		});
	}

	it('exports getFilter as useFilter', async () => {
		const { Menu } = await import('../index.js');
		const filter = Menu.useFilter({ locale: 'en' });
		expect(filter.contains('Crème brûlée', 'creme')).toBe(true);
		expect(filter.startsWith('Rename', 're')).toBe(true);
		expect(filter.endsWith('Rename', 're')).toBe(false);
	});
});

describe('Menu.Clear', () => {
	it('excludes Clear from the tab order and accessibility tree', async () => {
		await openMenu(items('Rename'), { providerProps: { value: 'query' }, clear: true });
		const clear = document.querySelector('[aria-label="Clear filter"]')!;
		expect(clear.getAttribute('tabindex')).toBe('-1');
		expect(clear.getAttribute('aria-hidden')).toBe('true');
		expect(clear.getAttribute('type')).toBe('button');
		expect(page.getByRole('button', { name: 'Clear filter' }).query()).toBe(null);
	});

	it('does not render when the filter value is empty', async () => {
		await openMenu(items('Rename'), { clear: { 'data-testid': 'clear' } });
		expect(byTestId('clear')).toBe(null);
	});

	it('clears the filter value and focuses the input when clicked', async () => {
		const onValueChange = vi.fn();
		await openMenu(items('Canada', 'Chile'), {
			providerProps: { value: 'can', onValueChange },
			clear: true
		});
		await userEvent.click(page.getByLabelText('Clear filter'));
		expect(searchbox()!.value).toBe('');
		expect(focused()).toBe(searchbox());
		expect(document.querySelector('[aria-label="Clear filter"]')).toBe(null);
		expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('');
		expect(onValueChange.mock.calls.at(-1)?.[1].reason).toBe('clear-press');
	});

	it('does nothing when disabled', async () => {
		const onValueChange = vi.fn();
		await openMenu(items('Canada'), {
			providerProps: { value: 'can', onValueChange },
			clear: { disabled: true }
		});
		const clear = document.querySelector<HTMLButtonElement>('[aria-label="Clear filter"]')!;
		expect(clear.disabled).toBe(true);
		clear.click();
		await tick();
		expect(searchbox()!.value).toBe('can');
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('ignores a click on a disabled non-native button', async () => {
		const onValueChange = vi.fn();
		await openMenu(items('Canada'), {
			providerProps: { value: 'can', onValueChange },
			clear: { disabled: true, nativeButton: false }
		});
		const clear = document.querySelector<HTMLElement>('[aria-label="Clear filter"]')!;
		expect(clear.getAttribute('aria-disabled')).toBe('true');
		clear.click();
		await tick();
		expect(searchbox()!.value).toBe('can');
		expect(onValueChange).not.toHaveBeenCalled();
	});
});

describe('filtered menu groups', () => {
	it('hides a radio group, label included, when the query filters out all of its items', async () => {
		await openMenu([
			...items('Rename'),
			{
				type: 'radio-group',
				groupLabel: 'Sort by',
				props: { 'data-testid': 'sort-group', value: 'date' },
				items: [
					{ label: 'Date modified', value: 'date' },
					{ label: 'Size', value: 'size' }
				]
			}
		]);
		const group = byTestId('sort-group')!;
		expect(group.hidden).toBe(false);
		await userEvent.keyboard('rena');
		await expect.poll(() => group.hidden).toBe(true);
		expect(page.getByText('Sort by').element().checkVisibility()).toBe(false);
	});

	it('hides a group whose kept-mounted filterable submenu has its own groups', async () => {
		await openMenu([
			{
				type: 'group',
				groupLabel: 'Organize',
				props: { 'data-testid': 'organize-group' },
				items: [
					{
						type: 'submenu',
						label: 'Move to',
						portalProps: { keepMounted: true },
						filter: { inputLabel: 'Filter folders' },
						items: [{ type: 'group', groupLabel: 'Folders', items: items('Projects') }]
					}
				]
			},
			{ type: 'group', groupLabel: 'Other', items: items('Rename') }
		]);
		const group = byTestId('organize-group')!;
		expect(group.hidden).toBe(false);
		// The submenu's group must register with the submenu's query, not with the enclosing group.
		await userEvent.keyboard('rena');
		await expect.poll(() => queryItem('Move to')).toBe(null);
		await expect.poll(() => group.hidden).toBe(true);
	});
});

describe('Menu.Popup filter input focus', () => {
	const grouped: MenuItemSpec[] = [{ type: 'group', groupLabel: 'Edit', items: items('Rename') }];

	it('returns focus to the input when the list takes it from the input', async () => {
		await openMenu(grouped);
		// A press on a group or its label focuses the list, the nearest focusable ancestor.
		(document.querySelector('[role="menu"]') as HTMLElement).focus();
		expect(focused()).toBe(searchbox());
	});

	it('leaves focus on the list when the input did not have it', async () => {
		await openMenu(grouped);
		const list = document.querySelector('[role="menu"]') as HTMLElement;
		// A touch open leaves the input unfocused so the on-screen keyboard stays closed.
		searchbox()!.blur();
		list.focus();
		expect(focused()).toBe(list);
	});

	const closeKeys = [
		['vertical', 'ltr', 'ArrowLeft'],
		['vertical', 'rtl', 'ArrowRight'],
		['horizontal', 'ltr', 'ArrowUp'],
		['horizontal', 'rtl', 'ArrowUp']
	] as const;
	for (const [orientation, direction, key] of closeKeys) {
		it(`returns focus with the ${orientation} ${direction} close key`, async () => {
			await openMenu(
				items('Rename'),
				{ extra: 'Extra action' },
				{
					direction,
					rootProps: { orientation }
				}
			);
			const action = page.getByRole('button', { name: 'Extra action' }).element() as HTMLElement;
			action.focus();
			expect(focused()).toBe(action);
			action.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
			expect(focused()).toBe(searchbox());
		});
	}
});

describe('filterable menu initial highlight', () => {
	const actions: MenuItemSpec[] = [
		{ type: 'item', label: 'Unavailable', props: { disabled: true } },
		...items('Rename', 'Delete')
	];
	const withEmpty: MenuFilterSpec = { empty: 'No actions found.' };

	async function openWithKeyboard(options: Bag = {}) {
		menu(actions, { ...withEmpty, ...(options.filter as MenuFilterSpec) }, options);
		trigger().focus();
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => focused()).toBe(searchbox());
	}

	it('highlights the first enabled action and keeps the input in the arrow loop', async () => {
		await openWithKeyboard();
		const input = searchbox()!;
		expect(input.getAttribute('aria-activedescendant')).toBe(item('Rename').id);
		await userEvent.keyboard('{ArrowDown}');
		expect(input.getAttribute('aria-activedescendant')).toBe(item('Delete').id);
		await userEvent.keyboard('{ArrowDown}');
		expect(input.getAttribute('aria-activedescendant')).toBe(null);
		expect(input.hasAttribute('data-highlighted')).toBe(true);
		await userEvent.keyboard('{ArrowUp}');
		expect(input.getAttribute('aria-activedescendant')).toBe(item('Delete').id);
		await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
		expect(input.getAttribute('aria-activedescendant')).toBe(null);
		expect(focused()).toBe(input);
	});

	it('clears the initial highlight when typing and permits an empty result', async () => {
		await openWithKeyboard();
		const input = searchbox()!;
		await userEvent.keyboard('Del');
		expect(input.value).toBe('Del');
		await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(null);
		expect(queryItem('Rename')).toBe(null);
		await userEvent.keyboard('{ArrowDown}');
		expect(input.getAttribute('aria-activedescendant')).toBe(item('Delete').id);
		await userEvent.keyboard('x');
		expect(input.value).toBe('Delx');
		await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(null);
		await expect
			.poll(() => document.querySelector('[role="status"]')?.textContent)
			.toContain('No actions found.');
		expect(focused()).toBe(input);
	});

	for (const pointerType of ['mouse', 'touch', 'pen']) {
		it(`handles opening with ${pointerType}`, async () => {
			const onfocus = vi.fn();
			menu(actions, { ...withEmpty, inputProps: { onfocus } });
			const button = trigger();
			button.focus();
			pointer(button, 'pointerdown', { pointerType, isPrimary: true, width: 20, height: 20 });
			mouse(button, 'mousedown', { detail: 1 });
			pointer(button, 'pointerup', { pointerType, isPrimary: true, width: 20, height: 20 });
			mouse(button, 'mouseup', { detail: 1 });
			mouse(button, 'click', { detail: 1 });
			await expect.poll(() => searchbox()).not.toBe(null);
			await frame();
			const shouldFocus = pointerType === 'mouse';
			await expect.poll(() => searchbox()!.matches(':focus')).toBe(shouldFocus);
			expect(onfocus.mock.calls.length > 0).toBe(shouldFocus);
			expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(null);
		});
	}

	it('focuses the input when a screen reader press opens the menu', async () => {
		menu(actions, withEmpty);
		const button = trigger();
		button.focus();
		const init = { pointerType: 'touch', width: 0.333, height: 0.333, pressure: 0 };
		pointer(button, 'pointerdown', init);
		mouse(button, 'mousedown', { detail: 1 });
		pointer(button, 'pointerup', init);
		mouse(button, 'mouseup', { detail: 1 });
		mouse(button, 'click', { detail: 1 });
		await expect.poll(() => searchbox()).not.toBe(null);
		await expect.poll(() => focused()).toBe(searchbox());
	});

	it('focuses a submenu input when a screen reader press opens the submenu', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			open: true,
			items: [
				{
					type: 'submenu',
					label: 'Move to',
					triggerProps: { openOnHover: false },
					filter: { inputLabel: 'Filter destinations' },
					items: items('Documents')
				}
			]
		});
		const submenuTrigger = item('Move to');
		const init = { pointerType: 'touch', width: 0.333, height: 0.333, pressure: 0 };
		pointer(submenuTrigger, 'pointerdown', init);
		mouse(submenuTrigger, 'mousedown', { detail: 1 });
		pointer(submenuTrigger, 'pointerup', init);
		mouse(submenuTrigger, 'mouseup', { detail: 1 });
		mouse(submenuTrigger, 'click', { detail: 1 });
		await expect.poll(() => searchbox('Filter destinations')).not.toBe(null);
		await expect.poll(() => focused()).toBe(searchbox('Filter destinations'));
	});

	it('does not focus the input when an item is tapped after a touch open', async () => {
		const onfocus = vi.fn();
		menu(actions, { ...withEmpty, inputProps: { onfocus } });
		const button = trigger();
		const touch = { pointerType: 'touch', isPrimary: true, width: 20, height: 20 };
		pointer(button, 'pointerdown', touch);
		mouse(button, 'mousedown', { detail: 1 });
		pointer(button, 'pointerup', touch);
		mouse(button, 'mouseup', { detail: 1 });
		mouse(button, 'click', { detail: 1 });
		await expect.poll(() => queryItem('Rename')).not.toBe(null);
		await frame();

		const rename = item('Rename');
		pointer(rename, 'pointerdown', touch);
		pointer(rename, 'pointerup', touch);
		mouse(rename, 'mouseover');
		mouse(rename, 'mousemove');
		await frame();
		expect(focused()).not.toBe(searchbox());
		expect(onfocus).not.toHaveBeenCalled();
	});

	it('does not focus the input when opened on hover', async () => {
		const onfocus = vi.fn();
		menu(
			actions,
			{ ...withEmpty, inputProps: { onfocus } },
			{
				trigger: { openOnHover: true, delay: 0 }
			}
		);
		await userEvent.hover(page.getByRole('button', { name: 'Actions' }));
		await expect.poll(() => searchbox()).not.toBe(null);
		await frame();
		expect(focused()).not.toBe(searchbox());
		expect(onfocus).not.toHaveBeenCalled();
	});

	it('highlights the first action again when reopening', async () => {
		await openWithKeyboard();
		await userEvent.keyboard('{ArrowDown}{Escape}');
		await expect.poll(() => focused()).toBe(trigger());
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => focused()).toBe(searchbox());
		expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(item('Rename').id);
	});

	it('does not highlight an item when a controlled open follows a keyboard open', async () => {
		const screen = menu(items('Rename', 'Delete'), {}, { bindOpen: true });
		trigger().focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect
			.poll(() => searchbox()?.getAttribute('aria-activedescendant'))
			.toBe(queryItem('Rename')?.id);
		await screen.rerender({ open: false });
		await expect.poll(() => searchbox()).toBe(null);
		await screen.rerender({ open: true });
		await expect.poll(() => searchbox()).not.toBe(null);
		await frame();
		expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(null);
	});
});

describe('filtered Menu items', () => {
	it('keeps focus on the input when items are pressed', async () => {
		const onClick = vi.fn();
		await openMenu([
			{ type: 'item', label: 'Rename', props: { closeOnClick: false, onclick: onClick } },
			{ type: 'link', label: 'Open details', props: { href: '#details' } },
			{ type: 'checkbox', label: 'Show details' },
			{ type: 'radio-group', items: [{ label: 'Sort by date', value: 'date' }] }
		]);
		const input = searchbox()!;
		await userEvent.click(page.getByRole('menuitem', { name: 'Rename' }));
		expect(focused()).toBe(input);
		expect(onClick).toHaveBeenCalledTimes(1);

		await userEvent.click(page.getByRole('menuitem', { name: 'Open details' }));
		expect(focused()).toBe(input);

		await userEvent.click(page.getByRole('menuitemcheckbox', { name: 'Show details' }));
		expect(focused()).toBe(input);
		expect(queryItem('Show details')!.getAttribute('aria-checked')).toBe('true');

		await userEvent.click(page.getByRole('menuitemradio', { name: 'Sort by date' }));
		expect(focused()).toBe(input);
		expect(queryItem('Sort by date')!.getAttribute('aria-checked')).toBe('true');
	});

	it('matches text that a descendant rendered after the item registered', async () => {
		await openMenu(items('Loading', 'Delete'));
		item('Loading').firstChild!.nodeValue = 'Rename';
		await userEvent.keyboard('rename');
		await expect.poll(() => queryItem('Delete')).toBe(null);
		expect(queryItem('Rename')).not.toBe(null);
	});

	it('stops matching text that a descendant no longer renders', async () => {
		await openMenu([
			{ type: 'item', label: 'Rename', props: { 'data-testid': 'async-item' } },
			...items('Delete')
		]);
		byTestId('async-item')!.firstChild!.nodeValue = '';
		await userEvent.keyboard('rename');
		await expect.poll(() => byTestId('async-item')).toBe(null);
	});

	it('keeps the rendered text of an item while it is filtered out', async () => {
		await openMenu(items('Rename', 'Delete'));
		await userEvent.keyboard('del');
		await expect.poll(() => queryItem('Rename')).toBe(null);
		await userEvent.keyboard('{Control>}a{/Control}rena');
		await expect.poll(() => queryItem('Rename')).not.toBe(null);
		expect(queryItem('Delete')).toBe(null);
	});

	it('keeps a disabled item reachable with the arrow keys', async () => {
		await openMenu([
			...items('Rename'),
			{ type: 'item', label: 'Archive', props: { disabled: true } },
			...items('Delete')
		]);
		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(item('Archive').id);
	});

	it('does not activate a highlighted disabled item with Enter', async () => {
		const onDisabledClick = vi.fn();
		await openMenu([
			...items('Rename'),
			{ type: 'item', label: 'Archive', props: { disabled: true, onclick: onDisabledClick } },
			...items('Delete')
		]);
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
		expect(onDisabledClick).not.toHaveBeenCalled();
		expect(document.querySelector('[role="menu"]')).not.toBe(null);
	});
});

describe('Menu.SubmenuTrigger in a filterable menu', () => {
	it('keeps real focus on the parent input until the submenu opens', async () => {
		await openMenu([
			...items('Rename'),
			{
				type: 'submenu',
				label: 'Move to folder',
				triggerProps: { openOnHover: false },
				filter: { inputLabel: 'Filter folders' },
				items: items('Documents')
			}
		]);
		const input = searchbox()!;
		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		const submenuTrigger = item('Move to folder');
		expect(input.getAttribute('aria-activedescendant')).toBe(submenuTrigger.id);
		expect(submenuTrigger.getAttribute('tabindex')).toBe('-1');
		expect(focused()).toBe(input);
		await userEvent.click(submenuTrigger);
		await expect.poll(() => focused()).toBe(searchbox('Filter folders'));
	});

	it('reports a menu popup on a trigger whose submenu has no filter', async () => {
		await openMenu([{ type: 'submenu', label: 'Sort by', items: items('Name') }]);
		expect(item('Sort by').getAttribute('aria-haspopup')).toBe('menu');
	});

	it('lets a consumer override aria-haspopup', async () => {
		await openMenu([
			{
				type: 'submenu',
				label: 'Move to',
				triggerProps: { 'aria-haspopup': 'menu' },
				filter: { inputLabel: 'Filter folders' },
				items: items('Projects')
			}
		]);
		expect(item('Move to').getAttribute('aria-haspopup')).toBe('menu');
	});

	it('lets a consumer override aria-haspopup on the root trigger', async () => {
		menu(items('Rename'), {}, { trigger: { 'aria-haspopup': 'menu' } });
		expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
	});
});
