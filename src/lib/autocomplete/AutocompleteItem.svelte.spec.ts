// Assertions follow Base UI v1.9.0 packages/react/src/autocomplete/item/AutocompleteItem.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AutocompleteHarness from '../../tests/AutocompleteHarness.svelte';
import ComboboxVirtualHarness from '../../tests/ComboboxVirtualHarness.svelte';

const input = () => page.getByTestId('input');
const listbox = () => page.getByRole('listbox');
const option = (name: string) => page.getByRole('option', { name, exact: true });

describe('Autocomplete.Item', () => {
	describe('prop: onclick', () => {
		it('runs when the item is clicked', async () => {
			const onclick = vi.fn();
			render(AutocompleteHarness, {
				items: ['apple', 'banana'],
				itemProps: { onclick },
				root: { openOnInputClick: true }
			});

			await userEvent.click(input());
			await userEvent.click(option('banana'));

			expect(onclick).toHaveBeenCalledTimes(1);
			await expect.element(input()).toHaveValue('banana');
		});

		it('runs when the highlighted item is chosen with Enter', async () => {
			const onclick = vi.fn();
			render(AutocompleteHarness, {
				items: ['one', 'two'],
				itemProps: { onclick },
				root: { openOnInputClick: true }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeVisible();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			expect(onclick).toHaveBeenCalledTimes(1);
		});
	});

	it('does not expose data-selected when reopening after a value is chosen', async () => {
		render(AutocompleteHarness, {
			staticItems: [{ value: 'apple' }, { value: 'banana' }],
			root: { openOnInputClick: true }
		});

		await userEvent.click(input());
		await userEvent.click(option('banana'));
		await expect.element(listbox()).not.toBeInTheDocument();
		await userEvent.click(input());

		await expect.element(option('banana')).toBeInTheDocument();
		await expect.element(option('banana')).not.toHaveAttribute('data-selected');
		await expect.element(option('banana')).not.toHaveAttribute('aria-selected', 'true');
	});

	describe('prop: index', () => {
		it('highlights an index past the rendered window of a virtualized list', async () => {
			const onItemHighlighted = vi.fn();
			const items = Array.from({ length: 20 }, (_, index) => `item-${index}`);
			render(ComboboxVirtualHarness, {
				kind: 'autocomplete',
				root: { virtualized: true, items, id: 'ac', openOnInputClick: true, onItemHighlighted },
				windowSize: 5
			});
			await userEvent.click(input());
			await expect.element(option('item-4')).toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}'.repeat(7));

			expect(onItemHighlighted.mock.lastCall?.[0]).toBe('item-6');
			expect(onItemHighlighted.mock.lastCall?.[1].index).toBe(6);
			await expect.element(input()).toHaveAttribute('aria-activedescendant', 'ac-6');
		});
	});
});
