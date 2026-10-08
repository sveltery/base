// Assertions follow Base UI v1.8.0 packages/react/src/dialog/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance, className/style callbacks, Alert Dialog, Drawer, Menu, and Select are not ported.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DialogActionsHarness from '../../tests/DialogActionsHarness.svelte';
import DialogHandleHarness from '../../tests/DialogHandleHarness.svelte';
import DialogHarness from '../../tests/DialogHarness.svelte';
import DialogNestedHandleHarness from '../../tests/DialogNestedHandleHarness.svelte';
import DialogMissingPortalHarness from '../../tests/DialogMissingPortalHarness.svelte';
import DialogOpenCompleteStateHarness from '../../tests/DialogOpenCompleteStateHarness.svelte';
import PortalContainerHarness from '../../tests/PortalContainerHarness.svelte';
import PortalHostHarness from '../../tests/PortalHostHarness.svelte';
import PortalLateAttachHarness from '../../tests/PortalLateAttachHarness.svelte';
import PortalReleaseHarness from '../../tests/PortalReleaseHarness.svelte';
import PortalRenderHarness from '../../tests/PortalRenderHarness.svelte';
import { Dialog } from './index.js';
import { REASONS } from '../internal/event-details.js';

function button(name: string) {
	return page.getByRole('button', { name, includeHidden: true });
}

function click(locator: { element(): Element }) {
	(locator.element() as HTMLElement).click();
}

async function frame() {
	await new Promise<void>((resolve) => {
		requestAnimationFrame(() => resolve());
	});
	await tick();
}

/** Modal dialogs aria-hide the dialogs under them, so role queries include those nodes. */
function dialogLocator() {
	return page.getByRole('dialog', { includeHidden: true });
}

/** Close unmounts after the popup's animations finish, which is after the click's tick. */
async function dialogs(count: number) {
	await expect.poll(() => dialogLocator().elements().length).toBe(count);
}

function internalBackdrop() {
	return document.querySelector('[data-base-ui-portal] [role="presentation"][data-base-ui-inert]');
}

async function openDialog() {
	const trigger = button('Open');
	click(trigger);
	await tick();
	return trigger;
}

