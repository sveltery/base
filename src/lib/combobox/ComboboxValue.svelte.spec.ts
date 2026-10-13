// Assertions follow Base UI v1.9.0 packages/react/src/combobox/value/ComboboxValue.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported, React only: the cases with ReactNode labels or a ReactNode placeholder (labels and
// the placeholder are strings here). A children function is a `children` snippet.
import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const trigger = () => page.getByTestId('trigger');

/** A `children` snippet that renders this text for the value. */
function valueSnippet(format: (value: unknown) => string) {
	return createRawSnippet((value: () => unknown) => ({
		render: () => `<div data-testid="value">${format(value())}</div>`
	}));
}

const staticSnippet = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('Combobox.Value', () => {
	describe('prop: children', () => {
		it('renders the selected value through the children snippet', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: { children: valueSnippet(String) },
				staticItems: [{ value: 'a' }, { value: 'b' }],
				root: { defaultValue: 'b' }
			});

			await expect.element(page.getByTestId('value')).toHaveTextContent('b');
		});

		it('passes null to the children snippet when no value is selected', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: {
					children: valueSnippet((value) => (value === null ? 'null' : String(value)))
				},
				staticItems: [{ value: 'a' }]
			});

			await expect.element(page.getByTestId('value')).toHaveTextContent('null');
		});

		it('passes complex objects to the children snippet', async () => {
			const complexValue = { id: 1, name: 'Test', nested: { data: 'value' } };
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: {
					children: valueSnippet((value) => {
						const item = value as typeof complexValue | null;
						return item ? `${item.name} (${item.id})` : 'No value';
					})
				},
				staticItems: [{ value: complexValue, text: 'Test Item' }],
				root: { defaultValue: complexValue }
			});

			await expect.element(page.getByTestId('value')).toHaveTextContent('Test (1)');
		});

		it('overrides the value display with static children', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: { children: staticSnippet('<span>Custom Display Text</span>') },
				staticItems: [{ value: 'test-value', text: 'Test' }],
				root: { defaultValue: 'test-value' }
			});

			await expect.element(page.getByText('Custom Display Text')).toBeInTheDocument();
		});

		it('renders nested markup children', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: {
					children: staticSnippet(
						'<span data-testid="complex"><strong>Bold</strong> and <em>italic</em> text</span>'
					)
				},
				staticItems: [{ value: 'test', text: 'Test' }],
				root: { defaultValue: 'test' }
			});

			const element = page.getByTestId('complex').element();
			expect(element.querySelector('strong')?.textContent).toBe('Bold');
			expect(element.querySelector('em')?.textContent).toBe('italic');
		});
	});

	describe('selected value with a label property', () => {
		it('renders the label of the selected value object', async () => {
			const valueWithLabel = { value: 'test', label: 'Test Label' };
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: [{ value: valueWithLabel, text: 'Test Item' }],
				root: { defaultValue: valueWithLabel }
			});

			await expect.element(trigger()).toHaveTextContent('Test Label');
		});

		it('falls back to the value field when the label is null', async () => {
			const valueWithNullLabel = { value: 'test', label: null };
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: [{ value: valueWithNullLabel, text: 'Test Item' }],
				root: { defaultValue: valueWithNullLabel }
			});

			await expect.element(trigger()).toHaveTextContent('test');
		});
	});

	describe('items array format', () => {
		it('renders the null item label from items when no value is selected', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				items: [
					{ value: null, label: 'Select item' },
					{ value: 'a', label: 'A' }
				]
			});

			await expect.element(trigger()).toHaveTextContent('Select item');
		});

		it('renders the null item label when the input is inside the popup and has no defaultValue', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				empty: 'No countries found.',
				input: { placeholder: 'e.g. United Kingdom' },
				items: [
					{ value: null, label: 'Select country' },
					{ value: 'united-kingdom', label: 'United Kingdom' }
				]
			});

			await expect.element(trigger()).toHaveTextContent('Select country');
		});

		const fonts = [
			{ value: 'sans', label: 'Sans-serif' },
			{ value: 'serif', label: 'Serif' },
			{ value: 'mono', label: 'Monospace' }
		];

		it('displays the label from items when a value is selected', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				items: fonts,
				root: { defaultValue: fonts[1] }
			});

			await expect.element(trigger()).toHaveTextContent('Serif');
		});

		it('updates the label when the value changes', async () => {
			const props = renderBound(ComboboxHarness, {
				inputInside: true,
				items: fonts,
				value: fonts[0] as (typeof fonts)[number] | null
			});
			await expect.element(trigger()).toHaveTextContent('Sans-serif');

			props.value = fonts[1];
			await expect.element(trigger()).toHaveTextContent(/^Serif$/);

			props.value = fonts[2];
			await expect.element(trigger()).toHaveTextContent('Monospace');

			props.value = null;
			await expect.poll(() => trigger().element().textContent?.trim()).toBe('');
		});

		it('uses the first match for duplicate values in items', async () => {
			const items = [
				{ value: 'test', label: 'First Label' },
				{ value: 'test', label: 'Second Label' },
				{ value: 'other', label: 'Other' }
			];
			render(ComboboxHarness, { inputInside: true, items, root: { defaultValue: items[0] } });

			await expect.element(trigger()).toHaveTextContent('First Label');
		});

		it('is not stale after items are updated', async () => {
			const a = { value: 'a', label: 'a' };
			const b = { value: 'b', label: 'b' };
			// Plain props, so the objects stay the parent's own rather than `$state` proxies.
			const view = render(ComboboxHarness, { inputInside: true, items: [a, b], value: a });
			await expect.element(trigger()).toHaveTextContent('a');

			// The label changes, but the object identity of `a` does not.
			a.label = 'a new';
			const c = { value: 'c', label: 'c' };
			await view.rerender({ inputInside: true, items: [a, b, c], value: a });
			await expect.element(trigger()).toHaveTextContent('a new');

			await view.rerender({ inputInside: true, items: [a, b, c], value: c });
			await expect.element(trigger()).toHaveTextContent(/^c$/);
		});
	});

	describe('grouped items', () => {
		it('handles grouped items', async () => {
			const items = [
				{
					value: 'fonts',
					items: [
						{ value: 'sans', label: 'Sans-serif' },
						{ value: 'serif', label: 'Serif' }
					]
				},
				{
					value: 'sizes',
					items: [
						{ value: 'small', label: 'Small' },
						{ value: 'large', label: 'Large' }
					]
				}
			];
			render(ComboboxHarness, {
				inputInside: true,
				items,
				root: { defaultValue: items[0].items[1] }
			});

			await expect.element(trigger()).toHaveTextContent('Serif');
		});

		it('handles null items in a grouped structure', async () => {
			const items = [
				{
					value: 'options',
					items: [
						{ value: null, label: 'None selected' },
						{ value: 'option1', label: 'Option 1' }
					]
				}
			];
			render(ComboboxHarness, { inputInside: true, items });

			await expect.element(trigger()).toHaveTextContent('None selected');
		});
	});

	describe('multiple selection', () => {
		it('displays comma-separated labels from items', async () => {
			const items = [
				{ value: 'sans', label: 'Sans-serif' },
				{ value: 'serif', label: 'Serif' },
				{ value: 'mono', label: 'Monospace' }
			];
			render(ComboboxHarness, {
				inputInside: true,
				items,
				root: { multiple: true, defaultValue: [items[0], items[1]] }
			});

			await expect.element(trigger()).toHaveTextContent('Sans-serif, Serif');
		});

		it('falls back to raw values when items are not provided', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: [
					{ value: 'serif', text: 'Serif' },
					{ value: 'mono', text: 'Monospace' }
				],
				root: { multiple: true, defaultValue: ['serif', 'mono'] }
			});

			await expect.element(trigger()).toHaveTextContent('serif, mono');
		});
	});

	describe('primitive values', () => {
		it.each([
			['string', 'test-string', 'Test String', 'test-string'],
			['number', 42, 'Forty Two', '42'],
			['boolean', true, 'True', 'true']
		])('handles %s values', async (_, value, text, expected) => {
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: [{ value, text }],
				root: { defaultValue: value }
			});

			await expect.element(trigger()).toHaveTextContent(expected);
		});
	});

	describe('prop: itemToStringLabel', () => {
		it('uses a custom itemToStringLabel', async () => {
			const complexItem = { id: 1, name: 'Test Item' };
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: [{ value: complexItem, text: 'Test Item' }],
				root: {
					defaultValue: complexItem,
					itemToStringLabel: (item: unknown) =>
						item && typeof item === 'object' && 'name' in item
							? `Custom: ${item.name}`
							: String(item)
				}
			});

			await expect.element(trigger()).toHaveTextContent('Custom: Test Item');
		});
	});

	describe('prop: placeholder', () => {
		const option1 = [{ value: 'option1', text: 'Option 1' }];

		it('displays the placeholder when no value is selected', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: { placeholder: 'Select an option' },
				staticItems: option1
			});

			await expect.element(trigger()).toHaveTextContent('Select an option');
		});

		it('does not display the placeholder when a value is selected', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: { placeholder: 'Select an option' },
				staticItems: option1,
				root: { defaultValue: 'option1' }
			});

			await expect.element(trigger()).toHaveTextContent('option1');
		});

		it('gives static children precedence over the placeholder', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: {
					placeholder: 'Select an option',
					children: staticSnippet('<span>Custom Text</span>')
				},
				staticItems: option1
			});

			await expect.element(trigger()).toHaveTextContent('Custom Text');
		});

		it('gives a children snippet precedence over the placeholder', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: {
					placeholder: 'Select an option',
					children: valueSnippet((value) => (value ? String(value) : 'Function fallback'))
				},
				staticItems: option1
			});

			await expect.element(trigger()).toHaveTextContent('Function fallback');
		});

		it('gives the null item label in items precedence over the placeholder', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: { placeholder: 'Select an option' },
				items: [
					{ value: null, label: 'None' },
					{ value: 'option1', label: 'Option 1' }
				]
			});

			await expect.element(trigger()).toHaveTextContent('None');
		});

		it('uses the placeholder when the null item has no label', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: { placeholder: 'Select an option' },
				items: [
					{ value: null, label: null },
					{ value: 'option1', label: 'Option 1' }
				]
			});

			await expect.element(trigger()).toHaveTextContent('Select an option');
		});

		it('displays the placeholder when multiple mode has an empty array', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: { placeholder: 'Select options' },
				staticItems: option1,
				root: { multiple: true, defaultValue: [] }
			});

			await expect.element(trigger()).toHaveTextContent('Select options');
		});
	});
});
