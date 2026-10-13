// Assertions follow Base UI v1.9.0 packages/react/src/select/root/SelectRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Form and Field cases. The two cases upstream marks flaky in a real browser
// (validationMode onChange and onBlur after keyboard selection) run here too.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { isVirtualClick } from '@sveltery/floating-ui-svelte';
import SelectFieldHarness from '../../tests/SelectFieldHarness.svelte';
import SelectHarness from '../../tests/SelectHarness.svelte';

const trigger = () => page.getByTestId('trigger');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const field = () => page.getByTestId('field');
const optionItems = [
	{ value: '', text: 'Select' },
	{ value: '1', text: 'Option 1' }
];

/**
 * Chromium 141 forwards a label click to the trigger with no pointer type, a virtual click, so
 * the first item takes focus. Chromium 153 forwards it as a mouse click, so the listbox takes
 * focus, as in upstream's test. Upstream does the same in each.
 */
async function clickLabelAndExpectOpenFocus() {
	const clicks: MouseEvent[] = [];
	const element = trigger().element();
	const record = (event: Event) => clicks.push(event as MouseEvent);
	element.addEventListener('click', record);
	await userEvent.click(page.getByTestId('field-label'));
	element.removeEventListener('click', record);
	expect(clicks).toHaveLength(1);
	await expect.element(isVirtualClick(clicks[0]) ? option('Sans-serif') : listbox()).toHaveFocus();
}

/**
 * The popup takes focus a frame after it opens, in upstream too. A key sent before then lands on
 * the trigger, where an arrow key starts from the first item instead of the selected one.
 */
async function expectFocusInPopup() {
	await expect.poll(() => listbox().element().contains(document.activeElement)).toBe(true);
}

async function openSelect() {
	await userEvent.click(trigger());
	await expect.element(listbox()).toBeVisible();
}

function fire(target: Element, type: 'focus' | 'blur', relatedTarget?: Element | null) {
	target.dispatchEvent(new FocusEvent(type, { relatedTarget }));
	target.dispatchEvent(
		new FocusEvent(type === 'focus' ? 'focusin' : 'focusout', { bubbles: true, relatedTarget })
	);
}

function withExternalForm(id: string, onSubmit: (event: SubmitEvent) => void) {
	const form = document.createElement('form');
	form.id = id;
	const button = document.createElement('button');
	button.type = 'submit';
	button.textContent = 'Submit external';
	form.append(button);
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		onSubmit(event);
	});
	document.body.append(form);
	return { button, remove: () => form.remove() };
}

