// Assertions follow Base UI v1.9.0 packages/react/src/autocomplete/root/AutocompleteRoot.test.tsx,
// "prop: submitOnItemClick", "Form" and "Field" (commit
// ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The two cases upstream skips in a real browser (validationMode onChange and onBlur) run here
// too. The renderToString cases render on the server in `ssr.spec.ts`.
// The validation-ref case runs without its Switch, because each control here registers its own
// input and no other control can claim it.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AutocompleteHarness from '../../tests/AutocompleteHarness.svelte';

const input = () => page.getByTestId('input');
const combobox = () => page.getByRole('combobox');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const submitButton = () => page.getByTestId('submit');
const hiddenInput = () => document.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
const optionItems = [
	{ value: '', text: 'Select' },
	{ value: '1', text: 'Option 1' }
];
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};

function fire(target: Element, type: 'focus' | 'blur') {
	target.dispatchEvent(new FocusEvent(type));
	target.dispatchEvent(
		new FocusEvent(type === 'focus' ? 'focusin' : 'focusout', { bubbles: true })
	);
}

/** Records the named entry of each submit, as upstream's `createFormDataSpy`. */
function formDataSpy(name: string) {
	return vi.fn((data: FormData) => data.get(name));
}

/** A `Form` whose native submit records the named entry. */
function spyingForm(name: string) {
	const spy = vi.fn((data: FormData) => data.get(name));
	return {
		spy,
		form: {
			onsubmit: (event: SubmitEvent) => {
				event.preventDefault();
				spy(new FormData(event.currentTarget as HTMLFormElement));
			}
		}
	};
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

describe('Autocomplete.Root', () => {
	describe('prop: submitOnItemClick', () => {
		it('does not submit on Enter with a highlighted item by default', async () => {
			const onsubmit = formDataSpy('search');
			render(AutocompleteHarness, {
				nativeForm: true,
				onsubmit,
				field: { name: 'search' },
				items: ['apple', 'banana'],
				root: { autoHighlight: true }
			});

			await userEvent.click(combobox());
			await userEvent.type(combobox(), 'a');
			await expect.element(option('apple')).toHaveAttribute('data-highlighted');
			await userEvent.keyboard('{Enter}');

			expect(onsubmit).not.toHaveBeenCalled();
		});

		it('submits the owning form when an item is clicked', async () => {
			const onsubmit = formDataSpy('q');
			render(AutocompleteHarness, {
				nativeForm: true,
				onsubmit,
				field: { name: 'q' },
				items: ['alpha', 'alpine'],
				root: { submitOnItemClick: true }
			});

			await userEvent.type(combobox(), 'al');
			await userEvent.click(option('alpha'));

			expect(onsubmit).toHaveBeenCalledTimes(1);
			expect(onsubmit.mock.results.at(-1)?.value).toBe('alpha');
		});

		it('submits the input form of an autocomplete without a field', async () => {
			const onsubmit = vi.fn();
			render(AutocompleteHarness, {
				nativeForm: true,
				onsubmit,
				staticItems: [{ value: 'alpha' }],
				root: { submitOnItemClick: true }
			});

			await userEvent.type(combobox(), 'a');
			await userEvent.click(option('alpha'));

			expect(onsubmit).toHaveBeenCalledTimes(1);
		});

		it('submits the owning form on Enter with a highlighted item', async () => {
			const onsubmit = formDataSpy('q');
			render(AutocompleteHarness, {
				nativeForm: true,
				onsubmit,
				field: { name: 'q' },
				items: ['alpha', 'alpine'],
				root: { submitOnItemClick: true }
			});

			await userEvent.type(combobox(), 'al');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');

			await userEvent.keyboard('{Enter}');

			expect(onsubmit).toHaveBeenCalledTimes(1);
			expect(onsubmit.mock.results.at(-1)?.value).toBe('alpha');
		});

		it('submits an external form named by `form` when an item is clicked', async () => {
			const submitted: FormDataEntryValue[] = [];
			const external = withExternalForm('external-form', (data) => {
				submitted.push(data.get('q')!);
			});
			try {
				render(AutocompleteHarness, {
					items: ['alpha', 'alpine'],
					root: { name: 'q', form: 'external-form', submitOnItemClick: true }
				});

				await userEvent.type(combobox(), 'al');
				await userEvent.click(option('alpha'));

				expect(submitted).toEqual(['alpha']);
			} finally {
				external.remove();
			}
		});

		it('keeps focus on the input when the listbox is focused, and Enter still submits', async () => {
			const onsubmit = formDataSpy('q');
			render(AutocompleteHarness, {
				nativeForm: true,
				onsubmit,
				field: { name: 'q' },
				items: ['alpha', 'alpine'],
				root: { submitOnItemClick: true }
			});

			await userEvent.type(combobox(), 'al');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');

			(page.getByRole('listbox').element() as HTMLElement).focus();
			await expect.element(combobox()).toHaveFocus();

			await userEvent.keyboard('{Enter}');

			expect(onsubmit).toHaveBeenCalledTimes(1);
			expect(onsubmit.mock.results.at(-1)?.value).toBe('alpha');
		});
	});

	describe('Form', () => {
		it('submits the typed text when wrapped in Field.Root', async () => {
			const { spy, form } = spyingForm('search');
			render(AutocompleteHarness, {
				form,
				submit: true,
				field: { name: 'search' },
				popupLess: true
			});

			await userEvent.type(input(), 'hello world');
			await userEvent.click(submitButton());

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.results.at(-1)?.value).toBe('hello world');
		});

		it('puts the field name on the input and submits the typed text', async () => {
			const { spy, form } = spyingForm('query');
			render(AutocompleteHarness, {
				form,
				submit: true,
				field: { name: 'query' },
				staticItems: [{ value: 'base-ui' }]
			});

			await userEvent.type(combobox(), 'base ui');

			await expect
				.element(combobox(), { message: 'input carries the name' })
				.toHaveAttribute('name', 'query');
			await expect.element(combobox()).toHaveValue('base ui');

			await userEvent.click(submitButton());

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.results.at(-1)?.value).toBe('base ui');
		});

		it('submits the popup input text through the hidden input with a field-aware input', async () => {
			const { spy, form } = spyingForm('search');
			render(AutocompleteHarness, {
				form,
				submit: true,
				field: { name: 'search' },
				items: ['alpha', 'alpine'],
				inputInside: true,
				fieldAwareInput: true
			});

			await userEvent.click(combobox());
			await expect.element(input()).toBeInTheDocument();
			await expect.element(input()).not.toHaveAttribute('name');

			await userEvent.click(option('alpha'));
			await expect.element(combobox()).toHaveTextContent('alpha');

			await userEvent.click(submitButton());

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.results.at(-1)?.value).toBe('alpha');
		});

		it('submits the text of an inline list input', async () => {
			const { spy, form } = spyingForm('search');
			render(AutocompleteHarness, {
				form,
				submit: true,
				field: { name: 'search' },
				items: ['alpha', 'alpine'],
				inline: true
			});

			await expect.element(input()).toHaveAttribute('name', 'search');
			expect(hiddenInput().hasAttribute('name')).toBe(false);

			await userEvent.type(input(), 'alp');
			await userEvent.click(submitButton());

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.results.at(-1)?.value).toBe('alp');
		});

		it('submits a default popup input text before the popup opens', async () => {
			const { spy, form } = spyingForm('search');
			render(AutocompleteHarness, {
				form,
				submit: true,
				field: { name: 'search' },
				items: ['alpha', 'alpine'],
				inputInside: true,
				fieldAwareInput: true,
				root: { defaultValue: 'alpha' }
			});

			await userEvent.click(submitButton());

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.results.at(-1)?.value).toBe('alpha');
		});

		it('submits to an external form named by `form`', async () => {
			const submitted: FormDataEntryValue[] = [];
			const external = withExternalForm('external-form', (data) => {
				submitted.push(data.get('query')!);
			});
			try {
				render(AutocompleteHarness, {
					popupLess: true,
					root: { name: 'query', form: 'external-form' }
				});

				await userEvent.type(input(), 'base ui');
				external.button.click();

				expect(submitted).toEqual(['base ui']);
			} finally {
				external.remove();
			}
		});

		it('shows the valueMissing error when required and empty', async () => {
			render(AutocompleteHarness, {
				form: {},
				submit: true,
				popupLess: true,
				field: { name: 'auto' },
				errorMatch: 'valueMissing',
				errorText: 'required',
				root: { required: true }
			});
			await expect.element(page.getByTestId('error')).not.toBeInTheDocument();

			await userEvent.click(submitButton());

			await expect.element(page.getByTestId('error')).toHaveTextContent('required');
		});

		it('clears external errors on change', async () => {
			render(AutocompleteHarness, {
				form: { errors: { autocomplete: 'test' } },
				field: { name: 'autocomplete' },
				staticItems: [{ value: 'a' }, { value: 'b' }]
			});

			await expect.element(page.getByTestId('error')).toHaveTextContent('test');
			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');

			await userEvent.type(input(), 'test input');
			await flush();

			await expect.element(page.getByTestId('error')).not.toBeInTheDocument();
			await expect.element(input()).not.toHaveAttribute('aria-invalid');
		});

		it('submits the input text, not an item value', async () => {
			const { spy, form } = spyingForm('search');
			render(AutocompleteHarness, {
				form,
				submit: true,
				field: { name: 'search' },
				staticItems: [{ value: 'apple' }, { value: 'banana' }]
			});

			await userEvent.type(input(), 'appl');
			await userEvent.click(submitButton());

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.results.at(-1)?.value).toBe('appl');
		});

		it('submits on Enter when no item is highlighted', async () => {
			const { spy, form } = spyingForm('search');
			render(AutocompleteHarness, {
				form,
				submit: true,
				field: { name: 'search' },
				items: ['alpha', 'beta'],
				root: { openOnInputClick: true }
			});

			await userEvent.click(combobox());
			await expect.element(page.getByRole('listbox')).toBeVisible();
			await userEvent.keyboard('{Enter}');

			expect(spy).toHaveBeenCalledTimes(1);
		});

		it('submits the typed text on Enter with submitOnItemClick and no highlight', async () => {
			const { spy, form } = spyingForm('q');
			render(AutocompleteHarness, {
				form,
				submit: true,
				field: { name: 'q' },
				items: ['alpha', 'alpine'],
				root: { submitOnItemClick: true }
			});

			await userEvent.type(combobox(), 'xyz');
			await userEvent.keyboard('{Enter}');

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.results.at(-1)?.value).toBe('xyz');
		});

		it('submits on Enter while the list has focus', async () => {
			const { spy, form } = spyingForm('q');
			render(AutocompleteHarness, {
				form,
				field: { name: 'q' },
				items: ['alpha', 'alpine'],
				root: { submitOnItemClick: true }
			});

			await userEvent.type(combobox(), 'al');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');

			(page.getByRole('listbox').element() as HTMLElement).focus();
			await userEvent.keyboard('{Enter}');

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.results.at(-1)?.value).toBe('alpha');
		});
	});

	describe('Field', () => {
		it('sets `required` on the visible input', async () => {
			render(AutocompleteHarness, { field: {}, popupLess: true, root: { required: true } });

			await expect.element(input()).toHaveAttribute('required');
		});

		it('[data-touched]', async () => {
			render(AutocompleteHarness, { field: {}, staticItems: optionItems });
			await expect.element(input()).not.toHaveAttribute('data-touched');

			fire(input().element(), 'focus');
			fire(input().element(), 'blur');
			await flush();

			await expect.element(input()).toHaveAttribute('data-touched', '');
		});

		it('[data-dirty]', async () => {
			render(AutocompleteHarness, { field: {}, staticItems: optionItems });
			await expect.element(input()).not.toHaveAttribute('data-dirty');

			await userEvent.type(input(), 'test');

			await expect.element(input()).toHaveAttribute('data-dirty', '');
		});

		describe('[data-filled]', () => {
			it('adds [data-filled] once the input has text', async () => {
				render(AutocompleteHarness, { field: {}, staticItems: optionItems });
				await expect.element(input()).not.toHaveAttribute('data-filled');

				await userEvent.type(input(), 'test input');

				await expect.element(input()).toHaveAttribute('data-filled', '');
			});

			it('adds [data-filled] when filled from defaultValue', async () => {
				render(AutocompleteHarness, {
					field: {},
					staticItems: [{ value: '1', text: 'Option 1' }],
					root: { defaultValue: 'initial value' }
				});

				await expect.element(input()).toHaveAttribute('data-filled');
			});
		});

		it('[data-focused]', async () => {
			render(AutocompleteHarness, { field: {}, staticItems: optionItems });
			await expect.element(input()).not.toHaveAttribute('data-focused');

			fire(input().element(), 'focus');
			await expect.element(input()).toHaveAttribute('data-focused', '');

			fire(input().element(), 'blur');
			await expect.element(input()).not.toHaveAttribute('data-focused');
		});

		it('[data-invalid]', async () => {
			render(AutocompleteHarness, {
				field: { invalid: true },
				staticItems: [{ value: '1', text: 'Option 1' }]
			});

			await expect.element(input()).toHaveAttribute('data-invalid', '');
		});

		it('[data-valid]', async () => {
			render(AutocompleteHarness, {
				field: { validationMode: 'onBlur' },
				staticItems: [{ value: '1', text: 'Option 1' }],
				root: { required: true }
			});
			await expect.element(combobox()).not.toHaveAttribute('data-valid');
			await expect.element(combobox()).not.toHaveAttribute('data-invalid');

			await userEvent.type(combobox(), 'ok');
			(combobox().element() as HTMLElement).blur();

			await expect.element(combobox()).toHaveAttribute('data-valid', '');
			await expect.element(combobox()).not.toHaveAttribute('data-invalid');
		});

		it('prop: validate', async () => {
			render(AutocompleteHarness, {
				field: { validationMode: 'onBlur', validate: () => 'error' },
				popupLess: true
			});
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			fire(input().element(), 'focus');
			fire(input().element(), 'blur');

			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');
		});

		it('prop: validationMode=onSubmit', async () => {
			render(AutocompleteHarness, {
				form: {},
				submit: true,
				field: { validate: (value: unknown) => (value === 'one' ? 'error' : null) },
				staticItems: [
					{ value: 'one', text: 'Option 1' },
					{ value: 'two', text: 'Option 2' }
				],
				root: { required: true }
			});
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			await userEvent.click(submitButton());
			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');

			await userEvent.type(input(), 'two');
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			await userEvent.clear(input());
			await userEvent.type(input(), 'one');
			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');

			await userEvent.clear(input());
			await userEvent.type(input(), 'three');
			await expect.element(input()).not.toHaveAttribute('aria-invalid');
		});

		it('prop: validationMode=onChange', async () => {
			render(AutocompleteHarness, {
				field: {
					validationMode: 'onChange',
					validate: (value: unknown) => (value === 'invalid' ? 'error' : null)
				},
				staticItems: [{ value: 'valid', text: 'Valid Option' }]
			});
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			await userEvent.type(input(), 'invalid');

			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');
		});

		it('prop: validationMode=onBlur', async () => {
			render(AutocompleteHarness, {
				field: {
					validationMode: 'onBlur',
					validate: (value: unknown) => (value === 'invalid' ? 'error' : null)
				},
				staticItems: [{ value: 'valid', text: 'Valid Option' }]
			});
			await expect.element(input()).not.toHaveAttribute('aria-invalid');

			await userEvent.type(input(), 'invalid');
			fire(input().element(), 'blur');

			await expect.element(input()).toHaveAttribute('aria-invalid', 'true');
		});

		it('Field.Label', async () => {
			render(AutocompleteHarness, {
				field: {},
				fieldLabel: 'Search',
				fieldLabelSpan: true,
				popupLess: true
			});

			await expect
				.element(input())
				.toHaveAttribute('aria-labelledby', page.getByTestId('field-label').element().id);
		});

		it('Field.Description', async () => {
			render(AutocompleteHarness, { field: {}, description: 'Help', popupLess: true });

			await expect
				.element(input())
				.toHaveAttribute('aria-describedby', page.getByTestId('description').element().id);
		});
	});
});
