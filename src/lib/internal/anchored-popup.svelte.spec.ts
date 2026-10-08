import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AnchoredPopupHarness from '../../tests/AnchoredPopupHarness.svelte';
import AnchoredScrollLockHarness from '../../tests/AnchoredScrollLockHarness.svelte';
import TriggerFocusGuardHarness from '../../tests/TriggerFocusGuardHarness.svelte';

function overflowLocked() {
	return (
		document.documentElement.style.overflowY === 'hidden' ||
		document.body.style.overflowY === 'hidden'
	);
}

describe('anchored popup', () => {
	it('places the popup under the trigger and locks scroll for a pointer open', async () => {
		render(AnchoredPopupHarness, { scenario: 'placed' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		const positioner = page.getByTestId('positioner');
		await expect.element(positioner).toHaveAttribute('data-positioned', '');
		await expect.element(positioner).toHaveAttribute('data-side', 'bottom');
		await expect
			.poll(() => {
				const triggerBox = trigger.element().getBoundingClientRect();
				const popupBox = positioner.element().getBoundingClientRect();
				return popupBox.top >= triggerBox.bottom - 1 && popupBox.left >= triggerBox.left - 1;
			})
			.toBe(true);
		await expect.poll(overflowLocked).toBe(true);
	});

	it('opens on hover, stays open over the popup, and does not lock scroll', async () => {
		render(AnchoredPopupHarness, { scenario: 'hover' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.hover();
		const popup = page.getByRole('dialog', { name: 'Notice' });
		await expect.element(popup).toBeVisible();
		await expect.poll(overflowLocked).toBe(false);
		await popup.hover();
		await expect.element(popup).toBeVisible();
		await page.getByTestId('outside').hover();
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
	});

	it('moves focus from the guards to the tabbable neighbors', async () => {
		render(TriggerFocusGuardHarness);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.poll(() => page.getByTestId('open').element().textContent).toBe('true');

		const beforeContent = page.getByTestId('before-content');
		const outside = page.getByRole('button', { name: 'Before' }).element();
		page
			.getByTestId('focus-target')
			.element()
			.dispatchEvent(new FocusEvent('focus', { bubbles: true, relatedTarget: outside }));
		await expect.poll(() => document.activeElement).toBe(beforeContent.element());
		await expect.poll(() => page.getByTestId('open').element().textContent).toBe('true');

		const inside = beforeContent.element();
		page
			.getByTestId('focus-target')
			.element()
			.dispatchEvent(new FocusEvent('focus', { bubbles: true, relatedTarget: inside }));
		await expect
			.poll(() => document.activeElement)
			.toBe(page.getByRole('button', { name: 'After' }).element());
		await expect.poll(() => page.getByTestId('open').element().textContent).toBe('false');
	});

	it('locks a touch-opened popup only when it is nearly as wide as the viewport', async () => {
		const narrow = render(AnchoredScrollLockHarness, {
			enabled: true,
			touchOpen: true,
			wide: false
		});
		await expect.poll(overflowLocked).toBe(false);
		narrow.unmount();

		render(AnchoredScrollLockHarness, { enabled: true, touchOpen: true, wide: true });
		await expect.poll(overflowLocked).toBe(true);
	});
});
