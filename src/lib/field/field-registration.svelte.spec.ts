import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FieldRegistrationHarness from '../../tests/FieldRegistrationHarness.svelte';

function text(name: string) {
	return page.getByTestId(name).element().textContent ?? '';
}

describe('field registration', () => {
	it('registers an OTP field once while digits change', async () => {
		render(FieldRegistrationHarness, { scenario: 'otp-digits' });
		const first = page.getByRole('textbox').elements()[0] as HTMLInputElement;
		await expect.poll(() => text('count')).toBe('1');
		first.focus();
		await userEvent.keyboard('123');
		expect(text('count')).toBe('1');
		await userEvent.click(page.getByRole('button', { name: 'Read' }));
		expect(text('calls')).toBe(JSON.stringify(['123']));
	});

	it('submits the OTP value typed after registration', async () => {
		render(FieldRegistrationHarness, { scenario: 'otp-submit' });
		const first = page.getByRole('textbox').elements()[0] as HTMLInputElement;
		first.focus();
		await userEvent.keyboard('123');
		await userEvent.click(page.getByRole('button', { name: 'Submit' }));
		expect(text('values')).toBe(JSON.stringify({ code: '123' }));
		expect(text('calls')).toBe(JSON.stringify(['123']));
	});

	it('does not register a disabled control twice', async () => {
		render(FieldRegistrationHarness, { scenario: 'disabled' });
		await expect.poll(() => text('count')).toBe('1');
		await userEvent.click(page.getByRole('button', { name: 'Disable' }));
		await expect.poll(() => text('count')).toBe('2');
		await userEvent.click(page.getByRole('button', { name: 'Enable' }));
		await expect.poll(() => text('count')).toBe('3');
	});

	it('validates the value flushSync wrote during blur, once', async () => {
		render(FieldRegistrationHarness, { scenario: 'blur-flush' });
		const control = page.getByTestId('control');
		control.element().dispatchEvent(new FocusEvent('blur', { bubbles: true }));
		await expect.poll(() => text('calls')).toBe(JSON.stringify(['hi']));
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(text('calls')).toBe(JSON.stringify(['hi']));
	});

	it('validates the value flushSync wrote on Enter, once', async () => {
		render(FieldRegistrationHarness, { scenario: 'enter-flush' });
		const control = page.getByTestId('control');
		await control.click();
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => text('calls')).toBe(JSON.stringify(['fresh']));
		expect(text('values')).toBe(JSON.stringify({ email: 'fresh' }));
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(text('calls')).toBe(JSON.stringify(['fresh']));
	});

	it('validates the trimmed value written in onblur without flushSync', async () => {
		render(FieldRegistrationHarness, { scenario: 'blur-trim' });
		const control = page.getByTestId('control');
		control.element().dispatchEvent(new FocusEvent('blur', { bubbles: true }));
		await expect.poll(() => text('calls')).toBe(JSON.stringify(['hi']));
		await expect.element(control).toHaveAttribute('data-invalid', '');
	});

	it('validates Enter when the form never submits', async () => {
		render(FieldRegistrationHarness, { scenario: 'enter-idle' });
		const control = page.getByTestId('control').element() as HTMLInputElement;
		control.focus();
		control.setSelectionRange(control.value.length, control.value.length);
		await userEvent.keyboard('y{Enter}');
		await expect.poll(() => text('calls')).toBe(JSON.stringify(['xy']));
	});
});
