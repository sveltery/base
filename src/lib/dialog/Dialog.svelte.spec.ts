// Assertions follow Base UI v1.8.0 packages/react/src/dialog/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance, className/style callbacks, Alert Dialog, Drawer, Menu, and Select are not ported.
import { tick } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DialogActionsHarness from '../../tests/DialogActionsHarness.svelte';
import DialogHandleHarness from '../../tests/DialogHandleHarness.svelte';
import DialogHarness from '../../tests/DialogHarness.svelte';
import DialogMissingPortalHarness from '../../tests/DialogMissingPortalHarness.svelte';
import { Dialog } from './index.js';
import { REASONS } from '../internal/event-details.js';

async function frame() {
	await new Promise<void>((resolve) => {
		requestAnimationFrame(() => resolve());
	});
	await tick();
}

async function openDialog() {
	const trigger = page.getByRole('button', { name: 'Open' });
	trigger.element().click();
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
		page.getByRole('button', { name: 'Close' }).element().click();
		await tick();

		expect(page.getByRole('dialog').elements()).toHaveLength(0);
		expect(onOpenChange).toHaveBeenCalledWith(
			false,
			expect.objectContaining({ reason: REASONS.closePress, isCanceled: false })
		);
	});

	it('closes on Escape with escape-key', async () => {
		const onOpenChange = vi.fn();
		render(DialogHarness, { onOpenChange });
		await openDialog();
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await tick();

		expect(page.getByRole('dialog').elements()).toHaveLength(0);
		expect(onOpenChange).toHaveBeenLastCalledWith(
			false,
			expect.objectContaining({ reason: REASONS.escapeKey })
		);
	});

	it('closes a modal dialog on backdrop click and not on pointerdown', async () => {
		const onOpenChange = vi.fn();
		render(DialogHarness, { onOpenChange });
		await openDialog();
		const backdrop = document.querySelector('[data-base-ui-inert]') as HTMLElement;
		expect(backdrop).toBeTruthy();

		backdrop.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(1);

		backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(0);
		expect(onOpenChange).toHaveBeenCalledWith(
			false,
			expect.objectContaining({ reason: REASONS.outsidePress })
		);
	});

	it('closes a non-modal dialog when the outside control is clicked', async () => {
		render(DialogHarness, { modal: false, withBackdrop: false });
		await openDialog();
		page.getByTestId('outside').element().click();
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(0);
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
		const trigger = page.getByRole('button', { name: 'Open' });
		await expect.element(trigger).toHaveAttribute('disabled', '');
		await expect.element(trigger).toHaveAttribute('data-disabled', '');
		trigger.element().click();
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(0);
	});

	it('does not close when the close click is prevented', async () => {
		render(DialogHarness);
		await openDialog();
		const close = page.getByRole('button', { name: 'Close' });
		close.element().addEventListener(
			'click',
			(event) => {
				event.preventDefault();
			},
			{ capture: true }
		);
		close.element().click();
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(1);
	});

	it('focuses the first tabbable control and returns focus to the trigger', async () => {
		render(DialogHarness);
		const trigger = await openDialog();
		await frame();
		expect(document.activeElement).toBe(page.getByRole('button', { name: 'Inside' }).element());

		page.getByRole('button', { name: 'Close' }).element().click();
		await frame();
		expect(document.activeElement).toBe(trigger.element());
	});

	it('does not move focus when initialFocus and finalFocus are false', async () => {
		render(DialogHarness, { initialFocus: false, finalFocus: false });
		const before = document.activeElement;
		await openDialog();
		await frame();
		expect(document.activeElement).toBe(before);
		page.getByRole('button', { name: 'Close' }).element().click();
		await frame();
		expect(page.getByRole('dialog').elements()).toHaveLength(0);
	});

	it('keeps Escape on the nested dialog', async () => {
		render(DialogHarness, { nested: true });
		await openDialog();
		page.getByRole('button', { name: 'Nested' }).element().click();
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(2);

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(1);
		await expect.element(page.getByRole('dialog')).toHaveText(/Title/);
	});

	it('marks a nested dialog and counts it on the parent', async () => {
		render(DialogHarness, { nested: true });
		await openDialog();
		page.getByRole('button', { name: 'Nested' }).element().click();
		await tick();
		const dialogs = page.getByRole('dialog').elements();
		expect(dialogs[1]).toHaveAttribute('data-nested', '');
		expect(dialogs[0].style.getPropertyValue('--nested-dialogs')).toBe('1');
		expect(dialogs[0]).toHaveAttribute('data-nested-dialog-open', '');
	});

	it('omits the internal backdrop when modal is false', async () => {
		render(DialogHarness, { modal: false });
		await openDialog();
		expect(document.querySelector('[data-base-ui-inert]')).toBeNull();
	});

	it('keeps the popup mounted when keepMounted is set', async () => {
		render(DialogHarness, { keepMounted: true });
		expect(page.getByTestId('popup').elements()).toHaveLength(1);
		await expect.element(page.getByTestId('popup')).toHaveAttribute('hidden', '');
		await openDialog();
		await expect.element(page.getByTestId('popup')).not.toHaveAttribute('hidden');
	});

	it('unmounts after preventUnmountOnClose when actions.unmount is called', async () => {
		render(DialogActionsHarness);
		await openDialog();
		page.getByRole('button', { name: 'Open' }).element().click();
		await tick();
		expect(page.getByTestId('popup').elements()).toHaveLength(1);

		page.getByRole('button', { name: 'Unmount' }).element().click();
		await tick();
		expect(page.getByTestId('popup').elements()).toHaveLength(0);
	});

	it('opens a detached trigger through a handle and passes its payload', async () => {
		const handle = Dialog.createHandle<string>();
		render(DialogHandleHarness, { handle });
		page.getByRole('button', { name: 'Detached' }).element().click();
		await tick();
		await expect.element(page.getByTestId('payload')).toHaveTextContent('from-trigger');
		expect(handle.isOpen).toBe(true);
		handle.close();
		await tick();
		expect(page.getByRole('dialog').elements()).toHaveLength(0);
	});

	it('throws when a trigger is rendered outside a root and without a handle', () => {
		expect(() => render(Dialog.Trigger)).toThrow(
			'Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.'
		);
	});

	it('throws when a popup is rendered outside a root', () => {
		expect(() => render(Dialog.Popup)).toThrow(/DialogRootContext is missing/);
	});

	it('throws when a popup is rendered without a portal', () => {
		expect(() => render(DialogMissingPortalHarness)).toThrow(
			'Base UI: <Dialog.Portal> is missing.'
		);
	});
});
