// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "Form" and "Field" (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see
// THIRD_PARTY_NOTICES.md. Multiple values submit through one hidden `<select multiple>`, so the
// multiple serialization case reads its options. The two cases upstream skips in a real browser
// (validationMode onChange and onBlur after keyboard selection) run here too.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { submitTo } from '../../routes/fixtures/form-log.js';
import ComboboxFieldHarness from '../../tests/ComboboxFieldHarness.svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const trigger = () => page.getByTestId('trigger');
const field = () => page.getByTestId('field');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const submitButton = () => page.getByTestId('submit');
const ab = [{ value: 'a' }, { value: 'b' }];
const optionItems = [
	{ value: '', text: 'Select' },
	{ value: '1', text: 'Option 1' }
];

function fire(target: Element, type: 'focus' | 'blur', relatedTarget?: Element | null) {
	target.dispatchEvent(new FocusEvent(type, { relatedTarget }));
	target.dispatchEvent(
		new FocusEvent(type === 'focus' ? 'focusin' : 'focusout', { bubbles: true, relatedTarget })
	);
}

function withExternalForm(id: string, onSubmit: (data: FormData) => void) {
	const form = document.createElement('form');
	form.id = id;
	const button = document.createElement('button');
	button.type = 'submit';
	button.textContent = 'Submit external';
	form.append(button);
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		onSubmit(new FormData(form));
	});
	document.body.append(form);
	return { button, remove: () => form.remove() };
}

const countries = [
	{ code: 'US', label: 'United States' },
	{ code: 'CA', label: 'Canada' },
	{ code: 'AU', label: 'Australia' }
];
type Country = (typeof countries)[number];
const countryRoot = {
	itemToStringLabel: (item: Country) => item.label,
	itemToStringValue: (item: Country) => item.code
};

