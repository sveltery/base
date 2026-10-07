// Assertions follow Base UI v1.8.0 packages/react/src/otp-field/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance, ref, inputRef, className callbacks, and React's controlled lock are not ported.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OTPFieldHarness from '../../tests/OTPFieldHarness.svelte';

function inputs() {
	return page.getByRole('textbox').elements() as HTMLInputElement[];
}

function hidden(name = 'otp') {
	const input = document.querySelector(`input[name="${name}"]`);
	if (!(input instanceof HTMLInputElement)) throw new Error(`expected input[name="${name}"]`);
	return input;
}

function values() {
	return inputs()
		.map((input) => input.value)
		.join('');
}

async function setInput(input: HTMLInputElement, text: string) {
	input.focus();
	input.value = text;
	input.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
	await expect.element(page.getByRole('textbox').first()).toBeVisible();
}

function paste(input: HTMLInputElement, text: string) {
	const data = new DataTransfer();
	data.setData('text/plain', text);
	input.dispatchEvent(
		new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })
	);
}

function key(input: HTMLInputElement, keyName: string, modifiers: KeyboardEventInit = {}) {
	input.dispatchEvent(
		new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true, ...modifiers })
	);
}

describe('<OTPField />', () => {
	it('splits a default value across the slots and clamps it', async () => {
		render(OTPFieldHarness, { scenario: 'default' });
		await expect.poll(() => values()).toBe('123456');
		expect(inputs()[0]).toHaveAttribute('maxlength', '6');
		expect(inputs()[1].hasAttribute('maxlength')).toBe(false);
		expect(page.getByTestId('root').element()).not.toHaveAttribute('data-filled', null);
		expect(page.getByTestId('root').element()).toHaveAttribute('data-filled', '');
		expect(page.getByTestId('root').element()).toHaveAttribute('data-complete', '');
	});

	it('clamps an overlong default onto the hidden input', async () => {
		render(OTPFieldHarness, { scenario: 'overlong' });
		await expect.poll(() => values()).toBe('123456');
		expect(hidden().value).toBe('123456');
		expect(hidden()).toHaveAttribute('pattern', '\\d{6}');
		expect(hidden()).toHaveAttribute('minlength', '6');
		expect(hidden()).toHaveAttribute('maxlength', '6');
	});

	it('keeps grouped slots in document order around a separator', async () => {
		render(OTPFieldHarness, { scenario: 'grouped' });
		const root = page.getByTestId('root').element();
		expect(root).toContainElement(page.getByTestId('first-group').element());
		expect(root).toContainElement(page.getByTestId('second-group').element());
		expect(page.getByText('-').element()).toBeVisible();
		expect(values()).toBe('123456');
	});

	it('filters alphabetic and alphanumeric values', async () => {
		const view = render(OTPFieldHarness, { scenario: 'alpha' });
		expect(values()).toBe('abCd');
		view.unmount();

		render(OTPFieldHarness, { scenario: 'alphanumeric' });
		await setInput(inputs()[0], 'A1-B2c3');
		await expect.poll(() => values()).toBe('A1B2c3');
		expect(inputs()[0]).toHaveAttribute('pattern', '[a-zA-Z0-9]{1}');
		expect(hidden()).not.toHaveAttribute('minlength', null);
		expect(hidden()).toHaveAttribute('pattern', '[a-zA-Z0-9]{6}');
	});

	it('omits the hidden pattern when validation is none and honors inputMode', async () => {
		render(OTPFieldHarness, {
			scenario: 'none',
			normalizeValue: (value) => value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
		});
		expect(hidden().hasAttribute('pattern')).toBe(false);
		expect(inputs()[0]).toHaveAttribute('inputmode', 'numeric');
		await setInput(inputs()[0], 'ab-12 cd');
		await expect.poll(() => values()).toBe('AB12CD');
	});

	it('moves focus to the next slot after typing and completes the code', async () => {
		const onValueChange = vi.fn();
		const onValueComplete = vi.fn();
		render(OTPFieldHarness, { scenario: 'plain', onValueChange, onValueComplete });
		const slots = inputs();
		await setInput(slots[0], '1');
		await expect.poll(() => document.activeElement).toBe(slots[1]);
		expect(onValueChange.mock.lastCall?.[0]).toBe('1');
		expect(onValueChange.mock.lastCall?.[1].reason).toBe('input-change');
		expect(onValueComplete).not.toHaveBeenCalled();

		await setInput(slots[0], '123456');
		await expect.poll(() => values()).toBe('123456');
		await expect.poll(() => document.activeElement).toBe(slots[5]);
		expect(onValueComplete).toHaveBeenCalled();
		expect(onValueComplete.mock.lastCall?.[1].reason).toBe('input-change');
	});

	it('does not store a canceled value or fire completion', async () => {
		const onValueComplete = vi.fn();
		render(OTPFieldHarness, { scenario: 'cancel', onValueComplete });
		paste(inputs()[0], '123456');
		await expect.poll(() => values()).toBe('');
		expect(onValueComplete).not.toHaveBeenCalled();
	});

	it('pastes from the focused slot and reports rejected characters', async () => {
		const onValueInvalid = vi.fn();
		const onValueChange = vi.fn();
		render(OTPFieldHarness, { scenario: 'plain', onValueInvalid, onValueChange });
		const slots = inputs();
		await setInput(slots[0], '12');
		await expect.poll(() => values()).toBe('12');
		paste(slots[2], '9a9');
		await expect.poll(() => values()).toBe('1299');
		expect(onValueInvalid).toHaveBeenCalled();
		expect(onValueInvalid.mock.lastCall?.[0]).toBe('9a9');
		expect(onValueInvalid.mock.lastCall?.[1].reason).toBe('input-paste');
		expect(onValueChange.mock.lastCall?.[1].reason).toBe('input-paste');
	});

	it('moves focus with arrows, Home, and End, including RTL', async () => {
		render(OTPFieldHarness, { scenario: 'default' });
		const slots = inputs();
		slots[2].focus();
		key(slots[2], 'ArrowLeft');
		expect(document.activeElement).toBe(slots[1]);
		key(slots[1], 'ArrowRight');
		expect(document.activeElement).toBe(slots[2]);
		key(slots[2], 'Home');
		expect(document.activeElement).toBe(slots[0]);
		key(slots[0], 'End');
		expect(document.activeElement).toBe(slots[5]);
		expect(keyStopped(slots[5], 'ArrowDown')).toBe(true);
	});

	it('swaps horizontal arrows in RTL', async () => {
		render(OTPFieldHarness, { scenario: 'rtl' });
		const rtl = inputs();
		expect(getComputedStyle(rtl[1]).direction).toBe('rtl');
		rtl[1].focus();
		key(rtl[1], 'ArrowLeft');
		expect(document.activeElement).toBe(rtl[2]);
		key(rtl[2], 'ArrowRight');
		expect(document.activeElement).toBe(rtl[1]);
	});

	it('deletes with Backspace and Delete and leaves an empty Delete alone', async () => {
		const onValueChange = vi.fn();
		render(OTPFieldHarness, { scenario: 'default', onValueChange });
		const slots = inputs();
		slots[2].focus();
		key(slots[2], 'Delete');
		await expect.poll(() => values()).toBe('12456');
		expect(onValueChange.mock.lastCall?.[1].reason).toBe('keyboard');

		slots[0].focus();
		key(slots[0], 'Backspace');
		await expect.poll(() => values()).toBe('2456');
		expect(document.activeElement).toBe(slots[0]);

		onValueChange.mockClear();
		slots[4].focus();
		key(slots[4], 'Delete');
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('keeps arrow navigation in readonly mode and blocks edits', async () => {
		const onValueChange = vi.fn();
		render(OTPFieldHarness, { scenario: 'readonly', onValueChange });
		const slots = inputs();
		expect(page.getByTestId('root').element()).toHaveAttribute('data-readonly', '');
		expect(slots[0]).toHaveAttribute('readonly');
		slots[0].focus();
		await expect.element(page.getByTestId('root')).toHaveAttribute('data-focused', '');
		key(slots[0], 'ArrowRight');
		expect(document.activeElement).toBe(slots[1]);
		key(slots[1], 'Backspace');
		paste(slots[1], '999999');
		expect(values()).toBe('123456');
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('does not change a disabled field and leaves arrows unhandled', async () => {
		const onValueChange = vi.fn();
		render(OTPFieldHarness, { scenario: 'disabled', onValueChange });
		const slots = inputs();
		expect(page.getByTestId('root').element()).toHaveAttribute('data-disabled', '');
		expect(slots[0]).toBeDisabled();
		const event = new KeyboardEvent('keydown', {
			key: 'ArrowDown',
			bubbles: true,
			cancelable: true
		});
		slots[0].dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
		slots[0].dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('masks slots and lets one slot override the input type', async () => {
		render(OTPFieldHarness, { scenario: 'mask' });
		const slots = [...document.querySelectorAll('input')].filter(
			(input) => input.getAttribute('aria-hidden') !== 'true'
		);
		expect(slots[0]).toHaveAttribute('type', 'password');
		expect(slots[1]).toHaveAttribute('type', 'text');
	});

	it('associates a field label and description with the group', async () => {
		render(OTPFieldHarness, { scenario: 'labelled' });
		const label = page.getByTestId('label').element();
		const description = page.getByTestId('description').element();
		const first = inputs()[0];
		expect(label).toHaveAttribute('for', first.id);
		const group = page.getByRole('group', { name: 'Verification code' }).element();
		expect(group).toHaveAttribute('aria-labelledby', label.id);
		expect(group.getAttribute('aria-describedby')).toBe(`external-description ${description.id}`);
		for (const input of inputs()) {
			expect(input.getAttribute('aria-labelledby')).toBe(label.id);
		}
	});

	it('puts an explicit aria-labelledby on the group only', async () => {
		render(OTPFieldHarness, { scenario: 'explicit-label' });
		const group = page.getByRole('group').element();
		expect(group).toHaveAttribute('aria-labelledby', 'label-id');
		expect(inputs()[0].hasAttribute('aria-labelledby')).toBe(false);
		expect(inputs()[0].hasAttribute('aria-label')).toBe(false);
		expect(inputs()[1]).toHaveAttribute('aria-label', 'Digit');
	});

	it('shares a bound value and applies a later parent value', async () => {
		render(OTPFieldHarness, { scenario: 'bound' });
		await setInput(inputs()[0], '12');
		await expect.element(page.getByTestId('value')).toHaveTextContent('12');
		await userEvent.click(page.getByRole('button', { name: 'Apply value' }).element());
		await expect.poll(() => values()).toBe('654321');
		await expect.element(page.getByTestId('value')).toHaveTextContent('654321');
	});

	it('validates on blur only after focus leaves the field', async () => {
		render(OTPFieldHarness, { scenario: 'blur-validate' });
		const slots = inputs();
		slots[0].focus();
		await setInput(slots[0], '1');
		slots[1].dispatchEvent(new FocusEvent('blur', { bubbles: true, relatedTarget: slots[2] }));
		expect(page.getByTestId('counts').element().textContent).toBe('0');
		slots[1].dispatchEvent(
			new FocusEvent('blur', {
				bubbles: true,
				relatedTarget: page.getByRole('button', { name: 'Outside' }).element()
			})
		);
		await expect.element(page.getByTestId('counts')).toHaveTextContent('1');
	});

	it('uses the hidden input for native form validity', async () => {
		const incomplete = render(OTPFieldHarness, { scenario: 'form-incomplete' });
		expect((page.getByTestId('form').element() as HTMLFormElement).checkValidity()).toBe(false);
		incomplete.unmount();

		render(OTPFieldHarness, { scenario: 'form-complete' });
		expect((page.getByTestId('form').element() as HTMLFormElement).checkValidity()).toBe(true);
	});

	it('redirects hidden-input focus and accepts autofill', async () => {
		const onValueInvalid = vi.fn();
		const onValueComplete = vi.fn();
		render(OTPFieldHarness, { scenario: 'overlong', onValueInvalid, onValueComplete });
		const hiddenInput = hidden();
		hiddenInput.focus();
		expect(document.activeElement).toBe(inputs()[0]);
		hiddenInput.value = '12a34b56';
		hiddenInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await expect.poll(() => values()).toBe('123456');
		expect(onValueInvalid).toHaveBeenCalled();
		expect(onValueComplete).not.toHaveBeenCalled();
	});

	it('submits the owning form when autoSubmit is set and the code completes', async () => {
		const onValueComplete = vi.fn();
		render(OTPFieldHarness, { scenario: 'autosubmit', onValueComplete });
		await setInput(inputs()[0], '12345');
		expect(page.getByTestId('submitted').element().textContent).toBe('0');
		await setInput(inputs()[0], '123456');
		await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
		expect(onValueComplete).toHaveBeenCalledTimes(1);
	});

	it('submits an associated form and ignores a form id that is not a form', async () => {
		const external = render(OTPFieldHarness, { scenario: 'external-form' });
		await setInput(inputs()[0], '123456');
		await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
		external.unmount();

		render(OTPFieldHarness, { scenario: 'not-a-form' });
		await setInput(inputs()[0], '123456');
		expect(page.getByTestId('submitted').element().textContent).toBe('0');
	});

	it('derives slot ids from the root id and gives the hidden input a fallback id', async () => {
		render(OTPFieldHarness, { scenario: 'named' });
		expect(inputs().map((input) => input.id)).toEqual([
			'verification-code',
			'verification-code-2',
			'verification-code-3',
			'verification-code-4',
			'verification-code-5',
			'verification-code-6'
		]);
		const hiddenInput = document.querySelector('input[aria-hidden="true"]');
		expect(hiddenInput).toHaveAttribute('id', 'verification-code-hidden-input');
	});

	it('blocks an empty required field inside Form', async () => {
		render(OTPFieldHarness, { scenario: 'required-field' });
		await userEvent.click(page.getByRole('button', { name: 'Submit' }).element());
		await expect.element(page.getByTestId('error')).toHaveTextContent('Required');
		expect(page.getByTestId('submitted').element().textContent).toBe('0');
	});

	it('applies one-time-code autocomplete to the first slot only', async () => {
		render(OTPFieldHarness, { scenario: 'plain' });
		expect(inputs()[0]).toHaveAttribute('autocomplete', 'one-time-code');
		expect(inputs()[1]).toHaveAttribute('autocomplete', 'off');
		expect(inputs()[5]).toHaveAttribute('enterkeyhint', 'done');
		expect(inputs()[0]).toHaveAttribute('enterkeyhint', 'next');
		expect(inputs()[0]).toHaveAttribute('tabindex', '0');
		expect(inputs()[1]).toHaveAttribute('tabindex', '-1');
	});

	it('throws a descriptive error outside the root', async () => {
		await expect(async () => {
			render(OTPFieldHarness, { scenario: 'orphan' });
		}).rejects.toThrow(/OTPFieldRootContext is missing/);
	});
});

function keyStopped(input: HTMLInputElement, keyName: string) {
	const event = new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true });
	input.dispatchEvent(event);
	return event.defaultPrevented;
}
