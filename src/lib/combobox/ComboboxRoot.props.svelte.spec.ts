// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "keyboard interaction" through "prop: readOnly" (commit
// ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: "Enter selects with manual indices provided to items" (Item `index` is not
// ported).
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import ComboboxFieldHarness from '../../tests/ComboboxFieldHarness.svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import { nextFrame, pressWithTouch, scrollLocked } from '../../tests/select-events.js';

const input = () => page.getByTestId('input');
const trigger = () => page.getByTestId('trigger');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const ab = [{ value: 'a' }, { value: 'b' }];
const countries = [
	{ value: 'US', text: 'United States' },
	{ value: 'CA', text: 'Canada' }
];
const named = (name: string) => document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
const hiddenInput = () =>
	document.querySelector<HTMLInputElement>('input[aria-hidden="true"]:not([role])')!;

async function autofill(target: HTMLInputElement, value: string) {
	target.value = value;
	target.dispatchEvent(new Event('input', { bubbles: true }));
	await tick();
	await Promise.resolve();
	await tick();
}

describe('Combobox.Root', () => {
	describe('keyboard interaction', () => {
		it('focuses first item on ArrowDown and last item on ArrowUp', async () => {
			render(ComboboxHarness, { staticItems: fruitsStatic() });

			input().element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect
				.poll(() => input().element().getAttribute('aria-activedescendant'))
				.toBe(option('apple').element().id);

			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.keyboard('{ArrowUp}');
			await expect
				.poll(() => input().element().getAttribute('aria-activedescendant'))
				.toBe(option('cherry').element().id);
		});

		it('opens, navigates with ArrowDown, and Enter selects', async () => {
			render(ComboboxHarness, { items: ['apple', 'banana', 'cherry'] });

			await userEvent.click(input());
			await expect.element(listbox()).toBeVisible();

			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(input()).toHaveValue('apple');
		});

		it('clicking on "listbox" keeps the focus on the input', async () => {
			render(ComboboxHarness, { items: ['apple', 'banana', 'cherry'] });

			await userEvent.click(input());
			await expect.element(listbox()).toBeVisible();

			await userEvent.click(listbox(), { position: { x: 1, y: 1 } });
			await expect.element(input()).toHaveFocus();

			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.element(input()).toHaveValue('apple');
		});

		it('Escape closes the popup without committing when nothing highlighted', async () => {
			render(ComboboxHarness, { open: true, items: ['a', 'b'] });
			await expect.element(listbox()).toBeInTheDocument();

			input().element().focus();
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(input()).toHaveValue('');
		});

		it('bubbles Escape key when rendered inline without Positioner/Popup', async () => {
			const onOuterKeyDown = vi.fn();
			render(ComboboxHarness, {
				inline: true,
				open: true,
				staticItems: ab,
				onOuterKeydown: (event: KeyboardEvent) => {
					if (event.key === 'Escape') onOuterKeyDown();
				}
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeVisible();

			await userEvent.keyboard('{Escape}');
			expect(onOuterKeyDown).toHaveBeenCalledTimes(1);
		});

		it('keeps input value on Enter when inline and no item is highlighted', async () => {
			render(ComboboxHarness, { inline: true, items: ['Apple', 'Banana'] });

			await userEvent.click(input());
			await userEvent.type(input(), 'Ba');

			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
			await expect.element(input()).toHaveValue('Ba');

			await userEvent.keyboard('{Enter}');
			await expect.element(input()).toHaveValue('Ba');
		});

		it('bubbles Escape key when list is empty and popup hidden with CSS', async () => {
			const onOuterKeyDown = vi.fn();
			render(ComboboxHarness, {
				open: true,
				items: [],
				onOuterKeydown: (event: KeyboardEvent) => {
					if (event.key === 'Escape') onOuterKeyDown();
				}
			});

			await expect.element(page.getByTestId('positioner')).toBeInTheDocument();
			page.getByTestId('positioner').element().style.display = 'none';

			await userEvent.click(input());
			await userEvent.keyboard('{Escape}');
			expect(onOuterKeyDown).toHaveBeenCalledTimes(1);
		});

		it('does not bubble Escape key when Empty component is present', async () => {
			const onOuterKeyDown = vi.fn();
			render(ComboboxHarness, {
				open: true,
				items: [],
				empty: 'No results.',
				onOuterKeydown: (event: KeyboardEvent) => {
					if (event.key === 'Escape') onOuterKeyDown();
				}
			});

			await expect.element(page.getByTestId('positioner')).toBeInTheDocument();
			page.getByTestId('positioner').element().style.display = 'none';

			await userEvent.click(input());
			await userEvent.keyboard('{Escape}');
			expect(onOuterKeyDown).toHaveBeenCalledTimes(0);
		});
	});

	describe('aria attributes', () => {
		it('sets all aria attributes on the input when closed', async () => {
			render(ComboboxHarness);

			await expect.element(input()).toHaveAttribute('role', 'combobox');
			await expect.element(input()).toHaveAttribute('aria-expanded', 'false');
			await expect.element(input()).toHaveAttribute('aria-autocomplete', 'list');
			await expect.element(input()).toHaveAttribute('aria-haspopup', 'listbox');
			await expect.element(input()).not.toHaveAttribute('aria-controls');
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		});

		it('sets all aria attributes on the input when open', async () => {
			render(ComboboxHarness, { open: true });

			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).toHaveAttribute('role', 'combobox');
			await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(input()).toHaveAttribute('aria-autocomplete', 'list');
			await expect.element(input()).toHaveAttribute('aria-haspopup', 'listbox');
			await expect.element(input()).toHaveAttribute('aria-controls', listbox().element().id);
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		});

		it('sets aria-expanded on the input when rendered inline and open', async () => {
			render(ComboboxHarness, { inline: true, open: true });

			await expect.element(input()).toHaveAttribute('role', 'combobox');
			await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(input()).toHaveAttribute('aria-controls', listbox().element().id);
		});

		it('sets the popup type on the input when rendered inline as a grid', async () => {
			render(ComboboxHarness, { inline: true, open: true, root: { grid: true } });

			const grid = page.getByRole('grid');
			await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(input()).toHaveAttribute('aria-haspopup', 'grid');
			await expect.element(input()).toHaveAttribute('aria-controls', grid.element().id);
		});

		it('keeps the input expanded when rendered inline without the `open` prop', async () => {
			render(ComboboxHarness, { inline: true, items: ['apple', 'banana'] });

			const id = listbox().element().id;
			await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(input()).toHaveAttribute('aria-controls', id);

			await userEvent.click(input());

			await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(input()).toHaveAttribute('aria-controls', id);
		});

		it('sets correct attributes on the item when highlighted', async () => {
			render(ComboboxHarness, { open: true, staticItems: ab });

			await userEvent.click(input());
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('a')).toHaveAttribute('aria-selected', 'false');
			await expect.element(option('b')).toHaveAttribute('aria-selected', 'false');
			await expect
				.element(input())
				.toHaveAttribute('aria-activedescendant', option('a').element().id);

			await userEvent.keyboard('{Enter}');
			await userEvent.click(input());

			await expect.element(option('a')).toHaveAttribute('aria-selected', 'true');
			await expect.element(option('b')).toHaveAttribute('aria-selected', 'false');
		});

		it('sets aria-controls to the dialog popup on trigger', async () => {
			render(ComboboxHarness, { open: true, inputInside: true });

			const popup = page.getByRole('dialog');
			await expect.element(popup).toBeInTheDocument();
			expect(popup.element().id).not.toBe('');
			await expect.element(trigger()).toHaveAttribute('aria-controls', popup.element().id);
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');

			await userEvent.click(trigger());

			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
			await expect.element(trigger()).not.toHaveAttribute('aria-controls');
		});

		it('points aria-controls at a custom popup id on the trigger', async () => {
			render(ComboboxHarness, {
				open: true,
				inputInside: true,
				popup: { id: 'custom-popup-id' }
			});

			await expect.element(page.getByRole('dialog')).toHaveAttribute('id', 'custom-popup-id');
			await expect.element(trigger()).toHaveAttribute('aria-controls', 'custom-popup-id');
		});

		it('points aria-controls at a popup id supplied through the render prop', async () => {
			render(ComboboxHarness, { open: true, inputInside: true, popupRenderId: 'custom-render-id' });

			await expect.element(page.getByRole('dialog')).toHaveAttribute('id', 'custom-render-id');
			await expect.element(trigger()).toHaveAttribute('aria-controls', 'custom-render-id');
		});
	});

	it('should handle browser autofill', async () => {
		const onInputValueChange = vi.fn();
		render(ComboboxHarness, {
			staticItems: ab,
			root: { name: 'test', onInputValueChange }
		});

		await autofill(named('test'), 'b');
		expect(onInputValueChange.mock.lastCall?.[0]).toBe('b');
		expect(onInputValueChange.mock.lastCall?.[1].reason).toBe(REASONS.none);

		await userEvent.click(input());
		await expect.element(option('b')).toHaveAttribute('aria-selected', 'true');
	});

	it.each([
		{ lockState: 'readonly', label: 'inside Field', withField: true, expectedError: 'test' },
		{ lockState: 'disabled', label: 'inside Field', withField: true, expectedError: 'test' },
		{ lockState: 'readonly', label: 'outside Field', withField: false, expectedError: null },
		{ lockState: 'disabled', label: 'outside Field', withField: false, expectedError: null }
	] as const)(
		'ignores hidden-input autofill when $lockState $label',
		async ({ lockState, withField, expectedError }) => {
			const onValueChange = vi.fn();
			const onInputValueChange = vi.fn();
			const combobox = {
				staticItems: ab,
				root: {
					name: withField ? undefined : 'test',
					readonly: lockState === 'readonly',
					disabled: lockState === 'disabled',
					onValueChange,
					onInputValueChange
				}
			};
			if (withField) {
				render(ComboboxFieldHarness, {
					form: { errors: { test: 'test' } },
					field: { name: 'test' },
					combobox
				});
			} else {
				render(ComboboxHarness, combobox);
			}

			const errorText = () => document.querySelector('[data-testid="error"]')?.textContent ?? null;
			const hidden = named('test');
			expect(hidden).not.toBeNull();
			expect(errorText()).toBe(expectedError);

			await autofill(hidden, 'b');

			expect(onValueChange).not.toHaveBeenCalled();
			expect(onInputValueChange).not.toHaveBeenCalled();
			expect((input().element() as HTMLInputElement).value).toBe('');
			expect(hidden.value).toBe('');
			expect(errorText()).toBe(expectedError);
		}
	);

	it('shows all items when opening after browser autofill', async () => {
		render(ComboboxHarness, { items: ['a', 'b', 'c'], root: { name: 'test' } });

		await autofill(named('test'), 'b');
		await userEvent.click(input());

		await expect.element(listbox()).toBeVisible();
		await expect.element(option('a')).toBeInTheDocument();
		await expect.element(option('b')).toBeInTheDocument();
		await expect.element(option('c')).toBeInTheDocument();
	});

	it('does not open or filter the popup on browser autofill with insertReplacementText', async () => {
		render(ComboboxHarness, {
			items: ['a', 'b', 'c'],
			root: { name: 'test', defaultValue: 'b' }
		});

		const element = input().element() as HTMLInputElement;
		element.value = 'B';
		element.dispatchEvent(
			new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' })
		);
		await tick();

		await expect.element(input()).toHaveValue('B');
		expect(document.querySelector('[role="listbox"]')).toBeNull();

		await userEvent.click(input());

		await expect.element(listbox()).toBeVisible();
		await expect.element(option('a')).toBeInTheDocument();
		await expect.element(option('b')).toBeInTheDocument();
		await expect.element(option('c')).toBeInTheDocument();
	});

	const objectItems = [
		{ country: 'United States', code: 'US' },
		{ country: 'Canada', code: 'CA' }
	];
	type Country = (typeof objectItems)[number];

	it('should handle browser autofill with object values', async () => {
		render(ComboboxHarness, {
			open: true,
			items: objectItems,
			itemLabel: (item: Country) => item.country,
			root: {
				name: 'country',
				itemToStringLabel: (item: Country) => item.country,
				itemToStringValue: (item: Country) => item.code
			}
		});

		await autofill(named('country'), 'CA');
		input()
			.element()
			.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		await expect.element(option('Canada')).toHaveAttribute('aria-selected', 'true');
	});

	it('should handle browser autofill with object values when autofill uses the label', async () => {
		const onValueChange = vi.fn();
		render(ComboboxHarness, {
			open: true,
			items: objectItems,
			itemLabel: (item: Country) => item.country,
			root: {
				name: 'country',
				itemToStringLabel: (item: Country) => item.country,
				itemToStringValue: (item: Country) => item.code,
				onValueChange
			}
		});

		await autofill(named('country'), 'Canada');

		expect(onValueChange).toHaveBeenCalledWith(
			{ country: 'Canada', code: 'CA' },
			expect.objectContaining({ reason: REASONS.none })
		);

		input()
			.element()
			.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await expect.element(option('Canada')).toHaveAttribute('aria-selected', 'true');
	});

	it('matches browser autofill against an item rendered label for primitive values regardless of case', async () => {
		render(ComboboxHarness, { staticItems: countries, root: { name: 'country' } });

		await autofill(named('country'), 'canada');
		await userEvent.click(input());

		await expect.element(option('Canada')).toHaveAttribute('aria-selected', 'true');
	});

	it('matches browser autofill by serialized value before an earlier rendered label', async () => {
		render(ComboboxHarness, {
			staticItems: [
				{ value: 'CA', text: 'US' },
				{ value: 'US', text: 'United States' }
			],
			root: { name: 'country' }
		});

		await autofill(named('country'), 'US');
		await userEvent.click(input());

		await expect.element(option('United States')).toHaveAttribute('aria-selected', 'true');
		await expect.element(option('US')).toHaveAttribute('aria-selected', 'false');
	});

	it('matches browser autofill when an earlier item has no rendered label', async () => {
		render(ComboboxHarness, {
			staticItems: [
				{ value: 'US', text: '' },
				{ value: 'CA', text: 'Canada' }
			],
			root: { name: 'country' }
		});

		await autofill(named('country'), 'Canada');
		await userEvent.click(input());

		await expect.element(option('Canada')).toHaveAttribute('aria-selected', 'true');
	});

	it('matches browser autofill against an item rendered label when using the items prop', async () => {
		const countryNames: Record<string, string> = { US: 'United States', CA: 'Canada' };
		render(ComboboxHarness, {
			items: ['US', 'CA'],
			itemLabel: (code: string) => countryNames[code],
			root: { name: 'country' }
		});

		await autofill(named('country'), 'Canada');
		await userEvent.click(input());

		await expect.element(option('Canada')).toHaveAttribute('aria-selected', 'true');
	});

	it('does not force-mount the list when autofill matches a serialized value with the items prop', async () => {
		render(ComboboxHarness, { items: ['US', 'CA'], root: { name: 'country' } });

		await autofill(named('country'), 'CA');
		expect(document.querySelector('[role="listbox"]')).toBeNull();

		await userEvent.click(input());
		await expect.element(option('CA')).toHaveAttribute('aria-selected', 'true');
	});

	it('marks the field dirty and validates after successful autofill', async () => {
		const validateSpy = vi.fn((value: unknown) => (value === 'CA' ? null : 'error'));
		render(ComboboxFieldHarness, {
			field: { validationMode: 'onChange', validate: validateSpy },
			error: false,
			combobox: { staticItems: countries, root: { name: 'country' } }
		});

		await expect.element(input()).not.toHaveAttribute('data-dirty');

		await autofill(named('country'), 'CA');

		await expect.poll(() => validateSpy.mock.calls.length).toBeGreaterThan(0);
		expect(validateSpy.mock.lastCall?.[0]).toBe('CA');
		await expect.element(input()).toHaveAttribute('data-dirty', '');
	});

	it('does not update field state when autofill is canceled', async () => {
		render(ComboboxFieldHarness, {
			form: { errors: { country: 'server error' } },
			field: { name: 'country' },
			combobox: {
				inputInside: true,
				staticItems: countries,
				root: { onValueChange: (_value: unknown, details: { cancel(): void }) => details.cancel() }
			}
		});

		await expect.element(trigger()).not.toHaveAttribute('data-dirty');
		await expect.element(page.getByTestId('error')).toHaveTextContent('server error');

		await autofill(named('country'), 'CA');

		await expect.element(trigger()).not.toHaveAttribute('data-dirty');
		await expect.element(page.getByTestId('error')).toHaveTextContent('server error');
	});

	it('does not mark the field dirty when input autofill is canceled', async () => {
		render(ComboboxFieldHarness, {
			error: false,
			combobox: {
				inputInside: true,
				staticItems: countries,
				root: {
					name: 'country',
					onValueChange: (_value: unknown, details: { cancel(): void }) => details.cancel()
				}
			}
		});

		await expect.element(trigger()).not.toHaveAttribute('data-dirty');
		await autofill(named('country'), 'CA');
		await expect.element(trigger()).not.toHaveAttribute('data-dirty');
	});

	it('should pass autoComplete to the hidden input', async () => {
		render(ComboboxHarness, {
			staticItems: countries,
			root: { name: 'country', autocomplete: 'country' }
		});

		const hidden = hiddenInput();
		await expect.element(input()).toHaveAttribute('autocomplete', 'off');
		await expect.element(input()).not.toHaveAttribute('name');
		expect(hidden.getAttribute('name')).toBe('country');
		expect(hidden.hasAttribute('id')).toBe(false);
		expect(hidden.getAttribute('autocomplete')).toBe('country');
	});

	describe('scroll locking', () => {
		describe('touch scroll lock', () => {
			it('applies scroll lock when a touch-opened popup covers the viewport width', async () => {
				render(ComboboxHarness, {
					trigger: true,
					staticItems: [{ value: 'Apple' }],
					root: { modal: true },
					positioner: { style: 'width: calc(100vw - 10px)' }
				});

				pressWithTouch(trigger().element());
				await expect.element(listbox()).toBeInTheDocument();
				await expect.poll(scrollLocked).toBe(true);
			});

			it('does not apply scroll lock when a touch-opened popup is narrower than the viewport', async () => {
				render(ComboboxHarness, {
					trigger: true,
					staticItems: [{ value: 'Apple' }],
					root: { modal: true },
					positioner: { style: 'width: 240px' }
				});

				pressWithTouch(trigger().element());
				await expect.element(listbox()).toBeInTheDocument();
				await nextFrame();
				expect(scrollLocked()).toBe(false);
			});
		});
	});

	it('does not open on programmatic input events', async () => {
		render(ComboboxHarness, {
			staticItems: [{ value: 'Darlinghurst' }, { value: 'Sydney' }]
		});

		const element = input().element() as HTMLInputElement;
		element.value = 'Darlinghurst';
		element.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();
		await Promise.resolve();

		expect(document.querySelector('[role="listbox"]')).toBeNull();
	});

	it('opens on paste input events', async () => {
		render(ComboboxHarness, {
			staticItems: [{ value: 'Darlinghurst' }, { value: 'Sydney' }]
		});

		const element = input().element() as HTMLInputElement;
		element.value = 'Darlinghurst';
		element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }));

		await expect.element(listbox()).toBeInTheDocument();
	});

	describe('prop: id', () => {
		it('sets the id on the input when it is outside the popup', async () => {
			render(ComboboxHarness, { staticItems: ab, root: { id: 'test-id' } });
			await expect.element(input()).toHaveAttribute('id', 'test-id');
		});

		it('sets the id on the trigger when the input is inside the popup', async () => {
			render(ComboboxHarness, {
				open: true,
				inputInside: true,
				staticItems: ab,
				root: { id: 'test-id' }
			});

			await expect.element(trigger()).toHaveAttribute('id', 'test-id');
			await expect.element(input()).not.toHaveAttribute('id', 'test-id');
		});
	});

	describe('prop: disabled', () => {
		it('should render disabled state on all interactive components', async () => {
			render(ComboboxHarness, { trigger: true, staticItems: ab, root: { disabled: true } });

			await expect.element(input()).toHaveAttribute('disabled');
			await expect.element(trigger()).toHaveAttribute('disabled');

			trigger()
				.element()
				.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			await tick();
			expect(document.querySelector('[role="listbox"]')).toBeNull();
		});

		it('should not open popup when disabled', async () => {
			render(ComboboxHarness, { trigger: true, staticItems: ab, root: { disabled: true } });

			for (const target of [input(), trigger()]) {
				const element = target.element();
				element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
				element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
				element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
				await tick();
				expect(document.querySelector('[role="listbox"]')).toBeNull();
			}
		});

		it('should prevent keyboard interactions when disabled', async () => {
			render(ComboboxHarness, { staticItems: ab, root: { disabled: true } });

			input().element().focus();
			await userEvent.keyboard('a');
			await tick();
			expect(document.querySelector('[role="listbox"]')).toBeNull();
		});

		it('should set disabled attribute on hidden input', async () => {
			render(ComboboxHarness, {
				staticItems: [{ value: 'a' }],
				root: { disabled: true, name: 'test' }
			});
			expect(hiddenInput().hasAttribute('disabled')).toBe(true);
		});
	});

	describe('prop: required', () => {
		it('does not mark the hidden input as required when selection exists in multiple mode', async () => {
			render(ComboboxHarness, {
				value: ['a'],
				root: { multiple: true, required: true, name: 'languages' }
			});

			expect(hiddenInput()).not.toBeNull();
			expect(hiddenInput().hasAttribute('required')).toBe(false);
		});

		it('keeps the hidden input required when no selection exists in multiple mode', async () => {
			render(ComboboxHarness, {
				value: [],
				root: { multiple: true, required: true, name: 'languages' }
			});

			expect(hiddenInput()).not.toBeNull();
			expect(hiddenInput().hasAttribute('required')).toBe(true);
		});
	});

	describe('prop: readOnly', () => {
		it('should render readOnly state on the input', async () => {
			render(ComboboxHarness, { root: { readonly: true } });

			await expect.element(input()).toHaveAttribute('aria-readonly', 'true');
			await expect.element(input()).toHaveAttribute('readonly');
		});

		it('should expose aria-autocomplete="none" when readOnly', async () => {
			render(ComboboxHarness, { root: { readonly: true } });
			await expect.element(input()).toHaveAttribute('aria-autocomplete', 'none');
		});

		it('should open the popup from the input and the trigger when readOnly', async () => {
			render(ComboboxHarness, { trigger: true, staticItems: ab, root: { readonly: true } });

			await userEvent.click(input());
			await expect.element(listbox()).toHaveAttribute('aria-readonly', 'true');

			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
		});

		it('should browse the items with the arrow keys when readOnly', async () => {
			render(ComboboxHarness, { staticItems: ab, root: { readonly: true } });

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('a')).toHaveAttribute('data-highlighted');

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('b')).toHaveAttribute('data-highlighted');
		});

		it('should not change the input value when typing while readOnly', async () => {
			const onInputValueChange = vi.fn();
			render(ComboboxHarness, { staticItems: ab, root: { readonly: true, onInputValueChange } });

			await userEvent.type(input(), 'a');

			await expect.element(input()).toHaveValue('');
			expect(onInputValueChange).not.toHaveBeenCalled();
		});

		it('should set readOnly attribute on hidden input', async () => {
			render(ComboboxHarness, {
				staticItems: [{ value: 'a' }],
				root: { readonly: true, name: 'test' }
			});
			expect(hiddenInput().hasAttribute('readonly')).toBe(true);
		});

		it('should prevent value changes when readOnly with items', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				open: true,
				staticItems: [
					{ value: 'a', testid: 'item-a' },
					{ value: 'b', testid: 'item-b' }
				],
				root: { readonly: true, onValueChange }
			});

			await userEvent.click(page.getByTestId('item-a'));
			expect(onValueChange).toHaveBeenCalledTimes(0);
		});

		it('should not submit the form with Enter on a highlighted item when readOnly', async () => {
			const onSubmit = vi.fn();
			render(ComboboxFieldHarness, {
				nativeForm: true,
				field: false,
				submit: true,
				onsubmit: onSubmit,
				combobox: { staticItems: ab, root: { readonly: true } }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('a')).toHaveAttribute('data-highlighted');

			await userEvent.keyboard('{Enter}');
			await tick();
			expect(onSubmit).not.toHaveBeenCalled();
		});

		it('should report arrow-key highlights as keyboard-driven when readOnly', async () => {
			const onItemHighlighted = vi.fn();
			render(ComboboxHarness, { staticItems: ab, root: { readonly: true, onItemHighlighted } });

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			onItemHighlighted.mockClear();

			await userEvent.keyboard('{ArrowDown}');

			await expect
				.poll(() =>
					onItemHighlighted.mock.calls.some(([v, d]) => v === 'a' && d.reason === 'keyboard')
				)
				.toBe(true);
		});

		it('should not commit a value with Enter on a highlighted item when readOnly', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, { staticItems: ab, root: { readonly: true, onValueChange } });

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('a')).toHaveAttribute('data-highlighted');

			await userEvent.keyboard('{Enter}');

			expect(onValueChange).toHaveBeenCalledTimes(0);
			await expect.element(input()).toHaveValue('');
		});
	});
});

function fruitsStatic() {
	return [{ value: 'apple' }, { value: 'banana' }, { value: 'cherry' }];
}
