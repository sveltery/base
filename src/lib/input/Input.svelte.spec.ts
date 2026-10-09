// Assertions follow Base UI v1.8.0 packages/react/src/input/Input.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream `describeConformance(<Input />)` checks prop forwarding, render, class/style,
// and that `ref` is an HTMLInputElement. Svelte has no ref: the host is the element.
// Input.test.tsx renders Input outside Field. A standalone Input does the same.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InputHarness from '../../tests/InputHarness.svelte';

function control() {
	return page.getByTestId('control');
}

describe('<Input />', () => {
	describe('conformance', () => {
		it('renders an input element', async () => {
			render(InputHarness, { scenario: 'plain' });
			const input = page.getByRole('textbox');

			await expect.element(input).toBeVisible();
			expect(input.element()).toBeInstanceOf(HTMLInputElement);
			expect((input.element() as HTMLElement).tagName).toBe('INPUT');
		});
	});

	describe('prop forwarding', () => {
		it('forwards custom props, class and style to the input', async () => {
			render(InputHarness, { scenario: 'props' });
			const input = control();

			await expect.element(input).toHaveAttribute('lang', 'fr');
			await expect.element(input).toHaveAttribute('data-foobar', 'token');
			await expect.element(input).toHaveAttribute('class', 'name-input');
			await expect.element(input).toHaveAttribute('style', 'color: green;');
		});

		it('forwards custom props through the render snippet', async () => {
			render(InputHarness, { scenario: 'render' });
			const input = control();

			await expect.element(input).toHaveAttribute('class', 'from-props');
			await expect.element(input).toHaveAttribute('data-custom', 'true');
			await expect.element(input).toHaveAttribute('data-state-disabled', 'true');
			await expect.element(input).toHaveAttribute('data-disabled', '');
			expect(input.element()).toBeInstanceOf(HTMLInputElement);
		});
	});

	describe('prop: render', () => {
		it('can host a textarea', async () => {
			// Upstream Input.spec.tsx types a textarea ref through `render={<textarea />}`.
			// The snippet receives the control props and the element is that textarea.
			render(InputHarness, { scenario: 'textarea' });
			const host = control();

			await expect.element(host).toBeVisible();
			expect(host.element()).toBeInstanceOf(HTMLTextAreaElement);
		});
	});

	describe('native Svelte', () => {
		it('passes consumer attachments to the input', async () => {
			render(InputHarness, { scenario: 'attach' });

			await expect.element(page.getByTestId('host')).toHaveTextContent('INPUT:default-host');
		});

		it('associates a field label with the input', async () => {
			render(InputHarness, { scenario: 'labelled' });
			const input = control();
			expect(input.element().id).toMatch(/^base-ui-/);
			const id = input.element().id;
			await expect.element(page.getByTestId('label')).toHaveAttribute('for', id);
			await expect.element(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
		});

		it('uses Field disabled state', async () => {
			render(InputHarness, { scenario: 'disabled' });
			await expect.element(control()).toBeDisabled();
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-disabled', '');
			await expect.element(control()).toHaveAttribute('data-disabled', '');
		});

		it('uses Field invalid state', async () => {
			render(InputHarness, { scenario: 'invalid' });
			await expect.element(control()).toHaveAttribute('data-invalid', '');
			await expect.element(control()).toHaveAttribute('aria-invalid', 'true');
		});

		it('marks a default value filled without controlling the input', async () => {
			render(InputHarness, { scenario: 'filled' });
			await expect.element(control()).toHaveValue('hello');
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-filled', '');
			expect(control().element().getAttribute('value')).toBeNull();
		});

		it('does not mark an empty controlled value filled', async () => {
			render(InputHarness, { scenario: 'empty' });
			await expect.element(control()).toHaveValue('');
			await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-filled');
		});

		it('marks the field dirty, touched and focused from the input', async () => {
			render(InputHarness, { scenario: 'dirty' });
			const field = page.getByTestId('field');
			const input = control();

			await expect.element(field).not.toHaveAttribute('data-dirty');
			await input.fill('b');
			await expect.element(field).toHaveAttribute('data-dirty', '');
			await expect.element(input).toHaveAttribute('data-dirty', '');
			await expect.element(field).toHaveAttribute('data-focused', '');

			input.element().blur();
			await expect.element(field).toHaveAttribute('data-touched', '');
			await expect.element(input).not.toHaveAttribute('data-focused');
		});

		it('shares bind:value with the parent', async () => {
			render(InputHarness, { scenario: 'bound' });
			const input = control();

			await expect.element(input).toHaveValue('a');
			await expect.element(page.getByTestId('value')).toHaveTextContent('a');
			await page.getByRole('button', { name: 'Set' }).click();
			await expect.element(input).toHaveValue('program');
			await expect.element(page.getByTestId('value')).toHaveTextContent('program');

			await input.fill('typed');
			await expect.element(page.getByTestId('value')).toHaveTextContent('typed');
			await expect.element(input).toHaveValue('typed');
		});

		it('keeps the controlled value when onValueChange cancels', async () => {
			render(InputHarness, {
				scenario: 'bound',
				onValueChange: (_value, details) => details.cancel()
			});
			await control().fill('nope');
			await expect.element(control()).toHaveValue('a');
			await expect.element(page.getByTestId('value')).toHaveTextContent('a');
			expect(page.getByTestId('value').element().textContent).toBe('a');
		});

		it('submits the field name and the input value', async () => {
			render(InputHarness, { scenario: 'form' });
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect
				.element(page.getByTestId('values'))
				.toHaveTextContent(JSON.stringify({ username: 'ada' }));
			expect(page.getByTestId('submitted').element().textContent).toBe('1');
		});

		it('mounts outside Field.Root, and typing updates bind:value', async () => {
			render(InputHarness, { scenario: 'standalone' });
			const input = control();
			await expect.element(input).toHaveValue('a');
			await input.fill('typed');
			await expect.element(input).toHaveValue('typed');
			await expect.element(page.getByTestId('value')).toHaveTextContent('typed');
		});

		it('submits nothing for a required named input outside Field.Root', async () => {
			render(InputHarness, { scenario: 'form-required' });
			const input = control();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('values')).toHaveTextContent('{}');
			expect(input.element().hasAttribute('data-invalid')).toBe(false);
			expect(input.element().getAttribute('aria-invalid')).toBeNull();
		});

		it('leaves a named default value out of the form submission', async () => {
			render(InputHarness, { scenario: 'form-named' });
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('values')).toHaveTextContent('{}');
		});

		it('does not register standalone inputs on the shared form map', async () => {
			render(InputHarness, { scenario: 'pair' });
			await expect.element(page.getByTestId('one')).toBeVisible();
			await expect.element(page.getByTestId('two')).toBeVisible();
			const one = page.getByTestId('one').element() as HTMLInputElement;
			const two = page.getByTestId('two').element() as HTMLInputElement;
			await page.getByTestId('one').fill('a');
			expect(one.value).toBe('a');
			expect(two.value).toBe('');
			expect(one.form).toBeNull();
			expect(two.form).toBeNull();
		});

		it('does not mark focus, dirty, filled, or touched outside Field.Root', async () => {
			render(InputHarness, { scenario: 'inert-state' });
			const input = control();
			await input.click();
			expect(input.element().hasAttribute('data-focused')).toBe(false);
			await input.fill('ab');
			expect(input.element().hasAttribute('data-dirty')).toBe(false);
			expect(input.element().hasAttribute('data-filled')).toBe(false);
			input.element().dispatchEvent(new FocusEvent('blur', { bubbles: true }));
			expect(input.element().hasAttribute('data-touched')).toBe(false);
			expect(input.element().hasAttribute('data-focused')).toBe(false);
		});
	});
});
