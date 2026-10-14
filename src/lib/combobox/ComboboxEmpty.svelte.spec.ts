// Assertions follow Base UI v1.9.0 packages/react/src/combobox/empty/ComboboxEmpty.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React only). The reset-delay cases wait out the real delay
// instead of ticking fake timers.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxPartsHarness from '../../tests/ComboboxPartsHarness.svelte';

const MARKER = '⁠';
const RESET_DELAY = 200;
const empty = () => page.getByTestId('empty');

function renderEmpty(root: Record<string, unknown>, extra: Record<string, unknown> = {}) {
	return render(ComboboxPartsHarness, {
		scenario: 'live-region',
		part: 'empty',
		text: 'No results',
		root: { open: true, ...root },
		...extra
	});
}

describe('Combobox.Empty', () => {
	it('renders when there are no filtered items', async () => {
		renderEmpty({ items: [] });

		await expect.element(empty()).toHaveTextContent('No results');
		await expect.element(empty()).toHaveAttribute('role', 'status');
	});

	it('does not render its children when there are items', async () => {
		renderEmpty({ items: ['a'] });

		await expect.element(page.getByRole('option', { name: 'a' })).toBeInTheDocument();
		expect(page.getByText(/No results/).elements()).toHaveLength(0);
	});

	it('renders when the search query matches no items', async () => {
		renderEmpty({ items: ['a', 'b', 'c'], defaultInputValue: 'd' });

		await expect.element(empty()).toHaveTextContent('No results');
	});

	it('does not render when the search query matches an item', async () => {
		renderEmpty({ items: ['a', 'b', 'c'], defaultInputValue: 'c' });

		await expect.element(page.getByRole('option', { name: 'c' })).toBeInTheDocument();
		expect(page.getByText(/No results/).elements()).toHaveLength(0);
	});

	describe('a11y', () => {
		it('removes the initial text mutation after the reset delay', async () => {
			renderEmpty({ items: [] });
			await expect.element(empty()).toBeInTheDocument();

			expect(page.getByRole('status').element()).toBe(empty().element());
			expect(empty().element().textContent).toBe(`No results${MARKER}`);

			await new Promise((resolve) => setTimeout(resolve, RESET_DELAY + 50));

			expect(empty().element().textContent).toBe('No results');
		});

		it('updates the live region immediately when the empty content appears after mount', async () => {
			const view = render(ComboboxHarness, { open: true, items: ['a'], empty: 'No results' });
			await expect.element(empty()).toHaveTextContent('');
			expect(page.getByRole('status').element()).toBe(empty().element());

			await view.rerender({ items: [] });

			await expect.element(empty()).toHaveTextContent('No results');
			expect(empty().element().textContent).toBe('No results');
		});

		it('keeps a custom render element', async () => {
			renderEmpty({ items: [] }, { custom: true });
			const custom = page.getByTestId('custom');
			await expect.element(custom).toBeInTheDocument();

			expect(custom.element().tagName).toBe('P');
			expect(page.getByRole('status').element()).toBe(custom.element());
			expect(custom.element().textContent).toBe(`No results${MARKER}`);

			await new Promise((resolve) => setTimeout(resolve, RESET_DELAY + 50));

			expect(custom.element().textContent).toBe('No results');
		});
	});
});
