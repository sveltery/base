// Assertions follow Base UI v1.9.0 packages/react/src/menu/filter-root/MenuFilterRoot.scoping.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import MenuIndependentHarness from '../../tests/menu/MenuIndependentHarness.svelte';
import MenuOrphan from '../../tests/menu/MenuOrphan.svelte';
import { mouse, pointer } from '../../tests/menu/mouse.js';
import { testStyle } from '../../tests/menu/style.js';
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

function focused() {
	return document.activeElement;
}

function trigger(name = 'Actions') {
	return page.getByRole('button', { name }).element() as HTMLElement;
}

function after() {
	return page.getByRole('button', { name: 'After' }).element();
}

/** Modal focus management hides everything outside the popup from assistive technology. */
function isHiddenFromAssistiveTechnology(element: Element) {
	return element.closest('[aria-hidden="true"], [inert]') !== null;
}

async function frame() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

const actions = items('Rename', 'Delete', 'Duplicate');

function filterableMenu(
	extra: MenuItemSpec[] = [],
	filter: MenuFilterSpec = {},
	options: Bag = {}
) {
	return render(MenuHarness, {
		triggerLabel: 'Actions',
		open: true,
		filter: { empty: 'No results', ...filter },
		items: [...actions, ...extra],
		...options
	});
}

