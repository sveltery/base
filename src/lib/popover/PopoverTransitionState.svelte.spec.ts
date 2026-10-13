// Assertions follow Base UI v1.9.0 packages/react/src/popover/backdrop/PopoverBackdrop.test.tsx
// and packages/react/src/popover/popup/PopoverPopupTransitionState.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverTransitionStateHarness from '../../tests/PopoverTransitionStateHarness.svelte';

interface PopupState {
	open: boolean;
	transitionStatus: string | undefined;
}

describe('Popover.Backdrop', () => {
	it.for([false, true])(
		'does not start an entry phase when initially open (bind:open=%s)',
		async (bound) => {
			const statuses = new Set<string | undefined>();
			render(PopoverTransitionStateHarness, {
				part: 'backdrop',
				bound,
				onState: (state) => statuses.add(state.transitionStatus)
			});
			await expect.poll(() => statuses.size).toBeGreaterThan(0);
			await new Promise((resolve) => requestAnimationFrame(resolve));

			expect(statuses).toEqual(new Set([undefined]));
		}
	);
});

describe('Popover.Popup transition state', () => {
	it('starts each opening once when the popup is kept mounted', async () => {
		const states: PopupState[] = [];
		function onState(state: PopupState) {
			const previous = states.at(-1);
			if (previous?.open !== state.open || previous?.transitionStatus !== state.transitionStatus) {
				states.push(state);
			}
		}
		const completed = vi.fn();
		render(PopoverTransitionStateHarness, {
			part: 'popup',
			onState,
			onOpenChangeComplete: completed
		});
		const trigger = page.getByRole('button', { name: 'Toggle' });

		// The transition outlasts every phase, so each phase is finished explicitly.
		async function finishPhase(element: HTMLElement) {
			await expect.poll(() => element.getAnimations().length).toBeGreaterThan(0);
			expect(completed).not.toHaveBeenCalled();
			element.getAnimations().forEach((animation) => animation.finish());
		}

		async function openPopover() {
			states.length = 0;
			completed.mockClear();
			await trigger.click();
			const popup = page.getByRole('dialog').element() as HTMLElement;
			await finishPhase(popup);
			await expect.poll(() => completed.mock.calls).toEqual([[true]]);
			expect(states.filter((state) => state.open)).toEqual([
				{ open: true, transitionStatus: 'starting' },
				{ open: true, transitionStatus: undefined }
			]);
			return popup;
		}

		async function closePopover(popup: HTMLElement) {
			completed.mockClear();
			await userEvent.keyboard('{Escape}');
			await finishPhase(popup);
			await expect.poll(() => completed.mock.calls).toEqual([[false]]);
			expect(popup.isConnected).toBe(true);
		}

		const popup = await openPopover();
		await closePopover(popup);
		expect(await openPopover()).toBe(popup);
	});
});