describe('Combobox.Root', () => {
	describe('Form', () => {
		it.each([
			{ name: 'a single value', multiple: false, inputInside: false, tagName: 'INPUT' },
			{ name: 'multiple values', multiple: true, inputInside: false, tagName: 'SELECT' },
			{ name: 'an input inside the popup', multiple: false, inputInside: true, tagName: 'INPUT' }
		])('names one control for $name', async ({ multiple, inputInside, tagName }) => {
			render(ComboboxHarness, {
				items: ab,
				inputInside,
				portal: { keepMounted: true },
				root: { name: 'pick', multiple, defaultValue: multiple ? ['a'] : 'a' }
			});
			await tick();

			const named = document.querySelectorAll('[name="pick"]');
			expect(named).toHaveLength(1);
			expect(named[0].tagName).toBe(tagName);
			expect(named[0]).toHaveAttribute('aria-hidden', 'true');
		});

		it('submits the stringified value to onFormSubmit with itemToStringValue', async () => {
			const onFormSubmit = vi.fn();
			render(ComboboxFieldHarness, {
				form: { onsubmit: submitTo(onFormSubmit) },
				field: { name: 'country' },
				submit: true,
				combobox: {
					items: countries.slice(0, 2),
					root: { ...countryRoot, defaultValue: countries[0] }
				}
			});

			await userEvent.click(submitButton());

			expect(onFormSubmit).toHaveBeenCalledTimes(1);
			expect(onFormSubmit.mock.calls[0][0]).toEqual({ country: 'US' });
		});

		it('submits to an external form named by `form`', async () => {
			const submitted: FormDataEntryValue[] = [];
			const external = withExternalForm('external-form', (data) => {
				submitted.push(data.get('country')!);
			});
			try {
				render(ComboboxHarness, {
					items: countries.slice(0, 2),
					root: {
						...countryRoot,
						name: 'country',
						form: 'external-form',
						defaultValue: countries[0]
					}
				});
				external.button.click();
				expect(submitted).toEqual(['US']);
			} finally {
				external.remove();
			}
		});

		it('submits multiple values to an external form named by `form`', async () => {
			const submitted: FormDataEntryValue[][] = [];
			const external = withExternalForm('external-form', (data) => {
				submitted.push(data.getAll('countries'));
			});
			try {
				render(ComboboxHarness, {
					items: countries,
					root: {
						...countryRoot,
						multiple: true,
						name: 'countries',
						form: 'external-form',
						defaultValue: [countries[0], countries[2]]
					}
				});
				await tick();
				external.button.click();
				expect(submitted).toEqual([['US', 'AU']]);
			} finally {
				external.remove();
			}
		});

		describe('serialization for object values', () => {
			const items = [
				{ value: 'US', label: 'United States' },
				{ value: 'CA', label: 'Canada' },
				{ value: 'AU', label: 'Australia' }
			];
			const byLabel = { itemToStringLabel: (item: (typeof items)[number]) => item.label };

			it('serializes {value,label} objects using their value field', async () => {
				render(ComboboxHarness, {
					items,
					root: { ...byLabel, name: 'country', defaultValue: items[1] }
				});

				const hidden = document.querySelector<HTMLInputElement>('input[name="country"]');
				expect(hidden?.tagName).toBe('INPUT');
				expect(hidden?.value).toBe('CA');
			});

			it('serializes multiple {value,label} objects into the hidden select', async () => {
				render(ComboboxHarness, {
					items,
					root: {
						...byLabel,
						name: 'countries',
						multiple: true,
						defaultValue: [items[0], items[2]]
					}
				});
				await tick();

				const select = document.querySelector<HTMLSelectElement>('select[name="countries"]');
				expect([...select!.selectedOptions].map((entry) => entry.value)).toEqual(['US', 'AU']);
			});

			it('falls back to itemToStringValue when the object lacks a value', async () => {
				const codeItems = [
					{ code: 'US', name: 'United States' },
					{ code: 'CA', name: 'Canada' }
				];
				render(ComboboxHarness, {
					items: codeItems,
					itemLabel: (item: (typeof codeItems)[number]) => item.name,
					root: {
						name: 'country',
						itemToStringLabel: (item: (typeof codeItems)[number]) => item.name,
						itemToStringValue: (item: (typeof codeItems)[number]) => item.code,
						defaultValue: codeItems[0]
					}
				});

				expect(document.querySelector<HTMLInputElement>('input[name="country"]')?.value).toBe('US');
			});
		});

		it('triggers native validation on submit', async () => {
			render(ComboboxFieldHarness, {
				form: {},
				field: { name: 'test' },
				submit: true,
				errorMatch: 'valueMissing',
				errorText: 'required',
				combobox: { root: { required: true } }
			});
			await expect.element(page.getByTestId('error')).not.toBeInTheDocument();

			await userEvent.click(submitButton());

			await expect.element(page.getByTestId('error')).toHaveTextContent('required');
		});

		it('focuses the trigger and surfaces errors when the input is inside the popup', async () => {
			let submitted = 0;
			render(ComboboxFieldHarness, {
				form: {
					onsubmit: (event: SubmitEvent) => {
						event.preventDefault();
						submitted += 1;
					}
				},
				field: { name: 'combobox' },
				submit: true,
				errorMatch: 'valueMissing',
				errorText: 'required',
				combobox: {
					inputInside: true,
					fieldAwareInput: true,
					staticItems: ab,
					root: { required: true }
				}
			});
			await expect.element(page.getByTestId('error')).not.toBeInTheDocument();

			await userEvent.click(submitButton());

			expect(submitted).toBe(0);
			await expect.element(trigger()).toHaveFocus();
			await expect.element(trigger()).toHaveAttribute('data-invalid', '');
			await expect.element(page.getByTestId('error')).toHaveTextContent('required');

			await userEvent.click(trigger());
			await expect.element(input()).toBeInTheDocument();
			await expect.element(input()).not.toHaveAttribute('data-invalid');
		});

		it('submits when the input renders a field-aware input', async () => {
			const onFormSubmit = vi.fn();
			render(ComboboxFieldHarness, {
				form: { onsubmit: submitTo(onFormSubmit) },
				field: { name: 'country' },
				submit: true,
				combobox: { fieldAwareInput: true, items: ['France', 'Germany'], root: { required: true } }
			});
			await expect.element(input()).toHaveAttribute('name', 'country');

			await userEvent.click(input());
			await userEvent.click(option('France'));
			await userEvent.click(submitButton());

			expect(onFormSubmit).toHaveBeenCalledTimes(1);
			// The field-aware input and the hidden input both carry the name, as in Base UI.
			expect(onFormSubmit.mock.calls[0][0]).toEqual({ country: ['France', 'France'] });
		});

		it('submits when the input inside the popup renders a field-aware input', async () => {
			const onFormSubmit = vi.fn();
			render(ComboboxFieldHarness, {
				form: { onsubmit: submitTo(onFormSubmit) },
				field: { name: 'country' },
				submit: true,
				combobox: {
					inputInside: true,
					fieldAwareInput: true,
					items: ['France', 'Germany'],
					root: { required: true }
				}
			});

			await userEvent.click(page.getByRole('combobox'));
			await expect.element(input()).toBeInTheDocument();
			await expect.element(input()).not.toHaveAttribute('name');

			await userEvent.click(option('France'));

			const hidden = document.querySelector<HTMLInputElement>('input[name="country"]');
			expect(hidden?.value).toBe('France');

			await userEvent.click(submitButton());

			expect(onFormSubmit).toHaveBeenCalledTimes(1);
			expect(onFormSubmit.mock.calls[0][0]).toEqual({ country: 'France' });
		});

		it('clears external errors on change', async () => {
			render(ComboboxFieldHarness, {
				form: { errors: { combobox: 'test' } },
				field: { name: 'combobox' },
				combobox: { staticItems: ab }
			});
			await expect.element(page.getByTestId('error')).toHaveTextContent('test');
			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');

			await userEvent.click(input());
			await userEvent.click(option('b'));

			await expect.element(page.getByTestId('error')).not.toBeInTheDocument();
			await expect.element(input()).not.toHaveAttribute('aria-invalid');
		});

		it('submits on Enter when no item is highlighted', async () => {
			let submitted = 0;
			render(ComboboxFieldHarness, {
				form: {
					onsubmit: (event: SubmitEvent) => {
						event.preventDefault();
						submitted += 1;
					}
				},
				field: { name: 'q' },
				submit: true,
				combobox: { items: ['apple', 'banana'], root: { openOnInputClick: true } }
			});

			await userEvent.click(page.getByRole('combobox'));
			await userEvent.keyboard('{Enter}');

			expect(submitted).toBe(1);
		});

		it('prevents submit on Enter when an item is highlighted', async () => {
			let submitted = 0;
			render(ComboboxFieldHarness, {
				form: {
					onsubmit: (event: SubmitEvent) => {
						event.preventDefault();
						submitted += 1;
					}
				},
				field: { name: 'q' },
				submit: true,
				combobox: { items: ['alpha', 'beta'], root: { openOnInputClick: true } }
			});

			await userEvent.click(page.getByRole('combobox'));
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			expect(submitted).toBe(0);
		});
	});

	describe('Field', () => {
		it('receives disabled from Field.Root', async () => {
			render(ComboboxFieldHarness, {
				field: { disabled: true },
				combobox: { trigger: true, staticItems: ab }
			});

			await expect.element(input()).toHaveAttribute('disabled');
			await expect.element(trigger()).toHaveAttribute('disabled');
		});

		it('receives name from Field.Root', async () => {
			render(ComboboxFieldHarness, {
				field: { name: 'field-combobox' },
				combobox: { staticItems: ab }
			});

			expect(document.querySelector('input[name="field-combobox"]')).not.toBeNull();
		});

		it('links Field.Label to the trigger with an explicit id when the input is inside the popup', async () => {
			render(ComboboxFieldHarness, {
				fieldLabel: 'Search',
				combobox: { inputInside: true, triggerProps: { id: 'x-id' }, staticItems: ab }
			});
			const label = page.getByTestId('field-label').element();

			await expect.element(trigger()).toHaveAttribute('aria-labelledby', label.id);
			await expect.element(trigger()).toHaveAttribute('id', 'x-id');
		});

		it('does not apply validation attributes to the input inside the popup', async () => {
			render(ComboboxFieldHarness, {
				field: { invalid: true },
				description: 'Description',
				errorMatch: true,
				errorText: 'Error',
				combobox: { inputInside: true, staticItems: ab }
			});
			const description = page.getByTestId('description').element();
			const error = page.getByTestId('error').element();

			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
			const describedBy = trigger().element().getAttribute('aria-describedby') ?? '';
			expect(describedBy).toContain(description.id);
			expect(describedBy).toContain(error.id);

			await userEvent.click(trigger());
			await expect.element(input()).toBeInTheDocument();

			for (const attribute of [
				'aria-invalid',
				'aria-describedby',
				'data-valid',
				'data-invalid',
				'data-touched',
				'data-dirty',
				'data-filled',
				'data-focused'
			]) {
				expect(input().element().hasAttribute(attribute), attribute).toBe(false);
			}
		});

		it('links Combobox.Label to the trigger with an explicit id when the input is inside the popup', async () => {
			render(ComboboxHarness, {
				label: 'Search',
				inputInside: true,
				triggerProps: { id: 'x-id' },
				staticItems: ab
			});
			const label = page.getByTestId('label').element();

			await expect.element(trigger()).toHaveAttribute('aria-labelledby', label.id);
			await expect.element(trigger()).toHaveAttribute('id', 'x-id');
		});

		it('focuses the trigger without opening on a Combobox.Label click when the input is inside the popup', async () => {
			render(ComboboxHarness, { label: 'Search', inputInside: true, staticItems: ab });

			await userEvent.click(page.getByTestId('label'));

			await expect.element(trigger()).toHaveFocus();
			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		});

		it('[data-touched]', async () => {
			render(ComboboxFieldHarness, { combobox: { trigger: true, staticItems: optionItems } });

			fire(input().element(), 'focus');
			fire(input().element(), 'blur');

			await expect.element(input()).toHaveAttribute('data-touched', '');
			await expect.element(trigger()).toHaveAttribute('data-touched', '');
		});

		it('[data-dirty]', async () => {
			render(ComboboxFieldHarness, { combobox: { trigger: true, staticItems: optionItems } });
			await expect.element(input()).not.toHaveAttribute('data-dirty');
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.click(option('Option 1'));

			await expect.element(input()).toHaveAttribute('data-dirty', '');
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');
		});

		it('removes [data-dirty] in multiple mode after returning to the initial value', async () => {
			render(ComboboxFieldHarness, {
				open: true,
				combobox: { trigger: true, staticItems: ab, root: { multiple: true, defaultValue: ['a'] } }
			});
			await expect.element(input()).not.toHaveAttribute('data-dirty');
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');

			await userEvent.click(option('b'));
			await expect.element(input()).toHaveAttribute('data-dirty', '');
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');

			await userEvent.click(option('b'));
			await expect.element(input()).not.toHaveAttribute('data-dirty');
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');
		});

		it('removes [data-dirty] when an equal object value is reselected (different reference)', async () => {
			const options = [
				{ id: 'a', label: 'a' },
				{ id: 'b', label: 'b' }
			];
			type Entry = (typeof options)[number];
			render(ComboboxFieldHarness, {
				open: true,
				combobox: {
					noInput: true,
					trigger: true,
					items: options,
					root: {
						multiple: true,
						defaultValue: [{ id: 'a', label: 'a' }],
						itemToStringLabel: (item: Entry) => item.label,
						itemToStringValue: (item: Entry) => item.id,
						isItemEqualToValue: (item: Entry, value: Entry) => item.id === value.id
					}
				}
			});
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');

			await userEvent.click(option('a'));
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');

			await userEvent.click(option('a'));
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');
		});

		it('keeps [data-dirty] when the same values are reselected in a different order', async () => {
			render(ComboboxFieldHarness, {
				open: true,
				combobox: {
					noInput: true,
					trigger: true,
					staticItems: ab,
					root: { multiple: true, defaultValue: ['a', 'b'] }
				}
			});
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');

			await userEvent.click(option('a'));
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');

			await userEvent.click(option('a'));
			await tick();
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');
		});

		describe('[data-filled]', () => {
			it('is added when filled', async () => {
				render(ComboboxFieldHarness, { combobox: { trigger: true, staticItems: optionItems } });
				await expect.element(input()).not.toHaveAttribute('data-filled');
				await expect.element(trigger()).not.toHaveAttribute('data-filled');

				await userEvent.click(input());
				await userEvent.keyboard('{ArrowDown}');
				await userEvent.click(option('Option 1'));

				await expect.element(input()).toHaveAttribute('data-filled', '');
				await expect.element(trigger()).toHaveAttribute('data-filled', '');

				await userEvent.click(input());
				await expect.element(page.getByRole('listbox')).not.toHaveAttribute('data-filled');
			});

			it('is present when already filled', async () => {
				render(ComboboxFieldHarness, {
					combobox: {
						trigger: true,
						staticItems: [{ value: '1', text: 'Option 1' }],
						root: { defaultValue: '1' }
					}
				});

				await expect.element(input()).toHaveAttribute('data-filled');
				await expect.element(trigger()).toHaveAttribute('data-filled');
			});
		});

		it('[data-focused]', async () => {
			render(ComboboxFieldHarness, { combobox: { trigger: true, staticItems: optionItems } });
			await expect.element(input()).not.toHaveAttribute('data-focused');
			await expect.element(trigger()).not.toHaveAttribute('data-focused');

			fire(input().element(), 'focus');
			await expect.element(input()).toHaveAttribute('data-focused', '');
			await expect.element(trigger()).toHaveAttribute('data-focused', '');

			fire(input().element(), 'blur');
			await expect.element(input()).not.toHaveAttribute('data-focused');
			await expect.element(trigger()).not.toHaveAttribute('data-focused');
		});

		describe('[data-focused] without a blur event', () => {
			it('is removed when the focused input becomes disabled', async () => {
				const view = render(ComboboxFieldHarness, {});
				(input().element() as HTMLElement).focus();
				await expect.element(field()).toHaveAttribute('data-focused', '');

				await view.rerender({ combobox: { root: { disabled: true } } });

				await expect.element(field()).not.toHaveAttribute('data-focused');
				await expect.element(input()).not.toHaveAttribute('data-focused');
			});

			it('is removed when the focused input unmounts', async () => {
				const view = render(ComboboxFieldHarness, {});
				(input().element() as HTMLElement).focus();
				await expect.element(field()).toHaveAttribute('data-focused', '');

				await view.rerender({ mounted: false });

				await expect.element(field()).not.toHaveAttribute('data-focused');
			});

			it('is removed when the focused trigger becomes disabled', async () => {
				const view = render(ComboboxFieldHarness, { combobox: { noInput: true, trigger: true } });
				(trigger().element() as HTMLElement).focus();
				await expect.element(field()).toHaveAttribute('data-focused', '');

				await view.rerender({
					combobox: { noInput: true, trigger: true, root: { disabled: true } }
				});

				await expect.element(field()).not.toHaveAttribute('data-focused');
				await expect.element(trigger()).not.toHaveAttribute('data-focused');
			});

			it('is removed when the focused trigger unmounts', async () => {
				const view = render(ComboboxFieldHarness, { combobox: { noInput: true, trigger: true } });
				(trigger().element() as HTMLElement).focus();
				await expect.element(field()).toHaveAttribute('data-focused', '');

				await view.rerender({ combobox: { noInput: true } });

				await expect.element(field()).not.toHaveAttribute('data-focused');
			});
		});

		it('does not mark as touched when focus moves into the popup', async () => {
			const validate = vi.fn(() => 'error');
			render(ComboboxFieldHarness, {
				field: { validationMode: 'onBlur', validate },
				combobox: { noInput: true, trigger: true, staticItems: [{ value: '1', text: 'Option 1' }] }
			});
			const element = trigger().element() as HTMLElement;

			fire(element, 'focus');
			element.click();
			await expect.element(page.getByTestId('popup')).toBeInTheDocument();
			const popup = page.getByTestId('popup').element();
			fire(element, 'blur', popup);
			fire(popup, 'focus');
			await tick();

			await expect.element(trigger()).toHaveAttribute('data-focused', '');
			await expect.element(trigger()).not.toHaveAttribute('data-touched');
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');
		});

		it('validates when the popup is blurred', async () => {
			const validate = vi.fn(() => 'error');
			render(ComboboxFieldHarness, {
				field: { validationMode: 'onBlur', validate },
				combobox: { noInput: true, trigger: true, staticItems: [{ value: '1', text: 'Option 1' }] }
			});
			const element = trigger().element() as HTMLElement;
			const outside = page.getByTestId('field-outside').element();

			fire(element, 'focus');
			element.click();
			await expect.element(page.getByTestId('popup')).toBeInTheDocument();
			const popup = page.getByTestId('popup').element();
			fire(element, 'blur', popup);
			fire(popup, 'focus');
			fire(popup, 'blur', outside);
			fire(outside, 'focus');

			await expect.element(trigger()).toHaveAttribute('data-touched', '');
			await expect.element(trigger()).not.toHaveAttribute('data-focused');
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
		});

		it('[data-invalid]', async () => {
			render(ComboboxFieldHarness, {
				field: { invalid: true },
				combobox: { trigger: true, staticItems: [{ value: '1', text: 'Option 1' }] }
			});

			await expect.element(input()).toHaveAttribute('data-invalid', '');
			await expect.element(trigger()).toHaveAttribute('data-invalid', '');
		});

		it('[data-valid]', async () => {
			render(ComboboxFieldHarness, {
				field: { validationMode: 'onBlur' },
				combobox: {
					trigger: true,
					input: { required: true },
					staticItems: [{ value: '1', text: 'Option 1' }]
				}
			});
			for (const element of [input(), trigger()]) {
				await expect.element(element).not.toHaveAttribute('data-valid');
				await expect.element(element).not.toHaveAttribute('data-invalid');
			}

			fire(input().element(), 'focus');
			await userEvent.click(input());
			await userEvent.click(option('Option 1'));
			fire(input().element(), 'blur');

			await expect.element(input()).toHaveAttribute('data-valid', '');
			await expect.element(trigger()).toHaveAttribute('data-valid', '');
			await expect.element(input()).not.toHaveAttribute('data-invalid');
			await expect.element(trigger()).not.toHaveAttribute('data-invalid');
		});

		it('prop: validate', async () => {
			render(ComboboxFieldHarness, {
				field: { validationMode: 'onBlur', validate: () => 'error' }
			});
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			fire(input().element(), 'focus');
			fire(input().element(), 'blur');

			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');
		});

		it('passes the raw value to validate with itemToStringValue', async () => {
			const seen: unknown[] = [];
			const validate = vi.fn((value: unknown) => {
				seen.push(value);
				return 'error';
			});
			render(ComboboxFieldHarness, {
				field: { validationMode: 'onBlur', validate },
				combobox: {
					items: countries.slice(0, 2),
					root: { ...countryRoot, defaultValue: countries[0] }
				}
			});

			// The constraint gate's run at mount reads the registered form value instead.
			await tick();
			const before = seen.length;
			fire(input().element(), 'focus');
			fire(input().element(), 'blur');

			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');
			expect(seen.slice(before)).toEqual([countries[0]]);
		});

		it('validationMode onSubmit', async () => {
			render(ComboboxFieldHarness, {
				form: {},
				submit: true,
				error: false,
				field: { validate: (value: unknown) => (value === 'a' ? 'error' : null) },
				combobox: {
					clear: true,
					clearProps: { keepMounted: true },
					staticItems: ab,
					root: { required: true }
				}
			});
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			await userEvent.click(submitButton());
			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			await userEvent.click(page.getByTestId('clear'));
			await expect.element(input()).toHaveFocus();
			await userEvent.keyboard('{Tab}');

			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');
		});

		it('validationMode onChange', async () => {
			render(ComboboxFieldHarness, {
				field: {
					validationMode: 'onChange',
					validate: (value: unknown) => (value === '1' ? 'error' : null)
				},
				combobox: { staticItems: [{ value: '1', text: 'Option 1' }] }
			});
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');
		});

		it('validationMode onBlur', async () => {
			render(ComboboxFieldHarness, {
				field: {
					validationMode: 'onBlur',
					validate: (value: unknown) => (value === '1' ? 'error' : null)
				},
				combobox: { staticItems: [{ value: '1', text: 'Option 1' }] }
			});
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await tick();
			expect(input().element().hasAttribute('aria-invalid')).toBe(false);

			fire(input().element(), 'blur');

			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');
		});

		it('Field.Label', async () => {
			render(ComboboxFieldHarness, { fieldLabel: 'Label', fieldLabelSpan: true, labelAfter: true });
			const label = page.getByTestId('field-label').element();

			await expect.element(input()).toHaveAttribute('aria-labelledby', label.id);
		});

		it('Combobox.Label does not label Combobox.Input and warns when the input is the form control', async () => {
			const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			try {
				render(ComboboxHarness, { label: 'Search' });

				await expect.poll(() => errorSpy.mock.calls.length).toBe(1);
				expect(errorSpy.mock.calls[0][0]).toContain(
					'Base UI: <Combobox.Label> labels <Combobox.Trigger> only.'
				);
				await expect.element(input()).not.toHaveAttribute('aria-labelledby');
			} finally {
				errorSpy.mockRestore();
			}
		});

		it('does not set a fallback aria-labelledby when no label is rendered', async () => {
			render(ComboboxHarness, { input: { 'aria-label': 'Search' } });
			await tick();

			await expect.element(input()).not.toHaveAttribute('aria-labelledby');
		});

		it('updates the Combobox.Label linkage when the root id changes', async () => {
			const view = render(ComboboxHarness, {
				label: 'Food',
				inputInside: true,
				root: { id: 'first' }
			});

			await view.rerender({ label: 'Food', inputInside: true, root: { id: 'second' } });

			await expect.element(trigger()).toHaveAttribute('aria-labelledby', 'second-label');
			await expect.element(trigger()).toHaveAttribute('id', 'second');
			await expect.element(page.getByTestId('label')).toHaveAttribute('id', 'second-label');
		});

		it('Field.Description', async () => {
			render(ComboboxFieldHarness, {
				description: 'Description',
				combobox: { input: { 'aria-describedby': 'external-description' } }
			});
			const description = page.getByTestId('description').element();

			await expect
				.element(input())
				.toHaveAttribute(
					'aria-describedby',
					`external-description ${description.id} ${description.id.replace(/-description$/, '-error')}`
				);
		});
	});
});
