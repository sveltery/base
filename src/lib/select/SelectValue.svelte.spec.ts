// Assertions follow Base UI v1.9.0 packages/react/src/select/value/SelectValue.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported, React only: `describeConformance`, and the cases with ReactNode labels or a
// ReactNode placeholder (labels and the placeholder are strings here). A children function is a
// `children` snippet that receives the value, and string children are a snippet that ignores it.
import { tick, type ComponentProps } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import { selectedValues } from '../../tests/select-native.js';
import SelectHarness from '../../tests/SelectHarness.svelte';

type HarnessProps = ComponentProps<typeof SelectHarness>;

const value = () => page.getByTestId('value');
const fonts = { sans: 'Sans-serif', serif: 'Serif', mono: 'Monospace' };
const fontList = [
	{ value: 'sans', label: 'Sans-serif' },
	{ value: 'serif', label: 'Serif' },
	{ value: 'mono', label: 'Monospace' }
];
const fontItems = fontList.map((font) => ({ value: font.value, text: font.label }));

function live(initial: HarnessProps) {
	return renderBound(SelectHarness, initial, { value: undefined, open: false });
}

async function set(props: HarnessProps, next: Partial<HarnessProps>) {
	Object.assign(props, next);
	await tick();
}

describe('Select.Value', () => {
	describe('prop: children', () => {
		it('accepts a function with a value parameter', async () => {
			const children = vi.fn((current: unknown) => String(current));
			render(SelectHarness, {
				value: '1',
				formatValue: children,
				items: [{ value: '1', text: 'one' }]
			});

			await userEvent.click(page.getByText('1', { exact: true }));

			expect(children.mock.calls[0]?.[0]).toBe('1');
			expect(children.mock.calls.at(-1)?.[0]).toBe('1');
		});

		it('overrides the text when children is a string', async () => {
			render(SelectHarness, { value: '1', formatValue: () => 'one' });

			await expect.element(page.getByText('one')).toBeInTheDocument();
		});
	});

	describe('prop: items (object format)', () => {
		it('displays the label from items object when no children are provided', async () => {
			render(SelectHarness, { value: 'sans', root: { items: fonts }, items: fontItems });

			await expect.element(value()).toHaveTextContent('Sans-serif');
		});

		it('updates the label when value changes with items object', async () => {
			const props = live({ value: 'sans', root: { items: fonts }, items: fontItems });
			await expect.element(value()).toHaveTextContent('Sans-serif');

			await set(props, { value: 'serif' });
			await expect.element(value()).toHaveTextContent('Serif');

			await set(props, { value: 'mono' });
			await expect.element(value()).toHaveTextContent('Monospace');
		});

		it('falls back to raw value when value is not in items object', async () => {
			render(SelectHarness, { value: 'unknown', root: { items: { sans: 'Sans-serif' } } });

			await expect.element(value()).toHaveTextContent('unknown');
		});

		it('can lookup null value', async () => {
			render(SelectHarness, {
				value: null,
				root: { items: { sans: 'Sans-serif', serif: 'Serif', null: 'Null' } }
			});

			await expect.element(value()).toHaveTextContent('Null');
		});
	});

	describe('prop: items (array format)', () => {
		it('displays the label from items array when no children are provided', async () => {
			render(SelectHarness, { value: 'serif', root: { items: fontList }, items: fontItems });

			await expect.element(value()).toHaveTextContent('Serif');
		});

		it('updates the label when value changes with items array', async () => {
			const props = live({ value: 'sans', root: { items: fontList }, items: fontItems });
			await expect.element(value()).toHaveTextContent('Sans-serif');

			await set(props, { value: 'serif' });
			await expect.element(value()).toHaveTextContent('Serif');

			await set(props, { value: 'mono' });
			await expect.element(value()).toHaveTextContent('Monospace');
		});

		it('falls back to raw value when value is not in items array', async () => {
			render(SelectHarness, { value: 'unknown', root: { items: fontList.slice(0, 2) } });

			await expect.element(value()).toHaveTextContent('unknown');
		});

		it('is not stale after being updated', async () => {
			const first = [
				{ value: 'a', label: 'a' },
				{ value: 'b', label: 'b' }
			];
			const second = [
				{ value: 'a', label: 'a new' },
				{ value: 'b', label: 'b new' },
				{ value: 'c', label: 'c' }
			];
			const asItems = (list: typeof first) =>
				list.map((entry) => ({ value: entry.value, text: entry.label }));
			const props = live({ value: 'a', root: { items: first }, items: asItems(first) });
			await expect.element(value()).toHaveTextContent('a');

			await set(props, { root: { items: second }, items: asItems(second) });
			await expect.element(value()).toHaveTextContent('a new');

			await set(props, { value: 'c' });
			await expect.element(value()).toHaveTextContent('c');
		});
	});

	describe('prop: itemToStringLabel', () => {
		it('uses custom itemToStringLabel function', async () => {
			const countries = [
				{ country: 'United States', code: 'US' },
				{ country: 'Canada', code: 'CA' }
			];
			type Country = (typeof countries)[number];
			render(SelectHarness, {
				value: countries[1],
				root: {
					itemToStringLabel: (item: Country) => item.country,
					itemToStringValue: (item: Country) => item.code
				},
				items: countries.map((item) => ({ value: item, text: item.country }))
			});

			await expect.element(value()).toHaveTextContent('Canada');
		});

		it('falls back to label/value properties when functions are not provided', async () => {
			const countries = [
				{ label: 'United States', value: 'US' },
				{ label: 'Canada', value: 'CA' }
			];
			render(SelectHarness, {
				value: countries[1],
				root: { name: 'country' },
				items: countries.map((item) => ({ value: item, text: item.label }))
			});

			await expect.element(value()).toHaveTextContent('Canada');
			expect(selectedValues()).toEqual(['CA']);
		});
	});

	describe('prop: children (takes precedence over items)', () => {
		it('uses children string over items object', async () => {
			render(SelectHarness, {
				value: 'sans',
				root: { items: fonts },
				formatValue: () => 'Custom Text'
			});

			await expect.element(value()).toHaveTextContent('Custom Text');
		});

		it('uses children function over items array', async () => {
			render(SelectHarness, {
				value: 'sans',
				root: { items: fontList },
				formatValue: (current) => `Custom: ${current}`
			});

			await expect.element(value()).toHaveTextContent('Custom: sans');
		});
	});

	it('changes text when the value changes', async () => {
		const props = live({
			value: null,
			formatValue: (current) => (current as string | null) ?? 'initial',
			items: [{ value: '1' }, { value: '2' }]
		});
		await expect.element(value()).toHaveTextContent('initial');

		await set(props, { value: '1' });
		await expect.element(value()).toHaveTextContent('1');

		await set(props, { value: '2' });
		await expect.element(value()).toHaveTextContent('2');

		await set(props, { value: null });
		await expect.element(value()).toHaveTextContent('initial');
	});

	describe('prop: multiple', () => {
		it('displays comma-separated labels for multiple values with items object', async () => {
			render(SelectHarness, {
				value: ['sans', 'serif'],
				root: { items: fonts, multiple: true }
			});

			await expect.element(value()).toHaveTextContent('Sans-serif, Serif');
		});

		it('displays comma-separated labels for multiple values with items array', async () => {
			render(SelectHarness, {
				value: ['serif', 'mono'],
				root: { items: fontList.slice(1), multiple: true }
			});

			await expect.element(value()).toHaveTextContent('Serif, Monospace');
		});

		it('falls back to raw values when no items are provided', async () => {
			render(SelectHarness, { value: ['serif', 'mono'], root: { multiple: true } });

			await expect.element(value()).toHaveTextContent('serif, mono');
		});

		it('displays single value when only one value is selected in multiple mode', async () => {
			render(SelectHarness, { value: ['sans'], root: { multiple: true } });

			await expect.element(value()).toHaveTextContent('sans');
		});

		it('displays empty when no values are selected in multiple mode', async () => {
			render(SelectHarness, { value: [], root: { multiple: true } });

			expect(value().element().textContent).toBe('');
		});

		it('children function receives array of values in multiple mode', async () => {
			const children = vi.fn(
				(values: unknown) => `Selected: ${Array.isArray(values) ? values.join(' + ') : values}`
			);
			render(SelectHarness, {
				value: ['sans', 'serif'],
				root: { items: fonts, multiple: true },
				formatValue: children
			});

			expect(children.mock.calls[0]?.[0]).toEqual(['sans', 'serif']);
			await expect.element(page.getByText('Selected: sans + serif')).toBeInTheDocument();
		});

		it('children prop takes precedence over items in multiple mode', async () => {
			render(SelectHarness, {
				value: ['sans', 'serif'],
				root: { items: fonts, multiple: true },
				formatValue: () => 'Custom Multiple Text'
			});

			await expect.element(value()).toHaveTextContent('Custom Multiple Text');
		});

		it('defaults to empty array when no value is provided', async () => {
			const formatValue = vi.fn((_current: unknown) => '');
			render(SelectHarness, { root: { multiple: true }, formatValue });

			expect(formatValue.mock.calls[0]?.[0]).toEqual([]);
		});
	});

	describe('prop: placeholder', () => {
		const placeholder = { placeholder: 'Select an option' };

		it('displays placeholder when no value is selected', async () => {
			render(SelectHarness, { valueProps: placeholder });

			await expect.element(value()).toHaveTextContent('Select an option');
		});

		it('displays placeholder when value is null', async () => {
			render(SelectHarness, { value: null, valueProps: placeholder });

			await expect.element(value()).toHaveTextContent('Select an option');
		});

		it('does not display placeholder when value is selected', async () => {
			render(SelectHarness, {
				value: 'option1',
				valueProps: placeholder,
				items: [{ value: 'option1', text: 'Option 1' }]
			});

			await expect.element(value()).toHaveTextContent('option1');
		});

		it('children prop takes precedence over placeholder', async () => {
			render(SelectHarness, { valueProps: placeholder, formatValue: () => 'Custom Text' });

			await expect.element(value()).toHaveTextContent('Custom Text');
		});

		it('children function takes precedence over placeholder', async () => {
			render(SelectHarness, {
				valueProps: placeholder,
				formatValue: (current) => (current as string) || 'Function fallback'
			});

			await expect.element(value()).toHaveTextContent('Function fallback');
		});

		it('null item label in items takes precedence over placeholder', async () => {
			render(SelectHarness, {
				valueProps: placeholder,
				root: {
					items: [
						{ value: null, label: 'None' },
						{ value: 'option1', label: 'Option 1' }
					]
				},
				items: [
					{ value: null, text: 'None' },
					{ value: 'option1', text: 'Option 1' }
				]
			});

			await expect.element(value()).toHaveTextContent('None');
		});

		it('uses placeholder when items have null value without label', async () => {
			render(SelectHarness, {
				valueProps: placeholder,
				root: {
					items: [
						{ value: null, label: null },
						{ value: 'option1', label: 'Option 1' }
					]
				},
				items: [
					{ value: null, text: 'None' },
					{ value: 'option1', text: 'Option 1' }
				]
			});

			await expect.element(value()).toHaveTextContent('Select an option');
		});

		it('displays placeholder when object items do not have a null key', async () => {
			render(SelectHarness, {
				valueProps: placeholder,
				root: { items: { option1: 'Option 1', option2: 'Option 2' } }
			});

			await expect.element(value()).toHaveTextContent('Select an option');
		});

		it('null key label in object items takes precedence over placeholder', async () => {
			render(SelectHarness, {
				valueProps: placeholder,
				root: { items: { null: 'None', option1: 'Option 1' } }
			});

			await expect.element(value()).toHaveTextContent('None');
		});
	});
});
