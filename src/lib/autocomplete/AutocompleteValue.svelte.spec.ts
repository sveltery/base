// Assertions follow Base UI v1.9.0 packages/react/src/autocomplete/value/AutocompleteValue.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// A `children` snippet replaces the children function and static ReactNode children.
import { createRawSnippet } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AutocompleteHarness from '../../tests/AutocompleteHarness.svelte';

function valueSnippet(format: (value: string) => string) {
	return createRawSnippet((value: () => string) => ({
		render: () => `<div data-testid="value-child">${format(value())}</div>`
	}));
}

const staticSnippet = (html: string) => createRawSnippet(() => ({ render: () => html }));
const items = [{ value: 'hello' }, { value: 'help' }];

describe('Autocomplete.Value', () => {
	it('renders the input text without children', async () => {
		render(AutocompleteHarness, { valueText: true, staticItems: items });

		await userEvent.type(page.getByTestId('input'), 'hel');

		await expect.element(page.getByTestId('value')).toHaveTextContent('hel');
	});

	describe('prop: children', () => {
		it('passes the input text to the children snippet', async () => {
			render(AutocompleteHarness, {
				inputInside: true,
				valueChildren: valueSnippet(String),
				staticItems: items,
				root: { defaultValue: 'hel' }
			});

			await expect.element(page.getByTestId('value-child')).toHaveTextContent('hel');
		});

		it('passes an empty string when nothing is typed', async () => {
			render(AutocompleteHarness, {
				valueText: true,
				valueChildren: valueSnippet((value) => (value === '' ? 'empty' : value)),
				staticItems: [{ value: 'a' }]
			});

			await expect.element(page.getByTestId('value-child')).toHaveTextContent('empty');
		});

		it('replaces the text with static children', async () => {
			render(AutocompleteHarness, {
				valueText: true,
				valueChildren: staticSnippet('<span>Custom Display Text</span>'),
				staticItems: [{ value: 'test-value', text: 'Test' }],
				root: { defaultValue: 'test-value' }
			});

			await expect.element(page.getByTestId('value')).toHaveTextContent('Custom Display Text');
		});

		it('renders nested static children', async () => {
			render(AutocompleteHarness, {
				valueText: true,
				valueChildren: staticSnippet(
					'<span data-testid="complex"><strong>Bold</strong> and <em>italic</em> text</span>'
				),
				staticItems: [{ value: 'test', text: 'Test' }],
				root: { defaultValue: 'test' }
			});

			const complex = page.getByTestId('complex').element();
			expect(complex.querySelector('strong')).toHaveTextContent('Bold');
			expect(complex.querySelector('em')).toHaveTextContent('italic');
		});
	});
});
