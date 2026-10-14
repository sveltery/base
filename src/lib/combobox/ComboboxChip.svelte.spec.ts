// Assertions follow Base UI v1.9.0 packages/react/src/combobox/chip/ComboboxChip.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React only). Chips here render inside `Combobox.Chips` with
// the input after them, and the chips that upstream renders from `Combobox.Value` children render
// from the bound value.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const chip = (name: string) => page.getByTestId(`chip-${name}`);
const listbox = () => page.getByRole('listbox');
const focusChip = (name: string) => (chip(name).element() as HTMLElement).focus();

function chips(value: string[], root: Record<string, unknown> = {}, extra = {}) {
	return render(ComboboxHarness, {
		chips: true,
		chipRemove: false,
		value,
		root: { multiple: true, ...root },
		...extra
	});
}

describe('Combobox.Chip', () => {
	describe('prop: disabled', () => {
		it('renders aria-disabled', async () => {
			chips(['apple'], { disabled: true });

			await expect.element(chip('apple')).toHaveAttribute('aria-disabled', 'true');
		});

		it('blocks keyboard navigation', async () => {
			chips(['apple', 'banana'], { disabled: true });

			focusChip('apple');
			await userEvent.keyboard('{ArrowRight}');

			await expect.element(chip('apple')).toHaveFocus();
		});

		it('blocks deletion', async () => {
			const onValueChange = vi.fn();
			chips(['apple', 'banana'], { disabled: true, onValueChange });

			focusChip('apple');
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(chip('apple')).toBeInTheDocument();
		});

		it('does not focus the input on mouse down', async () => {
			chips(['apple'], { disabled: true });

			await userEvent.click(chip('apple'), { force: true });

			await expect.element(input()).not.toHaveFocus();
		});

		it('does not take focus', async () => {
			chips(['apple'], { disabled: true }, { noInput: true });

			await userEvent.click(chip('apple'), { force: true });

			await expect.element(chip('apple')).not.toHaveFocus();
		});
	});

	describe('prop: readonly', () => {
		it('renders aria-readonly', async () => {
			chips(['apple'], { readonly: true });

			await expect.element(chip('apple')).toHaveAttribute('aria-readonly', 'true');
		});

		it('blocks deletion', async () => {
			const onValueChange = vi.fn();
			chips(['apple', 'banana'], { readonly: true, onValueChange });

			focusChip('apple');
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(chip('apple')).toBeInTheDocument();
		});

		it('blocks navigation and deletion', async () => {
			chips(['apple', 'banana'], { readonly: true });

			focusChip('apple');
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(chip('apple')).toHaveFocus();

			await userEvent.keyboard('{Delete}');
			await expect.element(chip('banana')).toBeInTheDocument();
		});

		it('moves focus to the input when a chip is pressed', async () => {
			chips(['apple'], { readonly: true });

			await userEvent.click(chip('apple'));

			await expect.element(input()).toHaveFocus();
		});
	});

	describe('interaction behavior', () => {
		const popupItems = { staticItems: [{ value: 'a' }, { value: 'b' }] };

		it('does not dismiss the popup when a chip is clicked', async () => {
			chips(['apple', 'banana'], {}, { open: true, ...popupItems });
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.click(chip('apple'));

			await expect.element(listbox()).toBeInTheDocument();
		});

		it('closes the popup when a chip receives focus', async () => {
			chips(['apple', 'banana'], {}, { open: true, ...popupItems });
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.click(input());
			focusChip('apple');

			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('navigates through the chips to the input', async () => {
			chips(['apple', 'banana', 'cherry']);

			focusChip('apple');
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(chip('banana')).toHaveFocus();

			await userEvent.keyboard('{ArrowRight}');
			await expect.element(chip('cherry')).toHaveFocus();

			await userEvent.keyboard('{ArrowRight}');
			await expect.element(input()).toHaveFocus();

			focusChip('apple');
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(input()).toHaveFocus();
		});

		it('returns focus to the input for activation, vertical navigation and text entry', async () => {
			chips(['apple'], {}, { staticItems: [{ value: 'banana' }] });

			focusChip('apple');
			await userEvent.keyboard('{Enter}');
			await expect.element(input()).toHaveFocus();

			focusChip('apple');
			await userEvent.keyboard(' ');
			await expect.element(input()).toHaveFocus();

			focusChip('apple');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveFocus();
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{Escape}');
			focusChip('apple');
			await userEvent.keyboard('{ArrowUp}');
			await expect.element(input()).toHaveFocus();
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{Escape}');
			focusChip('apple');
			await userEvent.keyboard('a');
			await expect.element(input()).toHaveFocus();
		});

		it.each(['ArrowDown', 'ArrowUp'])(
			'focuses a conditional input when reopening from a chip with %s',
			async (key) => {
				chips(
					['apple'],
					{},
					{ open: true, inputOnlyWhenOpen: true, staticItems: [{ value: 'banana' }] }
				);

				await userEvent.click(page.getByRole('combobox'));
				await userEvent.keyboard('{ArrowLeft}');

				await expect.element(page.getByRole('combobox')).not.toBeInTheDocument();
				await expect.element(chip('apple')).toHaveFocus();

				await userEvent.keyboard(`{${key}}`);

				await expect.element(page.getByRole('combobox')).toHaveFocus();
			}
		);

		it('leaves focus on a chip for modified printable keys', async () => {
			chips(['apple']);

			focusChip('apple');
			await userEvent.keyboard('{Control>}a{/Control}');
			await expect.element(chip('apple')).toHaveFocus();

			await userEvent.keyboard('{Meta>}a{/Meta}');
			await expect.element(chip('apple')).toHaveFocus();

			await userEvent.keyboard('{Alt>}a{/Alt}');
			await expect.element(chip('apple')).toHaveFocus();
		});

		it('removes the chip on Delete', async () => {
			const onValueChange = vi.fn();
			chips(['apple', 'banana'], { onValueChange });

			focusChip('apple');
			await userEvent.keyboard('{Delete}');

			expect(onValueChange).toHaveBeenCalledWith(['banana'], expect.anything());
		});

		it('focuses the next chip after removing a chip rendered from the value', async () => {
			chips(['apple', 'banana', 'cherry']);

			focusChip('banana');
			await userEvent.keyboard('{Delete}');

			await expect.element(chip('cherry')).toHaveFocus();
		});

		it('mirrors chip keyboard navigation in RTL', async () => {
			chips(['apple', 'banana'], {}, { direction: 'rtl' });
			const field = input().element() as HTMLInputElement;
			field.focus();
			field.setSelectionRange(0, 0);

			await userEvent.keyboard('{ArrowRight}');
			await expect.element(chip('banana')).toHaveFocus();

			await userEvent.keyboard('{ArrowRight}');
			await expect.element(chip('apple')).toHaveFocus();

			await userEvent.keyboard('{ArrowRight}');
			await expect.element(input()).toHaveFocus();

			focusChip('apple');
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(chip('banana')).toHaveFocus();

			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(input()).toHaveFocus();
		});

		it('navigates through only the rendered chips', async () => {
			chips(['apple', 'banana', 'cherry'], {}, { chipLimit: 2 });
			const field = input().element() as HTMLInputElement;
			field.focus();
			field.setSelectionRange(0, 0);

			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(chip('banana')).toHaveFocus();

			await userEvent.keyboard('{ArrowRight}');
			await expect.element(input()).toHaveFocus();

			focusChip('banana');
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(input()).toHaveFocus();
		});

		it('removes the chip on Backspace', async () => {
			const onValueChange = vi.fn();
			chips(['apple', 'banana'], { onValueChange });

			focusChip('apple');
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toEqual(['banana']);
		});

		it('focuses the input on mouse down', async () => {
			chips(['apple']);

			await userEvent.click(chip('apple'));

			await expect.element(input()).toHaveFocus();
		});
	});
});
