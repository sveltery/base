// Assertions follow Base UI v1.9.0 packages/react/src/menu/filter-root/MenuFilterRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import MenuListTriggersHarness from '../../tests/menu/MenuListTriggersHarness.svelte';
import MenuPaletteHarness from '../../tests/menu/MenuPaletteHarness.svelte';
import { mouse, pointer } from '../../tests/menu/mouse.js';
import { parkPointer } from '../../tests/pointer.js';
import { items, type MenuFilterSpec, type MenuItemSpec } from '../../tests/menu/types.js';

type Bag = Record<string, unknown>;

function input(name = 'Filter actions') {
	return page.getByRole('searchbox', { name }).element() as HTMLInputElement;
}

function item(name: string) {
	return page.getByRole('menuitem', { name, exact: true }).element() as HTMLElement;
}

function queryItem(name: string) {
	return (
		[...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
			(node) => node.textContent?.trim() === name
		) ?? null
	);
}

function itemNames() {
	return [...document.querySelectorAll('[role="menuitem"]')].map((node) =>
		node.textContent?.trim()
	);
}

function activeDescendant(name = 'Filter actions') {
	return input(name).getAttribute('aria-activedescendant');
}

function highlightedNames() {
	return [...document.querySelectorAll('[role="menuitem"][data-highlighted]')].map((node) =>
		node.textContent?.trim()
	);
}

function focused() {
	return document.activeElement;
}

async function frame() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

function filterable(
	entries: MenuItemSpec[],
	options: {
		filter?: MenuFilterSpec;
		rootProps?: Bag;
		open?: boolean;
		[prop: string]: unknown;
	} = {}
) {
	const { filter = {}, rootProps, open = true, ...rest } = options;
	return render(MenuHarness, {
		triggerLabel: 'Actions',
		open,
		rootProps,
		filter,
		items: entries,
		...rest
	});
}

async function openWithInput(entries: MenuItemSpec[], filter: MenuFilterSpec = {}) {
	const result = filterable(entries, { filter });
	await expect.poll(() => focused()).toBe(input());
	return result;
}

