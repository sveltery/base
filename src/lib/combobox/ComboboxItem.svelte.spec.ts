// Assertions follow Base UI v1.9.0 packages/react/src/combobox/item/ComboboxItem.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `preventBaseUIHandler()` is `event.preventDefault()` here. Not ported: `describeConformance`
// and the React.memo re-render case (React only), the link cases (upstream runs them only in
// JSDOM, where a link click does not navigate). The `listRef` probe of "registers a rendered
// window at its filtered indexes" is read through the item ids and the keyboard highlight.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxVirtualHarness from '../../tests/ComboboxVirtualHarness.svelte';

const input = () => page.getByTestId('input');
const listbox = () => page.getByRole('listbox');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const oneTwo = [{ value: 'one' }, { value: 'two' }];

describe('Combobox.Item', () => {
	it('selects the item and closes in single mode', async () => {
		render(ComboboxHarness, { open: true, staticItems: oneTwo });

		(option('two').element() as HTMLElement).click();

		await expect.element(input()).toHaveValue('two');
		await expect.element(listbox()).not.toBeInTheDocument();
	});

	describe('prop: onclick', () => {
		it('calls onclick when clicked with a pointer', async () => {
			const onclick = vi.fn();
			render(ComboboxHarness, {
				staticItems: [
					{ value: 'apple', props: { onclick } },
					{ value: 'banana', props: { onclick } }
				],
				root: { openOnInputClick: true }
			});

			await userEvent.click(input());
			await userEvent.click(option('banana'));

			expect(onclick).toHaveBeenCalledTimes(1);
		});

		it('calls onclick when selected with Enter', async () => {
			const onclick = vi.fn();
			render(ComboboxHarness, {
				staticItems: oneTwo.map((item) => ({ ...item, props: { onclick } })),
				root: { openOnInputClick: true }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			expect(onclick).toHaveBeenCalledTimes(1);
		});

		it('does not select the item when onclick prevents the Base UI handler', async () => {
			const onclick = vi.fn((event: MouseEvent) => event.preventDefault());
			render(ComboboxHarness, {
				open: true,
				staticItems: [{ value: 'one', props: { onclick } }, { value: 'two' }]
			});

			await userEvent.click(option('one'));

			expect(onclick).toHaveBeenCalledTimes(1);
			await expect.element(input()).toHaveValue('');
			await expect.element(listbox()).toBeInTheDocument();
		});
	});

	it('does not select a disabled item', async () => {
		render(ComboboxHarness, {
			open: true,
			staticItems: [{ value: 'one' }, { value: 'two', disabled: true }]
		});

		(option('two').element() as HTMLElement).click();

		await expect.element(input()).toHaveValue('');
	});

	it('inherits the disabled state from the root', async () => {
		const onclick = vi.fn();
		render(ComboboxHarness, {
			open: true,
			staticItems: [{ value: 'one', props: { onclick } }],
			root: { disabled: true }
		});
		await expect.element(option('one')).toHaveAttribute('data-disabled');

		(option('one').element() as HTMLElement).click();

		expect(onclick).not.toHaveBeenCalled();
		await expect.element(input()).toHaveValue('');
	});

	it('selects the highlighted item on Enter', async () => {
		render(ComboboxHarness, { staticItems: oneTwo });

		await userEvent.click(input());
		await expect.element(listbox()).toBeInTheDocument();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Enter}');

		await expect.element(input()).toHaveValue('one');
		await expect.element(listbox()).not.toBeInTheDocument();
	});

	it('keeps the input focused after selecting an item with touch', async () => {
		render(ComboboxHarness, { open: true, staticItems: oneTwo });
		await userEvent.click(input());
		await expect.element(input()).toHaveFocus();
		const two = option('two').element();

		const touch = {
			bubbles: true,
			cancelable: true,
			button: 0,
			pointerType: 'touch',
			isPrimary: true
		};
		two.dispatchEvent(new PointerEvent('pointerdown', touch));
		two.dispatchEvent(new PointerEvent('pointerup', touch));
		two.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		two.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		two.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		await expect.element(input()).toHaveValue('two');
		await expect.element(input()).toHaveFocus();
	});

	it('prevents the default mousedown so pointer selection does not take focus from the input', async () => {
		render(ComboboxHarness, { open: true, staticItems: oneTwo });
		const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 });

		option('two').element().dispatchEvent(mouseDown);

		expect(mouseDown.defaultPrevented).toBe(true);
	});

	it('toggles the selection and stays open in multiple mode', async () => {
		render(ComboboxHarness, {
			staticItems: [{ value: 'a' }, { value: 'b' }],
			root: { multiple: true }
		});

		await userEvent.click(input());
		await expect.element(listbox()).toBeInTheDocument();

		await userEvent.click(option('a'));
		await expect.element(option('a')).toHaveAttribute('aria-selected', 'true');
		await expect.element(listbox()).toBeInTheDocument();

		await userEvent.click(option('a'));
		await expect.element(option('a')).not.toHaveAttribute('aria-selected', 'true');
	});

	it('reflects the selected value with aria-selected when reopening', async () => {
		render(ComboboxHarness, { staticItems: oneTwo, root: { defaultValue: 'two' } });

		await userEvent.click(input());

		await expect.element(option('two')).toHaveAttribute('aria-selected', 'true');
	});

	describe('virtualized without explicit index', () => {
		const five = ['one', 'two', 'three', 'four', 'five'];

		it('selects the highlighted filtered item with the keyboard after filtering', async () => {
			render(ComboboxVirtualHarness, { root: { virtualized: true, items: five }, indexed: false });
			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			// "four" and "five" sat at indexes 3 and 4 of the full list.
			await userEvent.type(input(), 'f');
			await expect.element(option('one')).not.toBeInTheDocument();
			await expect.element(option('four')).toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.element(input()).toHaveValue('four');
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('selects the clicked filtered item after filtering', async () => {
			render(ComboboxVirtualHarness, { root: { virtualized: true, items: five }, indexed: false });
			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.type(input(), 'f');
			await expect.element(option('one')).not.toBeInTheDocument();

			await userEvent.click(option('five'));

			await expect.element(input()).toHaveValue('five');
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('registers a rendered window at its filtered indexes', async () => {
			const onItemHighlighted = vi.fn();
			render(ComboboxVirtualHarness, {
				root: { virtualized: true, items: five, id: 'fruit', onItemHighlighted },
				indexed: false,
				windowStart: 2,
				windowSize: 2
			});
			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await expect.element(option('three')).toHaveAttribute('id', 'fruit-2');
			await expect.element(option('four')).toHaveAttribute('id', 'fruit-3');

			await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');

			await expect.element(option('three')).toHaveAttribute('data-highlighted');
			await expect.element(input()).toHaveAttribute('aria-activedescendant', 'fruit-2');
			expect(onItemHighlighted.mock.lastCall?.[0]).toBe('three');
			expect(onItemHighlighted.mock.lastCall?.[1].index).toBe(2);
		});

		it('does not register an item missing from the filtered values', async () => {
			render(ComboboxVirtualHarness, {
				root: { virtualized: true, items: ['one'], open: true },
				windowSize: 0,
				extra: [{ text: 'missing value' }]
			});
			const item = option('missing value');
			await expect.element(item).toBeInTheDocument();

			await userEvent.hover(item);

			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
			await expect.element(item).not.toHaveAttribute('data-highlighted');
			await expect.element(item).not.toHaveAttribute('id');
		});
	});

	describe('virtualized with explicit index', () => {
		it('selects the highlighted filtered item with the keyboard after filtering', async () => {
			render(ComboboxVirtualHarness, {
				root: { virtualized: true, items: ['one', 'two', 'three'] }
			});
			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.type(input(), 't');
			await expect.element(option('one')).not.toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.element(input()).toHaveValue('two');
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('highlights an index past the rendered window with the keyboard', async () => {
			const onItemHighlighted = vi.fn();
			const items = Array.from({ length: 20 }, (_, index) => `item-${index}`);
			render(ComboboxVirtualHarness, {
				root: { virtualized: true, items, id: 'cb', onItemHighlighted },
				windowSize: 5
			});
			await userEvent.click(input());
			await expect.element(option('item-4')).toBeInTheDocument();
			await expect.element(option('item-5')).not.toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}'.repeat(7));

			expect(onItemHighlighted.mock.lastCall?.[0]).toBe('item-6');
			expect(onItemHighlighted.mock.lastCall?.[1].index).toBe(6);
			await expect.element(input()).toHaveAttribute('aria-activedescendant', 'cb-6');
			await expect.element(option('item-4')).not.toHaveAttribute('data-highlighted');
		});

		it('highlights the item once the window renders it', async () => {
			const items = Array.from({ length: 20 }, (_, index) => `item-${index}`);
			render(ComboboxVirtualHarness, {
				root: { virtualized: true, items, id: 'cb' },
				windowSize: 5,
				follow: true
			});
			await userEvent.click(input());
			await expect.element(option('item-4')).toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}'.repeat(7));

			await expect.element(option('item-6')).toHaveAttribute('data-highlighted');
			await expect.element(option('item-6')).toHaveAttribute('id', 'cb-6');
			await expect.element(input()).toHaveAttribute('aria-activedescendant', 'cb-6');

			await userEvent.keyboard('{Enter}');
			await expect.element(input()).toHaveValue('item-6');
		});
	});

	describe('prop: index', () => {
		it('updates the highlight on hover in a non-virtualized list', async () => {
			render(ComboboxVirtualHarness, {
				root: { items: ['apple', 'banana', 'cherry'], open: true, autoHighlight: true }
			});
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.hover(option('banana'));
			await expect.element(option('banana')).toHaveAttribute('data-highlighted');

			await userEvent.hover(option('cherry'));
			await expect.element(option('cherry')).toHaveAttribute('data-highlighted');
			await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		});

		it('does not assign an id to an explicitly unregistered item', async () => {
			render(ComboboxVirtualHarness, {
				root: { open: true },
				popup: false,
				windowSize: 0,
				extra: [{ text: 'orphan', value: 'orphan', index: -1 }]
			});

			await expect.element(option('orphan')).toBeInTheDocument();
			await expect.element(option('orphan')).not.toHaveAttribute('id');
		});
	});
});
