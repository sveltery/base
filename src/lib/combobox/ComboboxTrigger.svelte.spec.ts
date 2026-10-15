// Assertions follow Base UI v1.9.0 packages/react/src/combobox/trigger/ComboboxTrigger.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React ref and render-prop cloning), the Autocomplete row of
// "validates the value when blurred" (Autocomplete is a separate part), the React StrictMode row
// of the typeahead case, and "does not select when closed typeahead matches a sparse label
// without a value" (it writes React-only registry refs).
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxFieldHarness from '../../tests/ComboboxFieldHarness.svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxPartsHarness from '../../tests/ComboboxPartsHarness.svelte';

const trigger = () => page.getByTestId('trigger');
const triggerElement = () => trigger().element() as HTMLElement;
const listbox = () => page.getByRole('listbox');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const ab = [{ value: 'a' }, { value: 'b' }];
const alphaBeta = [
	{ value: 'alpha', text: 'Alpha' },
	{ value: 'beta', text: 'Beta' }
];

function press(target: Element, init: MouseEventInit & { pointerType?: string } = {}) {
	const options = { bubbles: true, cancelable: true, button: 0, ...init };
	target.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', ...options }));
	target.dispatchEvent(new MouseEvent('mousedown', options));
}

function release(target: Element, init: MouseEventInit = {}) {
	target.dispatchEvent(
		new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0, ...init })
	);
}

function fire(target: Element, type: 'focus' | 'blur') {
	target.dispatchEvent(new FocusEvent(type));
	target.dispatchEvent(
		new FocusEvent(type === 'focus' ? 'focusin' : 'focusout', { bubbles: true })
	);
}