describe('Menu.FilterProvider', () => {
	beforeEach(parkPointer);

	describe('opening with a query', () => {
		it('keeps only the matching items mounted', async () => {
			filterable(items('Rename', 'Copy'), {
				open: false,
				filter: { providerProps: { value: 'e' } }
			});
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(itemNames).toEqual(['Rename']);
			expect(input().value).toBe('e');
		});
	});

	describe('filtering', () => {
		it('highlights the first item while keeping input focus when opened with the keyboard', async () => {
			filterable(items('Rename'), { open: false });
			const trigger = page.getByRole('button', { name: 'Actions' }).element() as HTMLElement;
			trigger.focus();
			await userEvent.keyboard('{Enter}');
			await expect.poll(() => focused()).toBe(input());
			await expect.poll(() => activeDescendant()).toBe(item('Rename').id);
			expect(input().hasAttribute('data-highlighted')).toBe(false);
		});

		it('marks the input focus-visible when the menu is opened with a pointer', async () => {
			filterable(items('Rename'), { open: false });
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => focused()).toBe(input());
			expect(input().hasAttribute('data-highlighted')).toBe(true);
			expect(activeDescendant()).toBe(null);
		});

		it('filters items and selects the active item while focus remains on the input', async () => {
			const onRename = vi.fn();
			const onClick = vi.fn();
			await openWithInput([
				{ type: 'item', label: 'Rename', props: { onclick: onRename } },
				{ type: 'item', label: 'Duplicate', props: { onclick: onClick } },
				{ type: 'item', label: 'Delete', props: { onclick: onClick } }
			]);
			await userEvent.keyboard('ren');
			await expect.poll(itemNames).toEqual(['Rename']);
			expect(activeDescendant()).toBe(null);

			await userEvent.keyboard('{ArrowDown}');
			expect(activeDescendant()).toBe(item('Rename').id);
			expect(focused()).toBe(input());

			await userEvent.keyboard('{Enter}');
			expect(onRename).toHaveBeenCalledTimes(1);
			expect(onClick).toHaveBeenCalledTimes(0);
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBe(null);
		});

		it('uses dialog semantics for the popup and menu semantics for the list', async () => {
			await openWithInput(items('Rename'));
			const popup = document.querySelector('[role="dialog"]') as HTMLElement;
			const list = document.querySelector('[role="menu"]') as HTMLElement;
			const trigger = page.getByRole('button', { name: 'Actions' }).element();
			expect(popup).not.toBe(null);
			expect(popup.getAttribute('aria-labelledby')).toBe(trigger.id);
			expect(list.getAttribute('aria-labelledby')).toBe(trigger.id);
			expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
			expect(input().getAttribute('aria-controls')).toBe(list.id);
			expect(input().getAttribute('role')).toBe('searchbox');
			expect(input().getAttribute('autocomplete')).toBe('off');
		});

		it('moves focus past the menu when tabbing from the input', async () => {
			filterable(items('Rename', 'Duplicate'), {
				rootProps: { modal: false },
				after: true
			});
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('{Tab}');
			await expect
				.poll(() => focused())
				.toBe(page.getByRole('button', { name: 'After' }).element());
		});

		it('uses the configured locale for default matching', async () => {
			filterable(items('Istanbul'), { filter: { providerProps: { value: 'ı', locale: 'tr' } } });
			await expect.poll(itemNames).toEqual(['Istanbul']);
		});

		it('keeps Home and End as caret keys until an item is highlighted', async () => {
			await openWithInput(items('Rename'), { providerProps: { value: 'rename' } });
			input().setSelectionRange(3, 3);
			await userEvent.keyboard('{Home}');
			expect(input().selectionStart).toBe(0);
			expect(activeDescendant()).toBe(null);
			await userEvent.keyboard('{End}');
			expect(input().selectionStart).toBe(6);
			expect(activeDescendant()).toBe(null);
		});

		it('keeps the caret keys while a query is highlighted automatically', async () => {
			await openWithInput(items('Rename', 'Remove'), { providerProps: { autoHighlight: true } });
			await userEvent.keyboard('rem');
			await expect.poll(() => activeDescendant()).toBe(item('Remove').id);
			await userEvent.keyboard('{ArrowLeft}');
			expect(input().selectionStart).toBe(2);
			await userEvent.keyboard('{Home}');
			expect(input().selectionStart).toBe(0);
			await userEvent.keyboard('{ArrowRight}');
			expect(input().selectionStart).toBe(1);
			expect(activeDescendant()).toBe(item('Remove').id);
		});

		it('keeps the caret keys after navigating to an item while the query is not empty', async () => {
			await openWithInput(items('Rename', 'Remove'));
			await userEvent.keyboard('re{ArrowDown}');
			expect(activeDescendant()).toBe(item('Rename').id);
			await userEvent.keyboard('{ArrowLeft}');
			expect(input().selectionStart).toBe(1);
			await userEvent.keyboard('{End}');
			expect(input().selectionStart).toBe(2);
			expect(activeDescendant()).toBe(item('Rename').id);
		});

		it('uses Home and End for list navigation after an item is highlighted', async () => {
			await openWithInput(items('Rename', 'Duplicate', 'Delete'));
			await userEvent.keyboard('{ArrowDown}{ArrowDown}');
			expect(activeDescendant()).toBe(item('Duplicate').id);
			await userEvent.keyboard('{Home}');
			expect(activeDescendant()).toBe(item('Rename').id);
			await userEvent.keyboard('{End}');
			expect(activeDescendant()).toBe(item('Delete').id);
		});

		it('hides a group, label included, when the query filters out all of its items', async () => {
			await openWithInput([
				{
					type: 'group',
					groupLabel: 'File',
					props: { 'data-testid': 'file-group' },
					items: items('Save')
				},
				{
					type: 'group',
					groupLabel: 'Manage',
					props: { 'data-testid': 'manage-group' },
					items: items('Rename')
				}
			]);
			const fileGroup = page.getByTestId('file-group').element() as HTMLElement;
			const manageGroup = page.getByTestId('manage-group').element() as HTMLElement;
			await userEvent.keyboard('ren');
			await expect.poll(() => fileGroup.hidden).toBe(true);
			expect(manageGroup.hidden).toBe(false);
			expect(itemNames()).toEqual(['Rename']);

			await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');
			await expect.poll(() => fileGroup.hidden).toBe(false);
			expect(itemNames()).toEqual(['Save', 'Rename']);
		});

		it('keeps a group with no registered items visible while filtering', async () => {
			await openWithInput([
				{ type: 'group', groupLabel: 'Empty', props: { 'data-testid': 'group' }, items: [] },
				...items('Rename')
			]);
			await userEvent.keyboard('zzz');
			await expect.poll(itemNames).toEqual([]);
			expect((page.getByTestId('group').element() as HTMLElement).hidden).toBe(false);
		});

		it('filters each menu item variant without changing its role', async () => {
			await openWithInput([
				{ type: 'item', label: 'Plain match' },
				{ type: 'checkbox', label: 'Checkbox match' },
				{
					type: 'radio-group',
					items: [
						{ label: 'Radio match', value: 'a' },
						{ label: 'Radio other', value: 'b' }
					]
				},
				{ type: 'link', label: 'Link match', props: { href: '#link' } },
				{ type: 'item', label: 'Other' }
			]);
			await userEvent.keyboard('match');
			await expect
				.poll(() =>
					[...document.querySelectorAll('[role^="menuitem"]')].map(
						(node) => `${node.getAttribute('role')}:${node.textContent?.trim()}`
					)
				)
				.toEqual([
					'menuitem:Plain match',
					'menuitemcheckbox:Checkbox match',
					'menuitemradio:Radio match',
					'menuitem:Link match'
				]);
		});

		it('preserves uncontrolled checkbox state while the item is filtered out', async () => {
			await openWithInput([
				{ type: 'checkbox', label: 'Wrap lines', props: { closeOnClick: false } },
				...items('Rename')
			]);
			await userEvent.click(page.getByRole('menuitemcheckbox', { name: 'Wrap lines' }));
			const checked = () =>
				document.querySelector('[role="menuitemcheckbox"]')?.getAttribute('aria-checked') ?? null;
			expect(checked()).toBe('true');
			await userEvent.keyboard('ren');
			await expect.poll(checked).toBe(null);
			await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');
			await expect.poll(checked).toBe('true');
		});

		it('keeps plain menu items and submenu triggers out of the tab order', async () => {
			await openWithInput([
				...items('Rename'),
				{ type: 'submenu', label: 'More', items: items('Alpha') }
			]);
			await userEvent.keyboard('{ArrowDown}');
			expect(item('Rename').tabIndex).toBe(-1);
			await userEvent.keyboard('{ArrowDown}');
			expect(activeDescendant()).toBe(item('More').id);
			expect(item('More').tabIndex).toBe(-1);
		});

		it('prefers the label prop over rendered text for matching', async () => {
			await openWithInput([
				{ type: 'item', label: 'Rename', props: { label: 'Change name' } },
				...items('Delete')
			]);
			await userEvent.keyboard('change');
			await expect.poll(itemNames).toEqual(['Rename']);
			await userEvent.keyboard('{Control>}a{/Control}ren');
			await expect.poll(itemNames).toEqual([]);
		});

		it('re-filters an item whose rendered text changes while it is visible', async () => {
			await openWithInput(items('Rename', 'Delete'));
			await userEvent.keyboard('ren');
			await expect.poll(itemNames).toEqual(['Rename']);
			const rename = item('Rename');
			rename.firstChild!.nodeValue = 'Remove';
			await expect.poll(itemNames).toEqual([]);
		});

		it('uses an updated custom filter function', async () => {
			const startsWith = (text: string, query: string) =>
				text.toLowerCase().startsWith(query.toLowerCase());
			const endsWith = (text: string, query: string) =>
				text.toLowerCase().endsWith(query.toLowerCase());
			const screen = filterable(items('Rename', 'Delete'), {
				filter: { providerProps: { value: 'e', filter: startsWith } }
			});
			await expect.poll(itemNames).toEqual([]);
			await screen.rerender({ filter: { providerProps: { value: 'e', filter: endsWith } } });
			await expect.poll(itemNames).toEqual(['Rename', 'Delete']);
		});

		it('keeps every item visible when filtering is turned off with null', async () => {
			await openWithInput(items('Rename', 'Delete'), { providerProps: { filter: null } });
			await userEvent.keyboard('zzz');
			expect(input().value).toBe('zzz');
			expect(itemNames()).toEqual(['Rename', 'Delete']);
		});

		it('disables filter controls when the root is disabled', async () => {
			filterable(items('Rename'), {
				rootProps: { disabled: true },
				filter: { providerProps: { value: 'r' }, clear: true }
			});
			await expect.poll(() => document.querySelector('input')).not.toBe(null);
			expect(input().disabled).toBe(true);
			const clear = page
				.getByRole('button', { name: 'Clear filter', includeHidden: true })
				.element();
			expect(clear.hasAttribute('disabled')).toBe(true);
			expect(clear.hasAttribute('data-disabled')).toBe(true);
		});
	});

	describe('prop: autoHighlight', () => {
		it('highlights the first match after the user types', async () => {
			await openWithInput(items('Rename', 'Duplicate', 'Delete'), {
				providerProps: { autoHighlight: true }
			});
			expect(activeDescendant()).toBe(null);
			await userEvent.keyboard('d');
			await expect.poll(highlightedNames).toEqual(['Duplicate']);
			expect(activeDescendant()).toBe(item('Duplicate').id);
			await userEvent.keyboard('el');
			await expect.poll(highlightedNames).toEqual(['Delete']);
			expect(activeDescendant()).toBe(item('Delete').id);
		});

		it('always highlights the first item when autoHighlight is "always"', async () => {
			filterable(items('Rename', 'Delete'), {
				filter: { providerProps: { autoHighlight: 'always' } }
			});
			await expect.poll(highlightedNames).toEqual(['Rename']);
			expect(activeDescendant()).toBe(item('Rename').id);
		});

		it('updates the active descendant when filtering replaces a custom-id item', async () => {
			const screen = filterable(
				[
					{ type: 'item', label: 'Apple', props: { id: 'apple-item' } },
					{ type: 'item', label: 'Banana', props: { id: 'banana-item' } }
				],
				{ filter: { providerProps: { autoHighlight: 'always', value: '' } } }
			);
			await expect.poll(() => activeDescendant()).toBe('apple-item');
			await screen.rerender({
				filter: { providerProps: { autoHighlight: 'always', value: 'ban' } }
			});
			await expect.poll(() => activeDescendant()).toBe('banana-item');
			expect(queryItem('Apple')).toBe(null);
		});

		for (const autoHighlight of [true, 'always'] as const) {
			it(`keeps a highlight when typing does not change the trimmed query with autoHighlight=${autoHighlight}`, async () => {
				await openWithInput(items('Google Calendar', 'Google Chrome'), {
					providerProps: { autoHighlight }
				});
				await userEvent.keyboard('Google');
				await expect.poll(highlightedNames).toEqual(['Google Calendar']);
				await userEvent.keyboard(' ');
				await frame();
				expect(highlightedNames()).toEqual(['Google Calendar']);
				expect(activeDescendant()).toBe(item('Google Calendar').id);
			});

			it(`does not let arrow navigation escape when autoHighlight is ${autoHighlight}`, async () => {
				await openWithInput(items('Rename', 'Delete'), { providerProps: { autoHighlight } });
				if (autoHighlight === true) await userEvent.keyboard('e');
				await expect.poll(highlightedNames).toEqual(['Rename']);
				await userEvent.keyboard('{ArrowUp}');
				expect(activeDescendant()).toBe(item('Delete').id);
				await userEvent.keyboard('{ArrowDown}');
				expect(activeDescendant()).toBe(item('Rename').id);
			});
		}

		it('clears the automatic highlight when a typed query is cleared', async () => {
			await openWithInput(items('Rename', 'Delete'), { providerProps: { autoHighlight: true } });
			await userEvent.keyboard('del');
			await expect.poll(() => activeDescendant()).toBe(item('Delete').id);
			await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');
			await expect.poll(() => activeDescendant()).toBe(null);
			expect(highlightedNames()).toEqual([]);
		});

		it('clears a navigated highlight when Clear is pressed', async () => {
			await openWithInput(items('Rename', 'Delete'), {
				providerProps: { autoHighlight: true },
				clear: true
			});
			await userEvent.keyboard('e{ArrowDown}');
			await expect.poll(highlightedNames).toEqual(['Delete']);
			await userEvent.click(
				page.getByRole('button', { name: 'Clear filter', includeHidden: true })
			);
			await expect.poll(() => activeDescendant()).toBe(null);
			expect(highlightedNames()).toEqual([]);
			expect(input().value).toBe('');
			expect(focused()).toBe(input());
		});

		it('restores the first item when an always-highlighted query is cleared', async () => {
			await openWithInput(items('Rename', 'Delete'), {
				providerProps: { autoHighlight: 'always' }
			});
			await userEvent.keyboard('del');
			await expect.poll(highlightedNames).toEqual(['Delete']);
			await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');
			await expect.poll(highlightedNames).toEqual(['Rename']);
			expect(activeDescendant()).toBe(item('Rename').id);
		});

		it('clears the highlight when no items match', async () => {
			await openWithInput(items('Rename', 'Delete'), { providerProps: { autoHighlight: true } });
			await userEvent.keyboard('missing');
			await expect.poll(() => activeDescendant()).toBe(null);
			expect(itemNames()).toEqual([]);
		});

		it('continues keyboard navigation from the automatic highlight and activates it', async () => {
			const onDelete = vi.fn();
			await openWithInput(
				[
					{ type: 'item', label: 'Duplicate' },
					{ type: 'item', label: 'Delete', props: { onclick: onDelete } }
				],
				{ providerProps: { autoHighlight: true } }
			);
			await userEvent.keyboard('d');
			await expect.poll(highlightedNames).toEqual(['Duplicate']);
			await userEvent.keyboard('{ArrowDown}{Enter}');
			expect(onDelete).toHaveBeenCalledTimes(1);
		});

		it('clears a pointer highlight on pointer leave by default', async () => {
			await openWithInput(items('Rename', 'Delete'));
			await userEvent.hover(page.getByRole('menuitem', { name: 'Delete' }));
			await expect.poll(highlightedNames).toEqual(['Delete']);
			await userEvent.unhover(page.getByRole('menuitem', { name: 'Delete' }));
			await expect.poll(highlightedNames).toEqual([]);
		});

		it('preserves a pointer highlight when autoHighlight is "always"', async () => {
			await openWithInput(items('Rename', 'Delete'), {
				providerProps: { autoHighlight: 'always' }
			});
			await userEvent.hover(page.getByRole('menuitem', { name: 'Delete' }));
			await expect.poll(highlightedNames).toEqual(['Delete']);
			await userEvent.unhover(page.getByRole('menuitem', { name: 'Delete' }));
			await frame();
			expect(highlightedNames()).toEqual(['Delete']);
		});
	});

	describe('keyboard navigation', () => {
		it('walks the list with the arrow keys and releases the highlight at the end', async () => {
			await openWithInput(items('Rename', 'Delete'));
			await userEvent.keyboard('{ArrowDown}');
			expect(activeDescendant()).toBe(item('Rename').id);
			await userEvent.keyboard('{ArrowDown}');
			expect(activeDescendant()).toBe(item('Delete').id);
			await userEvent.keyboard('{ArrowDown}');
			expect(activeDescendant()).toBe(null);
			expect(highlightedNames()).toEqual([]);
			expect(input().hasAttribute('data-highlighted')).toBe(true);
			await userEvent.keyboard('{ArrowUp}');
			expect(activeDescendant()).toBe(item('Delete').id);
		});

		it('starts navigation from the top again after closing and reopening', async () => {
			filterable(items('Rename', 'Delete'), { open: false });
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('{ArrowDown}{ArrowDown}');
			expect(activeDescendant()).toBe(item('Delete').id);
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBe(null);
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('{ArrowDown}');
			expect(activeDescendant()).toBe(item('Rename').id);
		});

		it('resets the highlight when the query changes and rebuilds it from the first match', async () => {
			await openWithInput(items('Rename', 'Duplicate', 'Delete'));
			await userEvent.keyboard('{ArrowDown}{ArrowDown}');
			expect(activeDescendant()).toBe(item('Duplicate').id);
			await userEvent.keyboard('e');
			await expect.poll(() => activeDescendant()).toBe(null);
			await userEvent.keyboard('{ArrowDown}');
			expect(activeDescendant()).toBe(item('Rename').id);
		});

		it('does not move the highlight while typing into the input', async () => {
			await openWithInput(items('Apple', 'Banana', 'Cherry'));
			await userEvent.keyboard('{ArrowDown}');
			expect(activeDescendant()).toBe(item('Apple').id);
			await userEvent.keyboard('{Control>}a{/Control}');
			expect(activeDescendant()).toBe(item('Apple').id);
			await userEvent.keyboard('b');
			await expect.poll(itemNames).toEqual(['Banana']);
			expect(activeDescendant()).toBe(null);
		});
	});

	it('preserves input focus on item presses', async () => {
		await openWithInput([
			{ type: 'checkbox', label: 'Wrap lines', props: { closeOnClick: false } },
			...items('Rename')
		]);
		await userEvent.click(page.getByRole('menuitemcheckbox', { name: 'Wrap lines' }));
		expect(focused()).toBe(input());
	});

	it('preserves modifiers when the input activates a link item', async () => {
		const onClick = vi.fn((event: MouseEvent) => {
			event.preventDefault();
			return event.ctrlKey;
		});
		await openWithInput([
			{ type: 'link', label: 'Docs', props: { href: '#docs', onclick: onClick } }
		]);
		await userEvent.keyboard('{ArrowDown}{Control>}{Enter}{/Control}');
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onClick.mock.results[0].value).toBe(true);
	});

	it('leaves modified editing keys to the input while an item is highlighted', async () => {
		await openWithInput(items('Rename', 'Delete'), { providerProps: { value: 'e' } });
		await userEvent.keyboard('{ArrowDown}');
		expect(activeDescendant()).toBe(item('Rename').id);
		await userEvent.keyboard('{Shift>}{Home}{/Shift}');
		expect(input().selectionStart).toBe(0);
		expect(input().selectionEnd).toBe(1);
		expect(activeDescendant()).toBe(item('Rename').id);
	});

	it('uses the id passed to Menu.Input', async () => {
		filterable(items('Rename'), { filter: { inputProps: { id: 'custom-input' } } });
		await expect.poll(() => document.getElementById('custom-input')).toBe(input());
	});

	it('renders Empty when no items are registered at all', async () => {
		filterable([], { filter: { empty: 'No actions' } });
		await expect.poll(() => page.getByRole('status').element().textContent).toContain('No actions');
	});

	it('removes Empty once the query matches again', async () => {
		await openWithInput(items('Rename'), { empty: 'No actions' });
		expect(document.querySelector('[role="status"]')).toBe(null);
		await userEvent.keyboard('x');
		await expect
			.poll(() => document.querySelector('[role="status"]')?.textContent)
			.toContain('No actions');
		const status = document.querySelector('[role="status"]')!;
		expect(status.getAttribute('aria-live')).toBe('polite');
		expect(status.getAttribute('aria-atomic')).toBe('true');
		await userEvent.keyboard('{Backspace}');
		await expect.poll(() => document.querySelector('[role="status"]')).toBe(null);
	});

	it('renders Clear only while the input has text', async () => {
		await openWithInput(items('Rename'), { clear: true });
		const clear = () => document.querySelector('[aria-label="Clear filter"]');
		expect(clear()).toBe(null);
		await userEvent.keyboard('r');
		await expect.poll(clear).not.toBe(null);
		expect(clear()!.getAttribute('tabindex')).toBe('-1');
		expect(clear()!.getAttribute('aria-hidden')).toBe('true');
		await userEvent.click(page.getByRole('button', { name: 'Clear filter', includeHidden: true }));
		await expect.poll(clear).toBe(null);
		expect(input().value).toBe('');
		expect(focused()).toBe(input());
	});

	describe('input value change reasons', () => {
		function reasons(onValueChange: ReturnType<typeof vi.fn>) {
			return onValueChange.mock.calls.map(([value, details]) => [
				value,
				(details as { reason: string }).reason
			]);
		}

		it('reports input-change while typing and input-clear when emptied', async () => {
			const onValueChange = vi.fn();
			await openWithInput(items('Rename'), { providerProps: { onValueChange } });
			await userEvent.keyboard('re{Backspace}{Backspace}');
			expect(reasons(onValueChange)).toEqual([
				['r', 'input-change'],
				['re', 'input-change'],
				['r', 'input-change'],
				['', 'input-clear']
			]);
		});

		it('reports clear-press when the clear button is used', async () => {
			const onValueChange = vi.fn();
			await openWithInput(items('Rename'), { providerProps: { onValueChange }, clear: true });
			await userEvent.keyboard('r');
			await userEvent.click(
				page.getByRole('button', { name: 'Clear filter', includeHidden: true })
			);
			expect(reasons(onValueChange)).toEqual([
				['r', 'input-change'],
				['', 'clear-press']
			]);
		});

		it('reports popup-close once when the popup closes with a query', async () => {
			const onValueChange = vi.fn();
			await openWithInput(items('Rename'), { providerProps: { onValueChange } });
			await userEvent.keyboard('r{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBe(null);
			expect(reasons(onValueChange)).toEqual([
				['r', 'input-change'],
				['', 'popup-close']
			]);
		});

		it('leaves the query and visible items unchanged when a change is canceled', async () => {
			const onValueChange = vi.fn((_value: string, details: { cancel(): void }) => {
				details.cancel();
			});
			await openWithInput(items('Rename', 'Delete'), { providerProps: { onValueChange } });
			await userEvent.keyboard('d');
			expect(onValueChange).toHaveBeenCalledTimes(1);
			await frame();
			expect(input().value).toBe('');
			expect(itemNames()).toEqual(['Rename', 'Delete']);
		});

		it('keeps the query when the popup-close reset is canceled', async () => {
			const onValueChange = vi.fn((_value: string, details: { reason: string; cancel(): void }) => {
				if (details.reason === 'popup-close') details.cancel();
			});
			filterable(items('Rename', 'Delete'), {
				open: false,
				rootProps: { modal: false },
				filter: { providerProps: { onValueChange } }
			});
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('del{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBe(null);
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => focused()).toBe(input());
			expect(input().value).toBe('del');
			expect(itemNames()).toEqual(['Delete']);
		});
	});

	describe('leaving the menu', () => {
		it('closes on Escape even with a query typed and returns focus to the trigger', async () => {
			filterable(items('Rename'), { open: false });
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('re{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBe(null);
			expect(focused()).toBe(page.getByRole('button', { name: 'Actions' }).element());
		});

		it('closes and returns focus to the trigger on Shift+Tab from the input', async () => {
			const onOpenChange = vi.fn();
			filterable(items('Rename'), { open: false, rootProps: { onOpenChange } });
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBe(null);
			expect(focused()).toBe(page.getByRole('button', { name: 'Actions' }).element());
			expect(onOpenChange.mock.calls.map(([open, details]) => [open, details.reason])).toEqual([
				[true, 'trigger-press'],
				[false, 'focus-out']
			]);
		});

		it('keeps input focus when a Shift+Tab close is canceled', async () => {
			const onOpenChange = vi.fn((open: boolean, details: { cancel(): void }) => {
				if (!open) details.cancel();
			});
			filterable(items('Rename'), { open: false, rootProps: { onOpenChange } });
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
			await frame();
			expect(document.querySelector('[role="dialog"]')).not.toBe(null);
			expect(focused()).toBe(input());
		});
	});

	describe('prop: keepMounted', () => {
		it('resets the query and highlight across a close and reopen', async () => {
			filterable(items('Rename', 'Delete'), {
				open: false,
				portalProps: { keepMounted: true }
			});
			const field = () => document.querySelector('input') as HTMLInputElement;
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => focused()).toBe(field());
			await userEvent.keyboard('ren');
			await expect.poll(itemNames).toEqual(['Rename']);
			await userEvent.keyboard('{ArrowDown}');
			expect(field().getAttribute('aria-activedescendant')).toBe(item('Rename').id);
			await userEvent.keyboard('{Escape}');
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => field().value).toBe('');
			expect(itemNames()).toEqual(['Rename', 'Delete']);
			expect(field().getAttribute('aria-activedescendant')).toBe(null);
		});
	});

	describe('prop: onItemHighlighted', () => {
		it('reports the keyboard highlight with the item label', async () => {
			const onItemHighlighted = vi.fn();
			filterable(items('Rename', 'Delete'), { rootProps: { onItemHighlighted } });
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('{ArrowDown}');
			const calls = onItemHighlighted.mock.calls.map(([node, details]) => [
				(node as HTMLElement | undefined)?.textContent?.trim(),
				details.reason,
				details.label
			]);
			expect(calls.at(-1)).toEqual(['Rename', 'keyboard', 'Rename']);
		});
	});

	describe('IME composition', () => {
		it('filters on the committed text, not the composition in progress', async () => {
			const onValueChange = vi.fn();
			filterable(items('日本語', 'Rename'), {
				filter: { providerProps: { onValueChange }, empty: 'No actions found.' }
			});
			const field = input();
			field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
			field.value = 'にほ';
			field.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();
			expect(field.value).toBe('にほ');
			expect(onValueChange).not.toHaveBeenCalled();
			expect(queryItem('Rename')).not.toBe(null);
			expect(document.querySelector('[role="status"]')).toBe(null);

			field.value = '日本';
			field.dispatchEvent(new InputEvent('input', { bubbles: true }));
			field.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toBe('日本');
			await expect.poll(itemNames).toEqual(['日本語']);
		});

		it('does not activate the highlighted item when Enter commits a composition', async () => {
			const onClick = vi.fn();
			await openWithInput([{ type: 'item', label: 'Rename', props: { onclick: onClick } }]);
			await userEvent.keyboard('{ArrowDown}');
			input().dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'Enter',
					keyCode: 229,
					bubbles: true,
					cancelable: true
				})
			);
			expect(onClick).not.toHaveBeenCalled();
		});
	});

	describe('accessible names', () => {
		it('does not point the popup or list at a trigger that never rendered', async () => {
			filterable(items('Rename'), { trigger: false });
			await expect.poll(() => document.querySelector('[role="dialog"]')).not.toBe(null);
			expect(document.querySelector('[role="dialog"]')!.hasAttribute('aria-labelledby')).toBe(
				false
			);
			expect(document.querySelector('[role="menu"]')!.hasAttribute('aria-labelledby')).toBe(false);
		});

		it('keeps a list label supplied by the consumer', async () => {
			filterable(items('Rename'), { filter: { listProps: { 'aria-label': 'Commands' } } });
			const list = document.querySelector('[role="menu"]')!;
			expect(list.getAttribute('aria-label')).toBe('Commands');
			expect(list.hasAttribute('aria-labelledby')).toBe(false);
		});

		it('omits aria-controls when the list renders with an explicitly empty id', async () => {
			filterable(items('Rename'), { filter: { listProps: { id: '' } } });
			await expect.poll(() => input().hasAttribute('aria-controls')).toBe(false);
			expect(document.querySelector('[role="menu"]')!.id).toBe('');
		});

		it('points aria-controls at an explicit list id', async () => {
			filterable(items('Rename'), { filter: { listProps: { id: 'filtered-actions' } } });
			await expect.poll(() => input().getAttribute('aria-controls')).toBe('filtered-actions');
		});

		it('omits the list label when the trigger renders with an explicitly empty id', async () => {
			filterable(items('Rename'), { trigger: { id: '' } });
			const list = document.querySelector('[role="menu"]')!;
			await expect.poll(() => list.hasAttribute('aria-labelledby')).toBe(false);
			expect(document.querySelector('[role="dialog"]')!.hasAttribute('aria-labelledby')).toBe(
				false
			);
		});
	});

	describe('consumer props', () => {
		it('runs a consumer handler once per interaction on each composed part', async () => {
			const onTriggerClick = vi.fn();
			const onInputKeyDown = vi.fn();
			const onPopupKeyDown = vi.fn();
			filterable(items('Rename'), {
				open: false,
				trigger: { onclick: onTriggerClick },
				popupProps: { onkeydown: onPopupKeyDown },
				filter: { inputProps: { onkeydown: onInputKeyDown } }
			});
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			expect(onTriggerClick).toHaveBeenCalledTimes(1);
			await expect.poll(() => focused()).toBe(input());

			const key = (value: string) =>
				input().dispatchEvent(
					new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true })
				);
			key('r');
			// A printable key stays on the input: it must not reach the popup's handler.
			expect(onInputKeyDown).toHaveBeenCalledTimes(1);
			expect(onPopupKeyDown).toHaveBeenCalledTimes(0);

			// Escape is not consumed by the input, so it reaches the popup exactly once.
			key('Escape');
			expect(onPopupKeyDown).toHaveBeenCalledTimes(1);
		});

		it('lets a consumer key handler on the input opt out of list navigation and activation', async () => {
			const onPress = vi.fn();
			await openWithInput(
				[{ type: 'item', label: 'Rename', props: { onclick: onPress } }, ...items('Delete')],
				{
					inputProps: {
						onkeydown(event: KeyboardEvent) {
							if (event.key === 'ArrowUp' || event.key === 'Enter') event.preventDefault();
						}
					}
				}
			);
			await userEvent.keyboard('{ArrowDown}');
			expect(activeDescendant()).toBe(item('Rename').id);
			await userEvent.keyboard('{ArrowUp}{Enter}');
			expect(activeDescendant()).toBe(item('Rename').id);
			expect(onPress).not.toHaveBeenCalled();
		});
	});

	describe('focus ownership inside the popup', () => {
		it('leaves focus on another control in the popup when the pointer moves', async () => {
			await openWithInput(items('Rename'), { extra: 'Auxiliary action' });
			const auxiliary = page
				.getByRole('button', { name: 'Auxiliary action' })
				.element() as HTMLElement;
			auxiliary.focus();
			mouse(document.querySelector('[role="dialog"]')!, 'mousemove');
			expect(focused()).toBe(auxiliary);
		});

		const folders = (triggerProps: Bag = {}): MenuItemSpec => ({
			type: 'submenu',
			label: 'Move to folder',
			triggerProps: { delay: 0, ...triggerProps },
			popupProps: { 'data-testid': 'submenu-popup' },
			filter: { inputLabel: 'Filter folders' },
			items: items('Documents')
		});

		it('returns focus to the parent input when the pointer moves back over the parent popup', async () => {
			await openWithInput([folders({ closeDelay: 1000 })]);
			const submenuTrigger = item('Move to folder');
			await userEvent.hover(submenuTrigger);
			await expect
				.poll(() => document.querySelector('input[aria-label="Filter folders"]'))
				.not.toBe(null);
			const submenuInput = input('Filter folders');
			await frame();
			mouse(submenuInput, 'mousemove');
			await expect.poll(() => submenuInput.hasAttribute('data-highlighted')).toBe(true);
			expect(focused()).toBe(submenuInput);

			// Back over the still-open submenu's trigger.
			mouse(submenuTrigger, 'mousemove');
			expect(focused()).toBe(input());
			await expect.poll(() => input().hasAttribute('data-highlighted')).toBe(true);
			expect(submenuInput.hasAttribute('data-highlighted')).toBe(false);
			expect(submenuInput.isConnected).toBe(true);
		});

		it('returns focus to the parent input when a mouse enters the trigger after a tap', async () => {
			await openWithInput([folders({ closeDelay: 1000 })]);
			const submenuTrigger = item('Move to folder');
			await userEvent.hover(submenuTrigger);
			await expect
				.poll(() => document.querySelector('input[aria-label="Filter folders"]'))
				.not.toBe(null);
			const submenuInput = input('Filter folders');
			await frame();
			pointer(submenuInput, 'pointerdown', { pointerType: 'touch' });
			submenuInput.focus();
			expect(focused()).toBe(submenuInput);

			// A mouse entering fires `pointerover` and `mouseover` before any `pointermove`.
			pointer(submenuTrigger, 'pointerover', { pointerType: 'mouse' });
			mouse(submenuTrigger, 'mouseover');
			expect(focused()).toBe(input());
		});

		it('restores the parent input highlight when the pointer returns from a plain submenu', async () => {
			await openWithInput([
				{
					type: 'submenu',
					label: 'Share',
					triggerProps: { delay: 0 },
					list: true,
					items: items('Email')
				}
			]);
			const shareTrigger = item('Share');
			await userEvent.hover(shareTrigger);
			await expect.poll(() => queryItem('Email')).not.toBe(null);
			const email = queryItem('Email')!;
			mouse(email, 'mousemove');
			await expect.poll(() => focused()).toBe(email);
			await expect.poll(() => input().hasAttribute('data-highlighted')).toBe(false);

			mouse(shareTrigger, 'mouseover');
			expect(focused()).toBe(input());
			await expect.poll(() => input().hasAttribute('data-highlighted')).toBe(true);
		});

		it('returns focus to the parent input once a pointer-opened submenu unmounts', async () => {
			await openWithInput([...items('Rename'), folders({ closeDelay: 0 })]);
			await userEvent.hover(item('Move to folder'));
			await expect
				.poll(() => document.querySelector('input[aria-label="Filter folders"]'))
				.not.toBe(null);
			const submenuInput = input('Filter folders');
			mouse(submenuInput, 'mousemove');
			await expect.poll(() => focused()).toBe(submenuInput);

			await userEvent.hover(page.getByRole('menuitem', { name: 'Rename' }));
			await expect.poll(() => submenuInput.isConnected).toBe(false);
			await expect.poll(() => focused()).toBe(input());
			await expect.poll(() => input().hasAttribute('data-highlighted')).toBe(true);
		});

		it('opens a hovered submenu without moving focus until the pointer enters it', async () => {
			await openWithInput([folders()]);
			await userEvent.hover(item('Move to folder'));
			await expect
				.poll(() => document.querySelector('input[aria-label="Filter folders"]'))
				.not.toBe(null);
			const submenuInput = input('Filter folders');
			await frame();
			expect(focused()).toBe(input());
			expect(input().hasAttribute('data-highlighted')).toBe(true);

			mouse(document.querySelector('[data-testid="submenu-popup"]')!, 'mousemove');
			expect(focused()).toBe(submenuInput);
			await expect.poll(() => submenuInput.hasAttribute('data-highlighted')).toBe(true);
		});

		it('moves focus back to the parent input while the pointer moves between submenu triggers', async () => {
			const submenu = (label: string, delay: number): MenuItemSpec => ({
				type: 'submenu',
				label,
				// The close waits until the pointer has highlighted the next trigger.
				triggerProps: { delay, closeDelay: 10 },
				filter: { inputLabel: `Filter ${label}` },
				items: items('Option')
			});
			// The second opens only after the first submenu has unmounted.
			await openWithInput([submenu('Move to folder', 0), submenu('Share', 50)]);
			await userEvent.hover(item('Move to folder'));
			await expect
				.poll(() => document.querySelector('input[aria-label="Filter Move to folder"]'))
				.not.toBe(null);
			const firstInput = input('Filter Move to folder');
			mouse(firstInput, 'mousemove');
			await expect.poll(() => focused()).toBe(firstInput);

			await userEvent.hover(item('Share'));
			await expect.poll(() => focused()).toBe(input());
			await expect
				.poll(() => document.querySelector('input[aria-label="Filter Share"]'))
				.not.toBe(null);
			const secondInput = input('Filter Share');
			await frame();
			expect(focused()).toBe(input());

			mouse(secondInput, 'mousemove');
			expect(focused()).toBe(secondInput);
		});
	});

	describe('with a Viewport', () => {
		it('keeps real focus on the input while the cursor moves through the list', async () => {
			filterable(items('Rename', 'Delete'), { viewport: true });
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('{ArrowDown}{ArrowDown}');
			expect(activeDescendant()).toBe(item('Delete').id);
			expect(focused()).toBe(input());
		});
	});
});

