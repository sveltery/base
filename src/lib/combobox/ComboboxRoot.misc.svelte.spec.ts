// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "prop: isItemEqualToValue", "prop: highlightItemOnHover", "prop: loopFocus" and
// "coverage edge cases" (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see
// THIRD_PARTY_NOTICES.md. Not ported: the Autocomplete cases (Autocomplete is a separate part),
// "exposes an unmount action that is ignored while open" (ComboboxRoot.svelte.spec.ts covers
// `unmount()`), and "within Composite" (no public composite item renders an input).
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const options = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')];
const hiddenControl = () => document.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};

interface User {
	id: number;
	name: string;
	source?: string;
}
const users: User[] = [
	{ id: 1, name: 'Alice' },
	{ id: 2, name: 'Bob' }
];
const userProps = {
	items: users,
	itemLabel: (item: User) => item.name,
	root: {
		itemToStringLabel: (item: User) => item.name,
		itemToStringValue: (item: User) => String(item.id),
		isItemEqualToValue: (item: User, value: User) => item.id === value.id
	}
};

interface Country {
	code: string;
	label: string;
}
const loadedItems: Country[] = [
	{ code: 'ca', label: 'Canada' },
	{ code: 'us', label: 'United States' }
];

describe('Combobox.Root', () => {
	describe('prop: isItemEqualToValue', () => {
		it('matches object values using the provided comparator', async () => {
			render(ComboboxHarness, {
				...userProps,
				open: true,
				valueText: true,
				value: { id: 2, name: 'Bob' }
			});

			await expect.element(page.getByTestId('value')).toHaveTextContent('Bob');
			await expect.element(option('Bob')).toHaveAttribute('aria-selected', 'true');
		});

		it('deselects object values using the provided comparator', async () => {
			render(ComboboxHarness, {
				...userProps,
				open: true,
				root: { ...userProps.root, multiple: true, defaultValue: [{ id: 2, name: 'Bob' }] }
			});
			await expect.element(option('Bob')).toHaveAttribute('aria-selected', 'true');

			(option('Bob').element() as HTMLElement).click();

			await expect.element(option('Bob')).toHaveAttribute('aria-selected', 'false');
		});

		it('passes the item as the first comparator argument in multiple mode', async () => {
			const sourced = users.map((entry) => ({ ...entry, source: 'item' }));
			render(ComboboxHarness, {
				...userProps,
				items: sourced,
				open: true,
				root: {
					...userProps.root,
					multiple: true,
					defaultValue: [{ id: 2, name: 'Bob', source: 'selected' }],
					isItemEqualToValue: (item: User, value: User) =>
						item.id === value.id && item.source === 'item' && value.source === 'selected'
				}
			});
			await expect.element(option('Bob')).toHaveAttribute('aria-selected', 'true');

			(option('Bob').element() as HTMLElement).click();

			await expect.element(option('Bob')).toHaveAttribute('aria-selected', 'false');
		});

		it('does not call the comparator with null when clearing the value', async () => {
			const compare = vi.fn((item: User, value: User) => {
				if (value == null) throw new Error('Compared against null');
				return item.id === value.id;
			});
			render(ComboboxHarness, {
				...userProps,
				noInput: true,
				trigger: true,
				valueText: true,
				clear: true,
				clearProps: { keepMounted: true },
				root: { ...userProps.root, defaultValue: users[0], isItemEqualToValue: compare }
			});

			await userEvent.click(page.getByTestId('clear'));

			await expect.poll(() => hiddenControl().value).toBe('');
			expect(compare.mock.calls.length).toBeGreaterThan(0);
			for (const call of compare.mock.calls) expect(call[1]).not.toBe(null);
		});

		it('does not call the comparator with undefined when items load after opening', async () => {
			const compare = vi.fn((item: Country, value: Country) => {
				if (item == null || value == null) throw new Error('Compared against undefined');
				return item.code === value.code;
			});
			const props = renderBound(ComboboxHarness, {
				items: undefined as Country[] | undefined,
				value: loadedItems[0],
				refuseValue: true,
				itemLabel: (item: Country) => item.label,
				root: {
					itemToStringLabel: (item: Country) => item.label,
					isItemEqualToValue: compare,
					filter: null
				}
			});

			await userEvent.click(input());
			props.items = loadedItems;

			await expect.element(option('Canada')).toBeInTheDocument();
			await userEvent.hover(option('Canada'));
			await expect.element(option('Canada')).toHaveAttribute('data-highlighted');
			await userEvent.keyboard('{ArrowDown}');

			await expect.element(option('United States')).toHaveAttribute('data-highlighted');
			expect(compare.mock.calls.length).toBeGreaterThan(0);
			for (const [item, value] of compare.mock.calls) {
				expect(item).not.toBe(undefined);
				expect(item).not.toBe(null);
				expect(value).not.toBe(undefined);
				expect(value).not.toBe(null);
			}
		});

		it('keeps showing items after selecting in a controlled input-inside-popup async flow', async () => {
			const props = renderBound(ComboboxHarness, {
				items: undefined as Country[] | undefined,
				value: null,
				inputValue: '',
				inputInside: true,
				empty: 'No countries found.',
				itemLabel: (item: Country) => item.label,
				root: {
					filter: null,
					isItemEqualToValue: (item: Country | null, selected: Country | null) =>
						item?.code === selected?.code
				}
			});
			const trigger = page.getByTestId('trigger');

			await userEvent.click(trigger);
			props.items = loadedItems;

			await expect.element(option('Canada')).toBeInTheDocument();
			await userEvent.hover(option('Canada'));
			await expect.element(option('Canada')).toHaveAttribute('data-highlighted');

			await userEvent.click(option('Canada'));
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

			await userEvent.click(trigger);

			await expect.element(option('Canada')).toBeInTheDocument();
			await expect.element(option('United States')).toBeInTheDocument();
		});
	});

	describe('prop: highlightItemOnHover', () => {
		it('highlights an item on mouse move by default', async () => {
			render(ComboboxHarness, { items: ['apple', 'banana', 'cherry'] });
			await userEvent.click(input());

			await userEvent.hover(option('banana'));

			await expect.element(option('banana')).toHaveAttribute('data-highlighted');
			expect(input().element().getAttribute('aria-activedescendant')).toBe(
				option('banana').element().id
			);
		});

		it('does not highlight items from mouse movement when disabled', async () => {
			render(ComboboxHarness, {
				items: ['apple', 'banana', 'cherry'],
				root: { highlightItemOnHover: false }
			});
			await userEvent.click(input());

			await userEvent.hover(option('banana'));
			await flush();

			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
			await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		});
	});

	describe('prop: loopFocus', () => {
		const fruits = ['apple', 'banana', 'cherry'];

		it('loops from the last item through the input to the first with ArrowDown by default', async () => {
			render(ComboboxHarness, { items: fruits });
			(input().element() as HTMLElement).focus();

			await userEvent.keyboard('{ArrowUp}');
			await expect.element(page.getByRole('listbox')).toBeInTheDocument();
			await expect.element(input()).toHaveAttribute('aria-activedescendant', options()[2].id);

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveAttribute('aria-activedescendant', options()[0].id);
		});

		it('loops from the first item through the input to the last with ArrowUp by default', async () => {
			render(ComboboxHarness, { items: fruits });
			(input().element() as HTMLElement).focus();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(page.getByRole('listbox')).toBeInTheDocument();
			await expect.element(input()).toHaveAttribute('aria-activedescendant', options()[0].id);

			await userEvent.keyboard('{ArrowUp}');
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');

			await userEvent.keyboard('{ArrowUp}');
			await expect.element(input()).toHaveAttribute('aria-activedescendant', options()[2].id);
		});

		it('stays on the last item with ArrowDown when loopFocus={false}', async () => {
			render(ComboboxHarness, { items: fruits, root: { loopFocus: false } });
			(input().element() as HTMLElement).focus();

			await userEvent.keyboard('{ArrowUp}');
			await expect.element(input()).toHaveAttribute('aria-activedescendant', options()[2].id);

			await userEvent.keyboard('{ArrowDown}');
			await flush();
			await expect.element(input()).toHaveAttribute('aria-activedescendant', options()[2].id);
		});

		it('stays on the first item with ArrowUp when loopFocus={false}', async () => {
			render(ComboboxHarness, { items: fruits, root: { loopFocus: false } });
			(input().element() as HTMLElement).focus();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveAttribute('aria-activedescendant', options()[0].id);

			await userEvent.keyboard('{ArrowUp}');
			await flush();
			await expect.element(input()).toHaveAttribute('aria-activedescendant', options()[0].id);
		});
	});

	describe('coverage edge cases', () => {
		it('allows an attempted open to be canceled', async () => {
			const onOpenChange = vi.fn((_open: boolean, details: { cancel(): void }) => details.cancel());
			render(ComboboxHarness, { root: { onOpenChange } });

			await userEvent.click(input());

			expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});

		it('closes after a changed query is cleared', async () => {
			render(ComboboxHarness, { open: true, items: ['apple'] });

			await userEvent.type(input(), 'a');
			await userEvent.clear(input());
			await userEvent.keyboard('{Escape}');

			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});

		it('clears a multiple inline query on close', async () => {
			render(ComboboxHarness, {
				inline: true,
				open: true,
				refuseOpen: true,
				trigger: true,
				items: ['apple'],
				root: { multiple: true }
			});

			await userEvent.type(input(), 'a');
			(page.getByTestId('trigger').element() as HTMLElement).click();

			await expect.element(input()).toHaveValue('');
		});

		it('normalizes a controlled null value when selecting in multiple mode', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				value: null,
				refuseValue: true,
				open: true,
				staticItems: [{ value: 'apple' }],
				root: { multiple: true, onValueChange }
			});

			(option('apple').element() as HTMLElement).click();

			expect(onValueChange).toHaveBeenCalledWith(['apple'], expect.anything());
		});

		it('normalizes a controlled null value while closed in multiple mode', async () => {
			render(ComboboxHarness, {
				value: null,
				refuseValue: true,
				items: ['apple'],
				probe: true,
				root: { multiple: true }
			});

			await expect.element(page.getByTestId('selected-index')).toHaveTextContent('null');
		});

		it('does not seed an initial highlight for an unmatched inline value', async () => {
			render(ComboboxHarness, {
				inline: true,
				open: true,
				items: ['apple'],
				probe: true,
				root: { defaultValue: 'missing' }
			});

			await expect.element(page.getByTestId('selected-index')).toHaveTextContent('null');
		});

		it('seeds the initial highlight for a matched inline value', async () => {
			render(ComboboxHarness, {
				inline: true,
				open: true,
				items: ['apple'],
				probe: true,
				root: { defaultValue: 'apple' }
			});

			await expect.element(page.getByTestId('selected-index')).toHaveTextContent('0');
		});

		it('omits groups with no matching items', async () => {
			render(ComboboxHarness, {
				open: true,
				items: [
					{ value: 'fruit', items: ['apple'] },
					{ value: 'vegetables', items: ['broccoli'] }
				]
			});

			await userEvent.type(input(), 'app');

			await expect.element(page.getByText('fruit')).toBeInTheDocument();
			await expect.element(page.getByText('vegetables')).not.toBeInTheDocument();
		});

		it('moves focus from the hidden control to an external input', async () => {
			render(ComboboxHarness, {});

			hiddenControl().dispatchEvent(new FocusEvent('focus'));

			await expect.element(input()).toHaveFocus();
		});

		it('falls back to the trigger when the hidden control is focused', async () => {
			render(ComboboxHarness, { noInput: true, trigger: true });

			hiddenControl().dispatchEvent(new FocusEvent('focus'));

			await expect.element(page.getByTestId('trigger')).toHaveFocus();
		});

		it('falls back to the trigger after an external input unmounts', async () => {
			const view = render(ComboboxHarness, {});
			await view.rerender({ noInput: true, trigger: true });

			hiddenControl().dispatchEvent(new FocusEvent('focus'));

			await expect.element(page.getByTestId('trigger')).toHaveFocus();
		});

		it('moves hidden-control focus to the trigger when the input is inside the popup', async () => {
			render(ComboboxHarness, { open: true, inputInside: true });
			await expect.element(input()).toBeInTheDocument();

			hiddenControl().dispatchEvent(new FocusEvent('focus'));

			await expect.element(page.getByTestId('trigger')).toHaveFocus();
		});

		it('safely handles hidden-control focus without a visible control', async () => {
			render(ComboboxHarness, { noInput: true });

			hiddenControl().dispatchEvent(new FocusEvent('focus'));

			expect(document.activeElement).toBe(document.body);
		});

		it('ignores scalar browser autofill in multiple mode', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, { items: ['apple'], root: { multiple: true, onValueChange } });
			const hidden = hiddenControl();

			hidden.value = 'apple';
			hidden.dispatchEvent(new Event('input', { bubbles: true }));
			await flush();

			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('ignores unmatched browser autofill in single mode', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, { items: ['apple'], root: { name: 'fruit', onValueChange } });
			const hidden = document.querySelector<HTMLInputElement>('input[name="fruit"]')!;

			hidden.value = 'orange';
			hidden.dispatchEvent(new Event('input', { bubbles: true }));
			await flush();

			expect(onValueChange).not.toHaveBeenCalled();
		});
	});
});
