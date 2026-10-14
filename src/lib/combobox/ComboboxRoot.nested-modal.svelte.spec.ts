import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxNestedModalHarness from '../../tests/ComboboxNestedModalHarness.svelte';

describe('Combobox.Root', () => {
	it('keeps the input exposed while a modal dialog opened from its popup hides the page', async () => {
		render(ComboboxNestedModalHarness);
		const input = page.getByRole('combobox', { name: 'Fruit' }).element();

		await userEvent.click(input);
		await userEvent.click(page.getByRole('button', { name: 'Details' }));
		await expect.element(page.getByRole('dialog', { name: 'Fruit details' })).toBeVisible();

		expect(input.closest('[aria-hidden="true"]')).toBe(null);
		expect(page.getByTestId('outside').element().getAttribute('aria-hidden')).toBe('true');
	});
});
