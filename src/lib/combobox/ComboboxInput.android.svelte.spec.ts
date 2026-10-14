// Assertions follow Base UI v1.9.0 packages/react/src/combobox/input/ComboboxInput.android.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

vi.mock('@sveltery/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltery/utils')>();
	return {
		...actual,
		platform: { ...actual.platform, os: { ...actual.platform.os, android: true } }
	};
});

describe('Combobox.Input on Android', () => {
	it('propagates changes during a composition', async () => {
		const onInputValueChange = vi.fn();
		render(ComboboxHarness, { root: { onInputValueChange } });
		const input = page.getByTestId('input').element() as HTMLInputElement;

		input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		input.value = 'a';
		input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));

		expect(onInputValueChange).toHaveBeenCalledWith('a', expect.anything());
	});
});