describe('Combobox.Trigger', () => {
	it('sets tabindex to -1 when not used as the main anchor', async () => {
		render(ComboboxHarness, { trigger: true });
		await expect.element(trigger()).toHaveAttribute('tabindex', '-1');

		await userEvent.click(page.getByTestId('input'));
		await expect.element(trigger()).toHaveAttribute('tabindex', '-1');

		await userEvent.click(trigger());
		await expect.element(trigger()).toHaveAttribute('tabindex', '-1');
	});

	describe('prop: disabled', () => {
		it('renders the disabled attribute when disabled', async () => {
			render(ComboboxHarness, { noInput: true, trigger: true, triggerProps: { disabled: true } });

			await expect.element(trigger()).toHaveAttribute('disabled');
		});

		it('inherits the disabled state from the root', async () => {
			render(ComboboxHarness, { noInput: true, trigger: true, root: { disabled: true } });

			await expect.element(trigger()).toHaveAttribute('disabled');
		});

		it('inherits the disabled state from Field.Root', async () => {
			render(ComboboxFieldHarness, {
				field: { disabled: true },
				combobox: { noInput: true, trigger: true }
			});

			await expect.element(trigger()).toHaveAttribute('disabled');
		});

		it('does not open the popup when disabled', async () => {
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				triggerProps: { disabled: true },
				staticItems: ab
			});

			await userEvent.click(trigger(), { force: true });

			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('ignores native keydown events on a disabled non-native trigger', async () => {
			const onOpenChange = vi.fn();
			render(ComboboxPartsHarness, { scenario: 'div-trigger', root: { onOpenChange } });

			triggerElement().dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
			);

			expect(onOpenChange).not.toHaveBeenCalled();
		});

		it('prioritizes the local disabled over the root disabled', async () => {
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				triggerProps: { disabled: true },
				root: { disabled: false }
			});

			await expect.element(trigger()).toHaveAttribute('disabled');
		});
	});

	it('validates the single selection value when blurred', async () => {
		const validate = vi.fn();
		render(ComboboxFieldHarness, {
			field: { validationMode: 'onBlur', validate },
			combobox: { noInput: true, trigger: true, root: { defaultValue: 'apple' } }
		});

		fire(triggerElement(), 'focus');
		fire(triggerElement(), 'blur');

		expect(validate).toHaveBeenCalledWith('apple', expect.anything());
	});

	it('ignores a pending mouseup after the trigger unmounts', async () => {
		const onOpenChange = vi.fn();
		const props = renderBound(ComboboxPartsHarness, {
			scenario: 'toggle-trigger' as const,
			showTrigger: true,
			root: { onOpenChange }
		});

		press(triggerElement());
		await expect.poll(() => onOpenChange.mock.calls[0]?.[0]).toBe(true);
		onOpenChange.mockClear();

		props.showTrigger = false;
		await expect.element(trigger()).not.toBeInTheDocument();

		release(document.body, { clientX: 100, clientY: 100 });
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	describe('prop: readOnly', () => {
		it('applies the data-readonly style hook only when readOnly', async () => {
			const props = renderBound(ComboboxHarness, {
				noInput: true,
				trigger: true,
				root: { readonly: true } as Record<string, unknown>
			});
			await expect.element(trigger()).toHaveAttribute('data-readonly', '');

			props.root = { readonly: false };

			await expect.element(trigger()).not.toHaveAttribute('data-readonly');
		});

		it('opens the popup when readOnly', async () => {
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				staticItems: ab,
				root: { readonly: true }
			});

			await userEvent.click(trigger());

			await expect.element(listbox()).toHaveAttribute('aria-readonly', 'true');
		});

		it.each(['{ArrowDown}', '{ArrowUp}', '{Enter}', '[Space]'])(
			'opens on %s when readOnly',
			async (key) => {
				const onOpenChange = vi.fn();
				render(ComboboxHarness, {
					inputInside: true,
					staticItems: [{ value: 'a' }],
					root: { readonly: true, onOpenChange }
				});

				triggerElement().focus();
				await userEvent.keyboard(key);

				await expect.element(listbox()).toBeInTheDocument();
				expect(onOpenChange).toHaveBeenCalledTimes(1);
			}
		);

		it('does not commit a value with typeahead on a closed trigger', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: [{ value: 'apple' }, { value: 'banana' }],
				root: { readonly: true, onValueChange }
			});

			triggerElement().focus();
			await userEvent.keyboard('b');

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(trigger()).toHaveAttribute('data-placeholder');
		});

		it('opens when readOnly is false', async () => {
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				staticItems: [{ value: 'a' }],
				root: { readonly: false }
			});

			await userEvent.click(trigger());

			await expect.element(listbox()).toBeInTheDocument();
		});
	});

	describe('interaction behavior', () => {
		it('toggles the popup when enabled', async () => {
			render(ComboboxHarness, { trigger: true, staticItems: ab });

			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.click(trigger());
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('calls onOpenChange when toggling', async () => {
			const onOpenChange = vi.fn();
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				staticItems: ab,
				root: { onOpenChange }
			});

			await userEvent.click(trigger());

			await expect.poll(() => onOpenChange.mock.calls.length).toBe(1);
			expect(onOpenChange.mock.calls[0][0]).toBe(true);
		});

		it('opens the popup on ArrowDown or ArrowUp', async () => {
			render(ComboboxHarness, { trigger: true });

			triggerElement().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(page.getByRole('combobox')).toHaveFocus();

			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();

			triggerElement().focus();
			await userEvent.keyboard('{ArrowUp}');
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(page.getByRole('combobox')).toHaveFocus();
		});

		it('does not open on ArrowDown or ArrowUp when the reference is a textarea', async () => {
			render(ComboboxPartsHarness, { scenario: 'textarea-reference' });

			await userEvent.click(page.getByRole('combobox'));
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(listbox()).not.toBeInTheDocument();
			await userEvent.keyboard('{ArrowUp}');
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('fires with reason trigger-press when the trigger is clicked', async () => {
			const onOpenChange = vi.fn();
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				staticItems: alphaBeta,
				root: { onOpenChange }
			});

			await userEvent.click(trigger());

			await expect.poll(() => onOpenChange.mock.calls.length).toBe(1);
			expect(onOpenChange.mock.lastCall?.[0]).toBe(true);
			expect(onOpenChange.mock.lastCall?.[1].reason).toBe(REASONS.triggerPress);
		});
	});

	describe('drag selection', () => {
		it('commits the selection when the input is outside the popup', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, { trigger: true, staticItems: alphaBeta, root: { onValueChange } });

			press(triggerElement());
			await expect.element(option('Beta')).toBeInTheDocument();
			await userEvent.hover(option('Beta'));
			await expect.element(option('Beta')).toHaveAttribute('data-highlighted');

			release(option('Beta').element());

			await expect.poll(() => onValueChange.mock.calls.length).toBe(1);
			expect(onValueChange.mock.calls[0][0]).toBe('beta');
		});

		it('commits the selection when the input is inside the popup and the pointer is released over an item', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: alphaBeta,
				root: { onValueChange }
			});

			press(triggerElement());
			await expect.element(option('Beta')).toBeInTheDocument();
			await userEvent.hover(option('Beta'));
			await expect.element(option('Beta')).toHaveAttribute('data-highlighted');

			release(option('Beta').element());

			await expect.poll(() => onValueChange.mock.calls.length).toBe(1);
			expect(onValueChange.mock.calls[0][0]).toBe('beta');
		});

		it('does not double-commit when a non-primary touch lands on another item', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: alphaBeta,
				root: { onValueChange }
			});

			press(triggerElement());
			await expect.element(option('Alpha')).toBeInTheDocument();
			await userEvent.hover(option('Alpha'));
			await expect.element(option('Alpha')).toHaveAttribute('data-highlighted');
			const alpha = option('Alpha').element();
			const beta = option('Beta').element();

			// Without the primary pointer guard, Beta's press would make Alpha's release read as a
			// drag-select that commits on `mouseup` and again on the following click.
			const touch = { bubbles: true, cancelable: true, button: 0, pointerType: 'touch' };
			alpha.dispatchEvent(new PointerEvent('pointerdown', { ...touch, isPrimary: true }));
			beta.dispatchEvent(new PointerEvent('pointerdown', { ...touch, isPrimary: false }));
			release(alpha);
			alpha.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));

			await expect.poll(() => onValueChange.mock.calls.length).toBe(1);
			expect(onValueChange.mock.calls[0][0]).toBe('alpha');
		});

		it('commits a later drag-select onto an item whose earlier pointerdown never released', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, { trigger: true, staticItems: alphaBeta, root: { onValueChange } });

			press(triggerElement());
			await expect.element(option('Alpha')).toBeInTheDocument();
			option('Alpha')
				.element()
				.dispatchEvent(
					new PointerEvent('pointerdown', {
						bubbles: true,
						cancelable: true,
						button: 0,
						pointerType: 'touch',
						isPrimary: true
					})
				);
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();

			press(triggerElement());
			await expect.element(option('Alpha')).toBeInTheDocument();
			await userEvent.hover(option('Alpha'));
			await expect.element(option('Alpha')).toHaveAttribute('data-highlighted');
			release(option('Alpha').element());

			await expect.poll(() => onValueChange.mock.calls.length).toBe(1);
			expect(onValueChange.mock.calls[0][0]).toBe('alpha');
		});

		it('does not commit the selection if the pointer never hovers the item', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: alphaBeta,
				root: { onValueChange }
			});

			press(triggerElement());
			await expect.element(option('Beta')).toBeInTheDocument();

			release(option('Beta').element());
			await new Promise((resolve) => requestAnimationFrame(resolve));

			expect(onValueChange).not.toHaveBeenCalled();
		});
	});

	describe('cancel-open', () => {
		it('closes the popup when mouseup occurs outside the trigger bounds', async () => {
			const onOpenChange = vi.fn();
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				staticItems: [{ value: 'alpha', text: 'Alpha' }],
				root: { onOpenChange }
			});

			press(triggerElement());
			await expect.element(listbox()).toBeInTheDocument();

			release(document.body, { clientX: 999, clientY: 999 });

			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
			expect(onOpenChange.mock.lastCall?.[1].reason).toBe(REASONS.cancelOpen);
		});

		it('keeps the popup open when mouseup remains near the trigger bounds', async () => {
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				staticItems: [{ value: 'alpha', text: 'Alpha' }]
			});
			triggerElement().getBoundingClientRect = () =>
				DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 40 });

			press(triggerElement());
			await expect.element(listbox()).toBeInTheDocument();
			const list = listbox().element();

			release(document.body, { clientX: 1, clientY: 1 });
			await new Promise((resolve) => requestAnimationFrame(resolve));

			expect(list.isConnected).toBe(true);
		});

		it('closes the popup when the release is more than 5px outside the trigger bounds', async () => {
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				staticItems: [{ value: 'alpha', text: 'Alpha' }]
			});
			triggerElement().getBoundingClientRect = () =>
				DOMRect.fromRect({ x: 100, y: 100, width: 100, height: 40 });

			press(triggerElement());
			await expect.element(listbox()).toBeInTheDocument();

			release(document.body, { clientX: 94, clientY: 120 });

			await expect.element(listbox()).not.toBeInTheDocument();
		});
	});

	describe('aria attributes', () => {
		it('sets aria-required when required (input inside popup)', async () => {
			render(ComboboxHarness, { noInput: true, trigger: true, root: { required: true } });

			await expect.element(trigger()).toHaveAttribute('aria-required', 'true');
		});

		it('does not set aria-required when the input is outside the popup', async () => {
			render(ComboboxHarness, { trigger: true, root: { required: true } });

			await expect.element(trigger()).not.toHaveAttribute('aria-required');
		});

		it('sets aria-readonly when readOnly (input inside popup)', async () => {
			render(ComboboxHarness, { noInput: true, trigger: true, root: { readonly: true } });

			await expect.element(trigger()).toHaveAttribute('role', 'combobox');
			await expect.element(trigger()).toHaveAttribute('aria-readonly', 'true');
		});

		it('does not set aria-readonly when the input is outside the popup', async () => {
			render(ComboboxHarness, { trigger: true, root: { readonly: true } });

			// Without the `combobox` role the trigger is a plain button, so `aria-readonly` would
			// not apply to it. The input carries the state instead.
			await expect.element(trigger()).not.toHaveAttribute('role');
			await expect.element(trigger()).not.toHaveAttribute('aria-readonly');
			await expect.element(page.getByTestId('input')).toHaveAttribute('aria-readonly', 'true');
		});

		it('sets the aria attributes when closed', async () => {
			render(ComboboxHarness, { noInput: true, trigger: true });

			await expect.element(trigger()).toHaveAttribute('tabindex', '0');
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
			await expect.element(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
			await expect.element(trigger()).not.toHaveAttribute('aria-controls');
		});

		it('sets the aria attributes when open', async () => {
			render(ComboboxHarness, { noInput: true, trigger: true });

			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
			const popup = page.getByRole('dialog').element();

			await expect.element(trigger()).toHaveAttribute('tabindex', '0');
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
			expect(popup.id).not.toBe('');
			await expect.element(trigger()).toHaveAttribute('aria-controls', popup.id);
		});
	});

	describe('typeahead', () => {
		const fruits = ['apple', 'banana', 'cherry'];

		it('selects an item when typing on the focused trigger (input inside popup)', async () => {
			render(ComboboxHarness, { inputInside: true, items: fruits });
			await expect.element(trigger()).not.toHaveTextContent('apple');

			triggerElement().focus();
			await userEvent.keyboard('a');

			await expect.element(trigger()).toHaveTextContent('apple');
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('selects an item when typing after the popup has been opened and closed (items prop)', async () => {
			render(ComboboxHarness, { inputInside: true, items: fruits });

			// Opening mounts the list and closing unmounts it. Typeahead must still work afterwards.
			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(trigger()).toHaveFocus();

			await userEvent.keyboard('b');

			await expect.element(trigger()).toHaveTextContent('banana');
		});

		it.each([false, true])(
			'cycles to the next matching item when typing after open and close (no items prop, keepMounted %s)',
			async (keepMounted) => {
				render(ComboboxHarness, {
					inputInside: true,
					staticItems: [{ value: 'apple' }, { value: 'apricot' }, { value: 'banana' }],
					portal: { keepMounted },
					root: { defaultValue: 'apple' }
				});

				await userEvent.click(trigger());
				await expect.element(listbox()).toBeInTheDocument();
				await userEvent.keyboard('{Escape}');
				await expect
					.poll(() => document.querySelector('[role="listbox"]')?.checkVisibility() ?? false)
					.toBe(false);
				await expect.element(trigger()).toHaveFocus();

				// Typeahead starts matching after the selected item, like a native select.
				await userEvent.keyboard('a');

				await expect.element(trigger()).toHaveTextContent('apricot');
			}
		);

		it('cycles from the selected item after reordering items while closed (no items prop)', async () => {
			const props = renderBound(ComboboxHarness, {
				inputInside: true,
				staticItems: [{ value: 'apple' }, { value: 'apricot' }, { value: 'banana' }],
				root: { defaultValue: 'apple' }
			});

			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(trigger()).toHaveFocus();

			// Reordering while closed moves apple from index 0 to index 1.
			props.staticItems = [{ value: 'apricot' }, { value: 'apple' }, { value: 'banana' }];

			await userEvent.keyboard('a');

			await expect.element(trigger()).toHaveTextContent('apricot');
		});

		it('only matches mounted indexed item labels when typing on the focused trigger', async () => {
			const props = renderBound(ComboboxHarness, {
				inputInside: true,
				staticItems: [
					{ value: 'apple', text: 'Apple', props: { index: 0 } },
					{ value: 'banana', text: 'Banana', props: { index: 1 } },
					{ value: 'blueberry', text: 'Blueberry', props: { index: 2 } }
				]
			});

			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
			props.staticItems = [
				{ value: 'apple', text: 'Apple', props: { index: 0 } },
				{ value: 'blueberry', text: 'Blueberry', props: { index: 2 } }
			];
			await expect.element(option('Banana')).not.toBeInTheDocument();
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();

			triggerElement().focus();
			await userEvent.keyboard('b');

			await expect.element(trigger()).toHaveTextContent('blueberry');
		});
	});

	describe('data state attributes', () => {
		it('sets data-popup-side to the current popup side', async () => {
			render(ComboboxHarness, {
				noInput: true,
				trigger: true,
				items: ['apple'],
				positioner: { side: 'right' }
			});
			await expect.element(trigger()).not.toHaveAttribute('data-popup-side');

			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(trigger()).toHaveAttribute('data-popup-side', 'right');

			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(trigger()).not.toHaveAttribute('data-popup-side');
		});

		it('toggles data-list-empty when the filtered list is empty', async () => {
			render(ComboboxHarness, { trigger: true, items: ['apple', 'banana'] });

			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(trigger()).not.toHaveAttribute('data-list-empty');

			await userEvent.type(page.getByTestId('input'), 'zzz');
			await expect.element(trigger()).toHaveAttribute('data-list-empty');

			await userEvent.clear(page.getByTestId('input'));
			await expect.element(trigger()).not.toHaveAttribute('data-list-empty');
		});

		it.each([
			['no value is selected', {}, true],
			['a value is selected', { defaultValue: 'a' }, false],
			['multiple mode has an empty array', { multiple: true, defaultValue: [] }, true],
			['multiple mode has a default value', { multiple: true, defaultValue: ['a'] }, false]
		])('sets data-placeholder when %s: %s', async (_, root, placeholder) => {
			render(ComboboxHarness, {
				inputInside: true,
				valueProps: { placeholder: 'Select' },
				staticItems: [{ value: 'a' }],
				root
			});

			if (placeholder) await expect.element(trigger()).toHaveAttribute('data-placeholder');
			else await expect.element(trigger()).not.toHaveAttribute('data-placeholder');
		});
	});
});