describe('Select.Root', () => {
	describe('Form', () => {
		it('submits the stringified value to onFormSubmit with itemToStringValue', async () => {
			const items = [
				{ code: 'US', label: 'United States' },
				{ code: 'CA', label: 'Canada' }
			];
			const onFormSubmit = vi.fn();
			render(SelectFieldHarness, {
				form: { onFormSubmit },
				field: { name: 'country' },
				submit: true,
				select: {
					root: {
						defaultValue: items[0],
						itemToStringLabel: (item) => (item as (typeof items)[number]).label,
						itemToStringValue: (item) => (item as (typeof items)[number]).code
					},
					items: items.map((item) => ({ value: item, text: item.label }))
				}
			});
			await userEvent.click(page.getByText('Submit', { exact: true }));
			expect(onFormSubmit).toHaveBeenCalledTimes(1);
			expect(onFormSubmit.mock.calls[0][0]).toEqual({ country: 'US' });
		});

		it('submits to an external form named by `form`', async () => {
			const submitted: (string | null)[] = [];
			const external = withExternalForm('external-form', (event) => {
				submitted.push(new FormData(event.target as HTMLFormElement).get('country') as string);
			});
			try {
				render(SelectHarness, {
					root: { name: 'country', form: 'external-form', defaultValue: 'US' },
					items: [
						{ value: 'US', text: 'United States' },
						{ value: 'CA', text: 'Canada' }
					]
				});
				external.button.click();
				expect(submitted).toEqual(['US']);
			} finally {
				external.remove();
			}
		});

		it('submits multiple values to an external form named by `form`', async () => {
			const submitted: FormDataEntryValue[][] = [];
			const external = withExternalForm('external-form', (event) => {
				submitted.push(new FormData(event.target as HTMLFormElement).getAll('countries'));
			});
			try {
				render(SelectHarness, {
					value: ['US', 'CA'],
					root: { multiple: true, name: 'countries', form: 'external-form' },
					items: [
						{ value: 'US', text: 'United States' },
						{ value: 'CA', text: 'Canada' },
						{ value: 'AU', text: 'Australia' }
					]
				});
				external.button.click();
				expect(submitted).toEqual([['US', 'CA']]);
			} finally {
				external.remove();
			}
		});

		it('triggers native validation on submit', async () => {
			render(SelectFieldHarness, {
				form: {},
				field: { name: 'test' },
				submit: true,
				errorMatch: 'valueMissing',
				errorText: 'required',
				select: { root: { required: true } }
			});
			await expect.element(page.getByTestId('error')).not.toBeInTheDocument();
			await userEvent.click(page.getByText('Submit', { exact: true }));
			await expect.element(page.getByTestId('error')).toHaveTextContent('required');
		});

		it('clears external errors on change', async () => {
			render(SelectFieldHarness, {
				form: { errors: { select: 'test' } },
				field: { name: 'select' },
				select: { items: [{ value: 'a' }, { value: 'b' }] }
			});
			await expect.element(page.getByTestId('error')).toHaveTextContent('test');
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');

			await openSelect();
			await userEvent.click(option('b'));

			await expect.element(page.getByTestId('error')).not.toBeInTheDocument();
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');
		});

		it('revalidates immediately after form submission errors', async () => {
			render(SelectFieldHarness, {
				form: {},
				field: { name: 'select' },
				submit: true,
				errorMatch: 'valueMissing',
				errorText: 'required',
				select: { root: { required: true }, items: [{ value: 'a' }, { value: 'b' }] }
			});
			await userEvent.click(page.getByText('Submit', { exact: true }));
			await expect.element(page.getByTestId('error')).toHaveTextContent('required');
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');

			await openSelect();
			await userEvent.click(option('b'));

			await expect.element(page.getByTestId('error')).not.toBeInTheDocument();
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');
		});
	});

	describe('Field', () => {
		it('[data-touched]', async () => {
			render(SelectFieldHarness, { select: { items: optionItems } });
			const element = trigger().element();
			fire(element, 'focus');
			fire(element, 'blur');
			await expect.element(trigger()).toHaveAttribute('data-touched', '');
		});

		it('[data-dirty]', async () => {
			render(SelectFieldHarness, { select: { items: optionItems } });
			await expect.element(trigger()).not.toHaveAttribute('data-dirty');
			await openSelect();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.click(option('Option 1'));
			await expect.element(trigger()).toHaveAttribute('data-dirty', '');
		});

		describe('[data-filled]', () => {
			it('is added when filled', async () => {
				render(SelectFieldHarness, { select: { items: optionItems } });
				await expect.element(trigger()).not.toHaveAttribute('data-filled');
				await openSelect();
				await userEvent.keyboard('{ArrowDown}');
				await userEvent.click(option('Option 1'));
				await expect.element(trigger()).toHaveAttribute('data-filled', '');

				await openSelect();
				await expect.element(listbox()).not.toHaveAttribute('data-filled');
			});

			it('is present when already filled', async () => {
				render(SelectFieldHarness, {
					select: { root: { defaultValue: '1' }, items: [{ value: '1', text: 'Option 1' }] }
				});
				await expect.element(trigger()).toHaveAttribute('data-filled');
			});

			it('is absent when a single value serializes to an empty string', async () => {
				render(SelectFieldHarness, { value: '', select: { items: optionItems } });
				await expect.element(trigger()).not.toHaveAttribute('data-filled');
			});

			it('is absent when a non-string value serializes to an empty string', async () => {
				const emptyValue = { id: 1, label: 'Empty option' };
				render(SelectFieldHarness, {
					value: emptyValue,
					select: {
						root: {
							itemToStringLabel: (item) => (item as typeof emptyValue).label,
							itemToStringValue: () => ''
						},
						items: [
							{ value: emptyValue, text: 'Empty option' },
							{ value: { id: 2, label: 'Option 1' }, text: 'Option 1' }
						]
					}
				});
				await expect.element(trigger()).not.toHaveAttribute('data-filled');
			});

			it('is absent when a multiple value is empty', async () => {
				render(SelectFieldHarness, { select: { root: { multiple: true }, items: optionItems } });
				await expect.element(trigger()).not.toHaveAttribute('data-filled');
				await openSelect();
				await userEvent.click(option('Option 1'));
				await expect.element(trigger()).toHaveAttribute('data-filled', '');
				await userEvent.click(option('Option 1'));
				await expect.element(trigger()).not.toHaveAttribute('data-filled');
			});

			it('is absent when a multiple defaultValue is an empty array', async () => {
				render(SelectFieldHarness, {
					select: { root: { multiple: true, defaultValue: [] }, items: optionItems }
				});
				await expect.element(trigger()).not.toHaveAttribute('data-filled');
				await openSelect();
				await userEvent.click(option('Option 1'));
				await expect.element(trigger()).toHaveAttribute('data-filled', '');
				await userEvent.click(option('Option 1'));
				await expect.element(trigger()).not.toHaveAttribute('data-filled');
			});
		});

		it('[data-focused]', async () => {
			render(SelectFieldHarness, { select: { items: optionItems } });
			const element = trigger().element();
			await expect.element(trigger()).not.toHaveAttribute('data-focused');
			fire(element, 'focus');
			await expect.element(trigger()).toHaveAttribute('data-focused', '');
			fire(element, 'blur');
			await expect.element(trigger()).not.toHaveAttribute('data-focused');
		});

		describe('[data-focused] without a blur event', () => {
			it('is removed when the focused trigger becomes disabled', async () => {
				const view = render(SelectFieldHarness, {});
				(trigger().element() as HTMLElement).focus();
				await expect.element(field()).toHaveAttribute('data-focused', '');

				await view.rerender({ select: { root: { disabled: true } } });
				await expect.element(field()).not.toHaveAttribute('data-focused');
				await expect.element(trigger()).not.toHaveAttribute('data-focused');
			});

			it('is removed when the focused trigger unmounts', async () => {
				const view = render(SelectFieldHarness, {});
				(trigger().element() as HTMLElement).focus();
				await expect.element(field()).toHaveAttribute('data-focused', '');

				await view.rerender({ mounted: false });
				await expect.element(field()).not.toHaveAttribute('data-focused');
			});
		});

		it('does not mark as touched when focus moves into the popup', async () => {
			const validate = vi.fn(() => 'error');
			render(SelectFieldHarness, {
				field: { validationMode: 'onBlur', validate },
				select: { items: [{ value: '1', text: 'Option 1' }] }
			});
			const element = trigger().element() as HTMLElement;
			fire(element, 'focus');
			await openSelect();
			const list = listbox().element();
			fire(element, 'blur', list);
			fire(list, 'focus');
			await tick();

			expect(validate).not.toHaveBeenCalled();
			await expect.element(trigger()).toHaveAttribute('data-focused', '');
			await expect.element(trigger()).not.toHaveAttribute('data-touched');
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');
		});

		it('validates when the popup is blurred', async () => {
			const validate = vi.fn(() => 'error');
			render(SelectFieldHarness, {
				field: { validationMode: 'onBlur', validate },
				select: { items: [{ value: '1', text: 'Option 1' }] }
			});
			const element = trigger().element() as HTMLElement;
			await openSelect();
			await expect.element(listbox()).toHaveFocus();

			// Upstream fires a synthetic blur. Its earlier trigger blur leaves a queued focus-out
			// check that clears `insideReactTree`, so the popup closes. A real focus move with no
			// press keeps a portaled popup open in upstream, so blur it with Tab.
			await userEvent.tab();

			await expect.element(page.getByTestId('field-outside')).toHaveFocus();
			await expect.poll(() => validate.mock.calls.length).toBe(1);
			await expect.element(trigger()).toHaveAttribute('data-touched', '');
			await expect.element(trigger()).not.toHaveAttribute('data-focused');
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
			expect(element.isConnected).toBe(true);
		});

		it('prop: validate', async () => {
			render(SelectFieldHarness, { field: { validationMode: 'onBlur', validate: () => 'error' } });
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');
			const element = trigger().element();
			fire(element, 'focus');
			fire(element, 'blur');
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
		});

		it('passes the raw value to validate with itemToStringValue', async () => {
			const items = [
				{ code: 'US', label: 'United States' },
				{ code: 'CA', label: 'Canada' }
			];
			const seen: unknown[] = [];
			const validate = vi.fn((value: unknown) => {
				seen.push(value);
				return 'error';
			});
			render(SelectFieldHarness, {
				field: { validationMode: 'onBlur', validate },
				select: {
					root: {
						defaultValue: items[0],
						itemToStringLabel: (item) => (item as (typeof items)[number]).label,
						itemToStringValue: (item) => (item as (typeof items)[number]).code
					}
				}
			});
			const element = trigger().element();
			fire(element, 'focus');
			fire(element, 'blur');
			await expect.poll(() => validate.mock.calls.length).toBe(1);
			expect(seen[0]).toBe(items[0]);
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
		});

		it('validationMode onSubmit', async () => {
			render(SelectFieldHarness, {
				form: {},
				submit: true,
				error: false,
				field: { validate: (value: unknown) => (value === '2' ? 'error' : null) },
				select: {
					root: { required: true },
					items: [
						{ value: '1', text: 'Option 1' },
						{ value: '2', text: 'Option 2' }
					]
				}
			});
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');

			await userEvent.click(page.getByText('Submit', { exact: true }));
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');

			await userEvent.keyboard('{ArrowDown}');
			await expectFocusInPopup();
			await userEvent.keyboard('{Enter}');
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');

			await userEvent.click(trigger());
			await expectFocusInPopup();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');

			await userEvent.click(trigger());
			await expectFocusInPopup();
			await userEvent.keyboard('{ArrowUp}');
			await userEvent.keyboard('{Enter}');
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');
		});

		it('validationMode onChange', async () => {
			render(SelectFieldHarness, {
				field: {
					validationMode: 'onChange',
					validate: (value: unknown) => (value === '1' ? 'error' : null)
				},
				select: { items: [{ value: '1', text: 'Option 1' }] }
			});
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');
			await openSelect();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
		});

		it('revalidates when the bound value changes from outside', async () => {
			const validate = vi.fn((value: unknown) => (value === 'b' ? 'error' : null));
			const view = render(SelectFieldHarness, {
				value: 'a',
				field: { validationMode: 'onChange', validate, name: 'flavor' },
				select: {
					items: [
						{ value: 'a', text: 'Option A' },
						{ value: 'b', text: 'Option B' }
					]
				}
			});
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');
			const initialCalls = validate.mock.calls.length;

			await view.rerender({ value: 'b' });
			await expect.poll(() => validate.mock.calls.length).toBe(initialCalls + 1);
			expect(validate.mock.lastCall?.[0]).toBe('b');
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
		});

		it('validationMode onBlur', async () => {
			render(SelectFieldHarness, {
				field: {
					validationMode: 'onBlur',
					validate: (value: unknown) => (value === '1' ? 'error' : null)
				},
				select: { items: [{ value: '1', text: 'Option 1' }] }
			});
			await expect.element(trigger()).not.toHaveAttribute('aria-invalid');
			await openSelect();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.element(trigger()).toHaveFocus();
			fire(trigger().element(), 'blur');
			await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
		});

		it('Field.Label', async () => {
			render(SelectFieldHarness, { fieldLabel: 'Label', fieldLabelSpan: true });
			const label = page.getByTestId('field-label').element();
			await expect.element(trigger()).toHaveAttribute('aria-labelledby', label.id);
		});

		it('Select.Label', async () => {
			render(SelectHarness, { label: 'Font' });
			const label = page.getByTestId('label').element();
			await expect.element(trigger()).toHaveAttribute('aria-labelledby', label.id);
		});

		it('does not set a fallback aria-labelledby when no label is rendered', async () => {
			render(SelectHarness, { trigger: { 'aria-label': 'Font' } });
			await expect.element(trigger()).not.toHaveAttribute('aria-labelledby');
		});

		it('updates the Select.Label linkage when the root id changes', async () => {
			const view = render(SelectHarness, { label: 'Theme', root: { id: 'first' } });
			await view.rerender({ root: { id: 'second' } });
			await expect.element(trigger()).toHaveAttribute('aria-labelledby', 'second-label');
			await expect.element(trigger()).toHaveAttribute('id', 'second');
			await expect.element(page.getByTestId('label')).toHaveAttribute('id', 'second-label');
		});

		it('Select.Label focuses the trigger without opening', async () => {
			render(SelectHarness, {
				label: 'Font',
				items: [
					{ value: 'sans', text: 'Sans-serif' },
					{ value: 'serif', text: 'Serif' }
				]
			});
			await userEvent.click(page.getByTestId('label'));
			await expect.element(trigger()).toHaveFocus();
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('Field.Label links to the trigger and opens it', async () => {
			render(SelectFieldHarness, {
				fieldLabel: 'Font',
				select: {
					items: [
						{ value: 'sans', text: 'Sans-serif' },
						{ value: 'serif', text: 'Serif' }
					]
				}
			});
			const label = page.getByTestId('field-label').element() as HTMLLabelElement;
			const element = trigger().element();
			expect(label.htmlFor).toBe(element.id);

			await clickLabelAndExpectOpenFocus();
		});

		it('Field.Label links to a trigger with an explicit id', async () => {
			render(SelectFieldHarness, {
				fieldLabel: 'Font',
				select: {
					trigger: { id: 'x-id' },
					items: [
						{ value: 'sans', text: 'Sans-serif' },
						{ value: 'serif', text: 'Serif' }
					]
				}
			});
			const label = page.getByTestId('field-label').element() as HTMLLabelElement;
			await expect.element(trigger()).toHaveAttribute('id', 'x-id');
			expect(label.htmlFor).toBe('x-id');

			await clickLabelAndExpectOpenFocus();
		});

		it('Field.Description', async () => {
			render(SelectFieldHarness, {
				description: 'Help',
				select: { trigger: { 'aria-describedby': 'external-description' } }
			});
			const description = page.getByTestId('description').element();
			await expect
				.element(trigger())
				.toHaveAttribute('aria-describedby', `external-description ${description.id}`);
		});
	});
});