describe('Menu.FilterProvider submenus', () => {
	beforeEach(parkPointer);

	const share = (extra: MenuItemSpec = { type: 'item', label: 'Email' }): MenuItemSpec => ({
		type: 'submenu',
		label: 'Share',
		triggerProps: { openOnHover: false },
		filter: { inputLabel: 'Filter sharing options' },
		items: [extra]
	});

	it('focuses a click-opened filterable submenu input so typing filters the submenu', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			filter: {},
			items: [
				{
					type: 'submenu',
					label: 'Share',
					triggerProps: { openOnHover: false },
					filter: { inputLabel: 'Filter sharing options' },
					items: items('Email', 'Link')
				},
				...items('Delete')
			]
		});
		await userEvent.click(page.getByRole('button', { name: 'Actions' }));
		await userEvent.click(page.getByRole('menuitem', { name: 'Share' }));
		const submenuInput = input('Filter sharing options');
		await expect.poll(() => focused()).toBe(submenuInput);

		await userEvent.keyboard('em');
		expect(submenuInput.value).toBe('em');
		await expect.poll(() => queryItem('Link')).toBe(null);
		expect(itemNames()).toEqual(['Share', 'Delete', 'Email']);
	});

	describe('inside an ordinary parent menu', () => {
		const folders: MenuItemSpec = {
			type: 'submenu',
			label: 'Move to folder',
			triggerProps: { delay: 0 },
			filter: { inputLabel: 'Filter folders' },
			items: items('Documents', 'Downloads')
		};

		function parentNavigation(loopFocus: boolean, triggerLast: boolean) {
			const submenu: MenuItemSpec = { ...folders, items: [] };
			const rest: MenuItemSpec[] = [
				{ type: 'item', label: 'Disabled', props: { disabled: true } },
				{ type: 'item', label: 'Next' }
			];
			render(MenuHarness, {
				triggerLabel: 'Actions',
				open: true,
				rootProps: { loopFocus },
				items: triggerLast ? [...rest, submenu] : [submenu, ...rest]
			});
		}

		it('uses dialog semantics for a filterable submenu', async () => {
			render(MenuHarness, {
				triggerLabel: 'Actions',
				open: true,
				items: [...items('Rename'), folders]
			});
			const submenuTrigger = item('Move to folder');
			expect(submenuTrigger.getAttribute('aria-haspopup')).toBe('dialog');

			await userEvent.hover(submenuTrigger);
			await expect.poll(() => document.querySelector('[role="dialog"]')).not.toBe(null);
			const popup = document.querySelector('[role="dialog"]')!;
			expect(submenuTrigger.getAttribute('aria-controls')).toBe(popup.id);
			expect(popup.getAttribute('aria-labelledby')).toBe(submenuTrigger.id);
		});

		it('lets the ordinary parent menu own its main-axis navigation keys', async () => {
			render(MenuHarness, {
				triggerLabel: 'Actions',
				open: true,
				items: [...items('Rename'), folders]
			});
			const submenuTrigger = item('Move to folder');
			await expect.poll(() => submenuTrigger.isConnected).toBe(true);
			submenuTrigger.focus();
			await userEvent.keyboard('{ArrowUp}');
			await expect.poll(() => focused()).toBe(item('Rename'));
			expect(document.querySelector('[role="dialog"]')).toBe(null);
		});

		it('keeps disabled parent items reachable during main-axis navigation', async () => {
			parentNavigation(true, false);
			item('Move to folder').focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focused()).toBe(item('Disabled'));
		});

		it('wraps parent navigation when loopFocus is enabled', async () => {
			parentNavigation(true, true);
			item('Move to folder').focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focused()).toBe(item('Disabled'));
		});

		it('stops parent navigation at the boundary when loopFocus is disabled', async () => {
			parentNavigation(false, true);
			const submenuTrigger = item('Move to folder');
			submenuTrigger.focus();
			await userEvent.keyboard('{ArrowDown}');
			await frame();
			expect(focused()).toBe(submenuTrigger);
		});

		it('supports persistent always highlighting inside a filterable submenu', async () => {
			render(MenuHarness, {
				triggerLabel: 'Actions',
				open: true,
				items: [
					{
						type: 'submenu',
						label: 'Move to',
						rootProps: { open: true },
						filter: {
							inputLabel: 'Filter destinations',
							providerProps: { autoHighlight: 'always' }
						},
						items: items('Documents', 'Downloads')
					}
				]
			});
			const field = input('Filter destinations');
			await expect.poll(() => item('Documents').hasAttribute('data-highlighted')).toBe(true);
			expect(field.getAttribute('aria-activedescendant')).toBe(item('Documents').id);

			field.focus();
			await userEvent.keyboard('{ArrowUp}');
			await expect.poll(() => item('Downloads').hasAttribute('data-highlighted')).toBe(true);
			expect(field.getAttribute('aria-activedescendant')).toBe(item('Downloads').id);
		});
	});

	it('does not reopen a stale submenu with a cross-axis key', async () => {
		await openWithInput([
			...items('Rename'),
			{ ...share(), triggerProps: {} },
			{
				type: 'submenu',
				label: 'Export',
				filter: { inputLabel: 'Filter export options' },
				items: items('PDF')
			}
		]);
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
		await expect.poll(() => focused()).toBe(input('Filter sharing options'));

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => focused()).toBe(input());
		expect(activeDescendant()).toBe(item('Share').id);

		await userEvent.keyboard('{ArrowUp}');
		expect(focused()).toBe(input());
		expect(activeDescendant()).toBe(item('Rename').id);

		await userEvent.keyboard('{ArrowRight}');
		expect(document.querySelector('input[aria-label="Filter sharing options"]')).toBe(null);

		await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
		expect(document.querySelector('input[aria-label="Filter sharing options"]')).toBe(null);
		await expect.poll(() => focused()).toBe(input('Filter export options'));
	});

	it('focuses the first item when entering a hover-opened submenu from a filterable menu', async () => {
		await openWithInput([
			{
				type: 'submenu',
				label: 'Move to folder',
				triggerProps: { delay: 0 },
				items: items('Documents', 'Downloads')
			}
		]);
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.hover(item('Move to folder'));
		await expect.poll(() => queryItem('Documents')).not.toBe(null);
		await frame();
		expect(focused()).toBe(input());

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => focused()).toBe(item('Documents'));
	});

	it('does not forward submenu navigation keys while composing text', async () => {
		await openWithInput([{ ...share(), label: 'Move to folder' }]);
		await userEvent.keyboard('{ArrowDown}');
		input().dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowRight',
				keyCode: 229,
				bubbles: true,
				cancelable: true
			})
		);
		await frame();
		expect(document.querySelector('input[aria-label="Filter sharing options"]')).toBe(null);
	});

	it('does not reclaim focus when a controlled submenu closes after focus moves outside', async () => {
		const result = render(MenuHarness, {
			triggerLabel: 'Actions',
			open: true,
			rootProps: { modal: false },
			filter: {},
			items: [
				{
					type: 'submenu',
					label: 'Move to folder',
					filter: { inputLabel: 'Filter folders' },
					items: items('Documents')
				}
			]
		});
		await expect.poll(() => focused()).toBe(input());
		await userEvent.keyboard('{ArrowDown}{ArrowRight}');
		await expect.poll(() => focused()).toBe(input('Filter folders'));

		const outside = page.getByRole('button', { name: 'Outside' }).element() as HTMLElement;
		outside.focus();
		await result.rerender({
			items: [
				{
					type: 'submenu',
					label: 'Move to folder',
					rootProps: { open: false },
					filter: { inputLabel: 'Filter folders' },
					items: items('Documents')
				}
			]
		});
		await frame();
		await frame();
		expect(focused()).toBe(outside);
	});
});

