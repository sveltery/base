// Assertions follow Base UI v1.9.0 packages/react/src/menu/list/MenuList.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import MenuListTriggersHarness from '../../tests/menu/MenuListTriggersHarness.svelte';
import { parkPointer } from '../../tests/pointer.js';
import { items, type MenuItemSpec } from '../../tests/menu/types.js';

type Bag = Record<string, unknown>;

function input() {
	return document.querySelector('input') as HTMLInputElement;
}

function item(name: string) {
	return page.getByRole('menuitem', { name, exact: true }).element() as HTMLElement;
}

function byTestId(id: string) {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

function focused() {
	return document.activeElement;
}

function keyDown(target: Element, key: string) {
	return target.dispatchEvent(
		new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
	);
}

async function filterable(entries: MenuItemSpec[], options: Bag = {}) {
	const result = render(MenuHarness, {
		triggerLabel: 'Actions',
		open: true,
		items: entries,
		...options,
		filter: { listProps: { 'data-testid': 'list' }, ...(options.filter as Bag) }
	});
	await expect.poll(() => focused()).toBe(input());
	return result;
}

beforeEach(parkPointer);

describe('Menu.List', () => {
	it('replays keys from an item that holds real focus and activates on Enter', async () => {
		const onClick = vi.fn();
		await filterable([
			{ type: 'item', label: 'Rename' },
			{ type: 'item', label: 'Delete', props: { onclick: onClick } }
		]);
		await userEvent.keyboard('{ArrowDown}');
		expect(input().getAttribute('aria-activedescendant')).toBe(item('Rename').id);

		// A screen reader following `aria-activedescendant` moves real focus onto the item.
		item('Rename').focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => input().getAttribute('aria-activedescendant')).toBe(item('Delete').id);
		expect(focused()).toBe(input());

		const field = input();
		item('Delete').focus();
		await userEvent.keyboard('{Enter}');
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(field.value).toBe('');
	});

	it('clears the highlight when focus returns to the input from an item', async () => {
		await filterable(items('Rename', 'Delete'));
		await userEvent.keyboard('{ArrowDown}');
		const rename = item('Rename');
		expect(input().getAttribute('aria-activedescendant')).toBe(rename.id);
		rename.focus();
		input().focus();
		await tick();
		expect(input().getAttribute('aria-activedescendant')).toBe(null);
		expect(rename.hasAttribute('data-highlighted')).toBe(false);
	});

	it('keeps the highlight when focus returns to the input with autoHighlight="always"', async () => {
		await filterable(items('Rename', 'Delete'), {
			filter: { providerProps: { autoHighlight: 'always' } }
		});
		const rename = item('Rename');
		await expect.poll(() => input().getAttribute('aria-activedescendant')).toBe(rename.id);
		rename.focus();
		input().focus();
		await tick();
		expect(input().getAttribute('aria-activedescendant')).toBe(rename.id);
	});

	it('keeps virtual focus on the input without making the list tabbable', async () => {
		await filterable(items('Apple', 'Banana'));
		const list = byTestId('list')!;
		const apple = item('Apple');
		expect(list.hasAttribute('aria-hidden')).toBe(false);
		expect(list.getAttribute('tabindex')).toBe('-1');
		expect(apple.getAttribute('tabindex')).toBe('-1');
		expect(apple.hasAttribute('aria-expanded')).toBe(false);
		await userEvent.keyboard('{ArrowDown}');
		expect(input().getAttribute('aria-activedescendant')).toBe(apple.id);
		expect(focused()).toBe(input());
	});

	describe('keys on a focused list', () => {
		// Focus the list takes from the input goes straight back to it, so start from focus that
		// reached the list another way, such as a screen reader or a touch press.
		function focusList() {
			input().blur();
			byTestId('list')!.focus();
		}

		it('replays navigation keys on the input instead of scrolling', async () => {
			await filterable(items('Apple', 'Banana'));
			focusList();
			expect(focused()).toBe(byTestId('list'));
			expect(keyDown(byTestId('list')!, 'ArrowDown')).toBe(false);
			await expect.poll(() => input().getAttribute('aria-activedescendant')).toBe(item('Apple').id);
			expect(focused()).toBe(input());
		});

		it('commits the highlighted item when Enter lands on the list', async () => {
			const onPress = vi.fn();
			await filterable([
				{ type: 'item', label: 'Apple', props: { onclick: onPress } },
				{ type: 'item', label: 'Banana' }
			]);
			await userEvent.keyboard('{ArrowDown}');
			expect(input().getAttribute('aria-activedescendant')).toBe(item('Apple').id);
			focusList();
			keyDown(byTestId('list')!, 'Enter');
			expect(onPress).toHaveBeenCalledTimes(1);
		});

		it('still closes the menu with Escape', async () => {
			await filterable(items('Apple', 'Banana'));
			focusList();
			keyDown(byTestId('list')!, 'Escape');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBe(null);
		});

		it('hands typing keys back to the input', async () => {
			await filterable(items('Apple', 'Banana'));
			focusList();
			// Not canceled, so the native default action types into the refocused input.
			expect(keyDown(byTestId('list')!, 'z')).toBe(true);
			expect(focused()).toBe(input());
		});
	});
});

