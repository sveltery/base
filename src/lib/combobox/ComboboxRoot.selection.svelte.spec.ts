// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "selection behavior > single" (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: the two `virtualized` cases (the prop is not ported). A value held by the parent
// without `onValueChange` is a bound value the test writes.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const trigger = () => page.getByTestId('trigger');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const fruits = ['apple', 'banana', 'cherry'];
const staticFruits = fruits.map((value) => ({ value }));
const hiddenInput = () =>
	document.querySelector<HTMLInputElement>('input[aria-hidden="true"]:not([role])')!;
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

let scrollSpy: ReturnType<typeof vi.spyOn> | undefined;
function spyScroll() {
	scrollSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
	return scrollSpy;
}
afterEach(() => {
	scrollSpy?.mockRestore();
	scrollSpy = undefined;
});

describe('Combobox.Root selection: single', () => {
	it('fires onOpenChange once with reason item-press on mouse click', async () => {
		const onOpenChange = vi.fn();
		render(ComboboxHarness, { items: ['apple', 'banana'], root: { onOpenChange } });

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();

		onOpenChange.mockClear();
		await userEvent.click(option('apple'));
		await expect.element(listbox()).not.toBeInTheDocument();

		expect(onOpenChange).toHaveBeenCalledTimes(1);
		expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
		expect(onOpenChange.mock.lastCall?.[1].reason).toBe(REASONS.itemPress);
		expect(onOpenChange.mock.lastCall?.[1].event).toBeInstanceOf(MouseEvent);
	});

	it('fires onOpenChange once with reason item-press on Enter selection', async () => {
		const onOpenChange = vi.fn();
		render(ComboboxHarness, { items: ['apple', 'banana'], root: { onOpenChange } });

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await userEvent.keyboard('{ArrowDown}');
		onOpenChange.mockClear();
		await userEvent.keyboard('{Enter}');
		await expect.element(listbox()).not.toBeInTheDocument();

		expect(onOpenChange).toHaveBeenCalledTimes(1);
		expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
		expect(onOpenChange.mock.lastCall?.[1].reason).toBe(REASONS.itemPress);
		expect(onOpenChange.mock.lastCall?.[1].event).toBeInstanceOf(KeyboardEvent);
	});

	it('closes the popup after a selection when open is not bound', async () => {
		render(ComboboxHarness, { items: fruits, trigger: true });

		await userEvent.click(trigger());
		await expect.element(listbox()).toBeVisible();
		await expect.element(input()).toHaveAttribute('aria-expanded', 'true');

		await userEvent.click(option('apple'));
		await expect.element(listbox()).not.toBeInTheDocument();
		await expect.element(input()).toHaveAttribute('aria-expanded', 'false');
	});

	it('syncs the selected index when items change after close', async () => {
		let selected: string | null = null;
		const props = renderBound(ComboboxHarness, {
			items: ['Apple', 'Banana', 'Cherry'] as string[],
			root: {
				onValueChange: (value: string | null) => {
					selected = value;
				},
				onOpenChangeComplete: (open: boolean) => {
					if (!open && selected) props.items = [selected];
				}
			}
		});

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await userEvent.click(option('Cherry'));
		await expect.element(listbox()).not.toBeInTheDocument();

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await expect.element(option('Cherry')).toHaveAttribute('data-selected', '');
	});

	it('keeps the popup open after a selection when the parent holds it open', async () => {
		render(ComboboxHarness, {
			items: fruits,
			trigger: true,
			open: true,
			root: { onOpenChange: (_open, details) => details.cancel() }
		});

		await userEvent.click(option('apple'));
		await expect.element(listbox()).toBeInTheDocument();
	});

	it('shows all items when the query is empty', async () => {
		render(ComboboxHarness, { items: fruits, open: true });

		await expect.element(option('apple')).toBeInTheDocument();
		await expect.element(option('banana')).toBeInTheDocument();
		await expect.element(option('cherry')).toBeInTheDocument();
	});

	it('shows all items when the query matches the current selection', async () => {
		render(ComboboxHarness, { items: fruits, trigger: true, root: { defaultValue: 'apple' } });

		await userEvent.click(trigger());
		await userEvent.click(option('apple'));
		await expect.element(input()).toHaveValue('apple');

		await userEvent.click(trigger());
		await expect.element(option('apple')).toBeInTheDocument();
		await expect.element(option('banana')).toBeInTheDocument();
		await expect.element(option('cherry')).toBeInTheDocument();
	});

	it('resets the input value to the selected value when the popup closes without a selection', async () => {
		const onInputValueChange = vi.fn();
		render(ComboboxHarness, {
			items: fruits,
			trigger: true,
			root: { defaultValue: 'apple', onInputValueChange }
		});

		await userEvent.click(trigger());
		await userEvent.click(option('apple'));
		await expect.element(input()).toHaveValue('apple');

		await userEvent.click(trigger());
		await userEvent.type(input(), 'xyz');
		await expect.element(input()).toHaveValue('applexyz');

		await userEvent.click(document.body);

		await expect.element(input()).toHaveValue('apple');
		expect(onInputValueChange.mock.lastCall?.[0]).toBe('apple');
		expect(onInputValueChange.mock.lastCall?.[1].reason).toBe('none');
	});

	it('does not close during browser autofill', async () => {
		render(ComboboxHarness, { items: fruits, open: true, root: { name: 'test' } });
		await expect.element(listbox()).toBeInTheDocument();

		const hidden = hiddenInput();
		hidden.value = 'apple';
		hidden.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();
		await Promise.resolve();

		await expect.element(listbox()).toBeInTheDocument();
	});

	it('highlights and scrolls the selected item into view on first open (no items prop)', async () => {
		const scrollIntoView = spyScroll();
		render(ComboboxHarness, { staticItems: staticFruits, root: { defaultValue: 'banana' } });

		await userEvent.click(input());

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		const selected = option('banana').element();
		await expect.element(input()).toHaveAttribute('aria-activedescendant', selected.id);
		await expect.poll(() => scrollIntoView.mock.contexts).toEqual([selected]);
		expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
	});

	it('highlights and scrolls the selected item into view on mount when inline (items prop)', async () => {
		const scrollIntoView = spyScroll();
		render(ComboboxHarness, {
			items: fruits,
			inline: true,
			open: true,
			root: { defaultValue: 'banana' }
		});

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('banana').element().id);
		await expect
			.poll(() => scrollIntoView.mock.calls)
			.toContainEqual([{ block: 'nearest', inline: 'nearest' }]);
	});

	it('does not restore the initial highlight after focus leaves an inline input (items prop)', async () => {
		const props = renderBound(ComboboxHarness, {
			items: fruits,
			inline: true,
			open: true,
			value: 'banana' as unknown
		});

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');

		await userEvent.click(input());
		input().element().blur();
		props.value = 'cherry';
		await tick();

		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		await expect.element(option('cherry')).not.toHaveAttribute('data-highlighted');
	});

	it('does not apply the initial highlight when a selection resolves after blur (items prop)', async () => {
		const scrollIntoView = spyScroll();
		const props = renderBound(ComboboxHarness, {
			items: fruits,
			inline: true,
			open: true,
			value: null as unknown,
			around: true
		});

		await userEvent.click(input());
		await userEvent.click(page.getByTestId('outside'));
		props.value = 'banana';
		await tick();
		await frame();

		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		expect(scrollIntoView).not.toHaveBeenCalled();
	});

	it('does not snap the highlight to a stale index while filtering an inline list (items prop)', async () => {
		render(ComboboxHarness, {
			items: ['apple', 'banana', 'blueberry', 'cherry'],
			inline: true,
			open: true,
			root: { defaultValue: 'banana' }
		});

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');

		await userEvent.click(input());
		await userEvent.keyboard('b');
		await expect.element(option('cherry')).not.toBeInTheDocument();

		// Typing without autoHighlight clears the highlight. It must not be re-derived from a
		// stale unfiltered index onto a different item.
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		await expect.element(option('blueberry')).not.toHaveAttribute('data-highlighted');
	});

	it('does not transfer a stale highlight when clearing an inline list without a selection (items prop)', async () => {
		render(ComboboxHarness, {
			items: ['apple', 'banana', 'blueberry', 'cherry'],
			inline: true,
			open: true
		});

		await userEvent.type(input(), 'b');
		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		await expect.element(option('blueberry')).toHaveAttribute('data-highlighted');

		await userEvent.clear(input());

		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
	});

	it('waits for a refused query clear before restoring the selection (items prop)', async () => {
		render(ComboboxHarness, {
			items: ['apple', 'banana', 'blueberry', 'cherry'],
			inputInside: true,
			open: true,
			inputValue: 'b',
			probe: true,
			root: {
				defaultValue: 'banana',
				onInputValueChange: (_value: string, details) => details.cancel()
			}
		});

		// Upstream renders this button inside the popup. A DOM click is not an outside press.
		page
			.getByTestId('clear-highlight')
			.element()
			.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');

		await userEvent.clear(input());
		await expect.element(input()).toHaveValue('b');
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');

		await tick();
		await frame();
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
	});

	it('highlights the first selected item on mount and keeps the highlight when toggling in a multiple inline list (items prop)', async () => {
		render(ComboboxHarness, {
			items: ['apple', 'banana', 'cherry', 'date', 'elderberry'],
			inline: true,
			open: true,
			root: { multiple: true, defaultValue: ['apple', 'date'] }
		});

		// The initial highlight follows the first selected value in rendered order.
		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('apple').element().id);

		// Deselecting must not jump the highlight (and scroll) to the other selected item.
		await userEvent.click(option('date'));

		await expect.element(option('date')).toHaveAttribute('aria-selected', 'false');
		await expect.element(option('apple')).not.toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.not.toHaveAttribute('aria-activedescendant', option('apple').element().id);
	});

	it('does not highlight a non-selected item when an initial input value pre-filters the inline list (items prop)', async () => {
		render(ComboboxHarness, {
			items: ['b0', 'sel', 'b1', 'b2', 'b3'],
			inline: true,
			open: true,
			root: { defaultValue: 'sel', defaultInputValue: 'b' }
		});

		await expect.element(option('b1')).toBeInTheDocument();
		await expect.element(option('sel')).not.toBeInTheDocument();

		await expect.element(option('b1')).not.toHaveAttribute('data-highlighted');
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
	});

	it('does not replace a pointer highlight when the initial selection resolves after mount (items prop)', async () => {
		const scrollIntoView = spyScroll();
		const props = renderBound(ComboboxHarness, {
			items: ['apple', 'cherry'] as string[],
			inline: true,
			open: true,
			root: { defaultValue: 'banana' }
		});

		await userEvent.hover(option('apple'));
		await expect.element(option('apple')).toHaveAttribute('data-highlighted');

		props.items = fruits;
		await tick();
		await frame();

		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('apple').element().id);
		expect(scrollIntoView).not.toHaveBeenCalled();
	});

	it('does not restore the initial highlight after pointer navigation is cleared (items prop)', async () => {
		const scrollIntoView = spyScroll();
		const props = renderBound(ComboboxHarness, {
			items: ['apple', 'cherry'] as string[],
			inline: true,
			open: true,
			root: { defaultValue: 'banana' },
			around: true
		});

		await userEvent.hover(option('apple'));
		await expect.element(option('apple')).toHaveAttribute('data-highlighted');

		await userEvent.hover(page.getByTestId('outside'));
		await expect.element(option('apple')).not.toHaveAttribute('data-highlighted');

		scrollIntoView.mockClear();
		props.items = fruits;
		await tick();

		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		expect(scrollIntoView).not.toHaveBeenCalled();
	});

	it('restores the highlight and scroll to the selected item when the query is cleared', async () => {
		const scrollIntoView = spyScroll();
		render(ComboboxHarness, {
			items: fruits,
			inputInside: true,
			root: { defaultValue: 'banana' }
		});

		await userEvent.click(trigger());
		// Move the highlight away from the selected item by filtering.
		await userEvent.type(input(), 'cherry');
		await expect.element(option('banana')).not.toBeInTheDocument();

		scrollIntoView.mockClear();
		// Clearing the query restores the highlight to the selected item.
		await userEvent.clear(input());

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('banana').element().id);
		await expect
			.poll(() => scrollIntoView.mock.calls)
			.toContainEqual([{ block: 'nearest', inline: 'nearest' }]);
	});

	it('restores the selected direct item after its registration index changes', async () => {
		const scrollIntoView = spyScroll().mockImplementation(() => {});
		const onItemHighlighted = vi.fn();
		const all = staticFruits;
		// The input inside the popup clears the query as it mounts, before `view.props` is assigned.
		const view: { props?: { staticItems?: { value: unknown }[] } } = {};
		view.props = renderBound(ComboboxHarness, {
			staticItems: all,
			inputInside: true,
			open: true,
			root: {
				defaultValue: 'banana',
				autoHighlight: true,
				onItemHighlighted,
				onInputValueChange: (query: string) => {
					if (view.props) view.props.staticItems = query ? [{ value: 'cherry' }] : all;
				}
			}
		});

		await userEvent.type(input(), 'c');
		await userEvent.hover(option('cherry'));
		await expect.element(option('cherry')).toHaveAttribute('data-highlighted');
		await frame();

		scrollIntoView.mockClear();
		onItemHighlighted.mockClear();
		await userEvent.clear(input());

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		const banana = option('banana').element();
		await expect.element(input()).toHaveAttribute('aria-activedescendant', banana.id);
		await expect.poll(() => scrollIntoView.mock.contexts.at(-1)).toBe(banana);
		expect(scrollIntoView.mock.lastCall).toEqual([{ block: 'nearest', inline: 'nearest' }]);
		expect(onItemHighlighted.mock.lastCall?.[0]).toBe('banana');

		// The restore never reports an item at an index it does not occupy.
		const positions: Record<string, number> = { apple: 0, banana: 1, cherry: 2 };
		const inconsistent = onItemHighlighted.mock.calls
			.filter(([item]) => item != null)
			.filter(([item, details]) => positions[item] !== details.index)
			.map(([item, details]) => `${item}@${details.index}`);
		expect(inconsistent).toEqual([]);
	});

	it('does not navigate kept-mounted items while held closed', async () => {
		render(ComboboxHarness, {
			items: ['apple', 'banana'],
			probe: true,
			portal: { keepMounted: true },
			root: {
				autoHighlight: true,
				onOpenChange: (open: boolean, details) => {
					if (open) details.cancel();
				}
			}
		});

		await userEvent.type(input(), 'banana');

		await expect.element(page.getByTestId('active-index')).toHaveTextContent('null');
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
	});

	it('restores the selected item with the input outside the popup', async () => {
		// The parent holds the value, so clearing the input does not clear the selection.
		render(ComboboxHarness, {
			items: fruits,
			open: true,
			value: 'banana',
			root: { onValueChange: (_value: unknown, details) => details.cancel() }
		});

		await userEvent.type(input(), 'cherry');
		await expect.element(option('banana')).not.toBeInTheDocument();

		await userEvent.clear(input());

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('banana').element().id);
	});

	it('scrolls to programmatic highlights after the filtered list changes', async () => {
		const items = Array.from(
			{ length: 200 },
			(_, index) => `item-${String(index).padStart(3, '0')}`
		);
		render(ComboboxHarness, {
			items,
			inputInside: true,
			listProps: { style: 'max-height: 100px; overflow: auto' },
			root: { defaultValue: 'item-180', autoHighlight: true }
		});

		await userEvent.click(trigger());
		const list = page.getByTestId('list').element();
		list.scrollTop = list.scrollHeight;

		await userEvent.type(input(), '9');

		await expect.element(option('item-009')).toHaveAttribute('data-highlighted');
		await expect.poll(() => list.scrollTop).toBe(0);

		list.scrollTop = list.scrollHeight;
		await userEvent.clear(input());

		await expect.element(option('item-180')).toHaveAttribute('data-highlighted');
		await expect
			.poll(() => {
				const listRect = list.getBoundingClientRect();
				const selectedRect = option('item-180').element().getBoundingClientRect();
				return selectedRect.top >= listRect.top && selectedRect.bottom <= listRect.bottom;
			})
			.toBe(true);
	});

	it('restores the selected item instead of the first item when clearing with autoHighlight', async () => {
		render(ComboboxHarness, {
			items: fruits,
			inputInside: true,
			root: { defaultValue: 'banana', autoHighlight: true }
		});

		await userEvent.click(trigger());
		// With autoHighlight, filtering highlights the first match.
		await userEvent.type(input(), 'a');
		await expect.element(option('apple')).toHaveAttribute('data-highlighted');

		// Clearing returns the highlight to the selected item, not the first item.
		await userEvent.clear(input());

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		await expect.element(option('apple')).not.toHaveAttribute('data-highlighted');
	});

	it('emits onItemHighlighted for the selected item when the query is cleared', async () => {
		const onItemHighlighted = vi.fn();
		render(ComboboxHarness, {
			items: fruits,
			inputInside: true,
			root: { defaultValue: 'banana', onItemHighlighted }
		});

		await userEvent.click(trigger());
		await userEvent.type(input(), 'cherry');
		onItemHighlighted.mockClear();

		await userEvent.clear(input());

		// A programmatic (`none`) highlight lets a virtualized list scroll the item into view.
		await expect
			.poll(() => onItemHighlighted.mock.calls)
			.toContainEqual(['banana', expect.objectContaining({ reason: REASONS.none, index: 1 })]);
	});

	it('consumes a query-clear restore when the selected item is absent', async () => {
		const onItemHighlighted = vi.fn();
		let includeSelected = true;
		const visible = (query: string) =>
			(query ? ['apple'] : includeSelected ? fruits : ['apple', 'cherry']).map((value) => ({
				value
			}));
		const view: { props?: { staticItems?: { value: unknown }[] } } = {};
		view.props = renderBound(ComboboxHarness, {
			staticItems: visible(''),
			inputInside: true,
			open: true,
			probe: true,
			root: {
				defaultValue: 'banana',
				autoHighlight: true,
				onItemHighlighted,
				onInputValueChange: (query: string) => {
					if (view.props) view.props.staticItems = visible(query);
				}
			}
		});

		await userEvent.type(input(), 'a');
		await expect.element(page.getByTestId('active-index')).toHaveTextContent('0');

		includeSelected = false;
		onItemHighlighted.mockClear();
		await userEvent.clear(input());

		await expect.poll(() => page.getByRole('option').elements()).toHaveLength(2);
		await expect.element(page.getByTestId('active-index')).toHaveTextContent('null');
		expect(onItemHighlighted.mock.calls.some(([item]) => item === 'banana')).toBe(false);
	});

	it('clears selectedIndex when the value is cleared while closed (no items prop)', async () => {
		const props = renderBound(ComboboxHarness, {
			staticItems: staticFruits,
			probe: true,
			value: 'banana' as unknown
		});

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await expect.element(page.getByTestId('selected-index')).toHaveTextContent('1');

		await userEvent.keyboard('{Escape}');
		await expect.element(listbox()).not.toBeInTheDocument();

		props.value = null;
		await tick();
		await expect.element(page.getByTestId('selected-index')).toHaveTextContent('null');

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
	});

	it('clears selectedIndex when the value is set to an unmatched value while closed (no items prop)', async () => {
		const props = renderBound(ComboboxHarness, {
			staticItems: staticFruits,
			probe: true,
			value: 'banana' as unknown
		});

		await userEvent.click(input());
		await expect.element(page.getByTestId('selected-index')).toHaveTextContent('1');

		await userEvent.keyboard('{Escape}');
		await expect.element(listbox()).not.toBeInTheDocument();

		props.value = 'dragonfruit';
		await tick();
		await expect.element(page.getByTestId('selected-index')).toHaveTextContent('null');

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
	});

	it('registers selectedIndex before opening with a keepMounted portal (no items prop)', async () => {
		render(ComboboxHarness, {
			staticItems: staticFruits,
			probe: true,
			portal: { keepMounted: true },
			root: { defaultValue: 'banana' }
		});

		await expect.element(page.getByTestId('selected-index')).toHaveTextContent('1');
	});

	it('does not highlight the previous item after the value changes while open (no items prop)', async () => {
		const onItemHighlighted = vi.fn();
		const props = renderBound(ComboboxHarness, {
			staticItems: staticFruits,
			probe: true,
			value: 'banana' as unknown,
			root: { onItemHighlighted }
		});

		await userEvent.click(input());
		await expect.element(page.getByTestId('selected-index')).toHaveTextContent('1');

		props.value = 'cherry';
		await tick();
		await expect.element(listbox()).toBeInTheDocument();

		await userEvent.keyboard('{Escape}');
		await expect.element(listbox()).not.toBeInTheDocument();
		// Closing reconciles the index to the new selection.
		await expect.element(page.getByTestId('selected-index')).toHaveTextContent('2');

		onItemHighlighted.mockClear();
		await userEvent.click(input());
		await expect.element(option('cherry')).toHaveAttribute('data-highlighted');
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		expect(onItemHighlighted.mock.calls.some(([value]) => value === 'banana')).toBe(false);
	});

	it('re-highlights the selection on reopen when the value object is recreated with equal contents (no items prop)', async () => {
		const onItemHighlighted = vi.fn();
		const objects = [
			{ id: 1, label: 'apple' },
			{ id: 2, label: 'banana' },
			{ id: 3, label: 'cherry' }
		];
		const props = renderBound(ComboboxHarness, {
			staticItems: objects.map((value) => ({ value, text: value.label })),
			value: { id: 2, label: 'banana' } as unknown,
			root: {
				isItemEqualToValue: (a: { id: number }, b: { id: number }) => a.id === b.id,
				itemToStringLabel: (value: { label: string }) => value.label,
				onItemHighlighted
			}
		});

		await userEvent.click(input());
		await expect.element(option('banana')).toHaveAttribute('data-highlighted');

		await userEvent.keyboard('{Escape}');
		await expect.element(listbox()).not.toBeInTheDocument();

		props.value = { id: 2, label: 'banana' };
		await tick();

		onItemHighlighted.mockClear();
		await userEvent.click(input());
		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		expect(
			onItemHighlighted.mock.calls.some(
				([value]) => value && value.id !== undefined && value.id !== 2
			)
		).toBe(false);
	});
});