describe('Dialog', () => {
	it('opens from the trigger and exposes dialog semantics', async () => {
		render(DialogHarness);
		const trigger = await openDialog();
		const dialog = page.getByRole('dialog');

		await expect.element(dialog).toHaveAttribute('data-open', '');
		await expect.element(dialog).toHaveAttribute('aria-labelledby');
		await expect.element(dialog).toHaveAttribute('aria-describedby');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
		await expect.element(trigger).toHaveAttribute('data-popup-open', '');
		expect(dialog.element().id).toMatch(/^base-ui-/);
		expect(page.getByRole('heading', { name: 'Title' }).element().id).toBe(
			dialog.element().getAttribute('aria-labelledby')
		);
	});

	it('closes from the close button with close-press', async () => {
		const onOpenChange = vi.fn();
		render(DialogHarness, { onOpenChange });
		await openDialog();
		click(button('Close'));
		await dialogs(0);
		expect(onOpenChange).toHaveBeenCalledWith(
			false,
			expect.objectContaining({ reason: REASONS.closePress, isCanceled: false })
		);
	});

	it('closes on Escape from the focused element with escape-key', async () => {
		const onOpenChange = vi.fn();
		render(DialogHarness, { onOpenChange });
		await openDialog();
		await frame();
		const focused = document.activeElement;
		expect(focused).toBe(button('Inside').element());
		focused?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await dialogs(0);
		expect(onOpenChange).toHaveBeenLastCalledWith(
			false,
			expect.objectContaining({ reason: REASONS.escapeKey })
		);
	});

	it('traps Tab inside the dialog', async () => {
		render(DialogHarness);
		await openDialog();
		await frame();
		const inside = button('Inside').element() as HTMLElement;
		const close = button('Close').element() as HTMLElement;
		expect(document.activeElement).toBe(inside);
		close.focus();
		close.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
		);
		expect(document.activeElement).toBe(inside);
		inside.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true,
				shiftKey: true
			})
		);
		expect(document.activeElement).toBe(close);
	});

	it('closes a modal dialog on backdrop click and not on pointerdown', async () => {
		const onOpenChange = vi.fn();
		render(DialogHarness, { onOpenChange });
		await openDialog();
		const backdrop = internalBackdrop() as HTMLElement;
		expect(backdrop).toBeTruthy();

		backdrop.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(1);

		backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
		await dialogs(0);
		expect(onOpenChange).toHaveBeenCalledWith(
			false,
			expect.objectContaining({ reason: REASONS.outsidePress })
		);
	});

	it('stays open when the trigger is pressed after a non-modal close', async () => {
		render(DialogHarness, { modal: false, withBackdrop: false, keepMounted: true });
		await openDialog();
		const close = button('Close').element() as HTMLElement;
		close.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		close.click();
		await expect.poll(() => button('Open').element().getAttribute('aria-expanded')).toBe('false');

		const trigger = button('Open').element() as HTMLElement;
		trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		trigger.click();
		await tick();
		await expect.element(button('Open')).toHaveAttribute('aria-expanded', 'true');
		await expect.element(page.getByTestId('popup')).not.toHaveAttribute('hidden');
	});

	it('does not close when a press starts inside the popup and ends on the viewport', async () => {
		render(DialogHarness, { withViewport: true });
		await openDialog();
		const inside = button('Inside').element() as HTMLElement;
		const viewport = page.getByTestId('viewport').element() as HTMLElement;
		inside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		viewport.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
		await tick();
		expect(dialogLocator().elements()).toHaveLength(1);
	});

	it('closes a non-modal dialog when the outside control is clicked', async () => {
		render(DialogHarness, { modal: false, withBackdrop: false });
		await openDialog();
		const outside = page.getByTestId('outside').element() as HTMLElement;
		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		outside.click();
		await dialogs(0);
	});

	it('leaves focus on an outside button when a non-modal dialog closes', async () => {
		render(DialogHarness, { modal: false, withBackdrop: false });
		await openDialog();
		const outside = page.getByTestId('outside').element() as HTMLButtonElement;
		outside.focus();
		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		outside.click();
		await dialogs(0);
		await frame();
		expect(document.activeElement).toBe(outside);
	});

	it('does not close when onOpenChange cancels', async () => {
		render(DialogHarness, {
			onOpenChange: (_open, details) => details.cancel()
		});
		const trigger = await openDialog();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(page.getByRole('dialog').elements()).toHaveLength(0);
	});

	it('does not open from a disabled trigger', async () => {
		render(DialogHarness, { disabled: true });
		const trigger = button('Open');
		await expect.element(trigger).toHaveAttribute('disabled', '');
		await expect.element(trigger).toHaveAttribute('data-disabled', '');
		click(trigger);
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(0);
	});

	it('does not close when the close click is prevented', async () => {
		render(DialogHarness);
		await openDialog();
		const close = button('Close');
		close.element().addEventListener(
			'click',
			(event) => {
				event.preventDefault();
			},
			{ capture: true }
		);
		click(close);
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(1);
	});

	it('focuses the first tabbable control and returns focus to the trigger', async () => {
		render(DialogHarness);
		const trigger = await openDialog();
		await frame();
		expect(document.activeElement).toBe(button('Inside').element());

		click(button('Close'));
		await frame();
		expect(document.activeElement).toBe(trigger.element());
	});

	it('does not move focus when initialFocus and finalFocus are false', async () => {
		render(DialogHarness, { initialFocus: false, finalFocus: false });
		const before = document.activeElement;
		await openDialog();
		await frame();
		expect(document.activeElement).toBe(before);
		click(button('Close'));
		await dialogs(0);
	});

	it('keeps Escape on the nested dialog', async () => {
		render(DialogHarness, { nested: true });
		await openDialog();
		click(button('Nested'));
		await dialogs(2);

		(document.activeElement ?? document.body).dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
		);
		await dialogs(1);
		await expect.element(page.getByRole('dialog')).toHaveTextContent(/Title/);
	});

	it('marks a nested dialog and counts it on the parent', async () => {
		render(DialogHarness, { nested: true });
		await openDialog();
		click(button('Nested'));
		await tick();
		const openDialogs = dialogLocator().elements();
		expect(openDialogs[1]).toHaveAttribute('data-nested', '');
		expect(openDialogs[0].style.getPropertyValue('--nested-dialogs')).toBe('1');
		expect(openDialogs[0]).toHaveAttribute('data-nested-dialog-open', '');
	});

	it('omits the internal backdrop when modal is false', async () => {
		render(DialogHarness, { modal: false });
		await openDialog();
		expect(internalBackdrop()).toBeNull();
	});

	it('keeps the popup mounted when keepMounted is set', async () => {
		render(DialogHarness, { keepMounted: true });
		expect(page.getByTestId('popup').elements()).toHaveLength(1);
		await expect.element(page.getByTestId('popup')).toHaveAttribute('hidden', '');
		await openDialog();
		await expect.element(page.getByTestId('popup')).not.toHaveAttribute('hidden');
	});

	it('unmounts after preventUnmountOnClose when the root unmount method is called', async () => {
		render(DialogActionsHarness);
		await openDialog();
		click(button('Open'));
		await frame();
		expect(page.getByTestId('popup').elements()).toHaveLength(1);

		click(button('Unmount'));
		await tick();
		expect(page.getByTestId('popup').elements()).toHaveLength(0);
	});

	it('does not store a payload for a trigger that is not registered', () => {
		const handle = Dialog.createHandle<string>();
		expect(handle.setPayload('x', 'orphan')).toBe(false);
		expect('payloads' in handle).toBe(false);
	});

	it('keeps the current payload when opened with an unknown trigger id', async () => {
		const handle = Dialog.createHandle<string>();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		try {
			render(DialogHandleHarness, { handle, payload: 'from-trigger', id: 'detached' });
			click(button('Detached'));
			await tick();
			await expect.element(page.getByTestId('payload')).toHaveTextContent('from-trigger');
			handle.close();
			await dialogs(0);
			expect(handle.setPayload('missing', 'from-missing')).toBe(false);
			expect(() => handle.open('missing')).not.toThrow();
			await tick();
			await expect.element(page.getByTestId('payload')).toHaveTextContent('from-trigger');
			expect(page.getByTestId('payload').element().textContent).not.toContain('from-missing');
			expect(warn.mock.calls.some((call) => String(call[0]).includes('Dialog.Handle.open'))).toBe(
				true
			);
			expect(warn.mock.calls.some((call) => String(call[0]).includes('PopupHandle'))).toBe(false);
		} finally {
			warn.mockRestore();
		}
	});

	it('opens with the payload passed to openWithPayload', async () => {
		const handle = Dialog.createHandle<string>();
		render(DialogHandleHarness, { handle, payload: 'from-trigger' });
		handle.openWithPayload('from-handle');
		await tick();
		await expect.element(page.getByTestId('payload')).toHaveTextContent('from-handle');
	});

	it('opens a detached trigger through a handle and passes its payload', async () => {
		const handle = Dialog.createHandle<string>();
		render(DialogHandleHarness, { handle });
		click(button('Detached'));
		await tick();
		await expect.element(page.getByTestId('payload')).toHaveTextContent('from-trigger');
		expect(handle.isOpen).toBe(true);
		handle.close();
		await dialogs(0);
	});

	it('opens a handled trigger rendered inside another dialog', async () => {
		const handle = Dialog.createHandle<string>();
		render(DialogNestedHandleHarness, { handle });
		await expect.element(page.getByRole('dialog', { name: 'Parent' })).toBeVisible();
		click(button('Open child'));
		await tick();
		await expect.element(page.getByTestId('child-popup')).toBeVisible();
		expect(handle.isOpen).toBe(true);
	});

	it('uses the latest handle payload when opened by trigger id', async () => {
		const handle = Dialog.createHandle<string>();
		const view = render(DialogHandleHarness, { handle, payload: 'p1', id: 't1' });
		await view.rerender({ handle, payload: 'p2', id: 't1' });
		handle.open('t1');
		await tick();
		await expect.element(page.getByTestId('payload')).toHaveTextContent('p2');
	});

	it('marks a detached trigger that rendered before an already-open root', async () => {
		const handle = Dialog.createHandle<string>();
		render(DialogHandleHarness, { handle, defaultOpen: true, defaultTriggerId: 'detached' });
		await expect.element(button('Detached')).toHaveAttribute('aria-expanded', 'true');
		await expect.element(page.getByRole('dialog', { name: 'Handled' })).toBeVisible();
	});

	it('throws when a trigger is rendered outside a root and without a handle', () => {
		expect(() => render(Dialog.Trigger)).toThrow(
			'Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.'
		);
	});

	it('throws when a popup is rendered outside a root', () => {
		expect(() => render(Dialog.Popup)).toThrow(/DialogRootContext is missing/);
	});

	it('unmounts the viewport after close unless keepMounted is set', async () => {
		const closed = render(DialogHarness, { withViewport: true });
		expect(page.getByTestId('viewport').elements()).toHaveLength(0);
		await openDialog();
		expect(page.getByTestId('viewport').elements()).toHaveLength(1);
		click(button('Close'));
		await dialogs(0);
		expect(page.getByTestId('viewport').elements()).toHaveLength(0);
		closed.unmount();

		render(DialogHarness, { withViewport: true, keepMounted: true });
		expect(page.getByTestId('viewport').elements()).toHaveLength(1);
		await openDialog();
		click(button('Close'));
		await expect
			.poll(() => page.getByTestId('popup').elements()[0]?.hasAttribute('hidden'))
			.toBe(true);
		expect(page.getByTestId('viewport').elements()).toHaveLength(1);
	});

	it('makes the internal backdrop inert while a prevented close stays mounted', async () => {
		render(DialogHarness, { preventUnmount: true });
		await openDialog();
		const backdrop = internalBackdrop() as HTMLElement;
		expect(backdrop.hasAttribute('inert')).toBe(false);
		click(button('Open'));
		await tick();
		expect(page.getByTestId('popup').elements()).toHaveLength(1);
		expect((internalBackdrop() as HTMLElement).hasAttribute('inert')).toBe(true);
	});

	it('focuses a finalFocus element and calls a finalFocus function on close', async () => {
		const element = document.createElement('button');
		element.textContent = 'After';
		document.body.append(element);
		const first = render(DialogHarness, { finalFocus: element });
		await openDialog();
		await frame();
		click(button('Close'));
		await frame();
		expect(document.activeElement).toBe(element);
		first.unmount();

		const target = document.createElement('button');
		document.body.append(target);
		const finalFocus = vi.fn(() => target);
		render(DialogHarness, { finalFocus });
		await openDialog();
		await frame();
		expect(finalFocus).not.toHaveBeenCalled();
		click(button('Close'));
		await frame();
		expect(finalFocus).toHaveBeenCalled();
		expect(document.activeElement).toBe(target);
		element.remove();
		target.remove();
	});

	it('calls initialFocus when the dialog focuses, not before it opens', async () => {
		const initialFocus = vi.fn(() => true as const);
		render(DialogHarness, { initialFocus });
		await tick();
		expect(initialFocus).not.toHaveBeenCalled();
		await openDialog();
		await frame();
		expect(initialFocus).toHaveBeenCalled();
	});

	it('shares triggerId for the trigger that opened the dialog', async () => {
		const initial = render(DialogHarness, {
			twoTriggers: true,
			defaultOpen: true,
			defaultTriggerId: 'one'
		});
		await expect.element(button('One')).toHaveAttribute('aria-expanded', 'true');
		await expect.element(page.getByTestId('trigger-id')).toHaveTextContent('');
		initial.unmount();

		render(DialogHarness, { twoTriggers: true });
		click(button('Two'));
		await tick();
		await expect.element(page.getByTestId('trigger-id')).toHaveTextContent('two');
		await expect.element(button('Two')).toHaveAttribute('aria-expanded', 'true');
		await expect.element(button('One')).toHaveAttribute('aria-expanded', 'false');
	});

	it('lets onOpenChangeComplete write $state when the dialog opens', async () => {
		// Completion runs inside the effect when animations are skipped. A tracked
		// callback that writes `$state` then exceeds the update depth.
		const view = globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean };
		const previous = view.BASE_UI_ANIMATIONS_DISABLED;
		view.BASE_UI_ANIMATIONS_DISABLED = true;
		try {
			render(DialogOpenCompleteStateHarness);
			click(button('Open'));
			await expect.poll(() => page.getByTestId('completions').element().textContent).toBe('true');
		} finally {
			view.BASE_UI_ANIMATIONS_DISABLED = previous;
		}
	});

	it('throws when a popup is rendered without a portal', () => {
		expect(() => render(DialogMissingPortalHarness)).toThrow(
			'Base UI: <Dialog.Portal> is missing.'
		);
	});

	it('forwards host attributes and attachments onto the portal element', async () => {
		render(PortalHostHarness, { part: 'dialog' });

		await expect.poll(() => document.querySelector('[data-slot="dialog-portal"]')).not.toBeNull();
		const portal = document.querySelector('[data-slot="dialog-portal"]');
		if (!(portal instanceof HTMLDivElement)) throw new Error('portal is not a div');

		expect(portal.classList.contains('portal-host')).toBe(true);
		expect(portal.getAttribute('data-probe')).toBe('probe');
		expect(portal.dataset.attached).toBe('yes');
		// The consumer attachment runs after the move, so it sees the container.
		expect(portal.dataset.attachedInBody).toBe('yes');
		expect(portal.parentElement).toBe(document.body);
		expect(portal.querySelector('[role="dialog"]')).not.toBeNull();
		// The marker stays empty. A consumer value does not replace it.
		expect(portal.getAttribute('data-base-ui-portal')).toBe('');
	});

	it('applies a render snippet to the portal element', async () => {
		render(PortalRenderHarness, { part: 'dialog' });

		await expect.poll(() => document.querySelector('[data-replacement]')).not.toBeNull();
		const portal = document.querySelector('[data-replacement]');
		if (!(portal instanceof HTMLDivElement)) throw new Error('portal is not a div');

		expect(portal.getAttribute('data-slot')).toBe('dialog-portal');
		expect(portal.classList.contains('portal-host')).toBe(true);
		expect(portal.getAttribute('data-base-ui-portal')).toBe('');
		expect(portal.dataset.attached).toBe('yes');
		expect(portal.dataset.attachedInBody).toBe('yes');
		expect(portal.parentElement).toBe(document.body);
		expect(portal.querySelector('[role="dialog"]')).not.toBeNull();
	});

	it('does not mount while container is null', async () => {
		const view = render(PortalContainerHarness, { part: 'dialog' });
		await tick();
		await frame();

		expect(document.querySelector('[data-slot="dialog-portal"]')).toBeNull();
		expect(document.body.querySelector('[role="dialog"]')).toBeNull();

		await view.rerender({ part: 'dialog', provide: true });
		const holder = document.querySelector('[data-testid="portal-holder"]');
		await expect
			.poll(() => document.querySelector('[data-slot="dialog-portal"]')?.parentElement)
			.toBe(holder);
		expect(document.querySelector('[data-slot="dialog-portal"] [role="dialog"]')).not.toBeNull();
	});

	it('returns focus to the trigger when an open container returns to null', async () => {
		render(PortalReleaseHarness, { part: 'dialog' });
		const trigger = button('Open');
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await expect.element(trigger).toHaveAttribute('aria-controls', dialogLocator().element().id);

		click(page.getByTestId('release'));
		await expect.element(trigger).toHaveFocus();
		expect(document.querySelector('[role="dialog"]')).toBeNull();
		expect(trigger.element().getAttribute('aria-controls')).toBeNull();
		expect(trigger.element().getAttribute('aria-expanded')).toBe('true');
	});

	it('sets aria-controls when a detached container is attached', async () => {
		render(PortalLateAttachHarness, { part: 'dialog' });
		const anchor = page.getByTestId('late-anchor');
		await expect.element(anchor).toBeInTheDocument();
		const holder = (anchor.element() as HTMLDivElement & { lateHolder: HTMLDivElement }).lateHolder;
		await expect.poll(() => holder.querySelector('[role="dialog"]')).toBeInstanceOf(HTMLElement);
		expect(holder.isConnected).toBe(false);

		const popup = holder.querySelector('[role="dialog"]') as HTMLElement;
		document.body.append(holder);
		await expect.element(button('Open')).toHaveAttribute('aria-controls', popup.id);
	});

	async function settled() {
		await frame();
		await frame();
	}

	function connected(testId: string) {
		const node = document.querySelector(`[data-testid="${testId}"]`);
		return node instanceof HTMLElement && node.isConnected && !node.hidden;
	}

	// Upstream FloatingFocusManager (47b40521) closes on focusout of its own popup or trigger
	// and keeps parent and child popups open. Document focusin closes these.
	it('keeps a parent open when its nested popup is portaled to the body', async () => {
		render(DialogHarness, { scenario: 'nested-body' });
		await openDialog();
		await settled();
		click(button('Nested'));
		await settled();
		const nested = page.getByTestId('nested-inside').element() as HTMLElement;
		nested.focus();
		await settled();
		expect(connected('parent-popup')).toBe(true);
		expect(connected('nested-popup')).toBe(true);
	});

	it('keeps the outer popup open when the inner finalFocus moves outside', async () => {
		render(DialogHarness, { scenario: 'final-focus' });
		await openDialog();
		await settled();
		click(button('Nested'));
		await settled();
		click(button('Nested close'));
		await settled();
		expect(connected('parent-popup')).toBe(true);
		expect(document.activeElement).toBe(page.getByTestId('final-target').element());
		expect(connected('nested-popup')).toBe(false);
	});

	it('keeps the parent open when a child with initialFocus false receives focus', async () => {
		render(DialogHarness, { scenario: 'child-initial' });
		await openDialog();
		await settled();
		click(button('Nested'));
		await settled();
		expect(connected('parent-popup')).toBe(true);
		expect(connected('nested-popup')).toBe(true);
		(page.getByTestId('nested-inside').element() as HTMLElement).focus();
		await settled();
		expect(connected('parent-popup')).toBe(true);
		expect(connected('nested-popup')).toBe(true);
	});

	it('keeps both sibling non-modal dialogs open when one is focused', async () => {
		render(DialogHarness, { scenario: 'siblings' });
		await settled();
		expect(connected('popup-a')).toBe(true);
		expect(connected('popup-b')).toBe(true);
		(page.getByTestId('inside-b').element() as HTMLElement).focus();
		await settled();
		expect(connected('popup-a')).toBe(true);
		expect(connected('popup-b')).toBe(true);
	});

	function press(testId: string) {
		document
			.querySelector(`[data-testid="${testId}"]`)
			?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
	}

	it('leaves focus in a child that stayed open when its keepMounted parent closes', async () => {
		render(DialogHarness, { scenario: 'kept-child' });
		click(page.getByTestId('open-parent'));
		await settled();
		click(button('Nested'));
		await settled();
		(page.getByTestId('nested-inside').element() as HTMLElement).focus();
		press('force-close');
		await settled();
		expect(document.activeElement).toBe(page.getByTestId('nested-inside').element());
		expect(connected('parent-popup')).toBe(false);
		expect(connected('nested-popup')).toBe(true);
	});

	it('focuses inside a keepMounted parent reopened onto a child that stayed open', async () => {
		render(DialogHarness, { scenario: 'kept-child' });
		click(page.getByTestId('open-parent'));
		await settled();
		click(button('Nested'));
		await settled();
		(page.getByTestId('nested-inside').element() as HTMLElement).focus();
		press('force-close');
		await settled();
		(page.getByTestId('open-parent').element() as HTMLElement).click();
		await settled();
		expect(document.activeElement).toBe(page.getByTestId('parent-inside').element());
		expect(connected('parent-popup')).toBe(true);
		expect(connected('nested-popup')).toBe(true);
	});

	it('shift-tabs from the open trigger onto the control before it', async () => {
		render(DialogHarness, { scenario: 'tab' });
		const open = page.getByRole('button', { name: 'Open' });
		await open.click();
		await expect.poll(() => document.activeElement?.textContent).toBe('Inside');
		(open.element() as HTMLElement).focus();
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		await expect.poll(() => document.activeElement).toBe(page.getByTestId('before').element());
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('tabs from the open trigger into the dialog', async () => {
		render(DialogHarness, { scenario: 'tab' });
		const open = page.getByRole('button', { name: 'Open' });
		await open.click();
		await expect.poll(() => document.activeElement?.textContent).toBe('Inside');
		(open.element() as HTMLElement).focus();
		await userEvent.keyboard('{Tab}');
		await expect.poll(() => document.activeElement?.textContent).toBe('Inside');
		await expect.element(page.getByRole('dialog')).toBeVisible();
	});

	it('tabs out of the last control onto the control after the trigger', async () => {
		render(DialogHarness, { scenario: 'tab' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.poll(() => document.activeElement?.textContent).toBe('Inside');
		await userEvent.keyboard('{Tab}');
		await expect.poll(() => document.activeElement).toBe(page.getByTestId('after').element());
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('leaves focus on an outside button when finalFocus is null', async () => {
		render(DialogHarness, { scenario: 'outside', finalFocus: null });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await page.getByTestId('outside').click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		await expect.element(page.getByTestId('outside')).toHaveFocus();
	});

	it('leaves focus on an outside button when finalFocus is an element', async () => {
		const target = document.createElement('button');
		target.dataset.testid = 'explicit-final';
		document.body.append(target);
		render(DialogHarness, { scenario: 'outside', finalFocus: target });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await page.getByTestId('outside').click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		await expect.element(page.getByTestId('outside')).toHaveFocus();
		target.remove();
	});

	it('does not call finalFocus when a pointer focus-out closes', async () => {
		const target = document.createElement('button');
		document.body.append(target);
		// React calls this function and ignores the result. A focus-out close skips it.
		const finalFocus = vi.fn(() => target);
		render(DialogHarness, { scenario: 'outside', finalFocus });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await page.getByTestId('outside').click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		await expect.element(page.getByTestId('outside')).toHaveFocus();
		expect(finalFocus).not.toHaveBeenCalled();
		target.remove();
	});

	it('keeps final focus outside when the parent and nested dialog open together', async () => {
		render(DialogHarness, { scenario: 'together-outside' });
		await expect.poll(() => document.querySelector('[data-testid="parent-popup"]')).toBeTruthy();
		await expect.poll(() => document.querySelector('[data-testid="nested-popup"]')).toBeTruthy();
		await expect
			.poll(() => document.activeElement?.getAttribute('data-testid'))
			.toBe('nested-inside');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => document.activeElement?.getAttribute('data-testid')).toBe('outside');
		expect(document.querySelector('[data-testid="parent-popup"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="nested-popup"]')).toBeNull();
	});

	it('keeps final focus on the outside control when the inner dialog closes', async () => {
		render(DialogHarness, { scenario: 'final-outside' });
		click(button('Open'));
		await expect.poll(() => document.querySelector('[data-testid="parent-popup"]')).toBeTruthy();
		click(button('Nested'));
		await expect
			.poll(() => document.activeElement?.getAttribute('data-testid'))
			.toBe('nested-inside');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => document.activeElement?.getAttribute('data-testid')).toBe('outside');
		expect(document.querySelector('[data-testid="parent-popup"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="nested-popup"]')).toBeNull();
	});

	it('ignores a stray store prop on the portal', async () => {
		const stray = { portalElement: null as HTMLElement | null };
		render(PortalHostHarness, { part: 'dialog', stray });

		await expect.poll(() => document.querySelector('[data-slot="dialog-portal"]')).not.toBeNull();
		const portal = document.querySelector('[data-slot="dialog-portal"]');
		if (!(portal instanceof HTMLDivElement)) throw new Error('portal is not a div');

		expect(stray.portalElement).toBeNull();
		expect(portal.parentElement).toBe(document.body);
		expect(portal.querySelector('[role="dialog"]')).not.toBeNull();
	});
});
