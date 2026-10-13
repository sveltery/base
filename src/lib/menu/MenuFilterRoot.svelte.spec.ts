// Assertions follow Base UI v1.9.0 packages/react/src/menu/filter-root/MenuFilterRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
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
