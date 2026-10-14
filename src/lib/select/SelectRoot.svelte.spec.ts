// Assertions follow Base UI v1.9.0 packages/react/src/select/root/SelectRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported, React only: popupConformanceTests and popupListConformanceTests (React test-utils
// suites), React.startTransition and ReactDOM.createPortal cases, render-count checks.
// `actionsRef` is the root's exported `close()` and `unmount()`. `defaultOpen` is `open`
// without a binding. Multiple values submit through one hidden `<select multiple>`, so those
// cases read FormData instead of counting `<input>` elements.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import SelectFieldHarness from '../../tests/SelectFieldHarness.svelte';
import SelectHarness from '../../tests/SelectHarness.svelte';

const ab = [{ value: 'a' }, { value: 'b' }];
const countries = [
	{ country: 'United States', code: 'US' },
	{ country: 'Canada', code: 'CA' },
	{ country: 'Australia', code: 'AU' }
];
const countryItems = countries.map((item) => ({ value: item, text: item.country }));
type Country = (typeof countries)[number];

const trigger = () => page.getByTestId('trigger');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const hiddenInput = () => document.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;

async function openSelect() {
	await userEvent.click(trigger());
	await expect.element(listbox()).toBeVisible();
}

function autofill(value: string) {
	const input = hiddenInput();
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

const flush = async () => {
	await tick();
	await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('Select.Root', () => {
	describe('manual unmount lifecycle', () => {
		it('automatically unmounts and completes closing once', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(SelectHarness, {
				root: { onOpenChangeComplete },
				items: [{ value: 'apple', text: 'Apple' }]
			});

			expect(onOpenChangeComplete).not.toHaveBeenCalled();
			await openSelect();
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChangeComplete.mock.calls.filter(([open]) => !open)).toHaveLength(1);

			// Calling unmount after the automatic unmount must not repeat the completion.
			view.component.unmount();
			await tick();
			expect(onOpenChangeComplete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
		});

		it('keeps the popup mounted until unmount() completes closing', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(SelectHarness, {
				open: true,
				root: {
					onOpenChangeComplete,
					onOpenChange: (open, details) => {
						if (!open) details.preventUnmountOnClose();
					}
				},
				items: [{ value: 'apple', text: 'Apple' }]
			});

			await userEvent.click(option('Apple'));
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
			await expect.element(listbox()).toBeInTheDocument();
			expect(onOpenChangeComplete).not.toHaveBeenCalledWith(false);

			view.component.unmount();
			await tick();
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChangeComplete.mock.calls.filter(([open]) => !open)).toHaveLength(1);

			await view.rerender({ open: true });
			await expect.element(listbox()).toBeVisible();
			await view.rerender({ open: false });
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChangeComplete.mock.calls.filter(([open]) => !open)).toHaveLength(2);
		});

		it('clears the opt-out when a reopen interrupts a pending unmount', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(SelectHarness, {
				open: true,
				root: {
					onOpenChangeComplete,
					onOpenChange: (open, details) => {
						if (!open) details.preventUnmountOnClose();
					}
				},
				items: [{ value: 'apple', text: 'Apple' }]
			});

			await userEvent.click(option('Apple'));
			await expect.element(listbox()).toBeInTheDocument();
			expect(onOpenChangeComplete).not.toHaveBeenCalledWith(false);
			await view.rerender({ open: true });
			await view.rerender({ open: false });
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChangeComplete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
		});

		it('ignores an opt-out on a canceled close', async () => {
			let cancel = true;
			render(SelectHarness, {
				open: true,
				root: {
					onOpenChange: (open, details) => {
						if (!open && cancel) {
							details.preventUnmountOnClose();
							details.cancel();
						}
					}
				},
				items: [{ value: 'apple', text: 'Apple' }]
			});

			await userEvent.click(option('Apple'));
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(listbox()).toBeVisible();
			cancel = false;
			await userEvent.click(option('Apple'));
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('closes through close() so onOpenChange can opt out', async () => {
			const reasons: string[] = [];
			const view = render(SelectHarness, {
				open: true,
				root: {
					onOpenChange: (open, details) => {
						reasons.push(details.reason);
						if (!open) details.preventUnmountOnClose();
					}
				},
				items: [{ value: 'apple', text: 'Apple' }]
			});
			await expect.element(listbox()).toBeVisible();

			view.component.close();
			await tick();
			expect(reasons).toEqual([REASONS.imperativeAction]);
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
			await expect.element(listbox()).toBeInTheDocument();

			view.component.unmount();
			await tick();
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('ignores unmount() while the popup is open', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(SelectHarness, {
				open: true,
				root: { onOpenChangeComplete },
				items: [{ value: 'apple', text: 'Apple' }]
			});
			await expect.element(listbox()).toBeVisible();
			const popup = listbox().element();

			view.component.unmount();
			await tick();

			expect(listbox().element()).toBe(popup);
			expect(onOpenChangeComplete).not.toHaveBeenCalledWith(false);
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
		});

		it('unmounts when close() and unmount() are called together', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(SelectHarness, {
				open: true,
				root: {
					onOpenChangeComplete,
					onOpenChange: (open, details) => {
						if (!open) details.preventUnmountOnClose();
					}
				},
				items: [{ value: 'apple', text: 'Apple' }]
			});
			await expect.element(listbox()).toBeVisible();

			view.component.close();
			await tick();
			view.component.unmount();
			await tick();

			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChangeComplete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
		});

		it('still unmounts on a later close after unmount() was called while open', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(SelectHarness, {
				open: true,
				root: { onOpenChangeComplete },
				items: [{ value: 'apple', text: 'Apple' }]
			});
			await expect.element(listbox()).toBeVisible();

			view.component.unmount();
			await tick();
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChangeComplete).toHaveBeenLastCalledWith(false);
		});

		it('does not call onOpenChange when close() is called while closed', async () => {
			const onOpenChange = vi.fn();
			const view = render(SelectHarness, {
				root: { onOpenChange },
				items: [{ value: 'apple', text: 'Apple' }]
			});

			view.component.close();
			await tick();
			expect(onOpenChange).not.toHaveBeenCalled();
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
		});

		it('completes closing once when unmount() is called twice', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(SelectHarness, {
				open: true,
				root: {
					onOpenChangeComplete,
					onOpenChange: (open, details) => {
						if (!open) details.preventUnmountOnClose();
					}
				},
				items: [{ value: 'apple', text: 'Apple' }]
			});

			await userEvent.click(option('Apple'));
			await expect.element(listbox()).toBeInTheDocument();

			view.component.unmount();
			view.component.unmount();
			await tick();
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChangeComplete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
		});
	});

	it('exposes the orientation attribute rendered by Separator', async () => {
		render(SelectHarness, {
			open: true,
			items: ab,
			separator: true
		});
		await expect.element(page.getByTestId('separator')).toHaveAttribute('role', 'presentation');
	});

	describe('prop: defaultValue', () => {
		it('selects the item by default', async () => {
			render(SelectHarness, { root: { defaultValue: 'b' }, items: ab });
			await openSelect();
			await expect.element(option('b')).toHaveAttribute('data-selected', '');
		});
	});

	describe('prop: value', () => {
		it('selects the item named by the value prop', async () => {
			render(SelectHarness, { value: 'b', items: ab });
			await openSelect();
			await expect.element(option('b')).toHaveAttribute('data-selected', '');
		});

		it('selects the value when the popup is mounted on the initial render', async () => {
			render(SelectHarness, { open: true, value: 'b', items: ab });
			await expect.element(option('b')).toHaveAttribute('data-selected', '');
			await expect.element(option('a')).not.toHaveAttribute('data-selected');
		});

		it('updates the selected item when the value prop changes', async () => {
			const view = render(SelectHarness, { value: 'a', items: ab });
			await openSelect();
			await expect.element(option('a')).toHaveAttribute('data-selected', '');

			await view.rerender({ value: 'b' });
			await expect.element(option('b')).toHaveAttribute('data-selected', '');
			await expect.element(option('a')).not.toHaveAttribute('data-selected');
		});

		it('keeps the value when onValueChange cancels the change', async () => {
			const onValueChange = vi.fn((_value: unknown, details: { cancel(): void }) =>
				details.cancel()
			);
			render(SelectHarness, { value: 'a', root: { onValueChange }, items: ab });
			await expect.element(trigger()).toHaveTextContent('a');

			await openSelect();
			await userEvent.click(option('b'));

			expect(onValueChange).toHaveBeenCalledOnce();
			expect(onValueChange.mock.calls[0][0]).toBe('b');
			await expect.element(trigger()).toHaveTextContent('a');
			await expect.element(listbox()).not.toBeInTheDocument();

			await openSelect();
			await expect.element(option('a')).toHaveAttribute('data-selected');
			await expect.element(option('b')).not.toHaveAttribute('data-selected');
		});

		it('updates the Select.Value label when the value prop changes before the popup opens', async () => {
			const view = render(SelectHarness, { value: 'b', items: ab });
			await expect.element(trigger()).toHaveTextContent('b');
			await view.rerender({ value: 'a' });
			await expect.element(trigger()).toHaveTextContent('a');
		});
	});

	describe('prop: itemToStringValue', () => {
		it('uses itemToStringValue for form submission', async () => {
			render(SelectHarness, {
				root: {
					name: 'country',
					defaultValue: countries[0],
					itemToStringLabel: (item) => (item as Country).country,
					itemToStringValue: (item) => (item as Country).code
				},
				items: countryItems
			});
			expect(hiddenInput().value).toBe('US');
		});

		it('uses itemToStringValue for multiple selection form submission', async () => {
			render(SelectHarness, {
				root: {
					name: 'countries',
					multiple: true,
					defaultValue: [countries[0], countries[1]],
					itemToStringLabel: (item) => (item as Country).country,
					itemToStringValue: (item) => (item as Country).code
				},
				items: countryItems
			});
			const select = document.querySelector<HTMLSelectElement>('select[name="countries"]')!;
			expect([...select.selectedOptions].map((entry) => entry.value)).toEqual(['US', 'CA']);
		});

		it('does not invoke itemToStringValue with the value array in multiple mode', async () => {
			render(SelectHarness, {
				root: {
					name: 'countries',
					multiple: true,
					defaultValue: [countries[0], countries[1]],
					itemToStringValue: (item) => (item as Country).code.toUpperCase()
				},
				items: countryItems
			});
			const select = document.querySelector<HTMLSelectElement>('select[name="countries"]')!;
			expect([...select.selectedOptions].map((entry) => entry.value)).toEqual(['US', 'CA']);
		});
	});

	describe('prop: itemToStringLabel', () => {
		it('uses itemToStringLabel for trigger text when the value is an object', async () => {
			render(SelectHarness, {
				root: {
					defaultValue: countries[1],
					itemToStringLabel: (item) => (item as Country).country,
					itemToStringValue: (item) => (item as Country).code
				},
				items: countryItems
			});
			await expect.element(trigger()).toHaveTextContent('Canada');
		});

		it('updates trigger text with itemToStringLabel after selecting an object item', async () => {
			render(SelectHarness, {
				open: true,
				root: {
					itemToStringLabel: (item) => (item as Country).country,
					itemToStringValue: (item) => (item as Country).code
				},
				items: countryItems
			});
			await userEvent.click(option('Canada'));
			await expect.element(trigger()).toHaveTextContent('Canada');
		});
	});

	describe('prop: onValueChange', () => {
		it('is called when an item is selected', async () => {
			const onValueChange = vi.fn();
			render(SelectHarness, { value: '', root: { onValueChange }, items: ab });
			await openSelect();
			await userEvent.click(option('b'));
			expect(onValueChange.mock.calls[0][0]).toBe('b');
		});

		it('is not called twice on select', async () => {
			const onValueChange = vi.fn();
			render(SelectHarness, { root: { onValueChange }, items: ab });
			await openSelect();
			await userEvent.click(option('b'));
			expect(onValueChange).toHaveBeenCalledTimes(1);
		});
	});

	describe('initially open', () => {
		it('opens the select', async () => {
			render(SelectHarness, { open: true, items: ab });
			await expect.element(listbox()).toBeVisible();
			// `listbox` is implicitly vertical.
			await expect.element(listbox()).not.toHaveAttribute('aria-orientation');
		});

		it('selects an item and closes when clicked', async () => {
			const onValueChange = vi.fn();
			render(SelectHarness, { open: true, root: { onValueChange }, items: ab });
			await expect.element(listbox()).toBeVisible();

			await userEvent.hover(option('b'));
			await userEvent.click(option('b'));

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0][0]).toBe('b');
			await expect.element(listbox()).not.toBeInTheDocument();
		});
	});

	describe('browser autofill', () => {
		it('selects the item the hidden input names', async () => {
			render(SelectHarness, { root: { name: 'select' }, items: ab });
			expect(hiddenInput().getAttribute('name')).toBe('select');
			autofill('b');
			await flush();
			await openSelect();
			await expect.element(option('b')).toHaveAttribute('data-selected', '');
		});

		it('is ignored in multiple mode', async () => {
			const onValueChange = vi.fn();
			render(SelectHarness, {
				root: { multiple: true, name: 'select', onValueChange },
				items: ab
			});
			// Autofill writes one scalar, which cannot apply to a multi-selection.
			autofill('b');
			await flush();
			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('leaves the value untouched when nothing matches', async () => {
			const onValueChange = vi.fn();
			render(SelectHarness, {
				root: { name: 'select', defaultValue: 'a', onValueChange },
				items: ab
			});
			autofill('not-an-option');
			await flush();
			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(trigger()).toHaveTextContent('a');
		});

		it('redirects focus to the trigger when the hidden input is focused', async () => {
			render(SelectHarness, { root: { name: 'select' }, items: [{ value: 'a' }] });
			hiddenInput().focus();
			await expect.element(trigger()).toHaveFocus();
		});

		it('passes autocomplete to the hidden input', async () => {
			render(SelectHarness, {
				root: { name: 'country', autocomplete: 'country' },
				items: [
					{ value: 'US', text: 'United States' },
					{ value: 'CA', text: 'Canada' }
				]
			});
			expect(hiddenInput().getAttribute('name')).toBe('country');
			expect(hiddenInput().getAttribute('autocomplete')).toBe('country');
		});

		it('matches object values by their string value', async () => {
			render(SelectHarness, {
				root: {
					name: 'country',
					itemToStringLabel: (item) => (item as Country).country,
					itemToStringValue: (item) => (item as Country).code
				},
				items: countryItems.slice(0, 2)
			});
			autofill('CA');
			await flush();
			await openSelect();
			await expect.element(option('Canada')).toHaveAttribute('data-selected', '');
		});

		it('matches object values by their label', async () => {
			// Browsers autofill the displayed text, not the value.
			render(SelectHarness, {
				root: {
					name: 'country',
					itemToStringLabel: (item) => (item as Country).country,
					itemToStringValue: (item) => (item as Country).code
				},
				items: countryItems.slice(0, 2)
			});
			autofill('Canada');
			await flush();
			await openSelect();
			await expect.element(option('Canada')).toHaveAttribute('data-selected', '');
		});

		it('matches the rendered label of a primitive value regardless of case', async () => {
			render(SelectHarness, {
				root: { name: 'country' },
				items: [
					{ value: 'US', text: 'United States' },
					{ value: 'CA', text: 'Canada' }
				]
			});
			autofill('canada');
			await flush();
			await openSelect();
			await expect.element(option('Canada')).toHaveAttribute('data-selected', '');
		});

		it('matches the serialized value before an earlier rendered label', async () => {
			render(SelectHarness, {
				root: { name: 'country' },
				items: [
					{ value: 'CA', text: 'US' },
					{ value: 'US', text: 'United States' }
				]
			});
			autofill('US');
			await flush();
			await openSelect();
			await expect.element(option('United States')).toHaveAttribute('data-selected', '');
			await expect.element(option('US')).not.toHaveAttribute('data-selected');
		});

		it('matches when an earlier item has no rendered label', async () => {
			render(SelectHarness, {
				root: { name: 'country' },
				items: [
					{ value: 'US', text: '' },
					{ value: 'CA', text: 'Canada' }
				]
			});
			autofill('Canada');
			await flush();
			await openSelect();
			await expect.element(option('Canada')).toHaveAttribute('data-selected', '');
		});

		it('marks the field dirty and validates after a successful autofill', async () => {
			const validate = vi.fn((value: unknown) => (value === 'CA' ? null : 'error'));
			render(SelectFieldHarness, {
				field: { validationMode: 'onChange', validate },
				select: {
					root: { name: 'country' },
					items: [
						{ value: 'US', text: 'United States' },
						{ value: 'CA', text: 'Canada' }
					]
				}
			});
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');

			autofill('CA');
			await expect.poll(() => validate.mock.calls.length).toBeGreaterThan(0);
			expect(validate.mock.calls.at(-1)?.[0]).toBe('CA');
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');
		});

		it('does not update field state when the change is canceled', async () => {
			render(SelectFieldHarness, {
				form: { errors: { country: 'server error' } },
				field: { name: 'country' },
				select: {
					root: { onValueChange: (_value, details) => details.cancel() },
					items: [
						{ value: 'US', text: 'United States' },
						{ value: 'CA', text: 'Canada' }
					]
				}
			});
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');
			await expect.element(page.getByTestId('error')).toHaveTextContent('server error');

			autofill('CA');
			await flush();

			await expect.element(trigger()).not.toHaveAttribute('data-dirty');
			await expect.element(page.getByTestId('error')).toHaveTextContent('server error');
		});

		it.each([
			{ lockState: 'readonly', withField: true },
			{ lockState: 'disabled', withField: true },
			{ lockState: 'readonly', withField: false },
			{ lockState: 'disabled', withField: false }
		] as const)(
			'is ignored when $lockState (inside Field: $withField)',
			async ({ lockState, withField }) => {
				const onValueChange = vi.fn();
				const select = {
					root: {
						name: withField ? undefined : 'select',
						readonly: lockState === 'readonly',
						disabled: lockState === 'disabled',
						onValueChange
					},
					items: ab
				};
				if (withField) {
					render(SelectFieldHarness, {
						form: { errors: { select: 'test' } },
						field: { name: 'select' },
						select
					});
				} else {
					render(SelectHarness, select);
				}

				expect(hiddenInput().getAttribute('name')).toBe('select');
				const expectedError = withField ? 'test' : undefined;
				expect(document.querySelector('[data-testid="error"]')?.textContent).toBe(expectedError);

				autofill('b');
				await flush();

				expect(onValueChange).not.toHaveBeenCalled();
				expect(hiddenInput().value).toBe('');
				expect(document.querySelector('[data-testid="error"]')?.textContent).toBe(expectedError);
			}
		);
	});

	describe('dirty state in multiple mode', () => {
		it('removes [data-dirty] after returning to the initial value', async () => {
			render(SelectFieldHarness, {
				open: true,
				select: { root: { multiple: true, defaultValue: ['a'] }, items: ab }
			});
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');

			await userEvent.click(option('b'));
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');

			await userEvent.click(option('b'));
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');
		});

		it('compares object values with isItemEqualToValue when clearing [data-dirty]', async () => {
			const items = [
				{ value: 'a', label: 'a' },
				{ value: 'b', label: 'b' }
			];
			render(SelectFieldHarness, {
				open: true,
				select: {
					root: {
						multiple: true,
						// Equal to `items[0]` through `isItemEqualToValue`, not by reference.
						defaultValue: [{ value: 'a', label: 'a' }],
						isItemEqualToValue: (a, b) =>
							(a as { value: string }).value === (b as { value: string }).value
					},
					items: items.map((item) => ({ value: item, text: item.label }))
				}
			});
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');

			await userEvent.click(option('a'));
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');

			await userEvent.click(option('a'));
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');
		});

		it('does not invoke isItemEqualToValue with the value array when empty', async () => {
			const items = [
				{ value: 'a', label: 'a' },
				{ value: 'b', label: 'b' }
			];
			const isItemEqualToValue = vi.fn((a: unknown, b: unknown) => {
				if (Array.isArray(b)) throw new Error('isItemEqualToValue received the value array');
				return (a as { value: string }).value === (b as { value: string }).value;
			});
			render(SelectHarness, {
				open: true,
				root: { multiple: true, defaultValue: [], isItemEqualToValue },
				items: items.map((item) => ({ value: item, text: item.label }))
			});
			await expect.poll(() => document.querySelectorAll('[role="option"]').length).toBe(2);
			expect(isItemEqualToValue).not.toHaveBeenCalledWith(expect.anything(), expect.any(Array));
		});

		it('keeps [data-dirty] when the same values return in a different order', async () => {
			render(SelectFieldHarness, {
				open: true,
				select: { root: { multiple: true, defaultValue: ['a', 'b'] }, items: ab }
			});
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');

			await userEvent.click(option('a'));
			await userEvent.click(option('a'));
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');
		});
	});

	it.each(['disabled', 'readonly'] as const)(
		'does not commit item selection when root is %s and held open',
		async (lockState) => {
			const onValueChange = vi.fn();
			render(SelectHarness, {
				open: true,
				root: {
					onValueChange,
					disabled: lockState === 'disabled',
					readonly: lockState === 'readonly'
				},
				items: ab
			});

			// A disabled item is `aria-disabled`, which Playwright would wait on.
			await userEvent.click(option('b'), { force: true });

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(option('b')).not.toHaveAttribute('data-selected');
		}
	);
});