describe('filterable menu list semantics', () => {
	function entries(secondId?: string): MenuItemSpec[] {
		return [
			{ type: 'item', label: 'First', props: { id: 'first-item' } },
			{ type: 'item', label: 'Second', props: secondId ? { id: secondId } : {} }
		];
	}

	it('reads an item id when navigating to it', async () => {
		const screen = await filterable(entries('old-id'), {
			filter: { providerProps: { autoHighlight: 'always' } }
		});
		await expect.poll(() => input().getAttribute('aria-activedescendant')).toBe('first-item');
		await screen.rerender({ items: entries('new-id') });
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => input().getAttribute('aria-activedescendant')).toBe('new-id');
	});

	it('exposes horizontal navigation on the menu instead of the dialog', async () => {
		await filterable(entries('second-item'), {
			rootProps: { orientation: 'horizontal' },
			filter: { providerProps: { autoHighlight: 'always' } }
		});
		expect(document.querySelector('[role="menu"]')!.getAttribute('aria-orientation')).toBe(
			'horizontal'
		);
		expect(document.querySelector('[role="dialog"]')!.hasAttribute('aria-orientation')).toBe(false);
		await expect.poll(() => input().getAttribute('aria-activedescendant')).toBe('first-item');
		await userEvent.keyboard('{ArrowRight}');
		expect(input().getAttribute('aria-activedescendant')).toBe('second-item');
	});

	describe('horizontal list without autoHighlight', () => {
		const horizontal: MenuItemSpec[] = [
			{ type: 'item', label: 'Alpha', props: { id: 'alpha' } },
			{ type: 'item', label: 'Apple', props: { id: 'apple' } },
			{ type: 'item', label: 'Beta', props: { id: 'beta' } }
		];

		it('enters the results with the vertical arrows after typing', async () => {
			await filterable(horizontal, { rootProps: { orientation: 'horizontal' } });
			await userEvent.keyboard('p');
			await expect.poll(() => document.getElementById('beta')).toBe(null);
			// Left and Right keep moving the caret while nothing is highlighted.
			await userEvent.keyboard('{ArrowLeft}');
			expect(input().getAttribute('aria-activedescendant')).toBe(null);
			await userEvent.keyboard('{ArrowDown}');
			expect(input().getAttribute('aria-activedescendant')).toBe('alpha');
			await userEvent.keyboard('{ArrowRight}');
			expect(input().getAttribute('aria-activedescendant')).toBe('apple');
			await userEvent.keyboard('{ArrowLeft}');
			expect(input().getAttribute('aria-activedescendant')).toBe('alpha');
		});

		it('enters the results from the end with ArrowUp', async () => {
			await filterable(horizontal, { rootProps: { orientation: 'horizontal' } });
			await userEvent.keyboard('{ArrowUp}');
			expect(input().getAttribute('aria-activedescendant')).toBe('beta');
		});

		it('highlights the first item when opened from the trigger with ArrowDown', async () => {
			render(MenuHarness, {
				triggerLabel: 'Actions',
				rootProps: { orientation: 'horizontal' },
				filter: {},
				items: horizontal
			});
			(page.getByRole('button', { name: 'Actions' }).element() as HTMLElement).focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => input()?.getAttribute('aria-activedescendant')).toBe('alpha');
		});
	});
});

