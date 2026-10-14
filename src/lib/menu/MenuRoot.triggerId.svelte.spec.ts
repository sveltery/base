// Expected behavior follows Base UI v1.9.0 packages/react/src/utils/popups/popupStoreUtils.ts
// and packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream resets `activeTriggerId` once the popup unmounts (`useOpenStateTransitions`), and an
// open that names no trigger makes the only registered trigger the active trigger element
// (`useImplicitActiveTrigger`), even one that remounted under a new id. Menu and menubar menus
// run both hooks. The active trigger element anchors the positioner and receives focus on close.
import { userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuTriggerIdHarness from '../../tests/menu/MenuTriggerIdHarness.svelte';
import { parkPointer } from '../../tests/pointer.js';

function byTestId(id: string) {
	return document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
}

function trigger() {
	const element = byTestId('trigger');
	if (!element) throw new Error('no trigger');
	return element;
}

function ownership() {
	const rect = byTestId('positioner')?.getBoundingClientRect();
	return {
		ariaExpanded: trigger().getAttribute('aria-expanded'),
		controlsPopup:
			trigger().getAttribute('aria-controls') === document.querySelector('[role="menu"]')?.id,
		boundTriggerIsTrigger: byTestId('trigger-id')!.textContent === trigger().id,
		positioner: rect ? [Math.round(rect.left), Math.round(rect.top)] : null
	};
}

// The trigger sits at (100, 100) and is 36px tall. side=bottom, align=start.
const OWNED = {
	ariaExpanded: 'true',
	controlsPopup: true,
	boundTriggerIsTrigger: true,
	positioner: [100, 136]
};

/** Soft, so one run reports both the ownership and the focus return. */
async function expectOwnedThenFocusReturn() {
	await expect.poll(() => byTestId('positioner')).not.toBeNull();
	await expect
		.poll(ownership)
		.toEqual(OWNED)
		.catch(() => {});
	expect.soft(ownership(), 'the only trigger owns the open menu').toEqual(OWNED);

	await userEvent.keyboard('{Escape}');
	await expect.poll(() => byTestId('positioner')).toBeNull();
	await expect
		.poll(() => document.activeElement)
		.toBe(trigger())
		.catch(() => {});
	expect.soft(document.activeElement, 'Escape returns focus to the trigger').toBe(trigger());
}

async function openWithClickThenEscape() {
	await userEvent.click(trigger());
	await expect.poll(ownership).toEqual(OWNED);
	await userEvent.keyboard('{Escape}');
	await expect.poll(() => byTestId('positioner')).toBeNull();
	await expect.poll(() => document.activeElement).toBe(trigger());
	// A pointer resting on a remounted menubar trigger hovers it open and hides the bind:open path.
	await parkPointer();
}

beforeEach(parkPointer);

describe.each([
	['Menu', false],
	['Menubar menu', true]
] as const)('%s with one trigger opened through bind:open', (_, menubar) => {
	it('anchors to the only trigger on the first open', async () => {
		const view = render(MenuTriggerIdHarness, { menubar });

		await view.rerender({ open: true });
		await expectOwnedThenFocusReturn();
	});

	it('claims the remounted trigger after the previous trigger opened the menu', async () => {
		const view = render(MenuTriggerIdHarness, { menubar });
		await openWithClickThenEscape();
		const previous = trigger().id;

		await view.rerender({ triggerKey: 1 });
		await expect.poll(() => trigger().id).not.toBe(previous);

		await view.rerender({ open: true });
		await expectOwnedThenFocusReturn();
	});

	it('claims the only trigger after the parent cleared triggerId', async () => {
		const view = render(MenuTriggerIdHarness, { menubar });
		await openWithClickThenEscape();
		view.component.setTriggerId(null);
		await expect.poll(() => byTestId('trigger-id')!.textContent).toBe('');
		(document.activeElement as HTMLElement).blur();

		await view.rerender({ open: true });
		await expectOwnedThenFocusReturn();
	});
});
