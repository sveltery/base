// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "prop: itemToStringLabel" through "reopening during the close animation" (commit
// ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: the `strict: true` run of "does not force-mount the list when controlled value
// changes externally" (React StrictMode). A parent that controls a prop is a bound prop the test
// writes; a parent handler is the root callback writing the same bound props.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const trigger = () => page.getByTestId('trigger');
const popup = () => page.getByTestId('popup');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const options = () => document.querySelectorAll('[role="option"]');
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};

const countries = [
	{ country: 'United States', code: 'US' },
	{ country: 'Canada', code: 'CA' },
	{ country: 'Australia', code: 'AU' }
];
type Country = (typeof countries)[number];
const countryLabels = {
	itemToStringLabel: (item: Country) => item.country,
	itemToStringValue: (item: Country) => item.code
};

let animationStyle: HTMLStyleElement | undefined;
function animateClose() {
	animationStyle = document.createElement('style');
	animationStyle.textContent = `
		@keyframes combobox-close-test { to { opacity: 0; } }
		[data-testid="popup"][data-ending-style] { animation: combobox-close-test 400ms linear; }
	`;
	document.head.append(animationStyle);
}
afterEach(() => {
	animationStyle?.remove();
	animationStyle = undefined;
});

describe('Combobox.Root', () => {
	describe('prop: itemToStringLabel', () => {
		it('uses itemToStringLabel for input value synchronization', async () => {
			render(ComboboxHarness, {
				open: true,
				items: countries,
				itemLabel: (item: Country) => item.country,
				root: countryLabels
			});

			await userEvent.click(page.getByText('Canada'));
			await expect.element(input()).toHaveValue('Canada');
		});

		it('shows the label for a controlled object value not in items', async () => {
			render(ComboboxHarness, {
				items: countries,
				value: { country: 'Japan', code: 'JP' },
				root: countryLabels
			});

			await expect.element(input()).toHaveValue('Japan');
		});
	});

	describe('prop: itemToStringValue', () => {
		it('uses itemToStringValue for form submission', async () => {
			render(ComboboxHarness, {
				items: countries,
				itemLabel: (item: Country) => item.country,
				root: { ...countryLabels, name: 'country', defaultValue: countries[0] }
			});

			const hidden = document.querySelector<HTMLInputElement>('input[name="country"]')!;
			expect(hidden.tagName).toBe('INPUT');
			expect(hidden.value).toBe('US');
		});

		it('uses itemToStringValue for multiple selection form submission', async () => {
			const values = [countries[0], countries[1]];
			render(ComboboxHarness, {
				items: countries,
				itemLabel: (item: Country) => item.country,
				root: { ...countryLabels, name: 'countries', multiple: true, defaultValue: values }
			});

			// Multiple values submit through one `<select multiple>`, not one input per value.
			const control = document.querySelector<HTMLSelectElement>('select[name="countries"]')!;
			expect([...control.selectedOptions].map((selected) => selected.value)).toEqual(['US', 'CA']);
		});
	});

	describe('initial input value derivation', () => {
		it('derives input from defaultValue on first mount when unspecified', async () => {
			render(ComboboxHarness, { root: { defaultValue: 'apple' } });
			await expect.element(input()).toHaveValue('apple');
		});

		it('derives input from defaultValue on first mount with items prop', async () => {
			const items = [{ value: 'apple', label: 'Apple' }];
			render(ComboboxHarness, { items, root: { defaultValue: items[0] } });
			await expect.element(input()).toHaveValue('Apple');
		});

		it('derives input from controlled value on first mount when unspecified', async () => {
			render(ComboboxHarness, { value: 'banana' });
			await expect.element(input()).toHaveValue('banana');
		});

		it('defaultInputValue overrides derivation when provided', async () => {
			render(ComboboxHarness, { root: { defaultValue: 'apple', defaultInputValue: 'x' } });
			await expect.element(input()).toHaveValue('x');
		});

		it('inputValue overrides derivation when provided', async () => {
			render(ComboboxHarness, { value: 'apple', inputValue: 'x' });
			await expect.element(input()).toHaveValue('x');
		});

		it('multiple mode initial input remains empty', async () => {
			render(ComboboxHarness, {
				items: [
					{ value: 'a', label: 'A' },
					{ value: 'b', label: 'B' }
				],
				root: { multiple: true }
			});
			await expect.element(input()).toHaveValue('');
		});

		it('does not set input value for input-inside-popup pattern', async () => {
			render(ComboboxHarness, { open: true, inputInside: true, root: { defaultValue: 'apple' } });
			await expect.element(input()).toHaveValue('');
		});
	});

	describe('input value synchronization', () => {
		it('updates derived input when controlled value changes externally', async () => {
			const items = [
				{ value: 'apple', label: 'Apple' },
				{ value: 'banana', label: 'Banana' }
			];
			const props = renderBound(ComboboxHarness, { items, value: items[0] as unknown });
			await expect.element(input()).toHaveValue('Apple');

			props.value = items[1];
			await expect.element(input()).toHaveValue('Banana');
		});

		it('does not force-mount the list when controlled value changes externally (strict: false)', async () => {
			const labels: Record<string, string> = { apple: 'Apple', banana: 'Banana' };
			const itemToStringLabel = (item: string) => labels[item];
			const withItems = renderBound(ComboboxHarness, {
				items: ['apple', 'banana'],
				itemLabel: itemToStringLabel,
				value: null as unknown,
				input: { 'data-testid': 'items-input' },
				root: { itemToStringLabel }
			});
			const withoutItems = renderBound(ComboboxHarness, {
				staticItems: [
					{ value: 'apple', text: 'Apple' },
					{ value: 'banana', text: 'Banana' }
				],
				value: null as unknown,
				input: { 'data-testid': 'plain-input' },
				root: { itemToStringLabel }
			});

			expect(document.querySelectorAll('[role="listbox"]')).toHaveLength(0);

			withItems.value = 'banana';
			withoutItems.value = 'banana';
			await flush();

			expect(document.querySelectorAll('[role="listbox"]')).toHaveLength(0);
			await expect.element(page.getByTestId('items-input')).toHaveValue('Banana');
			await expect.element(page.getByTestId('plain-input')).toHaveValue('Banana');
		});

		it('re-derives input when items array changes', async () => {
			const initialItems = [
				{ value: 'a', label: 'Apple' },
				{ value: 'b', label: 'Banana' }
			];
			const props = renderBound(ComboboxHarness, {
				items: initialItems as unknown,
				value: initialItems[0] as unknown
			});
			await expect.element(input()).toHaveValue('Apple');

			const nextItems = [
				{ value: 'a', label: 'Apricot' },
				{ value: 'b', label: 'Banana' },
				{ value: 'c', label: 'Cherry' }
			];
			props.items = nextItems;
			props.value = nextItems[0];
			await expect.element(input()).toHaveValue('Apricot');

			const sameLengthDifferentItems = [
				{ value: 'a', label: 'Ambrosia' },
				{ value: 'b', label: 'Blue Java' },
				{ value: 'c', label: 'Clementine' }
			];
			props.items = sameLengthDifferentItems;
			props.value = sameLengthDifferentItems[0];
			await expect.element(input()).toHaveValue('Ambrosia');
		});

		it('restores the selected label after a one-step clear and items reload', async () => {
			const props = renderBound(ComboboxHarness, {
				items: ['apple'] as unknown,
				value: 'apple' as unknown,
				// The parent holds the value: a clear does not reach it.
				refuseValue: true,
				root: { itemToStringLabel: (item: string) => (item === 'apple' ? 'Apple' : item) }
			});
			await expect.element(input()).toHaveValue('Apple');

			await userEvent.clear(input());
			await expect.element(input()).toHaveValue('');

			props.items = ['apple'];
			await expect.element(input()).toHaveValue('Apple');
		});

		it('reports a single input value change when the controlled value changes', async () => {
			const onInputValueChange = vi.fn();
			const items = [
				{ value: 'a', label: 'Apple' },
				{ value: 'b', label: 'Banana' },
				{ value: 'c', label: 'Cherry' }
			];
			const props = renderBound(ComboboxHarness, {
				items,
				value: items[0] as unknown,
				root: { onInputValueChange }
			});
			await expect.element(input()).toHaveValue('Apple');
			onInputValueChange.mockClear();

			props.value = items[1];
			await expect.element(input()).toHaveValue('Banana');
			expect(onInputValueChange).toHaveBeenCalledTimes(1);

			props.value = items[2];
			await expect.element(input()).toHaveValue('Cherry');
			expect(onInputValueChange).toHaveBeenCalledTimes(2);

			props.value = items[0];
			await expect.element(input()).toHaveValue('Apple');
			expect(onInputValueChange).toHaveBeenCalledTimes(3);
		});

		it('syncs again after a canceled sync to the same label', async () => {
			let cancelSync = false;
			const props = renderBound(ComboboxHarness, {
				items: ['One', 'Two'],
				value: 'One' as unknown,
				root: {
					onInputValueChange: (_: string, details: { reason: string; cancel(): void }) => {
						if (cancelSync && details.reason === REASONS.none) details.cancel();
					}
				}
			});
			await expect.element(input()).toHaveValue('One');

			cancelSync = true;
			props.value = 'Two';
			await flush();
			await expect.element(input()).toHaveValue('One');

			// The input already matches this label, so nothing is written and nothing observes a change.
			cancelSync = false;
			props.value = 'One';
			await flush();
			await expect.element(input()).toHaveValue('One');

			props.value = 'Two';
			await expect.element(input()).toHaveValue('Two');
		});

		it('reports a single input value change when the selection is remapped', async () => {
			const onInputValueChange = vi.fn();
			render(ComboboxHarness, {
				open: true,
				items: ['Apple', 'Banana', 'Cherry'],
				value: 'Apple',
				mapValue: (next: unknown) => (next === 'Banana' ? 'Cherry' : (next ?? '')),
				root: { onInputValueChange }
			});
			await expect.element(input()).toHaveValue('Apple');
			onInputValueChange.mockClear();

			await userEvent.click(option('Banana'));

			await expect.element(input()).toHaveValue('Cherry');
			expect(
				onInputValueChange.mock.calls.map(([next, details]) => [next, details.reason])
			).toEqual([
				['Banana', REASONS.itemPress],
				['Cherry', REASONS.none]
			]);
		});

		it('re-syncs the input when the resolved label of an unchanged value changes', async () => {
			const props = renderBound(ComboboxHarness, {
				items: ['a', 'b'],
				value: 'b' as unknown,
				root: { itemToStringLabel: (value: string) => value }
			});
			await expect.element(input()).toHaveValue('b');

			props.root = { itemToStringLabel: (value: string) => (value === 'b' ? 'Banana' : value) };
			await expect.element(input()).toHaveValue('Banana');
		});

		it('restores derived input after items load asynchronously', async () => {
			const props = renderBound(ComboboxHarness, {
				items: [] as unknown,
				value: 'banana' as unknown
			});
			await expect.element(input()).toHaveValue('banana');

			props.items = ['apple', 'banana', 'bread'];
			await flush();
			await expect.element(input()).toHaveValue('banana');

			props.items = ['banana'];
			await flush();
			await expect.element(input()).toHaveValue('banana');
		});
	});

	describe('reopening during the close animation', () => {
		it('shows every item when a controlled reopen interrupts a canceled mirrored-selection clear', async () => {
			animateClose();
			const props: { open: boolean; inputValue: string } = renderBound(ComboboxHarness, {
				open: false,
				inputValue: '',
				inputInside: true,
				items: ['apple', 'apricot', 'banana'],
				root: {
					onValueChange: (value: string | null) => {
						props.inputValue = value ?? '';
					},
					onInputValueChange: (_: string, details: { reason: string; cancel(): void }) => {
						if (details.reason === REASONS.inputClear) details.cancel();
					}
				}
			}) as never;

			props.open = true;
			await expect.element(input()).toBeInTheDocument();
			await userEvent.type(input(), 'ap');
			await userEvent.click(option('apple'));

			await expect.element(popup()).toHaveAttribute('data-ending-style');

			props.open = true;
			await expect.element(popup()).not.toHaveAttribute('data-ending-style');

			await expect.element(input()).toHaveValue('apple');
			await expect.poll(() => options().length).toBe(3);
		});

		it('keeps the typed filter when items change afterwards (input outside popup)', async () => {
			animateClose();
			const props = renderBound(ComboboxHarness, {
				trigger: true,
				items: ['apple', 'apricot', 'banana'] as unknown
			});

			await userEvent.type(input(), 'app');
			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			await userEvent.click(trigger());
			await flush();
			await expect.element(input()).toHaveValue('app');

			// A new `items` identity must not resync the input to the selected label while the
			// user's filter is still in it.
			props.items = [...(props.items as string[])];
			await flush();
			await expect.element(input()).toHaveValue('app');
		});

		it('keeps filtering when typing reopens the popup (input outside popup)', async () => {
			animateClose();
			render(ComboboxHarness, {
				items: ['apple', 'apricot', 'banana'],
				root: { defaultValue: 'apple' }
			});
			await expect.element(input()).toHaveValue('apple');

			await userEvent.click(input());
			await userEvent.keyboard('{Backspace}');
			await expect.poll(() => options().length).toBe(1);

			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			await userEvent.keyboard('e');
			await flush();

			await expect.element(input()).toHaveValue('apple');
			await expect.poll(() => options().length).toBe(1);
		});

		it('does not re-emit a clear when closing again without typing (multiple, input outside popup)', async () => {
			animateClose();
			const onInputValueChange = vi.fn();
			render(ComboboxHarness, {
				trigger: true,
				items: ['apple', 'apricot', 'banana'],
				root: { multiple: true, onInputValueChange }
			});

			await userEvent.type(input(), 'app');
			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			await userEvent.click(trigger());
			await flush();
			await expect.element(input()).toHaveValue('');

			onInputValueChange.mockClear();
			await userEvent.keyboard('{Escape}');
			await flush();

			expect(onInputValueChange).not.toHaveBeenCalled();
		});

		it('keeps a keystroke typed into an empty input when items refresh synchronously', async () => {
			animateClose();
			const props: { items: unknown } = renderBound(ComboboxHarness, {
				items: ['apple', 'apricot', 'banana'] as unknown,
				root: {
					defaultValue: 'apple',
					onInputValueChange: () => {
						props.items = [...(props.items as string[])];
					}
				}
			}) as never;
			await expect.element(input()).toHaveValue('apple');

			await userEvent.click(input());
			await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}');
			await expect.element(input()).toHaveValue('');

			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			await userEvent.keyboard('a');
			await flush();
			await expect.element(input()).toHaveValue('a');
		});

		it('releases the frozen query when controlled open reopens the popup', async () => {
			animateClose();
			const onInputValueChange = vi.fn();
			const props = renderBound(ComboboxHarness, {
				open: false,
				items: ['apple', 'apricot', 'banana'],
				root: { multiple: true, onInputValueChange }
			});

			await userEvent.type(input(), 'app');
			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			props.open = true;

			await expect.element(input()).toHaveValue('');
			await expect.element(option('banana')).toBeInTheDocument();

			onInputValueChange.mockClear();
			await userEvent.keyboard('{Escape}');
			expect(onInputValueChange).not.toHaveBeenCalled();
		});

		it('unfreezes filtering when a controlled open ignores the close request (multiple, input outside popup)', async () => {
			render(ComboboxHarness, {
				open: true,
				items: ['apple', 'apricot', 'banana'],
				refuseOpen: true,
				root: { multiple: true }
			});

			await userEvent.type(input(), 'ap');
			await expect.poll(() => options().length).toBe(2);

			// The close request clears the input and freezes the query for the exit animation,
			// but the consumer keeps the popup open, so the frozen query must stop filtering.
			await userEvent.keyboard('{Escape}');
			await flush();

			await expect.element(input()).toHaveValue('');
			await expect.poll(() => options().length).toBe(3);
		});

		it('opens blank when the input only mirrors the selection (single, input inside popup)', async () => {
			animateClose();
			const props: { inputValue: string } = renderBound(ComboboxHarness, {
				value: null as unknown,
				inputValue: '',
				inputInside: true,
				items: ['apple', 'apricot', 'banana'],
				root: {
					onValueChange: (next: string | null) => {
						props.inputValue = next ?? '';
					}
				}
			}) as never;

			await userEvent.click(trigger());
			await expect.element(input()).toHaveFocus();

			await userEvent.type(input(), 'ap');
			await expect.poll(() => options().length).toBe(2);

			await userEvent.click(option('apple'));
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			// A consumer mirroring the selection into the popup input must not leave the reopened
			// list filtered by it: an interrupted close opens blank, same as a completed one.
			await userEvent.click(trigger());

			await expect.element(input()).toHaveValue('');
			await expect.poll(() => options().length).toBe(3);
		});

		it('keeps an input value set in the same batch as a controlled reopen (input inside popup)', async () => {
			animateClose();
			const onInputValueChange = vi.fn();
			const props = renderBound(ComboboxHarness, {
				open: false,
				inputValue: '',
				inputInside: true,
				items: ['apple', 'apricot', 'banana'],
				root: {
					onInputValueChange: (value: string, details: { reason: string }) =>
						onInputValueChange(value, details.reason)
				}
			});

			await userEvent.click(trigger());
			await expect.element(input()).toHaveFocus();

			await userEvent.type(input(), 'ap');
			await expect.poll(() => options().length).toBe(2);

			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			onInputValueChange.mockClear();

			// The consumer's value never fed the frozen query, so the reopen cleanup must not
			// mistake it for leftover filter text and clear it.
			props.inputValue = 'banana';
			props.open = true;
			await flush();

			await expect.element(input()).toHaveValue('banana');
			expect(onInputValueChange).not.toHaveBeenCalledWith('', REASONS.inputClear);
		});

		it('shows every item when selection reopens the popup', async () => {
			animateClose();
			render(ComboboxHarness, { trigger: true, items: ['apple', 'apricot', 'banana'] });

			await userEvent.type(input(), 'ap');
			await userEvent.click(option('apple'));
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			await userEvent.click(trigger());

			await expect.element(input()).toHaveValue('apple');
			await expect.poll(() => options().length).toBe(3);
		});
	});
});
