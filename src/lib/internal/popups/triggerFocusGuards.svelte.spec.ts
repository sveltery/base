// Assertions follow Base UI v1.9.0 packages/react/src/utils/popups/useTriggerFocusGuards.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream drives Popover and Menu. This harness drives the shared guards directly.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TriggerFocusGuardTabHarness from '../../../tests/TriggerFocusGuardTabHarness.svelte';

async function openPopup() {
	const trigger = page.getByRole('button', { name: 'Toggle' });
	await trigger.click();
	await expect.element(page.getByTestId('open')).toHaveTextContent('true');
	return trigger.element() as HTMLElement;
}

function focused() {
	return document.activeElement?.textContent ?? null;
}

describe('TriggerFocusGuards', () => {
	describe.each([0, -1])('trigger tabIndex=%s', (tabIndex) => {
		it('closes onto the control before the trigger on Shift+Tab', async () => {
			render(TriggerFocusGuardTabHarness, { tabIndex });
			const trigger = await openPopup();
			trigger.focus();

			await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

			await expect.element(page.getByTestId('open')).toHaveTextContent('false');
			expect(focused()).toBe('Before');
		});

		it('closes onto the control after the trigger when Tab leaves the popup', async () => {
			render(TriggerFocusGuardTabHarness, { tabIndex });
			await openPopup();
			page.getByRole('button', { name: 'Inside' }).element().focus();

			// The focus manager's trailing guard sends Tab from the popup to this target.
			(document.querySelectorAll('[data-base-ui-focus-guard]')[1] as HTMLElement).focus();

			await expect.element(page.getByTestId('open')).toHaveTextContent('false');
			expect(focused()).toBe('After');
		});
	});

	it('returns focus to the trigger when nothing outside is tabbable', async () => {
		render(TriggerFocusGuardTabHarness, { neighbors: false });
		const trigger = await openPopup();
		trigger.focus();

		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

		await expect.element(page.getByTestId('open')).toHaveTextContent('false');
		expect(document.activeElement).toBe(trigger);
	});
});
