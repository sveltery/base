// Assertions follow Base UI v1.9.0 packages/react/src/autocomplete/root/AutocompleteRoot.test.tsx,
// "prop: mode" through "prop: value", and "object item stringification" (commit
// ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `setProps` is a write to a bound prop. A bound `value` is the controlled value.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import AutocompleteHarness from '../../tests/AutocompleteHarness.svelte';

const input = () => page.getByTestId('input');
const options = () => page.getByRole('option');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const fruits = [{ value: 'apple' }, { value: 'banana' }, { value: 'cherry' }];
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};

describe('Autocomplete.Root', () => {
	describe('prop: mode', () => {
		it.each(['list', 'both'] as const)(
			'mode="%s": uses the locale when applying the default filter',
			async (mode) => {
				render(AutocompleteHarness, {
					items: ['Isparta', 'İzmir'],
					root: { mode, locale: 'tr' }
				});

				await userEvent.type(input(), 'i');

				await expect.element(option('İzmir')).toBeInTheDocument();
				await expect.element(option('Isparta')).not.toBeInTheDocument();
			}
		);

		it('mode="list" (default): filters the items and keeps the typed text', async () => {
			render(AutocompleteHarness, {
				items: ['apple', 'banana', 'cherry'],
				root: { mode: 'list' }
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'a');
			await expect.poll(() => options().elements()).toHaveLength(2);

			await userEvent.keyboard('{ArrowDown}');

			await expect.element(input()).toHaveValue('a');
			expect(options().elements()).toHaveLength(2);
		});

		it('mode="both": completes inline and filters by the typed text', async () => {
			render(AutocompleteHarness, {
				items: ['apple', 'banana', 'cherry'],
				root: { mode: 'both' }
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'a');
			await expect.poll(() => options().elements()).toHaveLength(2);

			await userEvent.keyboard('{ArrowDown}');

			await expect.element(input()).toHaveValue('apple');
			expect(options().elements()).toHaveLength(2);
		});

		it('mode="both": hovering an item keeps the inline completion', async () => {
			render(AutocompleteHarness, {
				items: ['alpha', 'alpine', 'beta'],
				root: { mode: 'both' }
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'al');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveValue('alpha');

			await userEvent.hover(option('alpine'));
			await expect.element(option('alpine')).toHaveAttribute('data-highlighted');
			await expect.element(input()).toHaveValue('alpha');
		});

		it('mode="both": a bound value written by the parent replaces the inline completion', async () => {
			const props = renderBound(AutocompleteHarness, {
				value: '',
				items: ['apple', 'banana'],
				root: { mode: 'both' as const }
			});

			await userEvent.type(input(), 'a');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveValue('apple');

			props.value = 'ba';
			await expect.element(input()).toHaveValue('ba');
		});

		it('mode="inline": completes inline over static items', async () => {
			render(AutocompleteHarness, {
				staticItems: fruits,
				root: { mode: 'inline', openOnInputClick: true }
			});

			await userEvent.click(input());
			await expect.poll(() => options().elements()).toHaveLength(3);

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveValue('apple');

			await userEvent.type(input(), 'b');

			await expect.element(input()).toHaveValue('appleb');
			expect(options().elements()).toHaveLength(3);
		});

		it('mode="none": keeps static items and the typed text', async () => {
			render(AutocompleteHarness, {
				staticItems: fruits,
				root: { mode: 'none', openOnInputClick: true }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeVisible();
			await userEvent.keyboard('{ArrowDown}');

			await expect.element(input()).toHaveValue('');
			expect(options().elements()).toHaveLength(3);

			await userEvent.type(input(), 'x');
			await userEvent.keyboard('{ArrowDown}');

			await expect.element(input()).toHaveValue('x');
			expect(options().elements()).toHaveLength(3);
		});
	});

	describe('scroll reset on input value change', () => {
		const listStyle = { style: 'max-height: 100px; overflow-y: auto' };

		it('scrolls the list back to the top when typing', async () => {
			const items = Array.from({ length: 50 }, (_, index) =>
				index < 25 ? `alpha-${index}` : `beta-${index - 25}`
			);
			render(AutocompleteHarness, {
				items,
				listProps: listStyle,
				root: { openOnInputClick: true }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeVisible();
			const list = listbox().element();
			list.scrollTop = 40;
			expect(list.scrollTop).toBeGreaterThan(0);

			// Remove the current first item while keeping enough matches for the list to scroll.
			await userEvent.type(input(), 'b');

			await expect.poll(() => list.scrollTop).toBe(0);
		});

		it('mode="both": inline navigation does not scroll the list back to the top', async () => {
			render(AutocompleteHarness, {
				items: Array.from({ length: 50 }, (_, index) => `item-${index}`),
				listProps: listStyle,
				root: { mode: 'both' }
			});

			await userEvent.click(input());
			// Keep every item in the filtered list so navigation can scroll far down.
			await userEvent.type(input(), 'item');
			for (let i = 0; i < 20; i += 1) {
				await userEvent.keyboard('{ArrowDown}');
			}

			await expect.poll(() => listbox().element().scrollTop).toBeGreaterThan(0);
		});
	});

	describe('prop: filter', () => {
		it('mode="both": keeps filtering by the typed query during inline completion', async () => {
			const filter = vi.fn((item: string, query: string) => item.includes(query));
			const props = renderBound(AutocompleteHarness, {
				items: ['apple', 'banana'] as unknown[],
				root: { mode: 'both' as const, filter }
			});

			await userEvent.type(input(), 'a');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveValue('apple');

			filter.mockClear();
			props.items = ['apple', 'banana', 'apricot'];
			await flush();

			expect(filter).toHaveBeenCalled();
			expect(filter.mock.calls.every(([, query]) => query === 'a')).toBe(true);
		});

		it('mode="inline": does not call a custom filter', async () => {
			const filter = vi.fn(() => false);
			render(AutocompleteHarness, {
				items: ['apple', 'banana'],
				root: { mode: 'inline', filter }
			});

			await userEvent.type(input(), 'a');

			await expect.poll(() => options().elements()).toHaveLength(2);
			expect(filter).not.toHaveBeenCalled();
		});

		it.each(['list', 'both'] as const)(
			'mode="%s": uses a custom filter instead of the locale-aware default',
			async (mode) => {
				render(AutocompleteHarness, {
					items: ['Isparta', 'İzmir'],
					root: {
						mode,
						locale: 'tr',
						filter: (item: string, query: string) => item[0] === query.toUpperCase()
					}
				});

				await userEvent.type(input(), 'i');

				await expect.element(option('Isparta')).toBeInTheDocument();
				await expect.element(option('İzmir')).not.toBeInTheDocument();
			}
		);

		it.each(['list', 'both'] as const)(
			'mode="%s": does not filter when filter is null',
			async (mode) => {
				const movies = [
					{ id: '1', title: 'Pulp Fiction', year: 1994 },
					{ id: '2', title: 'The Godfather', year: 1972 },
					{ id: '3', title: 'The Dark Knight', year: 2008 }
				];
				type Movie = (typeof movies)[number];
				render(AutocompleteHarness, {
					items: movies,
					itemLabel: (movie: Movie) => movie.title,
					root: { mode, filter: null, itemToStringValue: (movie: Movie) => movie.title }
				});

				await userEvent.type(input(), '1994');

				await expect.poll(() => options().elements()).toHaveLength(3);
				await expect.element(option('Pulp Fiction')).toBeInTheDocument();
				await expect.element(option('The Godfather')).toBeInTheDocument();
				await expect.element(option('The Dark Knight')).toBeInTheDocument();
			}
		);
	});

	describe('prop: value', () => {
		it('treats a null value as an empty query', async () => {
			render(AutocompleteHarness, {
				value: null,
				open: true,
				items: ['apple'],
				root: { mode: 'both' }
			});

			await expect.element(input()).toHaveValue('');
			await expect.element(option('apple')).toBeInTheDocument();
		});
	});

	describe('object item stringification', () => {
		it('filters and fills the input by the label of {label} objects', async () => {
			render(AutocompleteHarness, {
				items: [{ label: 'United States' }, { label: 'Canada' }, { label: 'Australia' }]
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'can');

			await expect.poll(() => options().elements()).toHaveLength(1);
			await userEvent.click(option('Canada'));

			await expect.element(input()).toHaveValue('Canada');
		});

		it('uses itemToStringValue when the object has no label', async () => {
			const countries = [
				{ country: 'United States' },
				{ country: 'Canada' },
				{ country: 'Australia' }
			];
			type Country = (typeof countries)[number];
			render(AutocompleteHarness, {
				items: countries,
				itemLabel: (item: Country) => item.country,
				root: { itemToStringValue: (item: Country) => item.country }
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'can');

			await expect.poll(() => options().elements()).toHaveLength(1);
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.element(input()).toHaveValue('Canada');
		});

		it('filters and fills the input by the value of {value} objects', async () => {
			render(AutocompleteHarness, {
				items: [{ value: 'United States' }, { value: 'Canada' }, { value: 'Australia' }]
			});

			await userEvent.type(input(), 'can');

			await expect.poll(() => options().elements()).toHaveLength(1);
			await userEvent.click(option('Canada'));

			await expect.element(input()).toHaveValue('Canada');
		});
	});
});
