// Assertions follow Base UI v1.8.0 packages/react/src/toggle/Toggle.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c), standalone cases. MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Toggle from './Toggle.svelte';
import ToggleControlledHarness from '../../tests/ToggleControlledHarness.svelte';
import ToggleRenderHarness from '../../tests/ToggleRenderHarness.svelte';

describe('Toggle', () => {
	describe('pressed state', () => {
		it('controlled', async () => {
			render(ToggleControlledHarness);
			const checkbox = page.getByRole('checkbox');
			const button = page.getByRole('button');

			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
			await checkbox.click();
			await expect.element(button).toHaveAttribute('aria-pressed', 'true');
			await checkbox.click();
			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
		});

		it('uncontrolled', async () => {
			render(Toggle, { defaultPressed: false });
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
			render(Toggle, { defaultPressed: false, onPressedChange: handlePressed });

			await page.getByRole('button').click();

			expect(handlePressed).toHaveBeenCalledTimes(1);
			expect(handlePressed.mock.calls[0][0]).toBe(true);
		});

		it('does not change the pressed state when the event is canceled', async () => {
			render(Toggle, {
				defaultPressed: false,
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

	describe('native Svelte rendering', () => {
		it('renders a non-submit button and strips form', async () => {
			render(Toggle, { form: 'other', type: 'submit' });
			const button = page.getByRole('button');

			await expect.element(button).toHaveAttribute('type', 'button');
			await expect.element(button).not.toHaveAttribute('form');
		});

		it('render snippet receives props and state and binds ref to its host', async () => {
			render(ToggleRenderHarness);
			const host = page.getByRole('button', { name: 'Custom' });

			await expect.element(host).toHaveAttribute('data-state', 'off');
			await expect.element(page.getByTestId('ref')).toHaveTextContent('custom-host');
			await host.click();
			await expect.element(host).toHaveAttribute('aria-pressed', 'true');
			await expect.element(host).toHaveAttribute('data-state', 'on');
		});
	});
});
