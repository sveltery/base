// Assertions follow Base UI v1.9.0
// packages/react/src/floating-ui-react/components/FloatingFocusManager.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ExplicitReturnFocusHarness from './__tests__/ExplicitReturnFocusHarness.svelte';

function focusedTestId() {
	return document.activeElement?.getAttribute('data-testid') ?? null;
}

describe('FloatingFocusManager prop: explicitReturnFocus', () => {
	it('keeps focus on an outside control that closed the popup by default', async () => {
		render(ExplicitReturnFocusHarness);
		await userEvent.click(page.getByTestId('reference'));
		await expect.poll(focusedTestId).toBe('child');

		await userEvent.click(page.getByTestId('close'));
		await expect.poll(() => document.querySelector('[data-testid="child"]')).toBeNull();
		await new Promise((resolve) => requestAnimationFrame(resolve));
		expect(focusedTestId()).toBe('close');
	});

	it('returns focus to the trigger from an outside control when true', async () => {
		render(ExplicitReturnFocusHarness, { explicitReturnFocus: true });
		await userEvent.click(page.getByTestId('reference'));
		await expect.poll(focusedTestId).toBe('child');

		await userEvent.click(page.getByTestId('close'));
		await expect.poll(focusedTestId).toBe('reference');
	});

	it('uses the latest explicitReturnFocus value without moving focus while open', async () => {
		const { rerender } = render(ExplicitReturnFocusHarness, { explicitReturnFocus: true });
		await userEvent.click(page.getByTestId('reference'));
		await expect.poll(focusedTestId).toBe('child');

		await rerender({ explicitReturnFocus: false });
		expect(focusedTestId()).toBe('child');

		await userEvent.click(page.getByTestId('close'));
		await expect.poll(() => document.querySelector('[data-testid="child"]')).toBeNull();
		await new Promise((resolve) => requestAnimationFrame(resolve));
		expect(focusedTestId()).toBe('close');
	});
});