describe('Menu.FilterProvider scoping', () => {
	it('makes the menu filterable', async () => {
		filterableMenu();
		expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
		const popup = page.getByRole('dialog', { name: 'Actions' }).element();
		expect(popup.contains(searchbox())).toBe(true);
		expect(popup.contains(document.querySelector('[role="menu"]'))).toBe(true);
		expect(itemNames()).toEqual(['Rename', 'Delete', 'Duplicate']);
	});

	it('filters items by text and shows the empty state', async () => {
		filterableMenu();
		searchbox()!.focus();
		await userEvent.keyboard('del');
		await expect.poll(itemNames).toEqual(['Delete']);
		expect(document.querySelector('[role="status"]')).toBe(null);
		await userEvent.keyboard('{Backspace}{Backspace}{Backspace}zzz');
		await expect.poll(itemNames).toEqual([]);
		expect(document.querySelector('[role="status"]')!.textContent).toContain('No results');
	});

	it('navigates the list from the input with aria-activedescendant', async () => {
		const onClick = vi.fn();
		render(MenuHarness, {
			open: true,
			filter: {},
			items: [{ type: 'item', label: 'Rename', props: { onclick: onClick } }, ...items('Delete')]
		});
		searchbox()!.focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(item('Rename').id);
		expect(focused()).toBe(searchbox());
		await userEvent.keyboard('{Enter}');
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('starts from the provider value and reports changes', async () => {
		const onValueChange = vi.fn();
		filterableMenu([], { providerProps: { value: 'dup', onValueChange } });
		expect(searchbox()!.value).toBe('dup');
		await expect.poll(itemNames).toEqual(['Duplicate']);
		searchbox()!.focus();
		await userEvent.keyboard('{End}x');
		expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('dupx');
	});

	it('leaves a plain menu untouched', async () => {
		render(MenuHarness, { triggerLabel: 'Actions', open: true, items: items('Delete') });
		expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
		expect(document.querySelector('[role="menu"]')).not.toBe(null);
		expect(document.querySelector('[role="dialog"]')).toBe(null);
	});

	it('throws when a filter part is rendered in a plain menu', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			expect(() => render(MenuOrphan, { part: 'input' })).toThrow(
				'Base UI: <Menu.Input> must be placed in a menu wrapped in <Menu.FilterProvider>.'
			);
		} finally {
			spy.mockRestore();
		}
	});

	it('throws when a filter part is rendered in a plain submenu of a filterable menu', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			expect(() => render(MenuOrphan, { part: 'input-in-plain-submenu' })).toThrow(
				'Base UI: <Menu.Input> must be placed in a menu wrapped in <Menu.FilterProvider>.'
			);
		} finally {
			spy.mockRestore();
		}
	});

	it('does not extend to a plain submenu inside the filterable menu', async () => {
		filterableMenu([{ type: 'submenu', label: 'Move to', items: items('Projects', 'Archive') }]);
		const submenuTrigger = item('Move to');
		expect(submenuTrigger.getAttribute('aria-haspopup')).toBe('menu');
		await userEvent.click(submenuTrigger);
		await expect.poll(() => page.getByRole('menu', { name: 'Move to' }).query()).not.toBe(null);
		expect(document.querySelectorAll('input[role="searchbox"]')).toHaveLength(1);

		// The trigger is still an item of the filterable parent list, so the parent query hides it.
		searchbox()!.focus();
		await userEvent.keyboard('ren');
		await expect.poll(() => queryItem('Move to')).toBe(null);
	});

	it('filters a filterable submenu without touching the parent list', async () => {
		filterableMenu([
			{
				type: 'submenu',
				label: 'Move to',
				filter: { inputLabel: 'Filter folders' },
				items: items('Projects', 'Archive')
			}
		]);
		const submenuTrigger = item('Move to');
		expect(submenuTrigger.getAttribute('aria-haspopup')).toBe('dialog');
		searchbox()!.focus();
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
		expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(submenuTrigger.id);
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => searchbox('Filter folders')).not.toBe(null);
		await expect.poll(() => focused()).toBe(searchbox('Filter folders'));
		await userEvent.keyboard('arch');
		await expect.poll(() => queryItem('Projects')).toBe(null);
		expect(queryItem('Archive')).not.toBe(null);
		expect(queryItem('Rename')).not.toBe(null);
	});

	it('filters a submenu of a plain menu', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			open: true,
			items: [
				...items('Rename'),
				{
					type: 'submenu',
					label: 'Move to',
					rootProps: { open: true },
					filter: { inputLabel: 'Filter folders' },
					items: items('Projects')
				}
			]
		});
		expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
		expect(item('Move to').getAttribute('aria-haspopup')).toBe('dialog');
		await expect.poll(() => searchbox('Filter folders')).not.toBe(null);
		expect(
			page.getByRole('dialog', { name: 'Move to' }).element().contains(searchbox('Filter folders'))
		).toBe(true);
	});

	it('announces a dialog from a detached trigger attached to a filterable root', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			detached: true,
			filter: {},
			items: items('Rename')
		});
		expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
		await userEvent.click(trigger());
		await expect.poll(() => searchbox()).not.toBe(null);
		await expect.poll(() => focused()).toBe(searchbox());
	});

	it('enters and leaves a plain submenu with the cross-axis keys from the input', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			open: true,
			filter: {},
			items: [
				...items('Rename'),
				{
					type: 'submenu',
					label: 'Share',
					popupProps: { 'data-testid': 'submenu' },
					items: items('Email', 'Copy link')
				}
			]
		});
		await expect.poll(() => focused()).toBe(searchbox());
		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		const shareTrigger = item('Share');
		expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(shareTrigger.id);

		// A plain submenu roves real focus, so entering it hands focus to its first item.
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => focused()).toBe(queryItem('Email'));
		// Only the focused submenu item is highlighted, as when a roving trigger blurs.
		expect(shareTrigger.hasAttribute('data-highlighted')).toBe(false);
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe(queryItem('Copy link'));

		// Leaving returns focus to the input and highlights the trigger again.
		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => document.querySelector('[data-testid="submenu"]')).toBe(null);
		await expect.poll(() => focused()).toBe(searchbox());
		await expect
			.poll(() => searchbox()!.getAttribute('aria-activedescendant'))
			.toBe(shareTrigger.id);
	});

	describe('leaving a plain submenu while it animates out', () => {
		function plainSubmenuMenu() {
			testStyle(
				'.exiting { transition: opacity 300ms; } .exiting[data-ending-style] { opacity: 0; }'
			);
			render(MenuHarness, {
				triggerLabel: 'Actions',
				open: true,
				popupProps: { class: 'exiting' },
				filter: {},
				items: [
					...items('Rename'),
					{
						type: 'submenu',
						label: 'Share',
						popupProps: { class: 'exiting', 'data-testid': 'submenu' },
						items: items('Email')
					}
				]
			});
		}

		function submenu() {
			return page.getByTestId('submenu').element();
		}

		async function enterSubmenu() {
			await expect.poll(() => focused()).toBe(searchbox());
			await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
			await expect.poll(() => focused()).toBe(item('Email'));
		}

		it.each(['ArrowLeft', 'Escape'])(
			'highlights the trigger as soon as %s closes the submenu',
			async (key) => {
				plainSubmenuMenu();
				await enterSubmenu();

				await userEvent.keyboard(`{${key}}`);

				expect(submenu().hasAttribute('data-ending-style')).toBe(true);
				expect(focused()).toBe(searchbox());
				expect(item('Share').hasAttribute('data-highlighted')).toBe(true);
				expect(searchbox()!.hasAttribute('data-highlighted')).toBe(false);
			}
		);

		it('keeps focus off the input while an item press closes the whole menu', async () => {
			plainSubmenuMenu();
			await enterSubmenu();
			const input = searchbox()!;

			await userEvent.keyboard('{Enter}');

			expect(submenu().hasAttribute('data-ending-style')).toBe(true);
			expect(input.isConnected).toBe(true);
			expect(focused()).not.toBe(input);
		});

		it('returns focus to the input as soon as the pointer closes the submenu', async () => {
			plainSubmenuMenu();
			await expect.poll(() => focused()).toBe(searchbox());
			await userEvent.hover(item('Share'));
			await expect.poll(() => queryItem('Email')).not.toBe(null);
			await userEvent.hover(item('Email'));
			await expect.poll(() => focused()).toBe(item('Email'));

			await userEvent.hover(item('Rename'));
			await expect.poll(() => submenu().hasAttribute('data-ending-style')).toBe(true);
			expect(focused()).toBe(searchbox());
		});
	});

	describe('trigger key relay', () => {
		async function openByHover(triggerProps: Bag = {}) {
			render(MenuHarness, {
				triggerLabel: 'Actions',
				trigger: { openOnHover: true, delay: 0, ...triggerProps },
				filter: {},
				items: items('Rename', 'Delete')
			});
			const button = trigger();
			button.focus();
			await userEvent.hover(page.getByRole('button', { name: 'Actions' }));
			await expect.poll(() => searchbox()).not.toBe(null);
			// A hover open shows the popup without moving focus off the trigger.
			expect(focused()).toBe(button);
			return button;
		}

		it('moves ArrowDown from the trigger into the input and highlights the first item', async () => {
			await openByHover();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focused()).toBe(searchbox());
			await expect
				.poll(() => searchbox()!.getAttribute('aria-activedescendant'))
				.toBe(item('Rename').id);
		});

		it('moves a typed character from the trigger into the input', async () => {
			await openByHover();
			await userEvent.keyboard('r');
			await expect.poll(() => focused()).toBe(searchbox());
		});

		it('keeps focus on the trigger for modified keys and cross-axis arrows', async () => {
			const button = await openByHover();
			await userEvent.keyboard('{Control>}r{/Control}');
			expect(focused()).toBe(button);
			await userEvent.keyboard('{ArrowRight}');
			expect(focused()).toBe(button);
			expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(null);
		});

		it('lets a consumer onkeydown cancel the relay', async () => {
			const button = await openByHover({
				onkeydown(event: KeyboardEvent) {
					if (event.key === 'ArrowDown') event.preventDefault();
				}
			});
			await userEvent.keyboard('{ArrowDown}');
			expect(focused()).toBe(button);
		});
	});

	describe('development warnings', () => {
		it('warns when a filterable menu opens without an input', async () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				render(MenuHarness, { open: true, trigger: false, list: true, items: items('Rename') });
				await frame();
				expect(warnSpy).not.toHaveBeenCalled();
				const { unmount } = render(MenuOrphan, { part: 'filter-without-input' });
				await frame();
				expect(warnSpy).toHaveBeenCalledTimes(1);
				expect(String(warnSpy.mock.calls[0][0])).toContain('opened without a <Menu.Input>');
				await unmount();
			} finally {
				warnSpy.mockRestore();
			}
		});

		it('does not warn for a filterable menu with an input and a detached trigger', async () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				render(MenuHarness, {
					open: true,
					detached: true,
					filter: {},
					items: items('Rename')
				});
				await frame();
				expect(warnSpy).not.toHaveBeenCalled();
			} finally {
				warnSpy.mockRestore();
			}
		});
	});

	describe('prop: onItemHighlighted', () => {
		const highlightItems: MenuItemSpec[] = [
			...items('Rename'),
			{ type: 'item', label: 'Delete', props: { label: 'Remove' } },
			...items('Duplicate')
		];

		function calls(spy: ReturnType<typeof vi.fn>) {
			return spy.mock.calls.map(([node, details]) => [
				(node as HTMLElement | undefined)?.textContent?.trim(),
				details.reason,
				details.label
			]);
		}

		it('reports keyboard highlights while the input keeps focus', async () => {
			const onItemHighlighted = vi.fn();
			render(MenuHarness, {
				open: true,
				rootProps: { onItemHighlighted },
				filter: {},
				items: highlightItems
			});
			searchbox()!.focus();
			await userEvent.keyboard('{ArrowDown}{ArrowDown}');
			expect(focused()).toBe(searchbox());
			expect(calls(onItemHighlighted)).toEqual([
				['Rename', 'keyboard', 'Rename'],
				['Delete', 'keyboard', 'Remove']
			]);
			expect(onItemHighlighted.mock.calls[1][1].event).toBeInstanceOf(KeyboardEvent);
		});

		it('reports the auto-highlighted item as a programmatic change', async () => {
			const onItemHighlighted = vi.fn();
			render(MenuHarness, {
				open: true,
				rootProps: { onItemHighlighted },
				filter: { providerProps: { autoHighlight: true } },
				items: highlightItems
			});
			searchbox()!.focus();
			await userEvent.keyboard('dup');
			await expect
				.poll(() => calls(onItemHighlighted))
				.toEqual([['Duplicate', 'none', 'Duplicate']]);
			await userEvent.keyboard('zzz');
			await expect
				.poll(() => calls(onItemHighlighted))
				.toEqual([
					['Duplicate', 'none', 'Duplicate'],
					[undefined, 'none', undefined]
				]);
		});

		it('does not report the item that takes the highlighted index when an item is inserted', async () => {
			const onItemHighlighted = vi.fn();
			const screen = render(MenuHarness, {
				open: true,
				rootProps: { onItemHighlighted },
				filter: {},
				items: items('Rename', 'Delete', 'Duplicate')
			});
			searchbox()!.focus();
			await userEvent.keyboard('{ArrowDown}{ArrowDown}');
			expect(calls(onItemHighlighted).at(-1)?.[0]).toBe('Delete');
			onItemHighlighted.mockClear();
			await screen.rerender({ items: items('Archive', 'Rename', 'Delete', 'Duplicate') });
			await frame();
			expect(calls(onItemHighlighted).map(([name]) => name)).toEqual([undefined]);
			expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(null);
		});

		it('keeps the highlight when an item the query filters out is appended', async () => {
			const onItemHighlighted = vi.fn();
			const screen = render(MenuHarness, {
				open: true,
				rootProps: { onItemHighlighted },
				filter: {},
				items: items('Report A', 'Report B', 'Other')
			});
			searchbox()!.focus();
			await userEvent.keyboard('rep{ArrowDown}{ArrowDown}');
			const reportB = item('Report B');
			await expect.poll(() => searchbox()!.getAttribute('aria-activedescendant')).toBe(reportB.id);
			onItemHighlighted.mockClear();
			await screen.rerender({ items: items('Report A', 'Report B', 'Other', 'Zebra') });
			await frame();
			expect(queryItem('Zebra')).toBe(null);
			expect(searchbox()!.getAttribute('aria-activedescendant')).toBe(reportB.id);
			expect(onItemHighlighted).not.toHaveBeenCalled();
		});
	});
});

