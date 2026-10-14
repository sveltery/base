// Assertions follow Base UI v1.9.0 packages/react/src/combobox/input/ComboboxInput.gecko.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

vi.mock('@sveltery/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltery/utils')>();
	return {
		...actual,
		platform: { ...actual.platform, engine: { ...actual.platform.engine, gecko: true } }
	};
});

describe('Combobox.Input in Gecko RTL', () => {
	it('uses Gecko RTL caret positions for Home and End', async () => {
		render(ComboboxHarness, { direction: 'rtl', inputValue: 'apple' });
		const input = page.getByTestId('input').element() as HTMLInputElement;
		input.focus();

		await userEvent.keyboard('{Home}');
		expect(input.selectionStart).toBe(input.value.length);

		await userEvent.keyboard('{End}');
		expect(input.selectionStart).toBe(0);
	});
});
