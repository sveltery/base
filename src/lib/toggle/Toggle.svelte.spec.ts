// Assertions follow Base UI v1.8.0 packages/react/src/toggle/Toggle.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c), standalone cases. MIT, see THIRD_PARTY_NOTICES.md.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Toggle from './Toggle.svelte';
import ToggleBindHarness from '../../tests/ToggleBindHarness.svelte';
import ToggleAttachHarness from '../../tests/ToggleAttachHarness.svelte';

describe('Toggle', () => {
	describe('pressed state', () => {
		it('bound: follows the owner and writes back', async () => {
			render(ToggleBindHarness);
			const checkbox = page.getByRole('checkbox');
			const button = page.getByRole('button');

			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
			await checkbox.click();
			await expect.element(button).toHaveAttribute('aria-pressed', 'true');
			await checkbox.click();
			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
			await button.click();
			await expect.element(checkbox).toBeChecked();
		});

		it('standalone', async () => {
			render(Toggle);
			const button = page.getByRole('button');

			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
			await button.click();
			await expect.element(button).toHaveAttribute('aria-pressed', 'true');
			await button.click();
			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
		});
	});

	describe('prop: onPressedChange', () => {
		it('is called when the pressed state changes', async () => {
			const handlePressed = vi.fn();
			render(Toggle, { onPressedChange: handlePressed });

			await page.getByRole('button').click();

			expect(handlePressed).toHaveBeenCalledTimes(1);
			expect(handlePressed.mock.calls[0][0]).toBe(true);
		});

		it('does not change the pressed state when the event is canceled', async () => {
			render(Toggle, {
				onPressedChange: (_pressed, eventDetails) => eventDetails.cancel()
			});
			const button = page.getByRole('button');

			await button.click();

			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
		});
	});

	describe('prop: disabled', () => {
		it('disables the component', async () => {
			const handlePressed = vi.fn();
			render(Toggle, { disabled: true, onPressedChange: handlePressed });
			const button = page.getByRole('button');

			await expect.element(button).toHaveAttribute('disabled');
			await expect.element(button).toHaveAttribute('data-disabled');
			await expect.element(button).toHaveAttribute('aria-pressed', 'false');

			(button.element() as HTMLButtonElement).click();

			expect(handlePressed).not.toHaveBeenCalled();
			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
		});
	});

	describe('native Svelte', () => {
		it('one-way pressed sets the value, clicks override it until the owner changes it', async () => {
			render(ToggleBindHarness, { bound: false });
			const checkbox = page.getByRole('checkbox');
			const button = page.getByRole('button');

			await checkbox.click();
			await expect.element(button).toHaveAttribute('aria-pressed', 'true');
			await button.click();
			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
			await expect.element(checkbox).toBeChecked();
			await checkbox.click();
			await checkbox.click();
			await expect.element(button).toHaveAttribute('aria-pressed', 'true');
		});

		it('preventDefault in onclick skips the toggle handler', async () => {
			const handlePressed = vi.fn();
			render(Toggle, {
				onclick: (event: MouseEvent) => event.preventDefault(),
				onPressedChange: handlePressed
			});
			const button = page.getByRole('button');

			await button.click();

			expect(handlePressed).not.toHaveBeenCalled();
			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
		});

		it('renders a non-submit button and strips form', async () => {
			render(Toggle, { form: 'other', type: 'submit' });
			const button = page.getByRole('button');

			await expect.element(button).toHaveAttribute('type', 'button');
			await expect.element(button).not.toHaveAttribute('form');
		});

		it('passes consumer attachments to the default button', async () => {
			render(ToggleAttachHarness);

			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
			await page.getByRole('button').click();
			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
		});

		it('render snippet receives props, state and consumer attachments', async () => {
			render(ToggleAttachHarness, { custom: true });
			const host = page.getByRole('button', { name: 'Custom' });

			await expect.element(host).toHaveAttribute('data-state', 'off');
			await expect.element(page.getByTestId('host')).toHaveTextContent('custom-host');
			await host.click();
			await expect.element(host).toHaveAttribute('aria-pressed', 'true');
			await expect.element(host).toHaveAttribute('data-state', 'on');
		});
	});
});
