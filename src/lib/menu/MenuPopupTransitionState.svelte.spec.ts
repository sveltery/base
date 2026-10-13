// Assertions follow Base UI v1.9.0 packages/react/src/menu/popup/MenuPopupTransitionState.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `controlled` binds `open`; otherwise the root gets `open` once as its initial value.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuTransitionStateHarness from '../../tests/menu/MenuTransitionStateHarness.svelte';

type PopupState = { open: boolean; transitionStatus: string | undefined };

describe('Menu popup transition state', () => {
	it.each([
		{ controlled: false, keepMounted: false, defaultOpen: false },
		{ controlled: false, keepMounted: false, defaultOpen: true },
		{ controlled: false, keepMounted: true, defaultOpen: false },
		{ controlled: false, keepMounted: true, defaultOpen: true },
		{ controlled: true, keepMounted: false, defaultOpen: false },
		{ controlled: true, keepMounted: false, defaultOpen: true },
		{ controlled: true, keepMounted: true, defaultOpen: false },
		{ controlled: true, keepMounted: true, defaultOpen: true }
	])(
		'starts each opening once (controlled=$controlled, keepMounted=$keepMounted, defaultOpen=$defaultOpen)',
		async ({ controlled, keepMounted, defaultOpen }) => {
			const states: PopupState[] = [];
			function onState(state: PopupState) {
				const previous = states[states.length - 1];
				if (
					previous?.open !== state.open ||
					previous?.transitionStatus !== state.transitionStatus
				) {
					states.push(state);
				}
			}
			const completed = vi.fn();
			render(MenuTransitionStateHarness, {
				controlled,
				keepMounted,
				defaultOpen,
				onState,
				onOpenChangeComplete: completed
			});
			const toggle = page.getByRole('button', { name: 'Toggle' });

			// The transition outlasts every phase, so finishing it ends the phase instead of racing it.
			async function expectCompletedAfterAnimations(popup: HTMLElement, open: boolean) {
				await expect
					.poll(() => {
						popup.getAnimations().forEach((animation) => animation.finish());
						return completed.mock.calls;
					})
					.toEqual([[open]]);
			}

			async function openMenu() {
				states.length = 0;
				completed.mockClear();
				await userEvent.click(toggle);
				await expect.poll(() => page.getByRole('menu').query()).not.toBeNull();
				const popup = page.getByRole('menu').element() as HTMLElement;
				await expect.poll(() => popup.getAnimations().length).toBeGreaterThan(0);
				expect(completed).not.toHaveBeenCalled();
				await expectCompletedAfterAnimations(popup, true);
				expect(popup.getAnimations()).toHaveLength(0);
				expect(states.filter((state) => state.open)).toEqual([
					{ open: true, transitionStatus: 'starting' },
					{ open: true, transitionStatus: undefined }
				]);
			}

			async function closeAndReopen() {
				completed.mockClear();
				const popup = page.getByRole('menu').element() as HTMLElement;
				await userEvent.keyboard('{Escape}');
				await expect.poll(() => popup.getAnimations().length).toBeGreaterThan(0);
				expect(completed).not.toHaveBeenCalled();
				await expectCompletedAfterAnimations(popup, false);
				expect(popup.isConnected).toBe(keepMounted);
				await openMenu();
			}

			if (defaultOpen) {
				await expect.poll(() => completed.mock.calls).toEqual([[true]]);
				expect(states).toEqual([{ open: true, transitionStatus: undefined }]);
			} else {
				await openMenu();
			}

			await closeAndReopen();
			if (defaultOpen && keepMounted) {
				await closeAndReopen();
			}

			// A reversed exit keeps the popup mounted, starts no entry phase, and reports no
			// completion for the canceled close.
			completed.mockClear();
			const popup = page.getByRole('menu').element() as HTMLElement;
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => popup.getAnimations().length).toBeGreaterThan(0);
			expect(completed).not.toHaveBeenCalled();
			states.length = 0;
			await userEvent.click(toggle);
			await expect.poll(() => popup.hasAttribute('data-open')).toBe(true);
			await expectCompletedAfterAnimations(popup, true);
			expect(page.getByRole('menu').element()).toBe(popup);
			expect(states.some((state) => state.transitionStatus === 'starting')).toBe(false);
			expect(popup.getAnimations()).toHaveLength(0);
		}
	);
});
