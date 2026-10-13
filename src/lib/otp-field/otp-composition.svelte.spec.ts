// Assertions follow Base UI v1.9.0 packages/react/src/otp-field/input/OTPFieldInput.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OTPCompositionHarness from '../../tests/OTPCompositionHarness.svelte';

function inputs() {
	return page.getByRole('textbox').elements() as HTMLInputElement[];
}

function slotValues() {
	return inputs().map((input) => input.value);
}

function compositionStart(input: HTMLInputElement) {
	input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
}

function composingInput(input: HTMLInputElement, text: string) {
	input.value = text;
	input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
}

function compositionEnd(input: HTMLInputElement, text: string) {
	input.value = text;
	input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: text }));
}

describe('<OTPField.Input /> IME composition', () => {
	it('commits a composition once on compositionend instead of per intermediate input', async () => {
		const onValueChange = vi.fn();
		render(OTPCompositionHarness, { validationType: 'alphanumeric', onValueChange });
		const slots = inputs();
		slots[0].focus();

		compositionStart(slots[0]);
		composingInput(slots[0], 'd');
		composingInput(slots[0], 'dd');
		composingInput(slots[0], 'ddd');

		expect(onValueChange).not.toHaveBeenCalled();
		await expect.poll(slotValues).toEqual(['ddd', '', '', '', '', '']);

		compositionEnd(slots[0], 'ddd');

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange.mock.lastCall?.[0]).toBe('ddd');
		await expect.poll(slotValues).toEqual(['d', 'd', 'd', '', '', '']);
		await expect.poll(() => document.activeElement).toBe(slots[3]);
	});

	it('reports characters rejected from a committed composition', async () => {
		const onValueChange = vi.fn();
		const onValueInvalid = vi.fn();
		render(OTPCompositionHarness, { onValueChange, onValueInvalid });
		const slots = inputs();
		slots[0].focus();

		compositionStart(slots[0]);
		composingInput(slots[0], '1a');
		expect(onValueInvalid).not.toHaveBeenCalled();

		compositionEnd(slots[0], '1a');

		expect(onValueInvalid).toHaveBeenCalledTimes(1);
		expect(onValueInvalid.mock.lastCall?.[0]).toBe('1a');
		expect(onValueInvalid.mock.lastCall?.[1].reason).toBe('input-change');
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange.mock.lastCall?.[0]).toBe('1');
		await expect.poll(slotValues).toEqual(['1', '', '', '', '', '']);
		await expect.poll(() => document.activeElement).toBe(slots[1]);
	});

	it('ignores keyboard commands while a composition is buffered', async () => {
		const onValueChange = vi.fn();
		render(OTPCompositionHarness, {
			validationType: 'alphanumeric',
			defaultValue: '12',
			onValueChange
		});
		const slots = inputs();
		slots[2].focus();

		compositionStart(slots[2]);
		composingInput(slots[2], 'a');
		const backspace = new KeyboardEvent('keydown', {
			key: 'Backspace',
			bubbles: true,
			cancelable: true
		});
		slots[2].dispatchEvent(backspace);

		expect(backspace.defaultPrevented).toBe(false);
		expect(onValueChange).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(slots[2]);
		await expect.poll(slotValues).toEqual(['1', '2', 'a', '', '', '']);

		compositionEnd(slots[2], '');

		expect(onValueChange).not.toHaveBeenCalled();
		await expect.poll(slotValues).toEqual(['1', '2', '', '', '', '']);
	});

	it.each(['disabled', 'readonly'] as const)(
		'does not commit a composition that ends after the field becomes %s',
		async (prop) => {
			const onValueChange = vi.fn();
			const { rerender } = render(OTPCompositionHarness, {
				validationType: 'alphanumeric',
				onValueChange
			});
			const slots = inputs();
			slots[0].focus();

			compositionStart(slots[0]);
			composingInput(slots[0], 'abc');
			await rerender({ validationType: 'alphanumeric', onValueChange, [prop]: true });

			compositionEnd(slots[0], 'abc');

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.poll(slotValues).toEqual(['', '', '', '', '', '']);
		}
	);
});
