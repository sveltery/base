// Assertions follow Base UI v1.9.0 packages/react/src/combobox/list/ComboboxList.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React only) and the Autocomplete read-only listbox case (the
// Autocomplete parts belong to their own port).
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const listbox = () => page.getByRole('listbox');
const enter = () => new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

function renderList(root: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) {
	return render(ComboboxHarness, { open: true, staticItems: [{ value: 'a' }], root, ...extra });
}

describe('Combobox.List', () => {
	it('sets role="listbox" and aria-multiselectable in multiple mode', async () => {
		renderList({ multiple: true }, { noInput: true });

		await expect.element(listbox()).toHaveAttribute('aria-multiselectable', 'true');
	});

	it('sets aria-readonly on the listbox while the root is read-only', async () => {
		renderList({ readonly: true }, { noInput: true });

		await expect.element(listbox()).toHaveAttribute('aria-readonly', 'true');
	});

	it('leaves aria-readonly to the input in grid mode', async () => {
		render(ComboboxHarness, { open: true, rows: [['a']], root: { readonly: true, grid: true } });

		await expect.element(page.getByRole('grid')).not.toHaveAttribute('aria-readonly');
		await expect.element(page.getByTestId('input')).toHaveAttribute('aria-readonly', 'true');
	});

	it('does not set aria-readonly by default', async () => {
		renderList({}, { noInput: true });

		await expect.element(listbox()).not.toHaveAttribute('aria-readonly');
	});

	it('does not prevent Enter while nothing is highlighted', async () => {
		renderList();
		await expect.element(listbox()).toBeInTheDocument();
		const event = enter();

		listbox().element().dispatchEvent(event);

		expect(event.defaultPrevented).toBe(false);
	});

	it('selects the highlighted item with Enter', async () => {
		const onValueChange = vi.fn();
		renderList({ onValueChange });

		await userEvent.click(page.getByRole('combobox'));
		await userEvent.keyboard('{ArrowDown}');
		await expect
			.element(page.getByRole('option', { name: 'a' }))
			.toHaveAttribute('data-highlighted');
		listbox().element().dispatchEvent(enter());

		expect(onValueChange).toHaveBeenCalledWith('a', expect.anything());
	});

	it.each([{ disabled: true }, { readonly: true }])(
		'ignores Enter while interaction is off: %o',
		async (rootProps) => {
			const onValueChange = vi.fn();
			renderList({ onValueChange, ...rootProps }, { noInput: true });
			await expect.element(listbox()).toBeInTheDocument();

			listbox().element().dispatchEvent(enter());

			expect(onValueChange).not.toHaveBeenCalled();
		}
	);
});
