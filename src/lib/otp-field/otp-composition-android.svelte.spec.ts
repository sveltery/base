// Assertions follow Base UI v1.9.0 packages/react/src/otp-field/input/OTPFieldInput.android.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OTPCompositionHarness from '../../tests/OTPCompositionHarness.svelte';

vi.mock('@sveltery/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltery/utils')>();
	return {
		...actual,
		platform: { ...actual.platform, os: { ...actual.platform.os, android: true } }
	};
});

describe('<OTPField.Input /> IME composition on Android', () => {
	it('commits each input during a composition', async () => {
		const onValueChange = vi.fn();
		render(OTPCompositionHarness, { validationType: 'alphanumeric', onValueChange });
		const slots = page.getByRole('textbox').elements() as HTMLInputElement[];
		slots[0].focus();

		slots[0].dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		slots[0].value = 'a';
		slots[0].dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange.mock.lastCall?.[0]).toBe('a');
		await expect.poll(() => document.activeElement).toBe(slots[1]);

		slots[0].dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'a' }));

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(slots.map((input) => input.value)).toEqual(['a', '', '', '', '', '']);
	});
});