describe('Menu.FilterProvider query and labels', () => {
	beforeEach(parkPointer);

	it('clears a positional highlight when a controlled query replaces the visible item', async () => {
		const onAppleClick = vi.fn();
		const entries: MenuItemSpec[] = [
			{ type: 'item', label: 'Apple', props: { onclick: onAppleClick } },
			...items('Banana')
		];
		const result = await openWithInput(entries, { providerProps: { value: 'ban' } });
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => activeDescendant()).toBe(item('Banana').id);

		await result.rerender({ filter: { providerProps: { value: 'app' } } });
		await expect.poll(itemNames).toEqual(['Apple']);
		expect(input().hasAttribute('aria-activedescendant')).toBe(false);
		await userEvent.keyboard('{Enter}');
		expect(onAppleClick).not.toHaveBeenCalled();
	});

	it('supports a detached trigger in a filterable menu', async () => {
		render(MenuHarness, {
			triggerLabel: 'Fruit',
			detached: true,
			trigger: { id: 'fruit-trigger' },
			filter: {
				inputLabel: 'Filter fruit',
				listProps: { 'data-testid': 'list' },
				empty: 'No fruit found'
			},
			items: items('Apple')
		});
		const trigger = page.getByRole('button', { name: 'Fruit' }).element() as HTMLElement;
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');

		await userEvent.click(trigger);
		const popup = page.getByRole('dialog', { name: 'Fruit' }).element();
		const list = page.getByTestId('list').element();
		expect(trigger.getAttribute('aria-controls')).toBe(popup.id);
		expect(popup.getAttribute('aria-labelledby')).toBe('fruit-trigger');
		expect(list.getAttribute('aria-labelledby')).toBe('fruit-trigger');
		expect(document.querySelector('[role="status"]')).toBe(null);

		await userEvent.type(input('Filter fruit'), 'zz');
		await expect
			.poll(() => document.querySelector('[role="status"]')?.textContent?.trim())
			.toBe('No fruit found');
	});

	it('uses an explicit popup label instead of the trigger label', async () => {
		render(MenuHarness, {
			triggerLabel: 'Fruit',
			popupProps: { 'aria-label': 'Available commands' },
			filter: { inputLabel: 'Filter fruit' },
			items: items('Apple')
		});
		await userEvent.click(page.getByRole('button', { name: 'Fruit' }));
		const popup = page.getByRole('dialog', { name: 'Available commands' }).element();
		expect(popup.hasAttribute('aria-labelledby')).toBe(false);
	});

	it('releases a popup id override when the prop is removed', async () => {
		const result = filterable(items('Apple'), { popupProps: { id: 'custom-popup' } });
		const trigger = page.getByRole('button', { name: 'Actions' }).element();
		const popup = page.getByRole('dialog').element();
		expect(popup.id).toBe('custom-popup');

		await result.rerender({ popupProps: {} });
		await expect.poll(() => popup.id).not.toBe('custom-popup');
		expect(popup.id).not.toBe('');
		expect(trigger.getAttribute('aria-controls')).toBe(popup.id);
		expect(item('Apple').id).not.toBe('');
	});
});

