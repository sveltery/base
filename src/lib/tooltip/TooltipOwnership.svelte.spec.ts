// Trigger ownership rules of Base UI v1.9.0 packages/react/src/utils/popups/popupStoreUtils.ts
// (`useImplicitActiveTrigger`, `useTriggerDataForwarding`, `createPopupOpenState`),
// packages/react/src/internals/useUnmountAfterClose.ts, and the handle-first store choice of
// packages/react/src/tooltip/trigger/TooltipTrigger.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TooltipHandleInRootHarness from '../../tests/TooltipHandleInRootHarness.svelte';
import TooltipOwnershipHarness from '../../tests/TooltipOwnershipHarness.svelte';
import { byTestId, hoverWithMouse } from '../../tests/tooltip-events.js';
import type { TooltipChangeEventDetails } from './types.js';

const flags = globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean };

beforeEach(() => {
	flags.BASE_UI_ANIMATIONS_DISABLED = true;
});

afterEach(() => {
	document.body.click();
});

function trigger() {
	const element = byTestId('trigger');
	if (!element) throw new Error('trigger missing');
	return element;
}

function popupText() {
	return byTestId('popup')?.textContent?.trim() ?? null;
}

async function settle() {
	await tick();
	await new Promise((resolve) => setTimeout(resolve, 50));
}

describe.for([
	{ name: 'a contained trigger', detached: false },
	{ name: 'a detached trigger', detached: true }
])('Tooltip.Root with $name', ({ detached }) => {
	it('does not call onOpenChange or write open when the root unmounts while open', async () => {
		const onOpenChange = vi.fn();
		const view = render(TooltipOwnershipHarness, { detached, open: true, onOpenChange });
		await expect.poll(popupText).toBe('Payload: from trigger');
		await view.rerender({ showRoot: false });
		await expect.poll(() => byTestId('popup')).toBeNull();
		await settle();
		expect(onOpenChange.mock.calls).toEqual([]);
		expect(view.component.getOpen()).toBe(true);
	});

	it('closes when the owning trigger unmounts while the root stays', async () => {
		const onOpenChange = vi.fn();
		const view = render(TooltipOwnershipHarness, { detached, open: true, onOpenChange });
		await expect.poll(popupText).toBe('Payload: from trigger');
		await view.rerender({ showTrigger: false });
		await expect.poll(() => view.component.getOpen()).toBe(false);
		expect(onOpenChange.mock.calls.map(([open, details]) => [open, details.reason])).toEqual([
			[false, 'none']
		]);
	});

	it('keeps the popup open when unmount() is called while open', async () => {
		const onOpenChangeComplete = vi.fn();
		const view = render(TooltipOwnershipHarness, { detached, open: true, onOpenChangeComplete });
		await expect.poll(popupText).toBe('Payload: from trigger');
		await settle();
		onOpenChangeComplete.mockClear();
		view.component.unmount();
		await settle();
		expect(popupText()).toBe('Payload: from trigger');
		expect(trigger().hasAttribute('data-popup-open')).toBe(true);
		expect(onOpenChangeComplete.mock.calls).toEqual([]);
	});

	it('completes a prevented close once when unmount() is called twice', async () => {
		const onOpenChangeComplete = vi.fn();
		const view = render(TooltipOwnershipHarness, {
			detached,
			onOpenChangeComplete,
			onOpenChange: (open: boolean, details: TooltipChangeEventDetails) => {
				if (!open) details.preventUnmountOnClose();
			}
		});
		hoverWithMouse(trigger());
		await expect.poll(popupText).toBe('Payload: from trigger');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => view.component.getOpen()).toBe(false);
		await settle();
		expect(popupText()).toBe('Payload: from trigger');
		onOpenChangeComplete.mockClear();
		view.component.unmount();
		view.component.unmount();
		await expect.poll(() => byTestId('popup')).toBeNull();
		await settle();
		expect(onOpenChangeComplete.mock.calls).toEqual([[false]]);
	});
});

describe('Tooltip.Root opened through a handle without a trigger', () => {
	it('does not let the lone trigger claim the popup', async () => {
		const view = render(TooltipOwnershipHarness, { detached: true });
		view.component.openWithoutTrigger();
		await expect.poll(popupText).toBe('Payload: none');
		await settle();
		expect(popupText()).toBe('Payload: none');
		expect(trigger().hasAttribute('data-popup-open')).toBe(false);
	});

	it('does not let a trigger that registers after the open claim the popup', async () => {
		const view = render(TooltipOwnershipHarness, { detached: true, showTrigger: false });
		view.component.openWithoutTrigger();
		await expect.poll(popupText).toBe('Payload: none');
		await view.rerender({ showTrigger: true });
		await settle();
		expect(popupText()).toBe('Payload: none');
		expect(trigger().hasAttribute('data-popup-open')).toBe(false);
	});

	it('lets the lone trigger claim a popup opened through bind:open', async () => {
		const view = render(TooltipOwnershipHarness, { detached: true });
		await view.rerender({ open: true });
		await expect.poll(popupText).toBe('Payload: from trigger');
		expect(trigger().hasAttribute('data-popup-open')).toBe(true);
	});
});

describe('Tooltip.Trigger with a handle inside another Tooltip.Root', () => {
	it('opens the handle tooltip, not the enclosing root', async () => {
		render(TooltipHandleInRootHarness);
		const inner = byTestId('inner-trigger');
		if (!inner) throw new Error('inner trigger missing');
		hoverWithMouse(inner);
		await expect.element(page.getByText('Inner content')).toBeVisible();
		expect(page.getByText('Outer content').query()).toBeNull();
		expect(inner.hasAttribute('data-popup-open')).toBe(true);
	});
});
