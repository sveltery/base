// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "selection behavior > multiple" (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// Multiple values submit through one hidden `<select multiple>`, so the hidden-input case reads
// FormData. A parent that ignores a change binds `value` through a setter that drops writes.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxFieldHarness from '../../tests/ComboboxFieldHarness.svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import type { ComboboxHighlightEventDetails } from './types.js';

const input = () => page.getByTestId('input');
const trigger = () => page.getByTestId('trigger');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const activeIndex = () => page.getByTestId('active-index');
const selectedIndex = () => page.getByTestId('selected-index');
const fruits = ['apple', 'banana', 'cherry'];

let scrollSpy: ReturnType<typeof vi.spyOn> | undefined;
afterEach(() => {
	scrollSpy?.mockRestore();
	scrollSpy = undefined;
});

/** Upstream `MultiplePopupCombobox`: the input inside the popup and an index probe. */
function renderPopup(
	options: {
		items?: string[];
		defaultValue?: string[];
		onItemHighlighted?: (itemValue: unknown, details: ComboboxHighlightEventDetails) => void;
	} = {}
) {
	return render(ComboboxHarness, {
		items: options.items ?? fruits,
		inputInside: true,
		probe: true,
		root: {
			multiple: true,
			defaultValue: options.defaultValue ?? ['apple', 'banana'],
			onItemHighlighted: options.onItemHighlighted
		}
	});
}

