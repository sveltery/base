// End-to-end checks of the Combobox port of Base UI v1.9.0
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const option = (name: string) => page.getByRole('option', { name, exact: true });

describe('smoke', () => {
	it('filters and selects', async () => {
		const view = render(ComboboxHarness, { items: ['apple', 'banana', 'cherry'] });
		await userEvent.click(input());
		await expect.element(option('apple')).toBeVisible();
		await userEvent.type(input(), 'ban');
		await expect.element(option('apple')).not.toBeInTheDocument();
		await expect.element(option('banana')).toBeVisible();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(input()).toHaveAttribute('aria-activedescendant');
		await userEvent.keyboard('{Enter}');
		await expect.element(input()).toHaveValue('banana');
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		void view;
	});

	it('multiple with chips', async () => {
		render(ComboboxHarness, { items: ['apple', 'banana'], chips: true, root: { multiple: true } });
		await userEvent.click(input());
		await userEvent.click(option('apple'));
		await expect.element(page.getByTestId('chip-apple')).toBeVisible();
		await userEvent.click(page.getByTestId('remove-apple'));
		await expect.element(page.getByTestId('chip-apple')).not.toBeInTheDocument();
	});

	it('input inside popup', async () => {
		render(ComboboxHarness, { items: ['apple', 'banana'], inputInside: true });
		await userEvent.click(page.getByTestId('trigger'));
		await expect.element(input()).toHaveFocus();
		await userEvent.click(option('banana'));
		await expect.element(page.getByTestId('trigger')).toHaveTextContent('banana');
	});

	it('empty', async () => {
		render(ComboboxHarness, { items: ['apple'], empty: 'No results' });
		await userEvent.click(input());
		await userEvent.type(input(), 'zzz');
		await expect.element(page.getByTestId('empty')).toHaveTextContent('No results');
	});
});
