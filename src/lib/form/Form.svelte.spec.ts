// Assertions follow Base UI v1.8.0 packages/react/src/form/Form.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field, Checkbox, NumberField and Switch are not ported. Registry cases drive Form's
// own submit, focus and actions behavior through the field-registration contract.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormAttachHarness from '../../tests/FormAttachHarness.svelte';
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
		it('disables native validation by default', async () => {
			render(Form);
			expect(formElement().hasAttribute('novalidate')).toBe(true);
		});

		it('leaves native validation on when novalidate is false', async () => {
			render(Form, { novalidate: false });
			expect(formElement().hasAttribute('novalidate')).toBe(false);
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

		it('keeps registration order when invalid controls are in different shadow roots', async () => {
			render(FormRegistryHarness, { scenario: 'shadow' });
			await page.getByRole('button', { name: 'Submit' }).click();

			const first = page.getByTestId('a').element();
			expect(first.getRootNode()).not.toBe(document);
			expect((first.getRootNode() as ShadowRoot).activeElement).toBe(first);
		});

		it('submits named field values and marks the native event prevented', async () => {
			render(FormRegistryHarness, { scenario: 'values' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('values')).toBe(JSON.stringify({ username: 'alice132', quantity: 5 }));
			expect(output('prevented')).toBe('true');
			expect(output('reason')).toBe('none');
			expect(output('calls')).toBe(JSON.stringify(['username', 'quantity']));
		});

		it('blocks submit for an invalid field that has no name', async () => {
			render(FormRegistryHarness, { scenario: 'unnamed' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('values')).toBe('');
			await expect.element(page.getByTestId('blank')).toHaveFocus();
		});

		it('blocks submit when the invalid field has no focusable control', async () => {
			render(FormRegistryHarness, { scenario: 'no-control' });
			await page.getByRole('button', { name: 'Submit' }).click();

			expect(output('values')).toBe('');
			expect(document.activeElement).toBe(page.getByRole('button', { name: 'Submit' }).element());
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
	});

	describe('prop: actions', () => {
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
			expect(formElement().hasAttribute('novalidate')).toBe(true);
			expect(formElement().className).toBe('default-host');
		});

		it('passes a consumer attachment through the render snippet', async () => {
			render(FormAttachHarness, { custom: true });
			await expect.element(page.getByTestId('host')).toHaveTextContent('from-props');
			expect(formElement().hasAttribute('novalidate')).toBe(true);
			expect(formElement().getAttribute('data-custom')).toBe('true');
			await expect.element(page.getByText('Inside')).toBeVisible();
		});
	});
});
