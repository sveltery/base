// Assertions follow Base UI v1.9.0 packages/react/src/utils/popups/useTriggerFocusGuards.test.tsx
// and packages/react/src/popover/root/PopoverRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverFocusGuardHarness from '../../tests/PopoverFocusGuardHarness.svelte';

function byTestId(id: string) {
	return page.getByTestId(id).element() as HTMLElement;
}

function trigger() {
	return page.getByRole('button', { name: 'Toggle' }).element() as HTMLElement;
}

function popupCount() {
	return document.querySelectorAll('[data-testid="popup"]').length;
}

async function openPopup() {
	await page.getByRole('button', { name: 'Toggle' }).click();
	await expect.poll(() => document.activeElement).toBe(byTestId('inside'));
}

function trackFocusedGuards() {
	const focused: Element[] = [];
	function onFocusIn(event: FocusEvent) {
		const target = event.target as Element;
		if (target.hasAttribute('data-base-ui-focus-guard')) focused.push(target);
	}
	document.addEventListener('focusin', onFocusIn);
	return { focused, stop: () => document.removeEventListener('focusin', onFocusIn) };
}

describe.for(['forward', 'backward'] as const)('tabbing %s from an open popover', (direction) => {
	it.for([0, -1])(
		'returns focus to the trigger without looping between guards when nothing else is tabbable (tabindex=%s)',
		async (tabindex) => {
			render(PopoverFocusGuardHarness, { tabindex, outside: false });
			await openPopup();
			(direction === 'backward' ? trigger() : byTestId('inside')).focus();

			const guards = trackFocusedGuards();
			try {
				await userEvent.tab({ shift: direction === 'backward' });
			} finally {
				guards.stop();
			}

			await expect.poll(popupCount).toBe(0);
			expect(new Set(guards.focused).size).toBe(guards.focused.length);
			expect(document.activeElement).toBe(trigger());
			expect(trigger().getAttribute('tabindex')).toBe(String(tabindex));
		}
	);
});

it('moves focus to the control after the trigger when tabbing from it during the exit animation', async () => {
	render(PopoverFocusGuardHarness);
	await openPopup();
	await page.getByRole('button', { name: 'Toggle' }).click();
	await expect.poll(() => byTestId('popup').hasAttribute('data-ending-style')).toBe(true);
	expect(document.activeElement).toBe(trigger());

	await userEvent.tab();

	expect(document.activeElement).toBe(byTestId('after'));
	await expect.poll(popupCount).toBe(0);
	expect(document.activeElement).toBe(byTestId('after'));
});