describe('Menu.FilterProvider keyboard and focus', () => {
	beforeEach(parkPointer);

	async function openWithKeyboard() {
		filterable(items('Rename', 'Duplicate', 'Delete'), { open: false });
		page.getByRole('button', { name: 'Actions' }).element().focus();
		await userEvent.keyboard('{Enter}');
		await expect
			.poll(() => document.activeElement?.getAttribute('aria-label'))
			.toBe('Filter actions');
		return input();
	}

	it('keeps the highlight index in step with the highlighted item after the input is refocused', async () => {
		const field = await openWithKeyboard();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => highlightedNames()).toEqual(['Duplicate']);

		field.blur();
		field.focus();
		await frame();
		expect(activeDescendant()).toBe(item('Duplicate').id);

		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => highlightedNames()).toEqual(['Delete']);
	});

	it('returns focus to the input with the RTL submenu close key', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			open: true,
			direction: 'rtl',
			filter: { extra: 'Auxiliary action' },
			items: items('Rename')
		});
		await expect.poll(() => focused()).toBe(input());
		const auxiliary = page.getByRole('button', { name: 'Auxiliary action' }).element();
		(auxiliary as HTMLElement).focus();
		auxiliary.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
		);
		expect(focused()).toBe(input());
	});

	it('does not open a highlighted submenu with a modified cross-axis key from the input', async () => {
		await openWithInput([
			{
				type: 'submenu',
				label: 'Share',
				triggerProps: { delay: 0 },
				popupProps: { 'data-testid': 'submenu-list' },
				items: items('Email')
			}
		]);
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => item('Share').hasAttribute('data-highlighted')).toBe(true);

		input().dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowRight',
				metaKey: true,
				bubbles: true,
				cancelable: true
			})
		);
		await frame();
		expect(document.querySelector('[data-testid="submenu-list"]')).toBe(null);

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.querySelector('[data-testid="submenu-list"]')).not.toBe(null);
	});

	it('calls onOpenChangeComplete when the menu opens and closes', async () => {
		const onOpenChangeComplete = vi.fn();
		filterable(items('Rename'), { open: false, rootProps: { onOpenChangeComplete } });
		await userEvent.click(page.getByRole('button', { name: 'Actions' }));
		await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true]]);

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true], [false]]);
	});

	it('does not seed a highlight when the trigger regains focus while open', async () => {
		filterable(items('Rename'), { open: false });
		const trigger = page.getByRole('button', { name: 'Actions' }).element() as HTMLElement;
		await userEvent.click(trigger);
		await expect.poll(() => focused()).toBe(input());

		trigger.focus();
		await frame();
		expect(input().hasAttribute('aria-activedescendant')).toBe(false);
		expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
		expect(item('Rename').hasAttribute('data-highlighted')).toBe(false);
	});

	it('labels the list with the trigger when no label is given', () => {
		filterable(items('Rename'));
		const trigger = page.getByRole('button', { name: 'Actions' }).element();
		expect(page.getByRole('menu').element().getAttribute('aria-labelledby')).toBe(trigger.id);
	});

	it('stays closed when onOpenChange is canceled', async () => {
		filterable(items('Rename'), {
			open: false,
			rootProps: {
				onOpenChange: (_: boolean, details: { cancel(): void }) => details.cancel()
			}
		});
		await userEvent.click(page.getByRole('button', { name: 'Actions' }));
		await frame();
		expect(document.querySelector('[role="menu"]')).toBe(null);
	});

	it('leaves a checkbox item unchecked when onCheckedChange is canceled', async () => {
		await openWithInput([
			{
				type: 'checkbox',
				label: 'Show hidden',
				props: {
					closeOnClick: false,
					onCheckedChange: (_: boolean, details: { cancel(): void }) => details.cancel()
				}
			}
		]);
		const checkbox = page.getByRole('menuitemcheckbox', { name: 'Show hidden' });
		await userEvent.click(checkbox);
		expect(checkbox.element().getAttribute('aria-checked')).toBe('false');
	});

	it('applies a custom filter to item text', async () => {
		const filter = vi.fn((text: string, query: string) => text.toLowerCase().startsWith(query));
		await openWithInput(items('Delete', 'Rename'), { providerProps: { filter } });
		await userEvent.keyboard('de');
		await expect.poll(itemNames).toEqual(['Delete']);
		expect(filter).toHaveBeenCalledWith('Delete', 'de');
		expect(filter).toHaveBeenCalledWith('Rename', 'de');
		expect(filter.mock.calls.every((args) => args.length === 2)).toBe(true);
	});

	it('does not run the filter again when navigating past hidden items', async () => {
		const filter = vi.fn((text: string, query: string) => text.includes(query));
		const labels = Array.from({ length: 20 }, (_, index) =>
			index < 2 ? `Match ${index}` : `Hidden ${index}`
		);
		await openWithInput(items(...labels), {
			providerProps: { filter, autoHighlight: 'always', value: 'Match' }
		});
		await expect.poll(itemNames).toEqual(['Match 0', 'Match 1']);
		filter.mockClear();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => highlightedNames()).toEqual(['Match 1']);
		expect(filter).not.toHaveBeenCalled();
	});

	it('does not highlight an item when another detached trigger receives focus', async () => {
		const onItemHighlighted = vi.fn();
		render(MenuListTriggersHarness, { filter: true, onItemHighlighted });
		await userEvent.click(page.getByRole('button', { name: 'First' }));
		await expect.poll(() => focused()).toBe(input());
		onItemHighlighted.mockClear();

		(page.getByRole('button', { name: 'Second' }).element() as HTMLElement).focus();
		await frame();
		expect(input().hasAttribute('aria-activedescendant')).toBe(false);
		expect(item('Rename').hasAttribute('data-highlighted')).toBe(false);
		expect(onItemHighlighted).not.toHaveBeenCalled();
	});
});

