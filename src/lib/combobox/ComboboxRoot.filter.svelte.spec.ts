// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "prop: filter" through "scroll reset on input value change" (commit
// ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// A parent deriving `filteredItems` from its state is the harness deriving them from the bound
// input value and value.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Combobox } from '#lib';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxScrollHarness from '../../tests/ComboboxScrollHarness.svelte';

const input = () => page.getByTestId('input');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
function typeSynthetic(text: string) {
	const element = input().element() as HTMLInputElement;
	for (const char of text) {
		element.value += char;
		element.dispatchEvent(
			new InputEvent('input', { bubbles: true, inputType: 'insertText', data: char })
		);
	}
}
const hover = (element: Element) =>
	element.dispatchEvent(new PointerEvent('mousemove', { bubbles: true, pointerType: 'mouse' }));

describe('Combobox.Root', () => {
	describe('prop: filter', () => {
		it('uses custom filter to narrow results', async () => {
			render(ComboboxHarness, {
				items: ['alpha', 'beta', 'alphabet', 'alpine'],
				root: {
					filter: (item: unknown, query: string) => String(item).toLowerCase().startsWith(query)
				}
			});

			await userEvent.type(input(), 'alp');

			await expect.element(option('beta')).not.toBeInTheDocument();
			await expect.element(option('alpha')).toBeInTheDocument();
			await expect.element(option('alphabet')).toBeInTheDocument();
			await expect.element(option('alpine')).toBeInTheDocument();
		});

		it('resets filtered results after selecting when using a custom search stringifier', async () => {
			type Movie = { id: number; english: string; romaji: string };
			const movies: Movie[] = [
				{ id: 1, english: 'Spirited Away', romaji: 'Sen to Chihiro no Kamikakushi' },
				{ id: 2, english: 'My Neighbor Totoro', romaji: 'Tonari no Totoro' },
				{ id: 3, english: 'Princess Mononoke', romaji: 'Mononoke Hime' }
			];
			const stringifyMovie = (movie: Movie | null) =>
				movie ? `${movie.english} ${movie.romaji}` : '';

			let props!: { value: unknown };
			props = renderBound(ComboboxHarness, {
				value: null as unknown,
				items: movies,
				itemLabel: (movie: Movie) => movie.english,
				root: {
					filter: (item: Movie | null, query: string) =>
						item
							? Combobox.useFilter({ value: props.value }).contains(item, query, stringifyMovie)
							: false,
					itemToStringLabel: (movie: Movie | null) => movie?.english ?? ''
				}
			}) as never;

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.type(input(), 'tonari');
			await expect.element(option('Spirited Away')).not.toBeInTheDocument();

			await userEvent.click(option('My Neighbor Totoro'));
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(option('Spirited Away')).toBeInTheDocument();
		});
	});

	describe('prop: filteredItems', () => {
		it('resets external filteredItems when reopening after a selection', async () => {
			interface TestItem {
				id: number;
				label: string;
				label2: string;
			}
			const testItems: TestItem[] = [
				{ id: 1, label: 'apple', label2: 'one' },
				{ id: 2, label: 'orange', label2: 'two' },
				{ id: 3, label: 'banana', label2: 'three' }
			];
			const toFilter = (item: TestItem | null) => (item ? `${item.label} ${item.label2}` : '');

			renderBound(ComboboxHarness, {
				inputValue: '',
				value: null as unknown,
				items: testItems,
				itemLabel: (item: TestItem) => item.label,
				filteredItems: (search: string, value: unknown) => {
					const { contains } = Combobox.useFilter({ value });
					return testItems.filter((item) => contains(item, search, toFilter));
				},
				indicator: true,
				empty: 'No items found.',
				root: {
					itemToStringLabel: (item: TestItem | null) => (item ? item.label || item.label2 : ''),
					isItemEqualToValue: (item: TestItem | null, v: TestItem | null) => item?.id === v?.id
				}
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'one');
			await expect.element(option('orange')).not.toBeInTheDocument();

			await userEvent.click(option('apple'));
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.click(input());
			await expect.element(option('orange')).toBeInTheDocument();
		});

		it('uses filteredItems when items prop is omitted', async () => {
			const fruits = ['Apple', 'Banana', 'Cherry'];
			renderBound(ComboboxHarness, { value: null as unknown, filteredItems: () => fruits });

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.click(option('Apple'));
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(option('Banana')).toBeInTheDocument();
		});

		it('highlights the externally filtered item order when filtering reorders items', async () => {
			const fruits = ['Apple', 'Banana', 'Zucchini'];
			const onItemHighlighted = vi.fn();
			renderBound(ComboboxHarness, {
				inputValue: '',
				filteredItems: (search: string) => (search.length > 0 ? [...fruits].reverse() : fruits),
				root: { autoHighlight: true, onItemHighlighted }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			onItemHighlighted.mockClear();

			await userEvent.type(input(), 'a');

			await expect.poll(() => onItemHighlighted.mock.calls.length).toBeGreaterThan(0);
			expect(onItemHighlighted.mock.lastCall?.[0]).toBe('Zucchini');
		});

		it('opens a reordered external list at the selected value in rendered-list coordinates', async () => {
			const onItemHighlighted = vi.fn();
			render(ComboboxHarness, {
				items: ['Apple', 'Banana', 'Cherry'],
				filteredItems: () => ['Cherry', 'Apple'],
				root: { multiple: true, defaultValue: ['Apple'], onItemHighlighted }
			});

			await userEvent.click(input());

			await expect.element(option('Apple')).toHaveAttribute('data-highlighted');
			await expect.element(option('Cherry')).not.toHaveAttribute('data-highlighted');
			expect(onItemHighlighted.mock.lastCall?.[0]).toBe('Apple');
		});

		it('resets an initially empty external result when opening a grouped selection', async () => {
			render(ComboboxHarness, {
				items: [
					{ value: 'Fruits', items: ['Apple', 'Banana'] },
					{ value: 'Vegetables', items: ['Carrot'] }
				],
				filteredItems: () => [],
				root: { defaultValue: 'Banana' }
			});

			await expect.element(input()).toHaveValue('Banana');

			await userEvent.click(input());

			await expect.poll(() => document.querySelectorAll('[role="option"]').length).toBe(3);
			await expect.element(option('Banana')).toHaveAttribute('aria-selected', 'true');
		});
	});

	describe('prop: openOnInputClick', () => {
		it('keeps the popup open on a second input click by default', async () => {
			render(ComboboxHarness, { staticItems: [{ value: 'a' }] });

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
		});

		it('does not open on input click when false, but opens on typing', async () => {
			render(ComboboxHarness, { staticItems: [{ value: 'a' }], root: { openOnInputClick: false } });

			await userEvent.click(input());
			expect(document.querySelector('[role="listbox"]')).toBeNull();

			await userEvent.type(input(), 'a');
			await expect.element(listbox()).toBeInTheDocument();
		});
	});

	describe('scroll reset on input value change', () => {
		const manyItems = Array.from({ length: 50 }, (_, index) => `item-${index}`);
		const filteringItems = Array.from({ length: 50 }, (_, index) =>
			index < 25 ? `alpha-${index}` : `beta-${index - 25}`
		);
		const scroller = (testid: string) => page.getByTestId(testid).element() as HTMLElement;

		it('resets the list scroll position to the top when the query changes', async () => {
			render(ComboboxScrollHarness, { items: filteringItems });
			await userEvent.click(input());

			const list = scroller('list');
			list.scrollTop = 40;
			expect(list.scrollTop).toBeGreaterThan(0);

			// Removes the current first item while keeping enough matches for the list to scroll.
			await userEvent.type(input(), 'b');
			await expect.poll(() => list.scrollTop).toBe(0);
		});

		it('resets manually filtered children without deferring the reset until hover', async () => {
			render(ComboboxScrollHarness, {
				staticItems: (query: string) => filteringItems.filter((item) => item.startsWith(query))
			});
			await userEvent.click(input());

			const list = scroller('list');
			list.scrollTop = 40;
			expect(list.scrollTop).toBeGreaterThan(0);

			await userEvent.type(input(), 'b');
			await expect.poll(() => list.scrollTop).toBe(0);

			// A later highlight must not consume a typed-input reset that should already be cleared.
			list.scrollTop = 40;
			const visibleOption = option('beta-5');
			hover(visibleOption.element());
			await expect.element(visibleOption).toHaveAttribute('data-highlighted');
			expect(list.scrollTop).toBe(40);
		});

		it('resets the scroll position of a scrollable wrapper around the list', async () => {
			render(ComboboxScrollHarness, { items: manyItems, layout: 'viewport' });
			await userEvent.click(input());

			const viewport = scroller('viewport');
			viewport.scrollTop = 40;
			expect(viewport.scrollTop).toBeGreaterThan(0);

			await userEvent.type(input(), 'item-1');
			await expect.poll(() => viewport.scrollTop).toBe(0);
		});

		it('skips clipping ancestors when finding the scroll container', async () => {
			render(ComboboxScrollHarness, { items: manyItems, layout: 'clip' });
			await userEvent.click(input());

			const viewport = scroller('viewport');
			viewport.scrollTop = 40;
			expect(viewport.scrollTop).toBeGreaterThan(0);

			await userEvent.type(input(), 'item-1');
			await expect.poll(() => viewport.scrollTop).toBe(0);
		});

		it('keeps the auto-highlighted first item in view after the query changes', async () => {
			render(ComboboxScrollHarness, { items: manyItems, root: { autoHighlight: true } });
			await userEvent.click(input());

			const list = scroller('list');
			list.scrollTop = 40;

			await userEvent.type(input(), 'item-1');
			await expect.poll(() => list.scrollTop).toBe(0);
		});

		it('resets the scroll container when filtering reorders retained items', async () => {
			const items = Array.from({ length: 10 }, (_, index) => `item-${index}`);
			render(ComboboxScrollHarness, {
				filteredItems: (query: string) => (query === '' ? items : [...items].reverse()),
				listStyle: 'max-height: 60px; overflow-y: auto',
				itemStyle: 'height: 24px'
			});
			await userEvent.click(input());

			const list = scroller('list');
			list.scrollTop = 40;
			expect(list.scrollTop).toBeGreaterThan(0);

			await userEvent.type(input(), 'x');

			await expect
				.poll(() => document.querySelector('[role="option"]')?.textContent)
				.toBe('item-9');
			await expect.poll(() => list.scrollTop).toBe(0);
		});

		it('resets only the nearest scrollable wrapper when composed in a scrollable dialog', async () => {
			render(ComboboxScrollHarness, {
				items: manyItems,
				layout: 'inline-dialog',
				root: { open: true }
			});

			const dialog = scroller('dialog');
			const viewport = scroller('viewport');
			await userEvent.click(input());
			dialog.scrollTop = 150;
			viewport.scrollTop = 40;
			const dialogScrollTop = dialog.scrollTop;
			expect(dialog.scrollTop).toBeGreaterThan(0);
			expect(viewport.scrollTop).toBe(40);

			// Native typing scrolls the caret into view; upstream's user-event types synthetically.
			typeSynthetic('item-1');

			await expect.poll(() => viewport.scrollTop).toBe(0);
			expect(dialog.scrollTop).toBe(dialogScrollTop);
		});

		it('does not reset a surrounding dialog', async () => {
			render(ComboboxScrollHarness, {
				items: manyItems,
				layout: 'portal-dialog',
				root: { open: true }
			});

			const dialog = scroller('dialog');
			await userEvent.click(input());
			dialog.scrollTop = dialog.scrollHeight;
			const dialogScrollTop = dialog.scrollTop;
			expect(dialogScrollTop).toBeGreaterThan(0);

			typeSynthetic('item-1');
			await expect.element(option('item-1')).toBeInTheDocument();
			expect(dialog.scrollTop).toBe(dialogScrollTop);
		});
	});
});
