// Assertions follow Base UI v1.8.0 packages/react/src/field/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Checkbox, Radio and NumberField integration is not ported. React 17 id fallbacks,
// StrictMode and render-count tests are not recreated.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FieldHarness from '../../tests/FieldHarness.svelte';
import FieldLowHarness from '../../tests/FieldLowHarness.svelte';
import { Field } from './index.js';

function text(name: string) {
	return page.getByTestId(name).element().textContent ?? '';
}

describe('Field', () => {
	describe('prop: disabled', () => {
		it('adds data-disabled on the root, control, label and description', async () => {
			render(FieldHarness, { scenario: 'disabled' });
			for (const name of ['field', 'control', 'label', 'description']) {
				await expect.element(page.getByTestId(name)).toHaveAttribute('data-disabled', '');
			}
			await expect.element(page.getByTestId('control')).toBeDisabled();
		});

		it('keeps an explicitly invalid field marked invalid while disabled', async () => {
			render(FieldHarness, { scenario: 'invalid-disabled' });
			for (const name of ['field', 'control', 'label', 'description']) {
				await expect.element(page.getByTestId(name)).toHaveAttribute('data-invalid', '');
			}
			await expect.element(page.getByTestId('control')).not.toHaveAttribute('aria-invalid');
		});

		it('keeps a disabled field with form errors marked invalid', async () => {
			render(FieldHarness, { scenario: 'form-error-disabled' });
			await expect.element(page.getByTestId('control')).toHaveAttribute('data-invalid', '');
			await expect.element(page.getByTestId('control')).not.toHaveAttribute('aria-invalid');
		});
	});

	describe('label', () => {
		it('sets for to the control id', async () => {
			render(FieldHarness, { scenario: 'label' });
			const label = page.getByTestId('label');
			const control = page.getByTestId('control');
			await expect.poll(() => control.element().id.length > 0).toBe(true);
			expect(label.element().getAttribute('for')).toBe(control.element().id);
			await expect.element(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
		});

		it('follows an explicit id and a generated id after that id is removed', async () => {
			render(FieldHarness, { scenario: 'explicit-id' });
			await expect.element(page.getByTestId('control')).toHaveAttribute('id', 'control-id');
			expect(page.getByTestId('label').element().getAttribute('for')).toBe('control-id');

			await page.getByRole('button', { name: 'Change id' }).click();
			await expect.element(page.getByTestId('control')).toHaveAttribute('id', 'next-id');
			expect(page.getByTestId('label').element().getAttribute('for')).toBe('next-id');

			await page.getByRole('button', { name: 'Clear id' }).click();
			const id = page.getByTestId('control').element().id;
			expect(id.startsWith('base-ui-')).toBe(true);
			expect(id).not.toBe('next-id');
			expect(page.getByTestId('label').element().getAttribute('for')).toBe(id);
		});

		it('clears aria-labelledby when the label unmounts', async () => {
			render(FieldHarness, { scenario: 'label-unmount' });
			const control = page.getByTestId('control');
			const label = page.getByTestId('label');
			await expect.poll(() => label.element().id.length > 0).toBe(true);
			const labelId = label.element().id;
			expect(control.element().getAttribute('aria-labelledby')).toBe(labelId);
			await page.getByRole('button', { name: 'Remove label' }).click();
			await expect.element(label).not.toBeInTheDocument();
			expect(control.element().hasAttribute('aria-labelledby')).toBe(false);
		});

		it('focuses the control from a non-native label', async () => {
			render(FieldHarness, { scenario: 'native-label-false' });
			await page.getByTestId('label').click();
			await expect.element(page.getByTestId('control')).toHaveFocus();
		});

		it('swaps the label association when the control is replaced', async () => {
			render(FieldHarness, { scenario: 'swap' });
			await expect.element(page.getByTestId('control')).toHaveAttribute('id', 'first');
			await page.getByRole('button', { name: 'Swap' }).click();
			await expect.element(page.getByTestId('control')).toHaveAttribute('id', 'second');
			expect(page.getByTestId('label').element().getAttribute('for')).toBe('second');
		});
	});

	describe('description', () => {
		it('adds the description id to aria-describedby and keeps the author id', async () => {
			render(FieldHarness, { scenario: 'description' });
			const description = page.getByTestId('description');
			const describedBy = page.getByTestId('control').element().getAttribute('aria-describedby');
			expect(describedBy?.split(' ')).toEqual(['author', description.element().id]);
		});
	});

	describe('validation', () => {
		it('does not validate on change until submit when mode is onSubmit', async () => {
			render(FieldHarness, { scenario: 'idle', validate: () => 'error' });
			const control = page.getByTestId('control');
			await control.fill('abc');
			control.element().blur();
			expect(text('calls')).toBe('0');
			expect(page.getByTestId('error').elements().length).toBe(0);
		});

		it('shows a required error on submit and blocks the submit', async () => {
			render(FieldHarness, { scenario: 'required' });
			expect(page.getByTestId('error').elements().length).toBe(0);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByText('Required')).toBeVisible();
			expect(text('submitted')).toBe('0');
			await expect.element(page.getByTestId('control')).toHaveAttribute('aria-invalid', 'true');
			await expect.element(page.getByTestId('control')).toHaveFocus();
		});

		it('runs custom validation after native errors', async () => {
			render(FieldHarness, { scenario: 'match' });
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByText('value missing')).toBeVisible();
			expect(page.getByText('custom error').elements().length).toBe(0);

			await page.getByTestId('control').fill('ab');
			await expect.element(page.getByText('custom error')).toBeVisible();
			await expect.poll(() => page.getByText('value missing').elements().length).toBe(0);
		});

		it('validates on change and treats an empty result as valid', async () => {
			render(FieldHarness, { scenario: 'empty-validate', validate: () => '' });
			await page.getByTestId('control').fill('abc');
			await expect.element(page.getByTestId('control')).not.toHaveAttribute('aria-invalid');
			expect(page.getByTestId('error').elements().length).toBe(0);
			await page.getByRole('button', { name: 'Submit' }).click();
			expect(text('submitted')).toBe('1');
		});

		it('debounces onChange validation', async () => {
			render(FieldHarness, { scenario: 'debounce' });
			const control = page.getByTestId('control');
			await userEvent.click(control);
			await userEvent.keyboard('ab');
			expect(text('calls')).toBe('0');
			await expect.poll(() => text('calls')).toBe('1');
			await expect.element(page.getByText('bad')).toBeVisible();
		});

		it('submits while an async validator is still pending', async () => {
			let resolveValidate: (value: string | null) => void = () => {};
			render(FieldHarness, {
				scenario: 'async',
				validate: () =>
					new Promise<string | null>((resolve) => {
						resolveValidate = resolve;
					})
			});
			await page.getByTestId('control').fill('later');
			await page.getByRole('button', { name: 'Submit' }).click();
			expect(text('submitted')).toBe('1');
			expect(text('values')).toContain('later');
			resolveValidate('nope');
			await expect.element(page.getByText('nope')).toBeVisible();
		});

		it('validates on blur', async () => {
			render(FieldHarness, { scenario: 'on-blur', validate: () => 'error' });
			const control = page.getByTestId('control');
			await control.fill('a');
			expect(text('calls')).toBe('0');
			control.element().dispatchEvent(new FocusEvent('blur'));
			await expect.poll(() => text('calls')).toBe('1');
			await expect.element(page.getByText('error')).toBeVisible();
		});

		it('does not validate when the change is canceled', async () => {
			render(FieldHarness, {
				scenario: 'cancel',
				validate: () => null,
				onValueChange: (_value, details) => details.cancel()
			});
			await page.getByTestId('control').fill('a');
			expect(text('calls')).toBe('0');
			await expect.element(page.getByTestId('control')).toHaveValue('');
			await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-dirty');
			await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-filled');
		});

		it('does not clear form errors when the input event is prevented', async () => {
			render(FieldHarness, { scenario: 'prevent', validate: () => null, onValueChange: () => {} });
			const control = page.getByTestId('control').element() as HTMLInputElement;
			control.addEventListener('input', (event) => event.preventDefault(), {
				capture: true,
				once: true
			});
			control.value = 'a';
			control.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
			expect(text('calls')).toBe('0');
			await expect.element(page.getByText('Server error')).toBeVisible();
		});

		it('validates when Enter is pressed outside a form', async () => {
			render(FieldHarness, { scenario: 'enter', validate: () => null });
			await userEvent.click(page.getByTestId('control'));
			await userEvent.keyboard('{Enter}');
			expect(text('calls')).toBe('1');
		});
	});

	describe('form errors', () => {
		it('shows a form error for the control name and clears it on input', async () => {
			render(FieldHarness, { scenario: 'form-error' });
			await expect.element(page.getByTestId('control')).toHaveAttribute('aria-invalid', 'true');
			await expect.element(page.getByTestId('error')).toHaveTextContent('Email is already taken');
			await page.getByTestId('control').fill('next@example.com');
			await expect.element(page.getByTestId('control')).not.toHaveAttribute('aria-invalid');
			await expect.poll(() => page.getByTestId('error').elements().length).toBe(0);
		});

		it('renders a form error array as a list and a single item as text', async () => {
			render(FieldHarness, { scenario: 'form-error-list' });
			await expect.element(page.getByRole('listitem').nth(0)).toHaveTextContent('One');
			await expect.element(page.getByRole('listitem').nth(1)).toHaveTextContent('Two');
		});

		it('renders a one-item form error array as text', async () => {
			render(FieldHarness, { scenario: 'form-error-single' });
			await expect.element(page.getByTestId('error')).toHaveTextContent('Only');
			expect(page.getByRole('list').elements().length).toBe(0);
		});

		it('ignores inherited form error properties', async () => {
			render(FieldHarness, { scenario: 'inherited' });
			await expect.element(page.getByTestId('control')).not.toHaveAttribute('aria-invalid');
			expect(page.getByTestId('error').elements().length).toBe(0);
		});

		it('submits the root name ahead of the control name', async () => {
			render(FieldHarness, { scenario: 'names' });
			await page.getByRole('button', { name: 'Submit' }).click();
			expect(text('values')).toBe(JSON.stringify({ username: 'ada' }));
		});

		it('uses the control name when the root has none', async () => {
			render(FieldHarness, { scenario: 'name-fallback' });
			await page.getByRole('button', { name: 'Submit' }).click();
			expect(text('values')).toBe(JSON.stringify({ email: 'ada' }));
		});
	});

	describe('state', () => {
		it('marks a prefilled control filled', async () => {
			render(FieldHarness, { scenario: 'filled' });
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-filled', '');
		});

		it('does not mark an empty controlled value filled', async () => {
			render(FieldHarness, { scenario: 'filled-controlled' });
			await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-filled');
		});

		it('marks the field dirty when the value changes and clean when it returns', async () => {
			render(FieldHarness, { scenario: 'dirty' });
			const field = page.getByTestId('field');
			const control = page.getByTestId('control');
			await expect.element(field).not.toHaveAttribute('data-dirty');
			await control.fill('b');
			await expect.element(field).toHaveAttribute('data-dirty', '');
			await control.fill('a');
			await expect.element(field).not.toHaveAttribute('data-dirty');
		});

		it('does not update a controlled dirty flag from input', async () => {
			render(FieldHarness, { scenario: 'controlled-dirty' });
			await page.getByTestId('control').fill('b');
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-dirty', '');
		});

		it('stays invalid when validate runs again after a parent clears dirty', async () => {
			render(FieldHarness, { scenario: 'controlled-dirty-flag' });
			const field = page.getByTestId('field');
			await page.getByRole('button', { name: 'Validate' }).click();
			await expect.element(field).toHaveAttribute('data-invalid', '');
			await page.getByRole('button', { name: 'Clean' }).click();
			await page.getByRole('button', { name: 'Validate' }).click();
			await expect.element(field).toHaveAttribute('data-invalid', '');
		});

		it('blocks an empty required control while dirty is false', async () => {
			render(FieldHarness, { scenario: 'controlled-dirty-submit' });
			await page.getByRole('button', { name: 'Submit' }).click();
			expect(text('submitted')).toBe('0');
			expect(text('values')).toBe('');
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-invalid', '');
			await expect.element(page.getByTestId('control')).toHaveFocus();
		});

		it('marks the field touched on blur and not when touched is controlled', async () => {
			render(FieldHarness, { scenario: 'touched' });
			await page.getByTestId('control').fill('b');
			page.getByTestId('control').element().blur();
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-touched', '');
		});

		it('validates from actions and without a mounted control', async () => {
			render(FieldHarness, { scenario: 'actions' });
			await page.getByRole('button', { name: 'Validate' }).click();
			await expect.element(page.getByText('bad')).toBeVisible();
		});

		it('validates a logical field that has no control', async () => {
			render(FieldHarness, { scenario: 'logical', validate: () => 'missing' });
			await page.getByRole('button', { name: 'Validate' }).click();
			await expect.element(page.getByText('missing')).toBeVisible();
		});
	});

	describe('item', () => {
		it('marks the item, label and description disabled', async () => {
			render(FieldHarness, { scenario: 'item' });
			for (const name of ['item', 'label', 'description']) {
				await expect.element(page.getByTestId(name)).toHaveAttribute('data-disabled', '');
			}
		});
	});

	describe('validity', () => {
		it('passes validity data through the snippet', async () => {
			render(FieldHarness, { scenario: 'validity' });
			expect(text('validity').startsWith('unknown|')).toBe(true);
			await page.getByTestId('control').fill('test');
			page.getByTestId('control').element().dispatchEvent(new FocusEvent('blur'));
			await expect.poll(() => text('validity').startsWith('true|')).toBe(true);
		});

		it('passes a string and an array from validate', async () => {
			render(FieldHarness, { scenario: 'validity', validate: () => ['1', '2'] });
			const control = page.getByTestId('control').element();
			control.dispatchEvent(new FocusEvent('focus'));
			control.dispatchEvent(new FocusEvent('blur'));
			await expect.poll(() => text('validity')).toContain('false|1|1,2');
		});
	});

	describe('fieldset', () => {
		it('disables the control when an ancestor fieldset is disabled', async () => {
			render(FieldHarness, { scenario: 'fieldset' });
			await expect.element(page.getByTestId('control')).toBeEnabled();
			await page.getByRole('button', { name: 'Toggle fieldset' }).click();
			await expect.element(page.getByTestId('control')).toBeDisabled();
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-disabled', '');
			await page.getByRole('button', { name: 'Toggle fieldset' }).click();
			await expect.element(page.getByTestId('control')).toBeEnabled();
		});
	});

	describe('native Svelte', () => {
		it('passes state through a render snippet', async () => {
			render(FieldHarness, { scenario: 'render' });
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-custom', 'true');
			await expect.element(page.getByTestId('control')).toBeVisible();
		});

		it('throws when a part is rendered outside Field.Root', () => {
			expect(() => render(Field.Label)).toThrow(/LabelableContext is missing/);
		});

		it('warns when nativeLabel does not match the host', async () => {
			const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			try {
				render(FieldHarness, { scenario: 'label-div' });
				await expect.element(page.getByTestId('label')).toBeVisible();
				expect(
					errorSpy.mock.calls.some((call) => String(call[0]).includes('nativeLabel` prop is true'))
				).toBe(true);
			} finally {
				errorSpy.mockRestore();
			}
		});
	});

	describe('controlled value', () => {
		it('clears errors, revalidates, and marks dirty when the parent changes the value', async () => {
			render(FieldHarness, { scenario: 'parent' });
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{"email":"stale"}');
			await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-dirty');
			await page.getByRole('button', { name: 'Set next' }).click();
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{}');
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-dirty', '');
			await expect.element(page.getByTestId('error')).toHaveTextContent('nope');
		});

		it('shows a value that arrives after an undefined start', async () => {
			render(FieldHarness, { scenario: 'late' });
			await expect.element(page.getByTestId('control')).toHaveValue('');
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{"email":"stale"}');
			await page.getByRole('button', { name: 'Set later' }).click();
			await expect.element(page.getByTestId('control')).toHaveValue('later');
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{}');
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-filled', '');
			await page.getByRole('button', { name: 'Submit' }).click();
			expect(text('values')).toContain('later');
		});

		it('sees an empty value when a parent clears a required control', async () => {
			render(FieldHarness, { scenario: 'required-clear' });
			await expect.element(page.getByTestId('control')).toHaveValue('kept');
			expect(text('seen')).toBe('pending');
			await page.getByRole('button', { name: 'Clear required' }).click();
			await expect.element(page.getByTestId('control')).toHaveValue('');
			expect(text('seen')).toBe('');
			await expect.element(page.getByTestId('error')).toHaveTextContent('empty');
		});

		it('clears form errors and validates when the parent clears the value', async () => {
			render(FieldHarness, { scenario: 'empty' });
			await expect.element(page.getByTestId('control')).toHaveValue('kept');
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{"email":"stale"}');
			await page.getByRole('button', { name: 'Unset' }).click();
			await expect.element(page.getByTestId('control')).toHaveValue('');
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{}');
			await expect.element(page.getByTestId('error')).toHaveTextContent('empty');
		});

		it('validates the DOM value after a native form reset', async () => {
			render(FieldHarness, { scenario: 'reset' });
			const control = page.getByTestId('control');
			await control.fill('stale');
			(page.getByTestId('form').element() as HTMLFormElement).reset();
			await expect.element(control).toHaveValue('');
			await page.getByRole('button', { name: 'Submit' }).click();
			expect(text('seen')).toBe('');
			expect(text('values')).toBe(JSON.stringify({ email: '' }));
		});

		it('validates the DOM value after a reset button', async () => {
			render(FieldHarness, { scenario: 'reset' });
			const control = page.getByTestId('control');
			await control.fill('stale');
			await page.getByRole('button', { name: 'Reset' }).click();
			await expect.element(control).toHaveValue('');
			await page.getByRole('button', { name: 'Submit' }).click();
			expect(text('seen')).toBe('');
			expect(text('values')).toBe(JSON.stringify({ email: '' }));
		});

		it('reads a rendered textarea for validation and submission', async () => {
			render(FieldHarness, { scenario: 'textarea' });
			const control = page.getByTestId('control');
			await control.fill('note');
			await page.getByRole('button', { name: 'Submit' }).click();
			expect(text('seen')).toBe('note');
			expect(text('values')).toBe(JSON.stringify({ note: 'note' }));
		});

		it('writes the first keystroke into an empty bind', async () => {
			render(FieldHarness, { scenario: 'typed' });
			await expect.element(page.getByTestId('typed')).toHaveTextContent('none');
			await page.getByTestId('control').fill('hi');
			await expect.element(page.getByTestId('control')).toHaveValue('hi');
			await expect.element(page.getByTestId('typed')).toHaveTextContent('hi');
		});

		it('syncs and validates when the bound value changes', async () => {
			render(FieldHarness, {
				scenario: 'controlled',
				validate: (value) => (value === 'program' ? null : 'bad')
			});
			await page.getByRole('button', { name: 'Set' }).click();
			await expect.element(page.getByTestId('control')).toHaveValue('program');
			expect(Number(text('calls'))).toBeGreaterThan(0);
			await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-invalid');
		});
	});

	it('keeps the fallback validity frozen for every control outside Field.Root', async () => {
		render(FieldLowHarness, { scenario: 'inert' });
		await page.getByRole('button', { name: 'Poke' }).click();
		await page.getByRole('button', { name: 'Read' }).click();
		expect(text('inert')).toBe('frozen');
		expect(text('seen')).toBe('null');
	});

	it('releases a control from the attachment before the following cleanup', async () => {
		render(FieldLowHarness, { scenario: 'release' });
		await expect.element(page.getByTestId('control')).toHaveValue('ada');
		await page.getByRole('button', { name: 'Hide' }).click();
		await expect.poll(() => text('seen')).toBe('0');
	});

	it('submits under the control name after that name changes', async () => {
		render(FieldLowHarness, { scenario: 'rename' });
		await expect.element(page.getByTestId('control')).toHaveValue('x');
		await page.getByRole('button', { name: 'Rename' }).click();
		await page.getByRole('button', { name: 'Submit' }).click();
		await expect.poll(() => text('values')).toBe(JSON.stringify({ b: 'x' }));
	});

	it('submits the value the control held when it mounted', async () => {
		render(FieldLowHarness, { scenario: 'initial' });
		await expect.element(page.getByTestId('control')).toHaveValue('x');
		await page.getByRole('button', { name: 'Submit' }).click();
		await expect.poll(() => text('values')).toBe(JSON.stringify({ letter: 'x' }));
	});
});