describe('Menu.FilterProvider hover-opened submenu ownership', () => {
	beforeEach(parkPointer);

	const hoverMenu: MenuItemSpec[] = [
		...items('Rename', 'Duplicate'),
		{
			type: 'submenu',
			label: 'Share',
			triggerProps: { delay: 0 },
			positionerProps: { sideOffset: 4 },
			filter: { inputLabel: 'Filter sharing options' },
			items: items('Email')
		}
	];

	const submenuInput = () => document.querySelector('input[aria-label="Filter sharing options"]');

	async function openAndHoverTrigger() {
		filterable(hoverMenu, { open: false, positionerProps: { sideOffset: 8 } });
		await userEvent.click(page.getByRole('button', { name: 'Actions' }));
		await expect.poll(() => focused()).toBe(input());
		await userEvent.hover(item('Share'));
		await expect.poll(submenuInput).not.toBe(null);
		const field = submenuInput() as HTMLInputElement;
		mouse(field, 'mousemove');
		return field;
	}

	it('closes when the pointer sweeps off the trigger', async () => {
		await openAndHoverTrigger();
		await userEvent.hover(item('Rename'));
		await expect.poll(submenuInput).toBe(null);
	});

	it('closes when the pointer leaves the submenu popup', async () => {
		await openAndHoverTrigger();
		await userEvent.hover(item('Email'));
		await userEvent.hover(item('Duplicate'));
		await expect.poll(submenuInput).toBe(null);
	});

	it('closes and resets after a query was typed into the hover-opened submenu', async () => {
		const field = await openAndHoverTrigger();
		await expect.poll(() => focused()).toBe(field);
		await userEvent.keyboard('em');
		await expect.poll(() => field.value).toBe('em');

		await userEvent.hover(item('Rename'));
		await expect.poll(submenuInput).toBe(null);

		await userEvent.hover(item('Share'));
		await expect.poll(submenuInput).not.toBe(null);
		expect((submenuInput() as HTMLInputElement).value).toBe('');
	});
});

