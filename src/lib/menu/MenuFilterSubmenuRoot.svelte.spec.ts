// Assertions follow Base UI v1.9.0
// packages/react/src/menu/filter-submenu-root/MenuFilterSubmenuRoot.test.tsx and the submenu cases
// of packages/react/src/menu/filter-root/MenuFilterRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import { mouse } from '../../tests/menu/mouse.js';
import { items, type MenuFilterSpec, type MenuItemSpec } from '../../tests/menu/types.js';

type Bag = Record<string, unknown>;
type Submenu = Extract<MenuItemSpec, { type: 'submenu' }>;

function searchbox(name: string) {
	return document.querySelector<HTMLInputElement>(`input[aria-label="${name}"]`);
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

function focused() {
	return document.activeElement;
}

async function frame() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

const PARENT = 'Filter actions';
const FOLDERS = 'Filter folders';

function folders(extra: Partial<Submenu> = {}, filter: MenuFilterSpec | null = {}): Submenu {
	return {
		type: 'submenu',
		label: 'Move to folder',
		popupProps: { 'data-testid': 'submenu' },
		...(filter ? { filter: { inputLabel: FOLDERS, ...filter } } : {}),
		items: items('Documents'),
		...extra
	};
}

/** A filterable root, open, with its input focused. */
async function filterableRoot(entries: MenuItemSpec[], options: Bag = {}) {
	const result = render(MenuHarness, {
		triggerLabel: 'Actions',
		open: true,
		filter: {},
		items: entries,
		...options
	});
	await expect.poll(() => focused()).toBe(searchbox(PARENT));
	return result;
}

/** A plain root with a filterable submenu between two items. */
function plainParent(submenu: Partial<Submenu> = {}, filter: MenuFilterSpec = {}) {
	return render(MenuHarness, {
		triggerLabel: 'Actions',
		open: true,
		items: [
			...items('Rename'),
			folders(
				{
					label: 'Move to',
					triggerProps: { 'data-testid': 'submenu-trigger' },
					items: items('Projects', 'Archive'),
					list: undefined,
					...submenu
				},
				filter
			),
			...items('Delete')
		]
	});
}

describe('Menu.FilterProvider around Menu.SubmenuRoot', () => {
	describe('prop: value', () => {
		it('renders the initial query and reports changes', async () => {
			const onValueChange = vi.fn();
			render(MenuHarness, {
				triggerLabel: 'Actions',
				open: true,
				filter: {},
				items: [
					folders(
						{ rootProps: { open: true }, items: items('Projects', 'Archive') },
						{ providerProps: { value: 'pro', onValueChange } }
					)
				]
			});
			await expect.poll(() => searchbox(FOLDERS)?.value).toBe('pro');
			expect(queryItem('Archive')).toBe(null);
			searchbox(FOLDERS)!.focus();
			await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');
			expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('');
			expect(onValueChange.mock.calls.at(-1)?.[1].reason).toBe('input-clear');
			await expect.poll(() => queryItem('Archive')).not.toBe(null);
		});

		it('keeps the uncontrolled query when the change is canceled', async () => {
			const onValueChange = (_value: string, details: { cancel(): void }) => details.cancel();
			render(MenuHarness, {
				triggerLabel: 'Actions',
				open: true,
				filter: {},
				items: [
					folders(
						{ rootProps: { open: true }, items: items('Projects') },
						{ providerProps: { value: 'pro', onValueChange } }
					)
				]
			});
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			searchbox(FOLDERS)!.focus();
			await userEvent.keyboard('x');
			await frame();
			expect(searchbox(FOLDERS)!.value).toBe('pro');
		});
	});

	describe('inside a plain parent menu', () => {
		async function enter() {
			const trigger = page.getByTestId('submenu-trigger').element() as HTMLElement;
			trigger.focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			return trigger;
		}

		it('opens with the cross-axis key and focuses the submenu input', async () => {
			plainParent();
			const trigger = await enter();
			expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
			expect(document.querySelector('[data-testid="submenu"]')!.getAttribute('role')).toBe(
				'dialog'
			);
		});

		it('tracks the input focus ring across keyboard and pointer highlights', async () => {
			plainParent();
			await expect.poll(() => focused()?.getAttribute('role')).toBe('menu');
			await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			const input = searchbox(FOLDERS)!;
			expect(input.hasAttribute('data-highlighted')).toBe(false);
			expect(input.getAttribute('aria-activedescendant')).toBe(item('Projects').id);

			await userEvent.hover(page.getByRole('menuitem', { name: 'Archive' }));
			expect(input.getAttribute('aria-activedescendant')).toBe(item('Archive').id);
			expect(input.hasAttribute('data-highlighted')).toBe(true);

			await userEvent.hover(page.getByRole('searchbox', { name: FOLDERS }));
			await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(null);
			expect(input.hasAttribute('data-highlighted')).toBe(true);

			await userEvent.keyboard('{ArrowDown}');
			expect(input.hasAttribute('data-highlighted')).toBe(false);

			await userEvent.keyboard('{ArrowUp}');
			expect(input.getAttribute('aria-activedescendant')).toBe(null);
			expect(input.hasAttribute('data-highlighted')).toBe(true);
		});

		it('closes with Escape and returns focus to the highlighted trigger', async () => {
			plainParent();
			const trigger = await enter();
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[data-testid="submenu"]')).toBe(null);
			await expect.poll(() => focused()).toBe(trigger);
			expect(trigger.hasAttribute('data-highlighted')).toBe(true);
			expect(queryItem('Rename')).not.toBe(null);
		});

		it('closes with the cross-axis close key and returns focus to the trigger', async () => {
			plainParent();
			const trigger = await enter();
			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => document.querySelector('[data-testid="submenu"]')).toBe(null);
			await expect.poll(() => focused()).toBe(trigger);
		});

		it('hands the cursor back to the submenu input when the open key repeats', async () => {
			plainParent();
			const trigger = await enter();
			trigger.focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			expect(document.querySelector('[data-testid="submenu"]')).not.toBe(null);
		});

		it('closes when the close key arrives while the trigger holds focus', async () => {
			plainParent();
			const trigger = await enter();
			trigger.focus();
			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => document.querySelector('[data-testid="submenu"]')).toBe(null);
		});

		it('moves along the parent list with the main-axis keys', async () => {
			plainParent();
			(page.getByTestId('submenu-trigger').element() as HTMLElement).focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focused()).toBe(item('Delete'));
		});

		it('prevents native scrolling when moving along the parent menu', async () => {
			plainParent({ triggerProps: { 'data-testid': 'submenu-trigger', openOnHover: false } });
			const trigger = page.getByTestId('submenu-trigger').element() as HTMLElement;
			trigger.focus();
			const event = new KeyboardEvent('keydown', {
				key: 'ArrowDown',
				bubbles: true,
				cancelable: true
			});
			expect(trigger.dispatchEvent(event)).toBe(false);
			expect(focused()).toBe(item('Delete'));
		});

		it('keeps focus in the submenu input when the pointer crosses the trigger again', async () => {
			plainParent({ triggerProps: { delay: 0, 'data-testid': 'submenu-trigger' } });
			const trigger = page.getByTestId('submenu-trigger').element() as HTMLElement;
			await userEvent.hover(trigger);
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			const input = searchbox(FOLDERS)!;

			mouse(input, 'mousemove');
			await expect.poll(() => focused()).toBe(input);
			await userEvent.keyboard('ar');
			expect(input.value).toBe('ar');

			mouse(trigger, 'mousemove');
			await frame();
			await frame();
			expect(focused()).toBe(input);
			await userEvent.keyboard('c');
			expect(input.value).toBe('arc');
			expect(queryItem('Archive')).not.toBe(null);
		});

		it('runs the trigger onfocus when the trigger hands focus back to the submenu input', async () => {
			const focusFrom: (EventTarget | null)[] = [];
			plainParent({
				triggerProps: {
					delay: 0,
					'data-testid': 'submenu-trigger',
					onfocus: (event: FocusEvent) => focusFrom.push(event.relatedTarget)
				}
			});
			const trigger = page.getByTestId('submenu-trigger').element() as HTMLElement;
			await userEvent.hover(trigger);
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			const input = searchbox(FOLDERS)!;
			mouse(input, 'mousemove');
			await expect.poll(() => focused()).toBe(input);
			focusFrom.length = 0;

			mouse(trigger, 'mousemove');
			await frame();
			await frame();
			expect(focusFrom).toEqual([input]);
			expect(focused()).toBe(input);
		});

		it('leaves a key that is neither an axis nor an activation key to the parent', async () => {
			plainParent();
			(page.getByTestId('submenu-trigger').element() as HTMLElement).focus();
			await userEvent.keyboard('{Home}');
			expect(document.querySelector('[data-testid="submenu"]')).toBe(null);
			await expect.poll(() => focused()).toBe(item('Rename'));
		});

		it('keeps the automatic highlight when the keyboard enters a hover-opened submenu', async () => {
			plainParent(
				{ triggerProps: { 'data-testid': 'submenu-trigger', delay: 0 } },
				{ providerProps: { autoHighlight: 'always' } }
			);
			const trigger = page.getByTestId('submenu-trigger');
			await userEvent.hover(trigger);
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			await expect
				.poll(() => searchbox(FOLDERS)!.getAttribute('aria-activedescendant'))
				.toBe(item('Projects').id);
			await expect.poll(() => focused()).toBe(trigger.element());
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			expect(searchbox(FOLDERS)!.getAttribute('aria-activedescendant')).toBe(item('Projects').id);
		});

		it('ignores a close key that composes text in the submenu input', async () => {
			plainParent({ triggerProps: { 'data-testid': 'submenu-trigger', openOnHover: false } });
			await enter();
			searchbox(FOLDERS)!.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'ArrowLeft',
					keyCode: 229,
					bubbles: true,
					cancelable: true
				})
			);
			await frame();
			expect(item('Move to').hasAttribute('data-popup-open')).toBe(true);
			expect(focused()).toBe(searchbox(FOLDERS));
		});
	});

	describe('inside a filterable parent menu', () => {
		it('opens a virtually focused submenu with the keyboard', async () => {
			await filterableRoot([folders(), ...items('Delete')]);
			const parent = searchbox(PARENT)!;
			await userEvent.keyboard('{ArrowDown}');
			const trigger = item('Move to folder');
			expect(parent.getAttribute('aria-activedescendant')).toBe(trigger.id);
			expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');

			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			const child = searchbox(FOLDERS)!;
			expect(child.hasAttribute('data-highlighted')).toBe(false);
			expect(child.getAttribute('aria-activedescendant')).toBe(item('Documents').id);
			expect(parent.getAttribute('aria-activedescendant')).toBe(null);

			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => focused()).toBe(parent);
			expect(parent.getAttribute('aria-activedescendant')).toBe(trigger.id);

			await userEvent.keyboard('{ArrowDown}');
			expect(parent.getAttribute('aria-activedescendant')).toBe(item('Delete').id);
		});

		for (const autoHighlight of [false, true]) {
			it(`keeps cross-axis keys as caret keys while the submenu query is not empty (autoHighlight: ${autoHighlight})`, async () => {
				await filterableRoot([folders({}, { providerProps: { autoHighlight } })]);
				await userEvent.keyboard('{ArrowDown}{ArrowRight}');
				await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
				await userEvent.keyboard('doc');
				expect(searchbox(FOLDERS)!.value).toBe('doc');
				await userEvent.keyboard('{ArrowLeft}');
				expect(focused()).toBe(searchbox(FOLDERS));
				expect(searchbox(FOLDERS)!.selectionStart).toBe(2);
				expect(searchbox(FOLDERS)!.value).toBe('doc');
			});
		}

		it('uses RTL cross-axis keys to enter and leave a filterable submenu', async () => {
			await filterableRoot([folders()], { direction: 'rtl' });
			await userEvent.keyboard('{ArrowDown}{ArrowLeft}');
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			mouse(searchbox(FOLDERS)!, 'mousemove');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => searchbox(FOLDERS)).toBe(null);
			expect(focused()).toBe(searchbox(PARENT));
			expect(searchbox(PARENT)!.getAttribute('aria-activedescendant')).toBe(
				item('Move to folder').id
			);
		});

		it('returns virtual focus to the parent input on Escape and resumes filtering', async () => {
			await filterableRoot([folders(), ...items('Rename')]);
			await userEvent.keyboard('{ArrowDown}{ArrowRight}');
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			mouse(searchbox(FOLDERS)!, 'mousemove');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => focused()).toBe(searchbox(PARENT));
			expect(searchbox(PARENT)!.getAttribute('aria-activedescendant')).toBe(
				item('Move to folder').id
			);
			await userEvent.keyboard('ren');
			expect(searchbox(PARENT)!.value).toBe('ren');
			await expect.poll(() => queryItem('Move to folder')).toBe(null);
			expect(queryItem('Rename')).not.toBe(null);
		});

		it('opens a submenu from a filterable submenu input', async () => {
			await filterableRoot([
				folders({
					items: [{ type: 'submenu', label: 'More folders', items: items('Archive') }]
				})
			]);
			await userEvent.keyboard('{ArrowDown}{ArrowRight}');
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			mouse(searchbox(FOLDERS)!, 'mousemove');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			const nested = item('More folders');
			expect(searchbox(FOLDERS)!.getAttribute('aria-activedescendant')).toBe(nested.id);

			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => focused()).toBe(queryItem('Archive'));

			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			await expect
				.poll(() => searchbox(FOLDERS)!.getAttribute('aria-activedescendant'))
				.toBe(nested.id);

			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => focused()).toBe(searchbox(PARENT));
			await expect
				.poll(() => searchbox(PARENT)!.getAttribute('aria-activedescendant'))
				.toBe(item('Move to folder').id);
		});

		it('opens a virtually focused submenu with Enter from the input', async () => {
			await filterableRoot([folders({ label: 'Share' }), ...items('Delete')]);
			const parent = searchbox(PARENT)!;
			const trigger = item('Share');
			await userEvent.keyboard('{ArrowDown}');
			expect(parent.getAttribute('aria-activedescendant')).toBe(trigger.id);
			await userEvent.keyboard('{Enter}');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			expect(parent.getAttribute('aria-activedescendant')).toBe(null);
			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => focused()).toBe(parent);
			expect(parent.getAttribute('aria-activedescendant')).toBe(trigger.id);
			await userEvent.keyboard('{ArrowDown}');
			expect(parent.getAttribute('aria-activedescendant')).toBe(item('Delete').id);
		});

		it('closes a hover-opened submenu from a virtually focused parent', async () => {
			await filterableRoot([folders({ triggerProps: { delay: 0 } })]);
			await userEvent.keyboard('{ArrowDown}');
			const trigger = item('Move to folder');
			await userEvent.hover(trigger);
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			mouse(searchbox(FOLDERS)!, 'mousemove');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));
			expect(searchbox(PARENT)!.getAttribute('aria-activedescendant')).toBe(trigger.id);
			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => searchbox(FOLDERS)).toBe(null);
			await expect.poll(() => focused()).toBe(searchbox(PARENT));
			expect(searchbox(PARENT)!.getAttribute('aria-activedescendant')).toBe(trigger.id);
		});

		it('focuses the first item when entering a hover-opened plain submenu', async () => {
			await filterableRoot([
				folders({ triggerProps: { delay: 0 }, items: items('Documents', 'Downloads') }, null)
			]);
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.hover(item('Move to folder'));
			await expect.poll(() => queryItem('Documents')).not.toBe(null);
			await frame();
			expect(focused()).toBe(searchbox(PARENT));
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => focused()).toBe(queryItem('Documents'));
		});

		it('retains the parent highlight when a submenu opens from a pointer', async () => {
			await filterableRoot([folders({ triggerProps: { delay: 0 } })]);
			await userEvent.hover(item('Move to folder'));
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			expect(searchbox(PARENT)!.getAttribute('aria-activedescendant')).toBe(
				item('Move to folder').id
			);
		});

		it('filters a non-filterable submenu trigger from a filterable parent', async () => {
			await filterableRoot([...items('Rename'), folders({}, null)]);
			await userEvent.keyboard('rename{ArrowDown}');
			expect(queryItem('Rename')).not.toBe(null);
			expect(queryItem('Move to folder')).toBe(null);
		});

		it('keeps a submenu trigger visible when the query matches its label', async () => {
			await filterableRoot([...items('Rename'), folders()]);
			await userEvent.keyboard('move');
			await expect.poll(() => queryItem('Rename')).toBe(null);
			expect(queryItem('Move to folder')).not.toBe(null);
		});

		it('matches a submenu trigger on its label prop', async () => {
			await filterableRoot([
				...items('Rename'),
				folders({ triggerProps: { label: 'Move to directory' } })
			]);
			await userEvent.keyboard('directory');
			await expect.poll(() => queryItem('Rename')).toBe(null);
			expect(queryItem('Move to folder')).not.toBe(null);
		});

		it('closes the submenu when the query filters out its trigger', async () => {
			await filterableRoot([...items('Rename'), folders({ triggerProps: { delay: 0 } })]);
			await userEvent.hover(item('Move to folder'));
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			searchbox(PARENT)!.focus();
			await userEvent.keyboard('rename');
			await expect.poll(() => queryItem('Move to folder')).toBe(null);
			await expect.poll(() => searchbox(FOLDERS)).toBe(null);
			expect(queryItem('Rename')).not.toBe(null);
		});

		it('keeps an open submenu trigger mounted when its filter close is canceled', async () => {
			const onOpenChange = (open: boolean, details: { cancel(): void }) => {
				if (!open) details.cancel();
			};
			render(MenuHarness, {
				triggerLabel: 'Actions',
				open: true,
				filter: {},
				items: [
					...items('Rename'),
					{
						type: 'group',
						items: [
							folders({ rootProps: { open: true, onOpenChange }, triggerProps: { delay: 0 } })
						]
					}
				]
			});
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			searchbox(PARENT)!.focus();
			await userEvent.keyboard('zzz');
			expect(searchbox(PARENT)!.value).toBe('zzz');
			await expect.poll(() => queryItem('Rename')).toBe(null);
			expect(queryItem('Move to folder')).not.toBe(null);
			expect(searchbox(FOLDERS)).not.toBe(null);
		});
	});

	describe('a horizontal parent', () => {
		const cases = [
			{ parentFilterable: false, submenuFilterable: false },
			{ parentFilterable: false, submenuFilterable: true },
			{ parentFilterable: true, submenuFilterable: false },
			{ parentFilterable: true, submenuFilterable: true }
		];
		for (const { parentFilterable, submenuFilterable } of cases) {
			it(`moves on when a vertical submenu closes on its main-axis key (filterable parent: ${parentFilterable}, filterable submenu: ${submenuFilterable})`, async () => {
				render(MenuHarness, {
					triggerLabel: 'Actions',
					rootProps: { orientation: 'horizontal' },
					list: true,
					filter: parentFilterable ? {} : undefined,
					items: [
						...items('First'),
						folders(
							{ label: 'More', items: items('Child'), list: true },
							submenuFilterable ? { inputLabel: 'Filter child actions' } : null
						),
						...items('Last')
					]
				});
				(page.getByRole('button', { name: 'Actions' }).element() as HTMLElement).focus();
				await userEvent.keyboard('{Enter}');
				await expect
					.poll(() => focused())
					.toBe(parentFilterable ? searchbox(PARENT) : queryItem('First'));
				await userEvent.keyboard('{ArrowRight}');
				const trigger = item('More');
				await expect.poll(() => trigger.hasAttribute('data-highlighted')).toBe(true);
				await userEvent.keyboard('{ArrowDown}');
				await expect.poll(() => document.querySelector('[data-testid="submenu"]')).not.toBe(null);
				await userEvent.keyboard('{ArrowLeft}');
				await expect.poll(() => document.querySelector('[data-testid="submenu"]')).toBe(null);
				expect(item('First').hasAttribute('data-highlighted')).toBe(true);
				expect(trigger.hasAttribute('data-highlighted')).toBe(false);
			});
		}

		for (const submenuFilterable of [false, true]) {
			it(`does not wrap a filterable parent when closing from its first item (filterable submenu: ${submenuFilterable})`, async () => {
				render(MenuHarness, {
					triggerLabel: 'Actions',
					rootProps: { orientation: 'horizontal' },
					filter: {},
					items: [
						folders(
							{ label: 'More', items: items('Child'), list: true },
							submenuFilterable ? { inputLabel: 'Filter child actions' } : null
						),
						...items('Middle', 'Last')
					]
				});
				(page.getByRole('button', { name: 'Actions' }).element() as HTMLElement).focus();
				await userEvent.keyboard('{Enter}');
				const trigger = item('More');
				await expect
					.poll(() => searchbox(PARENT)?.getAttribute('aria-activedescendant'))
					.toBe(trigger.id);
				await userEvent.keyboard('{ArrowDown}');
				await expect.poll(() => document.querySelector('[data-testid="submenu"]')).not.toBe(null);
				await expect.poll(focused).not.toBe(searchbox(PARENT));
				await userEvent.keyboard('{ArrowLeft}');
				await expect.poll(() => document.querySelector('[data-testid="submenu"]')).toBe(null);
				expect(focused()).toBe(searchbox(PARENT));
				expect(searchbox(PARENT)!.getAttribute('aria-activedescendant')).toBe(trigger.id);
				expect(item('Last').hasAttribute('data-highlighted')).toBe(false);
			});
		}
	});
});

describe('a hover close after the keyboard entered a hover-opened submenu', () => {
	for (const parent of ['filterable', 'plain'] as const) {
		it(`does not strand focus on the body (${parent} parent)`, async () => {
			render(MenuHarness, {
				triggerLabel: 'Actions',
				open: false,
				filter: parent === 'filterable' ? {} : undefined,
				items: [
					...items('Rename'),
					{ type: 'button', label: 'Elsewhere' },
					folders({ triggerProps: { delay: 0, closeDelay: 0 } })
				]
			});
			await userEvent.click(page.getByRole('button', { name: 'Actions' }));
			await userEvent.hover(item('Move to folder'));
			await expect.poll(() => searchbox(FOLDERS)).not.toBe(null);
			await expect.poll(() => item('Move to folder').hasAttribute('data-highlighted')).toBe(true);
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => focused()).toBe(searchbox(FOLDERS));

			// The pointer leaves the trigger without heading into the submenu.
			await userEvent.hover(page.getByRole('button', { name: 'Elsewhere' }));
			await expect.poll(() => searchbox(FOLDERS)).toBe(null);
			await frame();
			expect(focused()).toBe(parent === 'filterable' ? searchbox(PARENT) : item('Move to folder'));
		});
	}
});