describe('Combobox.Root selection: multiple', () => {
	it('handles multiple selection', async () => {
		const onValueChange = vi.fn();
		render(ComboboxHarness, {
			inline: true,
			staticItems: [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
			root: { multiple: true, onValueChange }
		});

		await userEvent.click(option('a'));
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange.mock.calls[0][0]).toEqual(['a']);

		await userEvent.click(option('b'));
		expect(onValueChange).toHaveBeenCalledTimes(2);
		expect(onValueChange.mock.calls[1][0]).toEqual(['a', 'b']);
	});

	it('opens with an empty input and highlights the first selected item (input inside popup)', async () => {
		const onItemHighlighted = vi.fn();
		renderPopup({ onItemHighlighted });

		await userEvent.click(trigger());

		await expect.element(input()).toHaveValue('');
		await expect.element(option('apple')).toHaveAttribute('aria-selected', 'true');
		await expect.element(option('banana')).toHaveAttribute('aria-selected', 'true');
		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('apple').element().id);
		await expect.element(activeIndex()).toHaveTextContent('0');
		await expect
			.poll(() => onItemHighlighted.mock.calls)
			.toContainEqual(['apple', expect.objectContaining({ reason: REASONS.none, index: 0 })]);
	});

	it('anchors the highlight to the first selected item in rendered order regardless of value order', async () => {
		renderPopup({ defaultValue: ['banana', 'apple', 'cherry'] });

		await userEvent.click(trigger());

		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('apple').element().id);
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		await expect.element(option('cherry')).not.toHaveAttribute('data-highlighted');
	});

	it('anchors the highlight to the first selected item with individually rendered items', async () => {
		render(ComboboxHarness, {
			staticItems: fruits.map((value) => ({ value })),
			root: { multiple: true, defaultValue: ['banana', 'apple', 'cherry'] }
		});

		await userEvent.click(input());

		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('apple').element().id);
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		await expect.element(option('cherry')).not.toHaveAttribute('data-highlighted');
	});

	it('anchors to the first selected item in rendered order across groups', async () => {
		render(ComboboxHarness, {
			staticGroups: [
				{ label: 'Vegetables', items: [{ value: 'artichoke' }, { value: 'spinach' }] },
				{ label: 'Fruits', items: [{ value: 'apple' }, { value: 'plum' }] }
			],
			root: { multiple: true, defaultValue: ['spinach', 'plum'] }
		});

		await userEvent.click(input());

		await expect.element(option('spinach')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('spinach').element().id);
		await expect.element(option('plum')).not.toHaveAttribute('data-highlighted');
	});

	it('keeps the highlight on an item a parent refused to select', async () => {
		// The query still clears, and the highlight stays on the pressed item, as when the same
		// item is pressed without a query.
		render(ComboboxHarness, {
			items: fruits,
			inputInside: true,
			value: ['apple'],
			refuseValue: true,
			root: { multiple: true }
		});

		await userEvent.click(trigger());
		await userEvent.type(input(), 'banana');
		await expect.element(option('apple')).not.toBeInTheDocument();

		await userEvent.click(option('banana'));
		await expect.element(input()).toHaveValue('');

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		await expect.element(option('banana')).toHaveAttribute('aria-selected', 'false');
		await expect.element(option('apple')).not.toHaveAttribute('data-highlighted');
	});

	it('anchors to the first selected item when opened with the keyboard', async () => {
		renderPopup({ defaultValue: ['banana', 'cherry'] });

		await userEvent.keyboard('{Tab}');
		await expect.element(trigger()).toHaveFocus();
		await userEvent.keyboard('{ArrowDown}');

		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		await expect.element(option('cherry')).not.toHaveAttribute('data-highlighted');
	});

	it('continues arrow navigation from the anchor rather than the top of the list', async () => {
		renderPopup({ defaultValue: ['banana', 'cherry'] });

		await userEvent.click(trigger());
		await expect.element(input()).toHaveFocus();
		await expect.element(option('banana')).toHaveAttribute('data-highlighted');

		// The next item after the anchor, not `apple` at the top.
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('cherry')).toHaveAttribute('data-highlighted');

		await userEvent.keyboard('{ArrowUp}');
		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
	});

	it('keeps the toggled item highlighted when selecting with the keyboard while filtering', async () => {
		renderPopup();

		await userEvent.click(trigger());
		await userEvent.type(input(), 'cherry');
		await expect.element(option('apple')).not.toBeInTheDocument();

		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('cherry')).toHaveAttribute('data-highlighted');

		await userEvent.keyboard('{Enter}');
		await expect.element(input()).toHaveValue('');

		await expect.element(option('cherry')).toHaveAttribute('data-highlighted');
		await expect.element(option('apple')).not.toHaveAttribute('data-highlighted');
	});

	it('moves the anchor when the anchor item value changes', async () => {
		const props = renderBound(ComboboxHarness, {
			staticItems: fruits.map((value) => ({ value })),
			probe: true,
			portal: { keepMounted: true },
			root: { multiple: true, defaultValue: ['apple', 'cherry'] }
		});

		await expect.element(selectedIndex()).toHaveTextContent('0');

		props.staticItems = ['date', 'banana', 'cherry'].map((value) => ({ value }));
		await tick();

		await expect.element(selectedIndex()).toHaveTextContent('2');
	});

	it('moves the anchor to the next selected item when the anchor item leaves the list', async () => {
		const props = renderBound(ComboboxHarness, {
			staticItems: fruits.map((value) => ({ value })),
			probe: true,
			portal: { keepMounted: true },
			root: { multiple: true, defaultValue: ['apple', 'cherry'] }
		});

		await expect.element(selectedIndex()).toHaveTextContent('0');

		props.staticItems = ['banana', 'cherry'].map((value) => ({ value }));
		await tick();

		// `banana` now occupies index 0 but is not selected, so `cherry` takes the anchor.
		await expect.element(selectedIndex()).toHaveTextContent('1');
	});

	it('restores the anchor rather than the toggled item when deselecting while filtering', async () => {
		renderPopup();

		await userEvent.click(trigger());
		await userEvent.type(input(), 'banana');
		await expect.element(option('apple')).not.toBeInTheDocument();

		await userEvent.click(option('banana'));
		await expect.element(input()).toHaveValue('');

		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		await expect.element(activeIndex()).toHaveTextContent('0');
	});

	it('restores the highlight to the first selected item when clearing (input inside popup)', async () => {
		const onItemHighlighted = vi.fn();
		renderPopup({ onItemHighlighted });

		await userEvent.click(trigger());
		await userEvent.type(input(), 'banana');
		await expect.element(option('apple')).not.toBeInTheDocument();

		onItemHighlighted.mockClear();
		await userEvent.clear(input());

		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('apple').element().id);
		await expect.element(activeIndex()).toHaveTextContent('0');
		await expect
			.poll(() => onItemHighlighted.mock.calls)
			.toContainEqual(['apple', expect.objectContaining({ reason: REASONS.none, index: 0 })]);
		expect(onItemHighlighted).toHaveBeenCalledTimes(1);
	});

	it('keeps the popup open and highlights the newly selected item after clearing its query', async () => {
		const onItemHighlighted = vi.fn();
		renderPopup({ defaultValue: ['apple'], onItemHighlighted });

		await userEvent.click(trigger());
		await userEvent.type(input(), 'cherry');
		await expect.element(option('cherry')).toBeInTheDocument();

		onItemHighlighted.mockClear();
		await userEvent.click(option('cherry'));

		await expect.element(input()).toHaveValue('');
		await expect.element(listbox()).toBeInTheDocument();
		await expect.element(option('apple')).toHaveAttribute('aria-selected', 'true');
		await expect.element(option('cherry')).toHaveAttribute('aria-selected', 'true');
		await expect.element(option('cherry')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('cherry').element().id);
		await expect.element(activeIndex()).toHaveTextContent('2');
		await expect
			.poll(() => onItemHighlighted.mock.calls)
			.toContainEqual(['cherry', expect.objectContaining({ reason: REASONS.none, index: 2 })]);
	});

	it('keeps the toggled item highlighted when deselecting a selected item', async () => {
		renderPopup();

		await userEvent.click(trigger());
		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await userEvent.click(option('banana'));

		await expect.element(option('banana')).toHaveAttribute('aria-selected', 'false');
		await expect.element(listbox()).toBeInTheDocument();
		await expect.element(option('apple')).toHaveAttribute('aria-selected', 'true');
		await expect.element(option('apple')).not.toHaveAttribute('data-highlighted');
		await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('banana').element().id);
		await expect.element(activeIndex()).toHaveTextContent('1');
	});

	it('clears the highlight when filtering deselects the only selected item', async () => {
		renderPopup({ defaultValue: ['banana'] });

		await userEvent.click(trigger());
		await userEvent.type(input(), 'banana');
		await userEvent.click(option('banana'));

		await expect.element(input()).toHaveValue('');
		await expect.element(option('banana')).toHaveAttribute('aria-selected', 'false');
		await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		await expect.element(activeIndex()).toHaveTextContent('null');
		expect(
			page
				.getByRole('option')
				.elements()
				.some((item) => item.hasAttribute('data-highlighted'))
		).toBe(false);
	});

	it('clears a closing query and restores the first selected item on reopen', async () => {
		const onItemHighlighted = vi.fn();
		renderPopup({ onItemHighlighted });

		await userEvent.click(trigger());
		await userEvent.type(input(), 'cherry');
		await expect.element(option('banana')).not.toBeInTheDocument();

		await userEvent.keyboard('{Escape}');
		await expect.element(listbox()).not.toBeInTheDocument();

		onItemHighlighted.mockClear();
		await userEvent.click(trigger());

		await expect.element(input()).toHaveValue('');
		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('apple').element().id);
		await expect.element(activeIndex()).toHaveTextContent('0');
		await expect
			.poll(() => onItemHighlighted.mock.calls)
			.toContainEqual(['apple', expect.objectContaining({ reason: REASONS.none, index: 0 })]);
	});

	it('scrolls the first selected item into view when clearing (input inside popup)', async () => {
		const scrollIntoView = (scrollSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView'));
		const items = Array.from({ length: 100 }, (_, index) => `item ${index}`);
		renderPopup({ items, defaultValue: ['item 90', 'item 80'] });

		await userEvent.click(trigger());
		await userEvent.type(input(), 'item 0');
		await expect.element(option('item 80')).not.toBeInTheDocument();

		scrollIntoView.mockClear();
		await userEvent.clear(input());

		await expect.element(option('item 80')).toHaveAttribute('data-highlighted');
		await expect.element(activeIndex()).toHaveTextContent('80');
		await expect.poll(() => scrollIntoView.mock.contexts).toEqual([option('item 80').element()]);
		expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
	});

	it('restores the highlight when clearing with the input outside the popup', async () => {
		render(ComboboxHarness, {
			items: fruits,
			root: { multiple: true, defaultValue: ['apple', 'banana'] }
		});

		await userEvent.click(input());
		await userEvent.type(input(), 'banana');
		await expect.element(option('apple')).not.toBeInTheDocument();

		// Opening already highlights the first selected item, so clearing returns to it.
		await userEvent.clear(input());
		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
		await expect
			.element(input())
			.toHaveAttribute('aria-activedescendant', option('apple').element().id);
	});

	it('resets selectedIndex when clearing all selections while open', async () => {
		const props = renderBound(ComboboxHarness, {
			items: fruits,
			probe: true,
			value: ['apple', 'banana'] as unknown,
			around: true,
			root: { multiple: true }
		});

		await expect.element(listbox()).not.toBeInTheDocument();
		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await expect.element(selectedIndex()).toHaveTextContent('0');

		// Upstream clears the value from a button outside the popup, which also closes it.
		props.value = [];
		await userEvent.click(page.getByTestId('before'));

		await expect.element(selectedIndex()).toHaveTextContent('null');
	});

	it('re-syncs selectedIndex after an outside update when closing', async () => {
		const props = renderBound(ComboboxHarness, {
			items: fruits,
			probe: true,
			value: ['apple'] as unknown,
			around: true,
			root: { multiple: true }
		});

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await expect.element(selectedIndex()).toHaveTextContent('0');

		// Upstream sets the value from a button outside the popup, which also closes it.
		props.value = ['cherry'];
		await userEvent.click(page.getByTestId('before'));
		await expect.element(selectedIndex()).toHaveTextContent('2');
		await expect.element(listbox()).not.toBeInTheDocument();

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await expect.element(selectedIndex()).toHaveTextContent('2');
	});

	it('clears selectedIndex when all values are removed while closed (no items prop)', async () => {
		const props = renderBound(ComboboxHarness, {
			staticItems: fruits.map((value) => ({ value })),
			probe: true,
			value: ['apple', 'banana'] as unknown,
			root: { multiple: true }
		});

		await userEvent.click(input());
		await expect.element(selectedIndex()).toHaveTextContent('0');

		await userEvent.keyboard('{Escape}');
		await expect.element(listbox()).not.toBeInTheDocument();

		props.value = [];
		await tick();
		await expect.element(selectedIndex()).toHaveTextContent('null');

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
	});

	it('submits every value for form submission', async () => {
		render(ComboboxFieldHarness, {
			nativeForm: true,
			field: false,
			value: ['a', 'b', 'c'],
			combobox: {
				root: { multiple: true, name: 'languages' },
				staticItems: [{ value: 'a' }, { value: 'b' }]
			}
		});

		const form = page.getByTestId('form').element() as HTMLFormElement;
		expect(new FormData(form).getAll('languages')).toEqual(['a', 'b', 'c']);
	});

	it('does not submit multiple values when disabled', async () => {
		render(ComboboxFieldHarness, {
			nativeForm: true,
			field: false,
			combobox: { root: { multiple: true, disabled: true, name: 'x', defaultValue: ['a'] } }
		});

		const form = page.getByTestId('form').element() as HTMLFormElement;
		expect(new FormData(form).getAll('x')).toEqual([]);
	});

	it('handles the disabled state with chips', async () => {
		render(ComboboxHarness, {
			chips: true,
			staticItems: [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
			root: { multiple: true, disabled: true, defaultValue: ['a', 'b'] }
		});

		await expect.element(page.getByTestId('chip-a')).toHaveAttribute('aria-disabled', 'true');
		await expect.element(page.getByTestId('remove-a')).toHaveAttribute('aria-disabled', 'true');

		await userEvent.click(page.getByTestId('remove-a'), { force: true });
		await expect.element(page.getByTestId('chip-a')).toBeInTheDocument();
	});

	it('handles the read-only state with chips', async () => {
		render(ComboboxHarness, {
			chips: true,
			staticItems: [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
			root: { multiple: true, readonly: true, defaultValue: ['a', 'b'] }
		});

		await expect.element(page.getByTestId('chip-a')).toHaveAttribute('aria-readonly', 'true');

		await expect.element(page.getByTestId('remove-a')).toBeDisabled();
		page
			.getByTestId('remove-a')
			.element()
			.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await expect.element(page.getByTestId('chip-a')).toBeInTheDocument();
	});
});