describe('Menu.FilterProvider submenu highlight details', () => {
	beforeEach(parkPointer);

	function submenuHighlightMenu(onItemHighlighted: (...args: unknown[]) => void) {
		filterable(
			[
				{
					type: 'submenu',
					label: 'Share',
					filter: { inputLabel: 'Filter sharing options' },
					items: items('Email')
				}
			],
			{ rootProps: { onItemHighlighted } }
		);
	}

	it('passes the keydown events when entering and leaving a filterable submenu', async () => {
		const onItemHighlighted = vi.fn();
		submenuHighlightMenu(onItemHighlighted);
		await expect.poll(() => focused()).toBe(input());
		await userEvent.keyboard('{ArrowDown}{ArrowRight}');
		await expect.poll(() => focused()).toBe(input('Filter sharing options'));

		const [enterItem, enterDetails] = onItemHighlighted.mock.lastCall!;
		expect(enterItem).toBe(undefined);
		expect(enterDetails.reason).toBe('keyboard');
		expect(enterDetails.event.key).toBe('ArrowRight');

		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBe(item('Share'));
		const exitDetails = onItemHighlighted.mock.lastCall![1];
		expect(exitDetails.reason).toBe('keyboard');
		expect(exitDetails.event.key).toBe('ArrowLeft');
	});

	it('reports no keyboard reason when Enter opens a filterable submenu', async () => {
		const onItemHighlighted = vi.fn();
		submenuHighlightMenu(onItemHighlighted);
		await expect.poll(() => focused()).toBe(input());
		await userEvent.keyboard('{ArrowDown}{Enter}');
		await expect.poll(() => focused()).toBe(input('Filter sharing options'));
		expect(onItemHighlighted.mock.lastCall?.[0]).toBe(undefined);
		expect(onItemHighlighted.mock.lastCall?.[1].reason).toBe('none');
	});
});

