// Assertions follow Base UI v1.9.0
// packages/react/src/combobox/chip-remove/ComboboxChipRemove.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React only). `fireEvent` calls dispatch the same DOM events.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { ComboboxChangeEventDetails } from '#lib';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxPartsHarness from '../../tests/ComboboxPartsHarness.svelte';

const input = () => page.getByTestId('input');
const remove = (name: string) => page.getByTestId(`remove-${name}`);
const option = (name: string) => page.getByRole('option', { name, exact: true });
const keydown = (target: Element, key: string) =>
	target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

function chips(value: string[], root: Record<string, unknown> = {}, extra = {}) {
	return render(ComboboxHarness, {
		chips: true,
		value,
		root: { multiple: true, ...root },
		...extra
	});
}

describe('Combobox.ChipRemove', () => {
	it('throws a descriptive error outside Combobox.Chip', () => {
		expect(() => render(ComboboxPartsHarness, { scenario: 'remove-outside-chip' })).toThrow(
			'Base UI: ComboboxChipContext is missing. ComboboxChip parts must be placed within <Combobox.Chip>.'
		);
	});

	describe('prop: disabled', () => {
		it('renders aria-disabled', async () => {
			chips(['apple'], { disabled: true });

			await expect.element(remove('apple')).toHaveAttribute('aria-disabled', 'true');
		});

		it('does not remove the chip', async () => {
			const onValueChange = vi.fn();
			chips(['apple', 'banana'], { disabled: true, onValueChange });

			await userEvent.click(remove('apple'), { force: true });

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(page.getByTestId('chip-apple')).toBeInTheDocument();
		});
	});

	describe('prop: readonly', () => {
		it('does not remove the chip', async () => {
			const onValueChange = vi.fn();
			chips(['apple', 'banana'], { readonly: true, onValueChange });

			await userEvent.click(remove('apple'), { force: true });

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(page.getByTestId('chip-apple')).toBeInTheDocument();
		});

		it('is focusable but not functional', async () => {
			chips(['apple'], { readonly: true }, { noInput: true });

			(remove('apple').element() as HTMLElement).focus();
			await expect.element(remove('apple')).toHaveFocus();

			await userEvent.keyboard('{Enter}');
			await expect.element(remove('apple')).toBeInTheDocument();
		});
	});

	describe('interaction behavior', () => {
		it('removes the chip on click', async () => {
			const onValueChange = vi.fn();
			chips(['apple', 'banana'], { onValueChange });

			await userEvent.click(remove('apple'));

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toEqual(['banana']);
		});

		it('focuses the input after removing a chip', async () => {
			chips(['apple']);

			await userEvent.click(remove('apple'));

			await expect.element(input()).toHaveFocus();
		});

		it('keeps the popup open while removing a chip', async () => {
			chips(['apple'], {}, { trigger: true, items: ['apple', 'banana'] });

			await userEvent.click(page.getByTestId('trigger'));
			await expect.element(page.getByRole('listbox')).toBeInTheDocument();

			await userEvent.click(remove('apple'));

			await expect.element(page.getByRole('listbox')).toBeInTheDocument();
			await expect.element(input()).toHaveFocus();
		});

		it('keeps a popup input focused when removing a chip rendered outside the popup', async () => {
			render(ComboboxPartsHarness, { scenario: 'chips-popup-input' });

			await userEvent.click(page.getByRole('combobox'));
			await expect.element(input()).toHaveFocus();

			await userEvent.click(remove('apple'));

			await expect.element(remove('apple')).not.toBeInTheDocument();
			await expect.element(page.getByRole('dialog')).toBeInTheDocument();
			await expect.element(input()).toHaveFocus();
			await expect.element(option('apple')).toHaveAttribute('aria-selected', 'false');
		});

		it('stops the click from reaching the chip', async () => {
			const chipClick = vi.fn();
			const removeClick = vi.fn();
			chips(
				['apple'],
				{},
				{ chipProps: { onclick: chipClick }, chipRemoveProps: { onclick: removeClick } }
			);

			await userEvent.click(remove('apple'));

			expect(removeClick).toHaveBeenCalledTimes(1);
			expect(chipClick).not.toHaveBeenCalled();
		});

		it('lets click and keyboard events propagate when requested', async () => {
			const chipClick = vi.fn();
			const chipKeydown = vi.fn();
			chips(
				['apple'],
				{
					onValueChange: (_value: unknown, details: ComboboxChangeEventDetails) =>
						details.allowPropagation()
				},
				{ refuseValue: true, chipProps: { onclick: chipClick, onkeydown: chipKeydown } }
			);

			await userEvent.click(remove('apple'));
			expect(chipClick).toHaveBeenCalledTimes(1);

			(remove('apple').element() as HTMLElement).focus();
			await userEvent.keyboard('{Enter}');
			expect(chipKeydown).toHaveBeenCalled();
		});

		it.each([{ disabled: true }, { readonly: true }])(
			'ignores click and keyboard activation on a non-native button: %o',
			async (rootProps) => {
				const onValueChange = vi.fn();
				render(ComboboxPartsHarness, {
					scenario: 'div-chip-remove',
					root: { onValueChange, ...rootProps }
				});
				const element = page.getByTestId('remove').element();

				element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
				keydown(element, 'Enter');

				expect(onValueChange).not.toHaveBeenCalled();
			}
		);

		it('removes a chip with Space but ignores unrelated keys', async () => {
			const onValueChange = vi.fn();
			chips(['apple', 'banana'], { onValueChange }, { noInput: true });
			const element = remove('apple').element() as HTMLElement;
			element.focus();

			keydown(element, 'ArrowDown');
			expect(onValueChange).not.toHaveBeenCalled();

			keydown(element, ' ');
			expect(onValueChange).toHaveBeenCalledWith(['banana'], expect.anything());
		});

		it('keeps a different active item highlighted when removing a chip', async () => {
			chips(
				['apple', 'banana'],
				{},
				{
					open: true,
					staticItems: [
						{ value: 'apple', text: 'apple option' },
						{ value: 'banana', text: 'banana option' }
					]
				}
			);

			await userEvent.hover(option('apple option'));
			await expect.element(option('apple option')).toHaveAttribute('data-highlighted');
			(remove('banana').element() as HTMLElement).click();

			await expect.element(option('apple option')).toHaveAttribute('data-highlighted');
		});

		it('removes a filtered-out chip without clearing the visible highlight', async () => {
			chips(
				['apple', 'banana'],
				{ items: ['banana'] },
				{ open: true, staticItems: [{ value: 'banana', text: 'banana option' }] }
			);

			await userEvent.hover(option('banana option'));
			await expect.element(option('banana option')).toHaveAttribute('data-highlighted');
			(remove('apple').element() as HTMLElement).click();

			await expect.element(option('banana option')).toHaveAttribute('data-highlighted');
		});

		it('clears the highlight when removing the highlighted item with a pointer', async () => {
			chips(
				['apple'],
				{},
				{ open: true, noInput: true, staticItems: [{ value: 'apple', text: 'apple option' }] }
			);

			option('apple option')
				.element()
				.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
			await expect.element(option('apple option')).toHaveAttribute('data-highlighted');
			// Without an input the unanchored popup sits over the chips, so a pointer click lands on it.
			(remove('apple').element() as HTMLElement).click();

			await expect.element(option('apple option')).not.toHaveAttribute('data-highlighted');
		});

		it('removes the chip on Enter', async () => {
			const onValueChange = vi.fn();
			chips(['apple', 'banana'], { onValueChange });

			(remove('apple').element() as HTMLElement).focus();
			await userEvent.keyboard('{Enter}');

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toEqual(['banana']);
		});

		it('has tabindex -1', async () => {
			chips(['apple'], {}, { noInput: true });

			await expect.element(remove('apple')).toHaveAttribute('tabindex', '-1');
		});
	});
});
