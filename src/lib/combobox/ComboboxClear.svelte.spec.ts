// Assertions follow Base UI v1.9.0 packages/react/src/combobox/clear/ComboboxClear.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React only) and the Autocomplete no-selection case (the
// Autocomplete parts belong to their own port). The `className` function assertion checks the
// `data-visible` attribute it mirrors.
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxPartsHarness from '../../tests/ComboboxPartsHarness.svelte';

const input = () => page.getByTestId('input');
const clear = () => page.getByTestId('clear');
const listbox = () => page.getByRole('listbox');

describe('Combobox.Clear', () => {
	it('renders in single mode when a value is selected', async () => {
		render(ComboboxHarness, { clear: true, root: { defaultValue: 'a' } });

		await expect.element(clear()).toBeInTheDocument();
	});

	it('does not render without a value by default', async () => {
		render(ComboboxHarness, { clear: true });

		await expect.element(input()).toBeInTheDocument();
		expect(clear().elements()).toHaveLength(0);
	});

	it('renders and clears chips in multiple mode', async () => {
		render(ComboboxHarness, {
			clear: true,
			chips: true,
			chipRemove: false,
			value: ['apple'],
			root: { multiple: true }
		});
		await expect.element(page.getByText('apple')).toBeInTheDocument();

		await userEvent.click(clear());

		await expect.element(page.getByText('apple')).not.toBeInTheDocument();
	});

	it('clears the selected value and focuses the input on click', async () => {
		render(ComboboxHarness, {
			clear: true,
			staticItems: [{ value: 'a' }],
			root: { defaultValue: 'a' }
		});

		await userEvent.click(clear());

		await expect.element(clear()).not.toBeInTheDocument();
		await expect.element(page.getByRole('combobox')).toHaveFocus();
	});

	it('clears after pointer interaction marks keyboard navigation inactive', async () => {
		render(ComboboxHarness, { clear: true, root: { defaultValue: 'a' } });

		input()
			.element()
			.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		await userEvent.click(clear());

		await expect.element(clear()).not.toBeInTheDocument();
	});

	it('does not dismiss the popup on click', async () => {
		render(ComboboxHarness, {
			open: true,
			clear: true,
			staticItems: [{ value: 'a' }, { value: 'b' }],
			root: { defaultValue: 'a' }
		});
		await expect.element(listbox()).toBeInTheDocument();

		await userEvent.click(clear());

		await expect.element(listbox()).toBeInTheDocument();
	});

	it('does not dismiss a popup input when the clear button is outside it', async () => {
		render(ComboboxPartsHarness, { scenario: 'clear-outside-popup-input' });

		await userEvent.click(page.getByRole('combobox'));
		await expect.element(input()).toHaveFocus();

		await userEvent.click(clear());

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();
		await expect.element(input()).toHaveFocus();
		await expect
			.element(page.getByRole('option', { name: 'a' }))
			.toHaveAttribute('aria-selected', 'false');
	});

	it('is disabled with the root and does nothing on click', async () => {
		render(ComboboxHarness, { clear: true, root: { defaultValue: 'a', disabled: true } });
		await expect.element(clear()).toHaveAttribute('disabled');

		(clear().element() as HTMLElement).click();

		await expect.element(clear()).toBeInTheDocument();
		await expect.element(input()).toHaveValue('a');
	});

	it('does nothing on click while the root is read-only', async () => {
		render(ComboboxHarness, { clear: true, root: { defaultValue: 'a', readonly: true } });

		(clear().element() as HTMLElement).click();

		await expect.element(clear()).toBeInTheDocument();
		await expect.element(input()).toHaveValue('a');
	});

	it('clears the selection without closing and restores popup input focus', async () => {
		render(ComboboxPartsHarness, { scenario: 'popup-clear' });

		await userEvent.click(page.getByTestId('trigger'));
		await expect.element(page.getByTestId('positioner')).toHaveAttribute('data-open', '');
		await expect.element(clear()).toHaveAttribute('data-visible', '');

		await userEvent.click(clear());

		await expect.element(clear()).not.toHaveAttribute('data-visible');
		await expect.element(page.getByRole('dialog')).toBeInTheDocument();
		await expect.element(input()).toHaveFocus();
		await expect.element(page.getByTestId('trigger')).toHaveTextContent('None');
		await expect
			.element(page.getByRole('option', { name: 'a' }))
			.toHaveAttribute('aria-selected', 'false');
	});

	describe('animations', () => {
		let style: HTMLStyleElement | undefined;

		afterEach(() => style?.remove());

		function addTransitionStyle() {
			style = document.createElement('style');
			style.textContent = `
				.animation-test-indicator { transition: opacity 1ms; }
				.animation-test-indicator[data-starting-style],
				.animation-test-indicator[data-ending-style] { opacity: 0; }
			`;
			document.head.append(style);
		}

		it('runs the enter animation through data-starting-style when becoming visible', async () => {
			addTransitionStyle();
			let finished = false;
			render(ComboboxHarness, {
				clear: true,
				clearProps: {
					class: 'animation-test-indicator',
					ontransitionend: () => (finished = true)
				},
				staticItems: [{ value: 'a' }]
			});
			expect(clear().elements()).toHaveLength(0);

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.click(page.getByRole('option', { name: 'a' }));

			await expect.poll(() => finished).toBe(true);
			await expect.element(clear()).toBeInTheDocument();
		});

		it('runs the exit animation through data-ending-style before unmounting', async () => {
			addTransitionStyle();
			let finished = false;
			render(ComboboxHarness, {
				clear: true,
				clearProps: {
					class: 'animation-test-indicator',
					keepMounted: true,
					ontransitionend: () => (finished = true)
				},
				root: { defaultValue: 'a' }
			});
			await expect.element(clear()).toBeInTheDocument();

			await userEvent.click(clear());

			await expect.poll(() => finished).toBe(true);
		});
	});
});
