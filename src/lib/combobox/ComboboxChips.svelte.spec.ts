// Assertions follow Base UI v1.9.0 packages/react/src/combobox/chips/ComboboxChips.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React only). `preventBaseUIHandler()` is
// `event.preventDefault()` here, and `fireEvent` calls dispatch the same DOM events.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxPartsHarness from '../../tests/ComboboxPartsHarness.svelte';

const input = () => page.getByTestId('input');
const chips = () => page.getByTestId('chips');
const listbox = () => page.getByRole('listbox');
const mouseDown = (target: Element) =>
	target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

function renderChips(extra: Record<string, unknown> = {}, root: Record<string, unknown> = {}) {
	return render(ComboboxHarness, {
		chips: true,
		chipRemove: false,
		value: ['apple'],
		staticItems: [{ value: 'apple' }, { value: 'banana' }],
		root: { multiple: true, ...root },
		...extra
	});
}

describe('Combobox.Chips', () => {
	it('does not set role="toolbar" without chips', async () => {
		renderChips({ value: [] });

		await expect.element(chips()).not.toHaveAttribute('role');
	});

	it('sets role="toolbar" with at least one chip', async () => {
		renderChips();

		await expect.element(chips()).toHaveAttribute('role', 'toolbar');
	});

	it('focuses the input when pressing anywhere in the chips area', async () => {
		renderChips();
		await expect.element(input()).not.toHaveFocus();

		mouseDown(chips().element());
		await expect.element(input()).toHaveFocus();

		(input().element() as HTMLElement).blur();
		await expect.element(input()).not.toHaveFocus();
		mouseDown(page.getByTestId('chip-apple').element());
		await expect.element(input()).toHaveFocus();
	});

	it('lets onmousedown prevent the built-in focus and open behavior', async () => {
		const onmousedown = vi.fn((event: MouseEvent) => event.preventDefault());
		renderChips({ chipsProps: { onmousedown } });

		mouseDown(chips().element());

		expect(onmousedown).toHaveBeenCalledTimes(1);
		await expect.element(input()).not.toHaveFocus();
		expect(listbox().elements()).toHaveLength(0);
	});

	it('lets a nested chip onmousedown prevent the built-in focus and open behavior', async () => {
		const onmousedown = vi.fn((event: MouseEvent) => event.preventDefault());
		renderChips({ chipProps: { onmousedown } });

		mouseDown(page.getByTestId('chip-apple').element());

		expect(onmousedown).toHaveBeenCalledTimes(1);
		await expect.element(input()).not.toHaveFocus();
		expect(listbox().elements()).toHaveLength(0);
	});

	it('lets a nested chip oncontextmenu prevent the built-in handler', async () => {
		const oncontextmenu = vi.fn((event: MouseEvent) => event.preventDefault());
		renderChips({ chipProps: { oncontextmenu } });

		expect(() =>
			page
				.getByTestId('chip-apple')
				.element()
				.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
		).not.toThrow();
		expect(oncontextmenu).toHaveBeenCalledTimes(1);
	});

	it('does not treat chip remove presses as chips-area presses', async () => {
		renderChips({ chipRemove: true });

		mouseDown(page.getByTestId('remove-apple').element());

		expect(listbox().elements()).toHaveLength(0);
	});

	it('does not focus or open when disabled by Field.Root', async () => {
		render(ComboboxPartsHarness, { scenario: 'field-disabled-chips' });

		mouseDown(chips().element());

		await expect.element(input()).not.toHaveFocus();
		expect(listbox().elements()).toHaveLength(0);
	});

	it('focuses the input and opens while read-only', async () => {
		renderChips({}, { readonly: true });

		mouseDown(chips().element());

		await expect.element(input()).toHaveFocus();
		await expect.element(listbox()).toBeInTheDocument();
	});

	it('opens and focuses an input inside the popup when the chips area is pressed', async () => {
		render(ComboboxPartsHarness, { scenario: 'chips-popup-input' });

		await userEvent.click(page.getByRole('toolbar'));

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();
		await expect.element(input()).toHaveFocus();
	});

	it('clears the highlighted chip when the popup opens', async () => {
		renderChips({ staticItems: [{ value: 'banana' }] });
		const field = input().element() as HTMLInputElement;
		const chip = page.getByTestId('chip-apple');

		field.focus();
		field.setSelectionRange(0, 0);
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(chip).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect.element(listbox()).toBeInTheDocument();

		field.focus();
		field.setSelectionRange(0, 0);
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(chip).toHaveFocus();
	});
});