describe('focus navigation in a filterable menu', () => {
	function focusMenu(options: Bag = {}, extra: MenuItemSpec[] = []) {
		return render(MenuHarness, {
			triggerLabel: 'Actions',
			open: true,
			after: true,
			popupProps: { 'data-testid': 'popup' },
			filter: {},
			items: [...items('Rename'), ...extra],
			...options
		});
	}

	it('does not trap a hover-opened popup', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			after: true,
			trigger: { openOnHover: true, delay: 0 },
			filter: {},
			items: items('Rename')
		});
		await userEvent.hover(page.getByRole('button', { name: 'Actions' }));
		await expect.poll(() => searchbox()).not.toBe(null);
		expect(isHiddenFromAssistiveTechnology(after())).toBe(false);
	});

	it('does not trap a popup opened by an assistive technology click', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			after: true,
			filter: {},
			items: items('Rename')
		});
		const button = trigger();
		// An assistive technology activation reports no pointer type.
		pointer(button, 'pointerdown', { pointerType: '' });
		mouse(button, 'mousedown');
		mouse(button, 'click', { detail: 1 });
		await expect.poll(() => searchbox()).not.toBe(null);
		expect(isHiddenFromAssistiveTechnology(after())).toBe(false);
	});

	it('lets Tab leave a modal filterable popup and closes it', async () => {
		focusMenu();
		await expect.poll(() => focused()).toBe(searchbox());
		expect(isHiddenFromAssistiveTechnology(after())).toBe(false);
		await userEvent.keyboard('{Tab}');
		await expect.poll(() => focused()).toBe(after());
		await expect.poll(() => document.querySelector('[role="menu"]')).toBe(null);
	});

	it('skips Clear when tabbing out of the popup', async () => {
		focusMenu({ filter: { providerProps: { value: 're' }, clear: true } }, items('Delete'));
		await expect.poll(() => focused()).toBe(searchbox());
		expect(document.querySelector('[aria-label="Clear filter"]')!.getAttribute('tabindex')).toBe(
			'-1'
		);
		await userEvent.keyboard('{Tab}');
		await expect.poll(() => focused()).toBe(after());
		await expect.poll(() => document.querySelector('[role="menu"]')).toBe(null);
	});

	it('lets Tab leave the popup with modal={false}', async () => {
		focusMenu({ rootProps: { modal: false } });
		await expect.poll(() => focused()).toBe(searchbox());
		expect(isHiddenFromAssistiveTechnology(after())).toBe(false);
		await userEvent.keyboard('{Tab}');
		await expect.poll(() => focused()).toBe(after());
	});

	it('does not trap a menu opened by touch', async () => {
		render(MenuHarness, {
			triggerLabel: 'Actions',
			after: true,
			filter: {},
			items: items('Rename')
		});
		const button = trigger();
		pointer(button, 'pointerdown', { pointerType: 'touch' });
		mouse(button, 'mousedown');
		await expect.poll(() => searchbox()).not.toBe(null);
		expect(isHiddenFromAssistiveTechnology(after())).toBe(false);
	});

	it('leaves a filterable submenu accessible inside its parent', async () => {
		focusMenu({}, [
			{
				type: 'submenu',
				label: 'More',
				popupProps: { 'data-testid': 'submenu-popup' },
				filter: { inputLabel: 'Filter more' },
				items: items('Share')
			}
		]);
		await expect.poll(() => focused()).toBe(searchbox());
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
		await expect.poll(() => searchbox('Filter more')).not.toBe(null);
		await expect.poll(() => focused()).toBe(searchbox('Filter more'));
		// The submenu runs no modal focus management of its own.
		expect(
			isHiddenFromAssistiveTechnology(document.querySelector('[data-testid="submenu-popup"]')!)
		).toBe(false);
	});
});

describe('independent menu focus inside a filterable menu', () => {
	it('returns to its own trigger on Shift+Tab', async () => {
		render(MenuIndependentHarness);
		const action = page.getByRole('menuitem', { name: 'Independent action' });
		await expect.poll(() => action.query()).not.toBe(null);
		(action.element() as HTMLElement).focus();
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		await expect.poll(() => action.query()).toBe(null);
		await expect
			.poll(() => document.activeElement)
			.toBe(page.getByRole('button', { name: 'Independent' }).element());
	});
});