describe('filterable menu navigation regressions', () => {
	beforeEach(parkPointer);

	describe.each([false, true])('with a filtered submenu: %s', (filterSubmenu) => {
		it.each([
			['{ArrowRight}', '{ArrowLeft}'],
			['{ArrowRight}', '{Shift>}{Tab}{/Shift}'],
			['{Enter}', '{Escape}']
		])(
			'restores input focus after opening with %s and closing with %s',
			async (openKey, closeKey) => {
				await openWithInput([
					{
						type: 'submenu',
						label: 'More',
						triggerProps: { openOnHover: false },
						filter: filterSubmenu ? { inputLabel: 'Filter child actions' } : undefined,
						items: items('Child action')
					},
					...items('Rename')
				]);
				await userEvent.keyboard(`{ArrowDown}${openKey}`);
				await expect
					.poll(() => focused())
					.toBe(filterSubmenu ? input('Filter child actions') : item('Child action'));
				await userEvent.keyboard(closeKey);
				await expect.poll(() => queryItem('Child action')).toBe(null);
				await expect.poll(() => focused()).toBe(input());
				await userEvent.keyboard('ren');
				expect(input().value).toBe('ren');
				expect(itemNames()).toEqual(['Rename']);
			}
		);
	});
});

describe('Menu.FilterProvider automatic highlight', () => {
	beforeEach(parkPointer);

	it.each([true, 'always'] as const)(
		'does not allow arrow navigation to escape when autoHighlight is %s',
		async (autoHighlight) => {
			filterable(items('Rename', 'Delete'), { filter: { providerProps: { autoHighlight } } });
			await expect.poll(() => focused()).toBe(input());
			if (autoHighlight === true) await userEvent.keyboard('e');
			await expect.poll(() => highlightedNames()).toEqual(['Rename']);

			await userEvent.keyboard('{ArrowUp}');
			await expect.poll(() => highlightedNames()).toEqual(['Delete']);
			expect(activeDescendant()).toBe(item('Delete').id);

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => highlightedNames()).toEqual(['Rename']);
			expect(activeDescendant()).toBe(item('Rename').id);
		}
	);

	it('always highlights the first item when mounted inside an opened dialog', async () => {
		render(MenuPaletteHarness);
		await userEvent.click(page.getByRole('button', { name: 'Open palette' }));
		await expect.poll(() => queryItem('Linear')).not.toBe(null);
		await expect.poll(() => highlightedNames()).toEqual(['Linear']);
		expect(input('Search commands').getAttribute('aria-activedescendant')).toBe(item('Linear').id);
	});

	it('preserves navigation with an inline filter and a highlighted-item preview', async () => {
		const onActivate = vi.fn();
		const onItemHighlighted = vi.fn();
		filterable(
			[
				{ type: 'item', label: 'Rename', props: { onclick: () => onActivate('Rename') } },
				{ type: 'item', label: 'Delete', props: { onclick: () => onActivate('Delete') } }
			],
			{
				rootProps: { onItemHighlighted },
				filter: {
					providerProps: {
						autoHighlight: 'always',
						filter: (text: string, query: string) => text.includes(query)
					}
				}
			}
		);
		await expect.poll(() => focused()).toBe(input());
		await expect.poll(() => onItemHighlighted.mock.lastCall?.[1].label).toBe('Rename');

		await userEvent.keyboard('{ArrowDown}');
		expect(activeDescendant()).toBe(item('Delete').id);
		expect(onItemHighlighted.mock.lastCall?.[1].label).toBe('Delete');

		await userEvent.keyboard('{Enter}');
		expect(onActivate.mock.calls).toEqual([['Delete']]);
	});

	it('keeps the highlight when an item\'s text changes with autoHighlight="always"', async () => {
		const entries = (count: number): MenuItemSpec[] => [
			{ type: 'item', label: `Inbox (${count})`, key: 'inbox' },
			...items('Archive', 'Delete')
		];
		const result = filterable(entries(1), {
			filter: { providerProps: { autoHighlight: 'always' } }
		});
		await expect.poll(() => focused()).toBe(input());
		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		await expect.poll(() => highlightedNames()).toEqual(['Delete']);
		const deleteItem = item('Delete');

		await result.rerender({ items: entries(2) });
		await expect.poll(() => queryItem('Inbox (2)')).not.toBe(null);
		await frame();
		expect(highlightedNames()).toEqual(['Delete']);
		expect(activeDescendant()).toBe(deleteItem.id);
	});

	it('keeps the automatic highlight when typing moves it out from under the pointer', async () => {
		filterable(items('Rename', 'Delete'), { filter: { providerProps: { autoHighlight: true } } });
		await expect.poll(() => focused()).toBe(input());
		await userEvent.keyboard('e');
		const deleteItem = item('Delete');
		await userEvent.hover(deleteItem);
		await expect.poll(() => activeDescendant()).toBe(deleteItem.id);

		await userEvent.keyboard('l');
		await expect.poll(() => queryItem('Rename')).toBe(null);
		pointer(deleteItem, 'pointerleave', { pointerType: 'mouse', bubbles: false });
		await frame();
		expect(activeDescendant()).toBe(deleteItem.id);
	});

	it('does not set aria-selected on highlighted items outside WebKit', async () => {
		await openWithInput(items('Rename'));
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => highlightedNames()).toEqual(['Rename']);
		expect(item('Rename').hasAttribute('aria-selected')).toBe(false);
	});

	it('never mounts the Empty children while items match', async () => {
		filterable(items('Rename', 'Delete'), { open: false, filter: { empty: 'No results' } });
		await userEvent.click(page.getByRole('button', { name: 'Actions' }));
		await expect.poll(() => queryItem('Rename')).not.toBe(null);
		await frame();
		expect(page.getByText('No results').query()).toBe(null);
		expect(document.querySelector('[role="status"]')).toBe(null);
	});

	it.each(['vertical', 'horizontal'] as const)(
		'passes the keydown event to onItemHighlighted in a %s menu',
		async (orientation) => {
			const onItemHighlighted = vi.fn();
			filterable(items('Rename', 'Delete'), { rootProps: { orientation, onItemHighlighted } });
			await expect.poll(() => focused()).toBe(input());
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBe(item('Rename'));
			const details = onItemHighlighted.mock.lastCall![1];
			expect(details.reason).toBe('keyboard');
			expect(details.event).toBeInstanceOf(KeyboardEvent);
			expect(details.event.key).toBe('ArrowDown');
		}
	);
});
