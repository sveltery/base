// Assertions follow Base UI v1.9.0 packages/react/src/combobox/input/ComboboxInput.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React ref and render-prop cloning). Chips render from the
// bound value, so the cases that render chips inside `Combobox.Value` bind `value`.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxFieldHarness from '../../tests/ComboboxFieldHarness.svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const inputElement = () => input().element() as HTMLInputElement;
const listbox = () => page.getByRole('listbox');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const ab = [{ value: 'a' }, { value: 'b' }];
const appleBanana = [{ value: 'apple' }, { value: 'banana' }];
const threeFruits = ['apple', 'banana', 'cherry'];

function compose(target: HTMLInputElement, value: string) {
	target.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
	target.value = value;
	target.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
}

describe('Combobox.Input', () => {
	describe('prop: disabled', () => {
		it('renders the disabled attribute when disabled', async () => {
			render(ComboboxHarness, { input: { disabled: true } });

			await expect.element(input()).toHaveAttribute('disabled');
		});

		it('inherits the disabled state from the root', async () => {
			render(ComboboxHarness, { root: { disabled: true } });

			await expect.element(input()).toHaveAttribute('disabled');
		});

		it('inherits the disabled state from Field.Root', async () => {
			render(ComboboxFieldHarness, { field: { disabled: true } });

			await expect.element(input()).toHaveAttribute('disabled');
		});

		it('does not open the popup when disabled', async () => {
			render(ComboboxHarness, { input: { disabled: true }, staticItems: ab });

			await userEvent.click(input(), { force: true });

			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('prioritizes the local disabled over the root disabled', async () => {
			render(ComboboxHarness, { input: { disabled: true }, root: { disabled: false } });

			await expect.element(input()).toHaveAttribute('disabled');
		});
	});

	describe('rendering as a different element', () => {
		it('renders as a <textarea> without a `type` attribute and stays editable', async () => {
			render(ComboboxHarness, { inputElement: 'textarea', items: ['apple', 'banana'] });
			const element = inputElement();
			expect(element.tagName).toBe('TEXTAREA');
			expect(element.hasAttribute('type')).toBe(false);

			await userEvent.type(input(), 'app');

			expect(element.value).toBe('app');
		});

		it('applies combobox aria attributes to a <textarea> only while the popup is open', async () => {
			render(ComboboxHarness, { inputElement: 'textarea', items: ['apple', 'banana'] });

			await expect.element(input()).not.toHaveAttribute('role', 'combobox');
			await expect.element(input()).not.toHaveAttribute('aria-expanded');
			await expect.element(input()).not.toHaveAttribute('aria-controls');

			await userEvent.type(input(), 'a');
			await expect.element(listbox()).toBeInTheDocument();

			await expect.element(input()).toHaveAttribute('role', 'combobox');
			await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(input()).toHaveAttribute('aria-controls', listbox().element().id);
		});

		it('applies combobox aria attributes to an inline <textarea> before it is interacted with', async () => {
			render(ComboboxHarness, {
				inputElement: 'textarea',
				inline: true,
				items: ['apple', 'banana']
			});
			await expect.element(listbox()).toBeInTheDocument();

			await expect.element(input()).toHaveAttribute('role', 'combobox');
			await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(input()).toHaveAttribute('aria-controls', listbox().element().id);
			await expect.element(input()).toHaveAttribute('aria-haspopup', 'listbox');
			await expect.element(input()).toHaveAttribute('aria-autocomplete', 'list');
		});
	});

	describe('prop: readonly', () => {
		it('renders aria-readonly and readonly when read-only', async () => {
			render(ComboboxHarness, { root: { readonly: true } });

			await expect.element(input()).toHaveAttribute('aria-readonly', 'true');
			await expect.element(input()).toHaveAttribute('readonly');
		});

		it('opens the popup when read-only', async () => {
			render(ComboboxHarness, { staticItems: ab, root: { readonly: true } });

			await userEvent.click(input());

			await expect.element(listbox()).toHaveAttribute('aria-readonly', 'true');
		});

		it('does not change the input value when typing while read-only', async () => {
			const onInputValueChange = vi.fn();
			render(ComboboxHarness, { staticItems: ab, root: { readonly: true, onInputValueChange } });

			await userEvent.type(input(), 'a');

			await expect.element(input()).toHaveValue('');
			expect(onInputValueChange).not.toHaveBeenCalled();
		});

		it('allows interactions when readonly is false', async () => {
			render(ComboboxHarness, { staticItems: [{ value: 'a' }], root: { readonly: false } });

			await userEvent.click(input());
			await userEvent.click(option('a'));

			await expect.element(input()).toHaveValue('a');
		});
	});

	describe('prop: required', () => {
		it('sets aria-required when required', async () => {
			render(ComboboxHarness, { root: { required: true } });

			await expect.element(input()).toHaveAttribute('aria-required', 'true');
		});
	});

	describe('onOpenChange reason', () => {
		it('fires with reason input-press when the input is clicked', async () => {
			const onOpenChange = vi.fn();
			render(ComboboxHarness, { items: ['apple', 'banana'], root: { onOpenChange } });

			await userEvent.click(input());

			expect(onOpenChange.mock.calls.length).toBeGreaterThan(0);
			expect(onOpenChange.mock.lastCall?.[0]).toBe(true);
			expect(onOpenChange.mock.lastCall?.[1].reason).toBe(REASONS.inputPress);
		});
	});

	describe('interaction behavior', () => {
		it('clears the selected value when the input text is cleared (single selection)', async () => {
			render(ComboboxHarness, { items: ['apple', 'banana'], root: { defaultValue: 'apple' } });
			await expect.element(input()).toHaveValue('apple');

			await userEvent.clear(input());
			await expect.element(input()).toHaveValue('');

			await userEvent.type(input(), 'a');
			await expect.element(listbox()).toBeInTheDocument();

			for (const element of page.getByRole('option').elements()) {
				expect(element.getAttribute('aria-selected')).not.toBe('true');
			}
		});

		it('opens the popup on typing when enabled', async () => {
			render(ComboboxHarness, { staticItems: appleBanana });

			await userEvent.type(input(), 'a');

			await expect.element(listbox()).toBeInTheDocument();
		});

		it('handles multiple selection with chips when disabled', async () => {
			render(ComboboxHarness, {
				chips: true,
				value: ['apple'],
				staticItems: appleBanana,
				root: { multiple: true, disabled: true }
			});

			await expect.element(input()).toHaveAttribute('disabled');
			await expect.element(page.getByTestId('chip-apple')).toHaveAttribute('aria-disabled', 'true');
			await expect
				.element(page.getByTestId('remove-apple'))
				.toHaveAttribute('aria-disabled', 'true');

			inputElement().dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true })
			);

			await expect.element(page.getByTestId('chip-apple')).toBeInTheDocument();
		});

		it('handles multiple selection with chips when read-only', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				chips: true,
				chipRemove: false,
				value: ['apple', 'banana'],
				root: { multiple: true, readonly: true, onValueChange }
			});
			await expect.element(input()).toHaveAttribute('aria-readonly', 'true');

			await userEvent.click(input());
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(page.getByTestId('chip-banana')).toBeInTheDocument();
		});

		it('clears on Escape when the popup is closed and restores the selection on Escape when open', async () => {
			render(ComboboxHarness, {
				clear: true,
				items: ['apple', 'banana'],
				root: { defaultValue: 'apple' }
			});

			inputElement().focus();
			await userEvent.keyboard('{Escape}');
			await expect.element(input()).toHaveValue('');

			await userEvent.type(input(), 'a');
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.click(option('apple'));

			await userEvent.type(input(), 'a');
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{Escape}');
			await expect.element(input()).toHaveValue('apple');
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.keyboard('{Escape}');
			await expect.element(input()).toHaveValue('');
		});

		it('moves the caret to the start on Home', async () => {
			render(ComboboxHarness, {});

			await userEvent.type(input(), 'banana');
			await userEvent.keyboard('{Home}');

			expect(inputElement().selectionStart).toBe(0);
			expect(inputElement().selectionEnd).toBe(0);
		});

		it('moves the caret to the end on End', async () => {
			render(ComboboxHarness, {});

			await userEvent.type(input(), 'apple');
			await userEvent.keyboard('{Home}{End}');

			expect(inputElement().selectionStart).toBe(5);
			expect(inputElement().selectionEnd).toBe(5);
		});

		it('scrolls to the start and end on Home and End in an overflowing input', async () => {
			render(ComboboxHarness, { input: { style: 'width: 64px; font-size: 20px' } });
			const element = inputElement();

			await userEvent.type(input(), 'this is a very long combobox value');
			expect(element.scrollWidth).toBeGreaterThan(element.clientWidth);
			const expectedScroll = element.scrollWidth - element.clientWidth;
			element.scrollLeft = expectedScroll;
			element.setSelectionRange(element.value.length, element.value.length);

			await userEvent.keyboard('{Home}');
			expect(element.selectionStart).toBe(0);
			expect(element.selectionEnd).toBe(0);
			expect(element.scrollLeft).toBe(0);

			await userEvent.keyboard('{End}');
			expect(element.selectionStart).toBe(element.value.length);
			expect(element.selectionEnd).toBe(element.value.length);
			expect(Math.abs(element.scrollLeft - expectedScroll)).toBeLessThanOrEqual(2);
		});

		it('preserves the caret position when bound and inserting in the middle', async () => {
			render(ComboboxHarness, { inputValue: '' });
			const element = inputElement();

			await userEvent.type(input(), 'abcd');
			await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
			expect(element.selectionStart).toBe(2);

			await userEvent.keyboard('xxx');
			expect(element.value).toBe('abxxxcd');
			expect(element.selectionStart).toBe(5);
			expect(element.selectionEnd).toBe(5);

			await userEvent.keyboard('y');
			expect(element.value).toBe('abxxxycd');
			expect(element.selectionStart).toBe(6);
			expect(element.selectionEnd).toBe(6);
		});

		it('clears the chip highlight when focus returns to the input', async () => {
			render(ComboboxHarness, {
				chips: true,
				chipRemove: false,
				value: threeFruits,
				root: { multiple: true }
			});

			inputElement().focus();
			await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
			await expect.element(page.getByTestId('chip-banana')).toHaveFocus();

			inputElement().focus();
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(page.getByTestId('chip-cherry')).toHaveFocus();
		});

		it('removes the last chip after clicking from a chip back to the input', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				chips: true,
				chipRemove: false,
				value: threeFruits,
				root: { multiple: true, openOnInputClick: false, onValueChange }
			});

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(page.getByTestId('chip-cherry')).toHaveFocus();

			await userEvent.click(input());
			await expect.element(input()).toHaveFocus();
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toEqual(['apple', 'banana']);
		});

		it('removes the last chip after leaving a chip and tabbing back to the input', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				around: true,
				chips: true,
				chipRemove: false,
				value: threeFruits,
				root: { multiple: true, onValueChange }
			});
			const before = page.getByTestId('before');

			await userEvent.click(before);
			await userEvent.tab();
			await expect.element(input()).toHaveFocus();
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(page.getByTestId('chip-cherry')).toHaveFocus();

			await userEvent.click(before);
			await expect.element(before).toHaveFocus();
			await userEvent.tab();
			await expect.element(input()).toHaveFocus();
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toEqual(['apple', 'banana']);
		});

		it('keeps focus on the input when navigating toward chips but none are rendered', async () => {
			render(ComboboxHarness, {
				chips: true,
				chipLimit: 0,
				value: ['apple'],
				root: { multiple: true }
			});

			inputElement().focus();
			inputElement().setSelectionRange(0, 0);
			await userEvent.keyboard('{ArrowLeft}');

			await expect.element(input()).toHaveFocus();
		});

		it('treats a null selectionStart as the beginning of a custom input', async () => {
			render(ComboboxHarness, {
				chips: true,
				chipRemove: false,
				inputElement: 'number',
				value: ['apple'],
				root: { multiple: true }
			});
			expect(inputElement().selectionStart).toBe(null);

			inputElement().focus();
			await userEvent.keyboard('{ArrowLeft}');

			await expect.element(page.getByTestId('chip-apple')).toHaveFocus();
		});

		it('keeps the popup open after modified keyboard navigation', async () => {
			render(ComboboxHarness, { open: true, staticItems: [{ value: 'apple' }] });

			inputElement().focus();
			await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');

			await expect.element(listbox()).toBeInTheDocument();
		});

		it('does not select an item for an IME keydown without a highlight', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				open: true,
				staticItems: [{ value: 'apple' }],
				root: { onValueChange }
			});

			inputElement().focus();
			inputElement().dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'Enter',
					keyCode: 229,
					bubbles: true,
					cancelable: true
				})
			);

			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('does not restore an inline highlight after the highlighted slot is removed', async () => {
			const props = renderBound(ComboboxHarness, {
				inline: true,
				open: true,
				around: true,
				items: ['apple'] as string[]
			});

			inputElement().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveAttribute('aria-activedescendant');

			await userEvent.click(page.getByTestId('outside'));
			props.items = [];
			await userEvent.click(input());

			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		});

		it('clears a closed multiple value on Escape and stops propagation', async () => {
			const onValueChange = vi.fn();
			const onOuterKeydown = vi.fn();
			render(ComboboxHarness, {
				onOuterKeydown,
				root: { multiple: true, defaultValue: ['apple'], onValueChange }
			});

			inputElement().focus();
			await userEvent.keyboard('{Escape}');

			expect(onValueChange).toHaveBeenCalledWith([], expect.anything());
			expect(onOuterKeydown).not.toHaveBeenCalled();
		});

		it('lets Escape propagate when a closed multiple value is already empty', async () => {
			const onOuterKeydown = vi.fn();
			render(ComboboxHarness, { onOuterKeydown, root: { multiple: true, defaultValue: [] } });

			inputElement().focus();
			await userEvent.keyboard('{Escape}');

			expect(onOuterKeydown).toHaveBeenCalled();
		});

		it('lets Escape propagate from a closed inline combobox', async () => {
			const onOuterKeydown = vi.fn();
			render(ComboboxHarness, { onOuterKeydown, inline: true, root: { defaultValue: 'apple' } });

			inputElement().focus();
			await userEvent.keyboard('{Escape}');

			expect(onOuterKeydown).toHaveBeenCalled();
		});

		it('closes on an empty composition update when input clicks do not open the popup', async () => {
			render(ComboboxHarness, {
				open: true,
				inputValue: 'x',
				items: ['apple'],
				root: { openOnInputClick: false, filter: null }
			});
			await expect.element(listbox()).toBeInTheDocument();

			compose(inputElement(), '');

			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('clears the highlight on an empty composition update while staying open', async () => {
			render(ComboboxHarness, {
				open: true,
				inputValue: 'x',
				items: ['apple'],
				root: { filter: null }
			});

			inputElement().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveAttribute('aria-activedescendant');

			compose(inputElement(), '');

			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		});

		it('removes the last rendered chip on Backspace in an empty input', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				chips: true,
				chipRemove: false,
				chipLimit: 2,
				value: threeFruits,
				root: { multiple: true, onValueChange }
			});

			await userEvent.click(input());
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toEqual(['apple', 'cherry']);
		});

		it('removes the last chip after tabbing from a chip back to the input', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				chips: true,
				chipRemove: false,
				value: threeFruits,
				refuseOpen: true,
				root: { multiple: true, onValueChange }
			});

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(page.getByTestId('chip-cherry')).toHaveFocus();

			await userEvent.tab();
			await expect.element(input()).toHaveFocus();
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toEqual(['apple', 'banana']);
		});

		it('focuses the last chip with ArrowLeft after tabbing from a chip back to the input', async () => {
			render(ComboboxHarness, {
				chips: true,
				chipRemove: false,
				value: threeFruits,
				refuseOpen: true,
				root: { multiple: true }
			});

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(page.getByTestId('chip-cherry')).toHaveFocus();

			await userEvent.tab();
			await expect.element(input()).toHaveFocus();

			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(page.getByTestId('chip-cherry')).toHaveFocus();
		});

		it('removes the last selected value when no chips are rendered', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				chips: true,
				chipLimit: 0,
				value: ['apple', 'banana'],
				root: { multiple: true, onValueChange }
			});

			await userEvent.click(input());
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toEqual(['apple']);
		});

		it('closes the popup when tabbing out', async () => {
			render(ComboboxHarness, { around: true, staticItems: appleBanana });
			const after = page.getByTestId('after');

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.tab();
			await expect.element(after).toHaveFocus();
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.tab();
			await expect.element(after).toHaveFocus();
			await expect.element(listbox()).not.toBeInTheDocument();
		});
	});

	describe('prop: oninput', () => {
		it('runs before the input value changes', async () => {
			const seen: unknown[] = [];
			const props = renderBound(ComboboxHarness, {
				inputValue: '',
				items: ['apple'] as string[],
				input: { oninput: () => seen.push(props.inputValue) }
			});
			await userEvent.type(input(), 'a');
			expect([seen, props.inputValue]).toEqual([[''], 'a']);
		});

		it('skips the input value change and the open when it calls preventDefault', async () => {
			const onInputValueChange = vi.fn();
			const props = renderBound(ComboboxHarness, {
				inputValue: '',
				open: false,
				items: ['apple'] as string[],
				root: { onInputValueChange },
				input: { oninput: (event: Event) => event.preventDefault() }
			});
			await userEvent.type(input(), 'a');
			expect([props.inputValue, props.open, onInputValueChange.mock.calls.length]).toEqual([
				'',
				false,
				0
			]);
		});
	});

	describe('data state attributes', () => {
		it('sets data-popup-side to the current popup side', async () => {
			render(ComboboxHarness, { items: ['apple'], positioner: { side: 'right' } });
			await expect.element(input()).not.toHaveAttribute('data-popup-side');

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).toHaveAttribute('data-popup-side', 'right');

			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(input()).not.toHaveAttribute('data-popup-side');
		});

		it('toggles data-list-empty when the filtered list is empty', async () => {
			render(ComboboxHarness, { items: ['apple', 'banana'] });

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).not.toHaveAttribute('data-list-empty');

			await userEvent.type(input(), 'zzz');
			await expect.element(input()).toHaveAttribute('data-list-empty');

			await userEvent.clear(input());
			await expect.element(input()).not.toHaveAttribute('data-list-empty');
		});
	});
});
