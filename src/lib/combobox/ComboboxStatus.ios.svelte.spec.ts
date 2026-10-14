// Assertions follow Base UI v1.9.0 packages/react/src/combobox/status/ComboboxStatus.iOS.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

vi.mock('@sveltery/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltery/utils')>();
	return {
		...actual,
		platform: { ...actual.platform, os: { ...actual.platform.os, ios: true, apple: true } }
	};
});

describe('Combobox.Status on iOS', () => {
	it('skips the initial text mutation', async () => {
		render(ComboboxHarness, { open: true, status: 'Searching…', staticItems: [{ value: 'a' }] });
		const status = page.getByTestId('status');

		await expect.element(page.getByRole('status')).toBeInTheDocument();
		expect(page.getByRole('status').element()).toBe(status.element());
		expect(status.element().textContent).toBe('Searching…');

		await new Promise((resolve) => setTimeout(resolve, 250));

		expect(status.element().textContent).toBe('Searching…');
	});
});