describe('Menu.List in a plain menu', () => {
	function plain(options: Bag = {}) {
		return render(MenuHarness, {
			triggerLabel: 'Actions',
			popupProps: { 'data-testid': 'popup' },
			list: { 'data-testid': 'list' },
			items: [
				{ type: 'item', label: 'Rename', props: { 'data-testid': 'item-1' } },
				{ type: 'item', label: 'Delete', props: { 'data-testid': 'item-2' } }
			],
			...options
		});
	}

	it('takes the menu role and label from the popup', async () => {
		plain();
		const trigger = page.getByRole('button', { name: 'Actions' }).element();
		await userEvent.click(trigger);
		await expect.poll(() => byTestId('list')).not.toBe(null);
		const list = byTestId('list')!;
		expect(list.getAttribute('role')).toBe('menu');
		expect(list.getAttribute('aria-labelledby')).toBe(trigger.id);
		expect(byTestId('popup')!.getAttribute('role')).toBe('presentation');
		expect(byTestId('popup')!.hasAttribute('aria-labelledby')).toBe(false);
		expect(trigger.getAttribute('aria-controls')).toBe(list.id);
	});

	it('updates the trigger when the open list changes its id', async () => {
		const screen = plain({ open: true, list: { 'data-testid': 'list', id: 'old-list' } });
		const trigger = page.getByRole('button', { name: 'Actions' }).element();
		await expect.poll(() => trigger.getAttribute('aria-controls')).toBe('old-list');
		await screen.rerender({ open: true, list: { 'data-testid': 'list', id: 'new-list' } });
		await expect.poll(() => trigger.getAttribute('aria-controls')).toBe('new-list');
	});

	it('renders the orientation on the list', async () => {
		plain({ rootProps: { orientation: 'horizontal' } });
		await userEvent.click(page.getByRole('button', { name: 'Actions' }));
		await expect.poll(() => byTestId('list')).not.toBe(null);
		expect(byTestId('list')!.getAttribute('aria-orientation')).toBe('horizontal');
		expect(byTestId('popup')!.hasAttribute('aria-orientation')).toBe(false);
	});

	it('navigates the items with the keyboard', async () => {
		plain();
		(page.getByRole('button', { name: 'Actions' }).element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => focused()).toBe(byTestId('item-1'));
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => focused()).toBe(byTestId('item-2'));
	});

	it('focuses the list rather than the presentational popup on a pointer open', async () => {
		plain();
		await userEvent.click(page.getByRole('button', { name: 'Actions' }));
		await expect.poll(() => focused()).toBe(byTestId('list'));
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => focused()).toBe(byTestId('item-1'));
	});

	it('does not point an inactive trigger at the list', async () => {
		render(MenuListTriggersHarness);
		const first = page.getByRole('button', { name: 'First' }).element();
		const second = page.getByRole('button', { name: 'Second' }).element();
		await userEvent.click(first);
		await expect.poll(() => byTestId('list')).not.toBe(null);
		expect(first.getAttribute('aria-controls')).toBe(byTestId('list')!.id);
		expect(second.hasAttribute('aria-controls')).toBe(false);
	});

	it('enters the list from the end with ArrowUp after a pointer open without looping', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			rootProps: { loopFocus: false },
			list: { 'data-testid': 'list' },
			items: items('Rename', 'Duplicate', 'Delete')
		});
		await userEvent.click(page.getByRole('button', { name: 'Actions' }));
		await expect.poll(() => focused()).toBe(byTestId('list'));
		await userEvent.keyboard('{ArrowUp}');
		await expect.poll(() => focused()).toBe(item('Delete'));
	});
});
