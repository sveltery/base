// Assertions follow Base UI v1.8.0 packages/react/src/form/Form.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The disabled Fieldset cases follow Base UI v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// Checkbox and Switch cases are in src/lib/field/choice-controls.svelte.spec.ts. Registry cases drive Form's
// own submit, focus and validate behavior through the field-registration contract.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormAttachHarness from '../../tests/FormAttachHarness.svelte';
import FormFieldsetHarness from '../../tests/FormFieldsetHarness.svelte';
import FormRegistryHarness from '../../tests/FormRegistryHarness.svelte';
import Form from './Form.svelte';
import { comesBeforeInSameTree } from './document-order.js';

function output(name: string) {
	return page.getByTestId(name).element().textContent ?? '';
}

describe('Form', () => {
	function formElement() {
		const form = document.querySelector('form');
		if (!form) throw new Error('expected a form');
		return form;
	}

	describe('prop: novalidate', () => {
		// Sveltery: the browser's constraint check is the submit gate, so it stays on by default.
		it('leaves native validation on by default', async () => {
			render(Form);
			expect(formElement().hasAttribute('novalidate')).toBe(false);
		});

		it('turns native validation off when novalidate is true', async () => {
			render(Form, { novalidate: true });
			expect(formElement().hasAttribute('novalidate')).toBe(true);
		});
	});

	describe('submit', () => {
		it('does not submit when a registered field is invalid and focuses the first input', async () => {
			const select = vi.spyOn(HTMLInputElement.prototype, 'select');
			try {
				render(FormRegistryHarness, { scenario: 'blocked' });
				await page.getByRole('button', { name: 'Submit' }).click();

				expect(output('values')).toBe('');
				expect(output('calls')).toBe(JSON.stringify(['custom', 'native-field']));
				await expect.element(page.getByTestId('custom')).toHaveFocus();
				expect(select).toHaveBeenCalledTimes(1);
			} finally {
				select.mockRestore();
			}
		});

		it('focuses a textarea without selecting its text', async () => {
			const select = vi.spyOn(HTMLInputElement.prototype, 'select');
			try {
				render(FormRegistryHarness, { scenario: 'textarea' });
				await page.getByRole('button', { name: 'Submit' }).click();

				expect(output('values')).toBe('');
				await expect.element(page.getByTestId('custom')).toHaveFocus();
				expect(select).not.toHaveBeenCalled();
			} finally {
				select.mockRestore();
			}
		});

		it('focuses the first invalid control in document order after a keyed reorder', async () => {
			render(FormRegistryHarness, { scenario: 'document-order' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('a')).toHaveFocus();

			await page.getByRole('button', { name: 'Reorder' }).click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('b')).toHaveFocus();
		});

		// Sveltery: an input in another shadow root belongs to no form, so the browser's constraint
		// check, which is the submit gate, never sees it.
		it('submits past invalid controls in other shadow roots', async () => {
			render(FormRegistryHarness, { scenario: 'shadow' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(page.getByTestId('a').element().getRootNode()).not.toBe(document);
			expect(output('values')).toBe('{}');
		});

		it('validates every field before the submit listener reads the form data', async () => {
			render(FormRegistryHarness, { scenario: 'values' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('values')).toBe(JSON.stringify({ username: 'alice132', quantity: '5' }));
			expect(output('prevented')).toBe('true');
			expect(output('calls')).toBe(JSON.stringify(['username', 'quantity']));
		});

		it('blocks submit for an invalid field that has no name', async () => {
			render(FormRegistryHarness, { scenario: 'unnamed' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('values')).toBe('');
			await expect.element(page.getByTestId('blank')).toHaveFocus();
		});

		// Sveltery: the browser checks inputs, so a field with no control cannot block the submit.
		it('submits when the invalid field has no control the browser can check', async () => {
			render(FormRegistryHarness, { scenario: 'no-control' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('values')).toBe('{}');
		});

		it('submits while a validator is still pending', async () => {
			render(FormRegistryHarness, { scenario: 'pending' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('values')).toBe(JSON.stringify({ pending: 'later' }));
		});

		it('counts the submit before field validation runs', async () => {
			render(FormRegistryHarness, { scenario: 'submit-count' });
			const submit = page.getByRole('button', { name: 'Submit' });
			await submit.click();
			await submit.click();

			expect(output('calls')).toBe(JSON.stringify(['1', '2']));
		});

		it('lets an unregistered required input submit while native validation is off', async () => {
			render(FormRegistryHarness, { scenario: 'unregistered' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('calls')).toBe(JSON.stringify(['native']));
		});

		it('does not run the submit listener when the browser blocks a native invalid form', async () => {
			render(FormRegistryHarness, { scenario: 'browser' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('calls')).toBe(JSON.stringify([]));
			expect(formElement().hasAttribute('novalidate')).toBe(false);
		});

		it('cancels the browser bubble only for controls a Field owns', async () => {
			render(FormRegistryHarness, { scenario: 'browser' });
			const raw = page.getByTestId('raw').element() as HTMLInputElement;
			const event = new Event('invalid', { cancelable: true });
			raw.dispatchEvent(event);
			expect(event.defaultPrevented).toBe(false);
		});

		it('cancels the browser bubble for a Field control and shows the message in Field.Error', async () => {
			render(FormRegistryHarness, { scenario: 'blocked' });
			const custom = page.getByTestId('custom').element() as HTMLInputElement;
			const event = new Event('invalid', { cancelable: true });
			custom.dispatchEvent(event);
			expect(event.defaultPrevented).toBe(true);
		});
	});

	describe('validate()', () => {
		it('validates every field, or only the first field with the given name', async () => {
			render(FormRegistryHarness, { scenario: 'actions' });

			await page.getByRole('button', { name: 'Validate all' }).click();
			expect(output('calls')).toBe(JSON.stringify(['username', 'quantity']));

			await page.getByRole('button', { name: 'Validate quantity' }).click();
			expect(output('calls')).toBe(JSON.stringify(['username', 'quantity', 'quantity']));

			await page.getByRole('button', { name: 'Validate missing' }).click();
			expect(output('calls')).toBe(JSON.stringify(['username', 'quantity', 'quantity']));
		});

		it('validates only the earliest field when two share a name', async () => {
			render(FormRegistryHarness, { scenario: 'same-name' });
			await page.getByRole('button', { name: 'Validate email' }).click();

			expect(output('calls')).toBe(JSON.stringify(['first']));
		});
	});

	describe('prop: errors', () => {
		it('focuses a server error by field name when the control id differs', async () => {
			render(FormRegistryHarness, { scenario: 'errors-name' });
			const input = page.getByTestId('control-id');

			await page.getByRole('button', { name: 'Submit' }).click();
			expect(output('values')).toBe(JSON.stringify({ username: 'kept' }));
			expect(document.activeElement).not.toBe(input.element());

			await page.getByRole('button', { name: 'Apply named error' }).click();
			await expect.element(input).toHaveFocus();
			expect(output('errors')).toBe(JSON.stringify({ username: 'nope' }));
		});

		it('focuses the first invalid field after errors change following a submit', async () => {
			render(FormRegistryHarness, { scenario: 'errors-focus' });
			const input = page.getByTestId('a');

			await page.getByRole('button', { name: 'Submit' }).click();
			expect(output('values')).toBe(JSON.stringify({ a: 'kept' }));
			expect(document.activeElement).not.toBe(input.element());

			await page.getByRole('button', { name: 'Apply errors' }).click();
			await expect.element(input).toHaveFocus();
			expect(output('errors')).toBe(JSON.stringify({ a: 'nope' }));
		});

		it('removes one error key and ignores a missing name', async () => {
			render(FormRegistryHarness, { scenario: 'clear' });

			await page.getByRole('button', { name: 'Set errors' }).click();
			expect(output('errors')).toBe(JSON.stringify({ a: 'bad', b: 'also' }));

			await page.getByRole('button', { name: 'Clear none' }).click();
			expect(output('errors')).toBe(JSON.stringify({ a: 'bad', b: 'also' }));

			await page.getByRole('button', { name: 'Clear a' }).click();
			expect(output('errors')).toBe(JSON.stringify({ b: 'also' }));
			expect(output('live-errors')).toBe(JSON.stringify({ b: 'also' }));
		});
	});

	describe('disabled Fieldset', () => {
		it('excludes disabled fieldset fields from validation and the submitted values', async () => {
			render(FormFieldsetHarness, { scenario: 'static' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('submitted')).toBe('1');
			expect(output('values')).toBe('{"enabled":"sent"}');
			await expect.element(page.getByTestId('control')).not.toHaveAttribute('aria-invalid');
		});

		it('clears invalid UI when a fieldset field becomes disabled', async () => {
			render(FormFieldsetHarness, { scenario: 'toggle' });
			const control = page.getByTestId('control');
			const submit = page.getByRole('button', { name: 'Submit' });

			await submit.click();
			expect(output('submitted')).toBe('0');
			await expect.element(control).toHaveAttribute('aria-invalid', 'true');
			await expect.element(page.getByTestId('error')).toBeInTheDocument();

			await page.getByRole('button', { name: 'Disable' }).click();
			await expect.element(control).toBeDisabled();
			await expect.element(control).not.toHaveAttribute('aria-invalid');
			await expect.element(page.getByTestId('error')).not.toBeInTheDocument();

			await submit.click();
			expect(output('submitted')).toBe('1');
			expect(output('values')).toBe('{}');

			await page.getByRole('button', { name: 'Enable' }).click();
			await submit.click();
			expect(output('submitted')).toBe('1');
			await expect.element(control).toHaveAttribute('aria-invalid', 'true');
			await expect.element(page.getByTestId('error')).toBeInTheDocument();
		});
	});

	describe('document order', () => {
		it('reports which connected node comes first and ignores separate shadow roots', () => {
			const parent = document.createElement('div');
			const earlier = document.createElement('input');
			const later = document.createElement('input');
			parent.append(earlier, later);
			document.body.append(parent);

			const hostA = document.createElement('div');
			const hostB = document.createElement('div');
			const shadowA = document.createElement('input');
			const shadowB = document.createElement('input');
			hostA.attachShadow({ mode: 'open' }).append(shadowA);
			hostB.attachShadow({ mode: 'open' }).append(shadowB);
			document.body.append(hostA, hostB);

			expect(comesBeforeInSameTree(earlier, later)).toBe(true);
			expect(comesBeforeInSameTree(later, earlier)).toBe(false);
			expect(comesBeforeInSameTree(shadowB, shadowA)).toBe(false);
			expect(comesBeforeInSameTree(shadowA, shadowB)).toBe(false);

			parent.remove();
			hostA.remove();
			hostB.remove();
		});
	});

	describe('native Svelte', () => {
		it('passes a consumer attachment to the default form', async () => {
			render(FormAttachHarness);
			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
			expect(formElement().hasAttribute('novalidate')).toBe(false);
			expect(formElement().className).toBe('default-host');
		});

		it('passes a consumer attachment through the render snippet', async () => {
			render(FormAttachHarness, { custom: true });
			await expect.element(page.getByTestId('host')).toHaveTextContent('from-props');
			expect(formElement().hasAttribute('novalidate')).toBe(false);
			expect(formElement().getAttribute('data-custom')).toBe('true');
			await expect.element(page.getByText('Inside')).toBeVisible();
		});
	});
});
