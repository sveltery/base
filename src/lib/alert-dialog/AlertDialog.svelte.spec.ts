// Assertions follow Base UI v1.9.0 packages/react/src/alert-dialog/root/AlertDialogRoot.test.tsx,
// AlertDialogRoot.spec.tsx, and the shared suites it runs: packages/react/test/popupConformanceTests.tsx,
// dialogRootSharedTests.tsx, and detachedTriggersConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `defaultOpen` with `open={false}` (there is no `defaultOpen`), and the render count of
// an inactive detached trigger (Svelte has no component re-render to count). The payload type checks
// in AlertDialogRoot.spec.tsx are in src/tests/PayloadTypes.svelte, which `pnpm check` verifies.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import AlertDialogFixture from '../../routes/fixtures/alert-dialog/AlertDialogFixture.svelte';
import AlertDialogNestingHarness from '../../tests/AlertDialogNestingHarness.svelte';
import AlertDialogOverlapHarness from '../../tests/AlertDialogOverlapHarness.svelte';
import AlertDialogStateHarness from '../../tests/AlertDialogStateHarness.svelte';
import { Dialog, DialogHandle } from '../dialog/index.js';
import {
	AlertDialog,
	type AlertDialogChangeEventDetails,
	type AlertDialogRootProps,
	type AlertDialogTriggerProps
} from './index.js';

function button(name: string) {
	return page.getByRole('button', { name, exact: true, includeHidden: true });
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

function popup() {
	return document.querySelector<HTMLElement>('[data-testid="popup"]');
}

function trigger(number?: number) {
	return page.getByTestId(number === undefined ? 'trigger' : `trigger-${number}`);
}

function internalBackdrop() {
	return document.querySelector<HTMLElement>(
		'[data-base-ui-portal] [role="presentation"][data-base-ui-inert]'
	);
}

async function popupClosed() {
	await expect.poll(popup).toBeNull();
}

async function content(text: string) {
	await expect.element(page.getByTestId('content')).toHaveTextContent(text);
}

/** Only the trigger numbered `active` carries the open state, and only it controls the popup. */
function expectActiveTrigger(active: number | null, count = 2) {
	const popupId = active === null ? null : popup()!.id;
	for (let number = 1; number <= count; number += 1) {
		const element = trigger(number).element();
		const isActive = number === active;
		expect(element.hasAttribute('data-popup-open')).toBe(isActive);
		expect(element.getAttribute('aria-expanded')).toBe(String(isActive));
		if (isActive) {
			expect(popupId).not.toBe('');
			expect(element.getAttribute('aria-controls')).toBe(popupId);
		} else if (popupId !== null) {
			expect(element.hasAttribute('aria-controls')).toBe(false);
		}
	}
}

function countWarnings(warn: { mock: { calls: unknown[][] } }, text: string) {
	return warn.mock.calls.filter(([message]) => String(message).includes(text)).length;
}

describe('AlertDialog', () => {
	describe('popup conformance', () => {
		it('opens the popup with the `open` prop', async () => {
			const screen = render(AlertDialogFixture, { open: false });
			expect(popup()).toBeNull();
			await screen.rerender({ open: true });
			await expect.poll(popup).not.toBeNull();
		});

		it('opens from an initial `open` and closes on Escape', async () => {
			render(AlertDialogFixture, { open: true });
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			await frame();
			await userEvent.keyboard('{Escape}');
			await popupClosed();
		});

		it('stays open on Escape while the parent holds `open`', async () => {
			render(AlertDialogFixture, { open: true, holdOpen: true });
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			await frame();
			await userEvent.keyboard('{Escape}');
			await frame();
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
		});

		it('calls onOpenChange with the new open state and the change details', async () => {
			const onOpenChange = vi.fn();
			render(AlertDialogFixture, { onOpenChange });
			expect(onOpenChange).not.toHaveBeenCalled();

			click(trigger());
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			expect(onOpenChange).toHaveBeenCalledTimes(1);
			expect(onOpenChange).toHaveBeenNthCalledWith(
				1,
				true,
				expect.objectContaining({ reason: REASONS.triggerPress, trigger: trigger().element() })
			);

			await frame();
			await userEvent.keyboard('{Escape}');
			await popupClosed();
			expect(onOpenChange).toHaveBeenCalledTimes(2);
			expect(onOpenChange).toHaveBeenNthCalledWith(
				2,
				false,
				expect.objectContaining({ reason: REASONS.escapeKey })
			);
		});

		it('keeps the popup closed when the open change is canceled', async () => {
			const onOpenChange = vi.fn();
			render(AlertDialogFixture, { scenario: 'cancel', onOpenChange });
			click(trigger());
			await frame();
			expect(onOpenChange).toHaveBeenCalledTimes(1);
			expect(onOpenChange).toHaveBeenNthCalledWith(
				1,
				true,
				expect.objectContaining({ reason: REASONS.triggerPress, isCanceled: true })
			);
			expect(popup()).toBeNull();
			await expect.element(trigger()).not.toHaveAttribute('data-popup-open');
		});

		it('has the alertdialog role on the popup', async () => {
			render(AlertDialogFixture, { open: true });
			await expect.element(page.getByTestId('popup')).toHaveAttribute('role', 'alertdialog');
		});

		it('has the `aria-controls` attribute on the trigger', async () => {
			render(AlertDialogFixture, { open: true });
			await expect.poll(popup).not.toBeNull();
			await expect.element(trigger()).toHaveAttribute('aria-controls', popup()!.id);
		});

		it('opens on trigger click and sets `aria-expanded` on the trigger', async () => {
			render(AlertDialogFixture);
			expect(popup()).toBeNull();
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
			click(trigger());
			await expect.element(page.getByTestId('popup')).toHaveAttribute('data-open', '');
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
		});

		it('has the `aria-haspopup` attribute on the trigger', async () => {
			const screen = render(AlertDialogFixture, { open: false });
			await expect.element(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
			await screen.rerender({ open: true });
			await expect.poll(popup).not.toBeNull();
			await expect.element(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
		});

		it('allows a custom `id` prop', async () => {
			render(AlertDialogFixture, { open: true, popupId: 'TestId' });
			await expect.element(page.getByTestId('popup')).toHaveAttribute('id', 'TestId');
			await expect.element(trigger()).toHaveAttribute('aria-controls', 'TestId');
		});

		describe('prop: onOpenChangeComplete', () => {
			const animationName = 'alert-dialog-complete';
			let style: HTMLStyleElement | undefined;

			afterEach(() => {
				style?.remove();
				style = undefined;
			});

			function addAnimations() {
				style = document.createElement('style');
				style.textContent = `
					@keyframes ${animationName}-enter { from { opacity: 0; } }
					@keyframes ${animationName}-exit { to { opacity: 0; } }
					.${animationName}[data-open] { animation: ${animationName}-enter 200ms; }
					.${animationName}[data-ending-style] { animation: ${animationName}-exit 200ms; }
				`;
				document.head.append(style);
			}

			const isAnimating = () =>
				popup()!
					.getAnimations()
					.some((animation) => animation.playState === 'running');

			it('is not called on mount when closed', async () => {
				const onOpenChangeComplete = vi.fn();
				render(AlertDialogFixture, { onOpenChangeComplete });
				await frame();
				expect(onOpenChangeComplete).not.toHaveBeenCalled();
			});

			it('is called on open when there is no enter animation', async () => {
				const onOpenChangeComplete = vi.fn();
				const screen = render(AlertDialogFixture, { open: false, onOpenChangeComplete });
				await screen.rerender({ open: true });
				await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true]]);
			});

			it('is called on close when there is no exit animation', async () => {
				const onOpenChangeComplete = vi.fn();
				const screen = render(AlertDialogFixture, { open: true, onOpenChangeComplete });
				await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true]]);
				await screen.rerender({ open: false });
				await popupClosed();
				await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true], [false]]);
			});

			it('is called on open once the enter animation finishes', async () => {
				addAnimations();
				const onOpenChangeComplete = vi.fn();
				const screen = render(AlertDialogFixture, {
					open: false,
					popupClass: animationName,
					onOpenChangeComplete
				});
				await screen.rerender({ open: true });
				await expect.poll(() => popup() !== null && isAnimating()).toBe(true);
				expect(onOpenChangeComplete).not.toHaveBeenCalled();
				await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true]]);
			});

			it('is called on close once the exit animation finishes', async () => {
				addAnimations();
				const onOpenChangeComplete = vi.fn();
				const screen = render(AlertDialogFixture, {
					open: true,
					popupClass: animationName,
					onOpenChangeComplete
				});
				await expect.poll(() => onOpenChangeComplete.mock.calls.length).toBe(1);
				onOpenChangeComplete.mockClear();

				await screen.rerender({ open: false });
				await expect.element(page.getByTestId('popup')).toHaveAttribute('data-ending-style', '');
				await expect.poll(isAnimating).toBe(true);
				expect(onOpenChangeComplete).not.toHaveBeenCalled();

				await popupClosed();
				expect(onOpenChangeComplete.mock.calls).toEqual([[false]]);
			});
		});

		describe('animations', () => {
			it('removes the popup when there is no exit animation defined', async () => {
				const screen = render(AlertDialogFixture, { open: true });
				await expect.poll(popup).not.toBeNull();
				await screen.rerender({ open: false });
				await popupClosed();
			});

			it('hides the kept-mounted popup once the exit animation finishes', async () => {
				const style = document.createElement('style');
				style.textContent = `
					@keyframes alert-dialog-hide { to { opacity: 0; } }
					.alert-dialog-hide[data-open] { opacity: 1; }
					.alert-dialog-hide[data-ending-style] { animation: alert-dialog-hide 150ms; }
				`;
				document.head.append(style);
				try {
					const screen = render(AlertDialogFixture, {
						open: true,
						keepMounted: true,
						popupClass: 'alert-dialog-hide'
					});
					await expect.poll(popup).not.toBeNull();
					await screen.rerender({ open: false });

					await expect.element(page.getByTestId('popup')).toHaveAttribute('data-ending-style', '');
					expect(popup()!.getAnimations()).not.toHaveLength(0);
					expect(popup()!.hidden).toBe(false);

					await expect.element(page.getByTestId('popup')).toHaveAttribute('hidden', '');
					await expect.element(page.getByTestId('popup')).toHaveAttribute('data-closed', '');
				} finally {
					style.remove();
				}
			});

			it('marks the popup with data-starting-style on the first open frame', async () => {
				const screen = render(AlertDialogFixture, { open: false });
				await screen.rerender({ open: true });
				const element = popup();
				expect(element?.hasAttribute('data-starting-style')).toBe(true);
				await expect.element(page.getByTestId('popup')).not.toHaveAttribute('data-starting-style');
			});
		});
	});

	describe('shared dialog root behavior', () => {
		it('reports the trigger and reason when opened by a trigger and closed by a close button', async () => {
			const onOpenChange = vi.fn();
			render(AlertDialogFixture, { onOpenChange });
			click(trigger());
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			expect(onOpenChange).toHaveBeenCalledTimes(1);
			expect(onOpenChange).toHaveBeenNthCalledWith(
				1,
				true,
				expect.objectContaining({ reason: REASONS.triggerPress, trigger: trigger().element() })
			);

			click(button('Close'));
			await popupClosed();
			expect(onOpenChange).toHaveBeenCalledTimes(2);
			expect(onOpenChange).toHaveBeenNthCalledWith(
				2,
				false,
				expect.objectContaining({ reason: REASONS.closePress, trigger: trigger().element() })
			);
		});

		it('unmounts the popup when the `unmount` method is called', async () => {
			const screen = render(AlertDialogFixture, { preventUnmount: true });
			click(trigger());
			await expect.element(page.getByRole('alertdialog')).toBeVisible();

			click(trigger());
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
			await frame();
			await expect.element(page.getByTestId('popup')).toHaveAttribute('data-closed', '');

			screen.component.unmount();
			await popupClosed();
		});

		it('clears manual unmount state after the `unmount` method is called', async () => {
			let shouldPreventUnmount = true;
			const screen = render(AlertDialogFixture, {
				onOpenChange(open: boolean, details: AlertDialogChangeEventDetails) {
					if (!open && shouldPreventUnmount) {
						shouldPreventUnmount = false;
						details.preventUnmountOnClose();
					}
				}
			});
			click(trigger());
			await expect.element(page.getByRole('alertdialog')).toBeVisible();

			click(button('Close'));
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
			await frame();
			await expect.element(page.getByTestId('popup')).toHaveAttribute('data-closed', '');

			screen.component.unmount();
			await popupClosed();

			click(trigger());
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			click(button('Close'));
			await popupClosed();
		});

		it('closes the popup when the `close` method is called', async () => {
			const onOpenChange = vi.fn();
			const screen = render(AlertDialogFixture, { open: true, onOpenChange });
			await expect.element(page.getByRole('alertdialog')).toBeVisible();

			screen.component.close();
			await popupClosed();
			expect(onOpenChange).toHaveBeenCalledTimes(1);
			expect(onOpenChange).toHaveBeenNthCalledWith(
				1,
				false,
				expect.objectContaining({ reason: REASONS.imperativeAction })
			);
		});

		it('opens with a payload set programmatically', async () => {
			const handle = AlertDialog.createHandle<number>();
			render(AlertDialogFixture, { handle, detached: true });
			expect(popup()).toBeNull();

			handle.openWithPayload(8);
			await content('8');
			await expect.element(trigger(1)).toHaveAttribute('aria-expanded', 'false');
			await expect.element(trigger(2)).toHaveAttribute('aria-expanded', 'false');

			handle.close();
			await popupClosed();
		});
	});

	describe.each([{ mode: 'contained' as const }, { mode: 'detached' as const }])(
		'$mode triggers',
		({ mode }) => {
			const props = () =>
				mode === 'detached'
					? { handle: AlertDialog.createHandle<number>(), detached: true }
					: { triggerCount: 2 };

			it('opens with any trigger on click and marks only that trigger as active', async () => {
				render(AlertDialogFixture, { ...props(), triggerCount: 3 });
				expect(popup()).toBeNull();
				expectActiveTrigger(null, 3);

				for (const number of [1, 2, 3]) {
					click(trigger(number));
					await expect.poll(popup).not.toBeNull();
					await tick();
					expectActiveTrigger(number, 3);

					click(button('Close'));
					await popupClosed();
					expectActiveTrigger(null, 3);
				}
			});

			it('sets the payload of the trigger that opened it and switches the active trigger', async () => {
				render(AlertDialogFixture, props());
				click(trigger(1));
				await content('1');
				await expect.element(page.getByTestId('root-payload')).toHaveTextContent('1');

				click(trigger(2));
				await expect.poll(() => trigger(2).element().getAttribute('aria-expanded')).toBe('true');
				expectActiveTrigger(2);
			});

			it('reuses the popup DOM nodes when switching triggers', async () => {
				render(AlertDialogFixture, props());
				click(trigger(1));
				await content('1');
				const element = popup();

				click(trigger(2));
				await expect.poll(() => trigger(2).element().getAttribute('aria-expanded')).toBe('true');
				expect(popup()).toBe(element);
			});

			it('marks the trigger matching a bound `triggerId` as active', async () => {
				render(AlertDialogFixture, { ...props(), open: true, triggerId: 'trigger-2' });
				await expect.poll(popup).not.toBeNull();
				await tick();
				expectActiveTrigger(2);
			});

			it('opens initially with a non-first `triggerId` active', async () => {
				render(AlertDialogFixture, {
					...props(),
					triggerCount: 3,
					open: true,
					triggerId: 'trigger-2'
				});
				await expect.poll(popup).not.toBeNull();
				await tick();
				expectActiveTrigger(2, 3);
			});

			it('allows controlling the open state and active trigger programmatically', async () => {
				const screen = render(AlertDialogFixture, { ...props(), open: false, triggerId: null });

				await screen.rerender({ open: true, triggerId: 'trigger-1' });
				await expect.poll(popup).not.toBeNull();
				await tick();
				expectActiveTrigger(1);

				await screen.rerender({ open: true, triggerId: 'trigger-2' });
				await tick();
				expectActiveTrigger(2);

				click(button('Close'));
				await popupClosed();
				expectActiveTrigger(null);
			});

			it('renders the payload of a trigger switched to while open or named by `triggerId`', async () => {
				const screen = render(AlertDialogFixture, {
					...props(),
					open: true,
					triggerId: 'trigger-2'
				});
				await content('2');
				await screen.rerender({ open: true, triggerId: 'trigger-1' });
				await content('1');
				click(trigger(2));
				await content('2');
			});
		}
	);

	describe('detached triggers', () => {
		it('opens by trigger id with its payload and closes', async () => {
			const handle = AlertDialog.createHandle<number>();
			render(AlertDialogFixture, { handle, detached: true });
			expect(popup()).toBeNull();
			expect(handle.isOpen).toBe(false);

			handle.open('trigger-2');
			await content('2');
			expect(handle.isOpen).toBe(true);
			expectActiveTrigger(2);

			handle.close();
			await popupClosed();
			expect(handle.isOpen).toBe(false);
			expectActiveTrigger(null);
		});

		it('opens unassociated with a warning when opened with an unregistered trigger id', async () => {
			const handle = AlertDialog.createHandle<number>();
			render(AlertDialogFixture, { handle, detached: true });
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				handle.open('missing');
				expect(countWarnings(warn, 'No trigger found with id "missing"')).toBe(1);
			} finally {
				warn.mockRestore();
			}
			await expect.poll(popup).not.toBeNull();
			expect(handle.isOpen).toBe(true);
			expectActiveTrigger(null);
		});

		it('ignores imperative calls while no root is attached and follows the root across remounts', async () => {
			const handle = AlertDialog.createHandle<number>();
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				handle.open('trigger-1');
				handle.close();
				expect(handle.isOpen).toBe(false);
				expect(countWarnings(warn, 'no root using this handle is mounted')).toBe(2);

				const screen = render(AlertDialogFixture, { handle, detached: true });
				expect(popup()).toBeNull();
				await expect.element(page.getByTestId('root-payload')).toHaveTextContent('No payload');

				handle.open('trigger-1');
				await content('1');
				expect(handle.isOpen).toBe(true);

				await screen.rerender({ rootMounted: false });
				expect(handle.isOpen).toBe(false);
				await popupClosed();

				warn.mockClear();
				handle.open('trigger-1');
				handle.close();
				expect(handle.isOpen).toBe(false);
				expect(countWarnings(warn, 'no root using this handle is mounted')).toBe(2);

				await screen.rerender({ rootMounted: true });
				expect(popup()).toBeNull();
				await expect.element(page.getByTestId('root-payload')).toHaveTextContent('No payload');

				handle.open('trigger-2');
				await content('2');
				expect(handle.isOpen).toBe(true);
			} finally {
				warn.mockRestore();
			}
		});

		it('registers a detached trigger declared after the root', async () => {
			render(AlertDialogFixture, {
				handle: AlertDialog.createHandle<number>(),
				detached: true,
				rootFirst: true
			});
			click(trigger(2));
			await content('2');
			expectActiveTrigger(2);
		});

		it('resolves a trigger still registered to the previous root during a transient overlap', async () => {
			const handle = AlertDialog.createHandle();
			const openErrors: unknown[] = [];
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				const screen = render(AlertDialogOverlapHarness, {
					handle,
					phase: 'outgoing',
					onOpenError: (error: unknown) => openErrors.push(error)
				});
				await screen.rerender({ phase: 'overlap' });

				expect(openErrors).toEqual([]);
				expect(countWarnings(warn, 'No trigger found')).toBe(0);
				expect(handle.isOpen).toBe(true);
				await expect.element(trigger(2)).toHaveAttribute('data-popup-open', '');
				await expect.element(trigger(1)).not.toHaveAttribute('data-popup-open');

				await screen.rerender({ phase: 'incoming' });
				expect(handle.isOpen).toBe(true);
				await expect.element(trigger(2)).toHaveAttribute('data-popup-open', '');
				await expect.element(trigger(1)).not.toHaveAttribute('data-popup-open');
			} finally {
				warn.mockRestore();
			}
		});

		describe('reparenting', () => {
			async function expectOpensAndCloses() {
				click(trigger(1));
				await expect.poll(popup).not.toBeNull();
				await tick();
				expectActiveTrigger(1, 1);
				click(button('Close popup'));
				await popupClosed();
			}

			it.each([
				{ name: 'when wrappers are removed', nestings: [3, 2, 1, 0], recreateHandle: false },
				{ name: 'when wrappers are added', nestings: [0, 1, 2, 3], recreateHandle: false },
				{ name: 'when the handle is recreated', nestings: [1, 1, 1], recreateHandle: true },
				{
					name: 'when reparented while the handle is recreated',
					nestings: [3, 2, 1, 0],
					recreateHandle: true
				}
			])('keeps a detached trigger working $name', async ({ nestings, recreateHandle }) => {
				const [initial, ...next] = nestings;
				const screen = render(AlertDialogNestingHarness, {
					handle: AlertDialog.createHandle(),
					nesting: initial
				});
				await expectOpensAndCloses();

				for (const nesting of next) {
					await screen.rerender(
						recreateHandle ? { nesting, handle: AlertDialog.createHandle() } : { nesting }
					);
					await expectOpensAndCloses();
				}
			});
		});
	});

	describe('root', () => {
		it('labels and describes the popup from Title and Description', async () => {
			render(AlertDialogFixture, { open: true, withBackdrop: true });
			const alert = page.getByRole('alertdialog');
			await expect.element(alert).toBeVisible();
			const labelledBy = alert.element().getAttribute('aria-labelledby');
			const describedBy = alert.element().getAttribute('aria-describedby');
			expect(labelledBy).toBe(page.getByText('Title', { exact: true }).element().id);
			expect(describedBy).toBe(page.getByText('Description', { exact: true }).element().id);
			expect(labelledBy).toMatch(/^base-ui-/);
			expect(describedBy).toMatch(/^base-ui-/);
		});

		it('synchronizes trigger ARIA attributes when initially open with a handle', async () => {
			const handle = AlertDialog.createHandle<number>();
			render(AlertDialogFixture, {
				handle,
				triggerCount: 1,
				open: true,
				triggerId: 'trigger-1'
			});
			const alert = page.getByRole('alertdialog');
			await expect.element(alert).toBeVisible();
			await expect.element(trigger(1)).toHaveAttribute('aria-expanded', 'true');
			await expect.element(trigger(1)).toHaveAttribute('aria-controls', alert.element().id);
		});

		it('synchronizes detached trigger ARIA attributes when initially open with a handle', async () => {
			const handle = AlertDialog.createHandle<number>();
			render(AlertDialogFixture, {
				handle,
				detached: true,
				triggerCount: 1,
				open: true,
				triggerId: 'trigger-1'
			});
			const alert = page.getByRole('alertdialog');
			await expect.element(alert).toBeVisible();
			await expect.element(trigger(1)).toHaveAttribute('aria-expanded', 'true');
			await expect.element(trigger(1)).toHaveAttribute('aria-controls', alert.element().id);
			expect(handle.isOpen).toBe(true);
		});

		it('renders a viewport', async () => {
			render(AlertDialogFixture, { open: true, withViewport: true });
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			expect(
				page.getByTestId('viewport').element().contains(page.getByRole('alertdialog').element())
			).toBe(true);
		});

		it('does not close when the internal backdrop is clicked', async () => {
			const onOpenChange = vi.fn();
			render(AlertDialogFixture, { open: true, onOpenChange });
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			await frame();
			const backdrop = internalBackdrop()!;
			backdrop.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
			backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
			backdrop.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
			backdrop.click();
			await frame();
			expect(onOpenChange).toHaveBeenCalledTimes(0);
			await expect.element(page.getByRole('alertdialog')).toHaveAttribute('data-open', '');
		});

		it('does not close when the Backdrop part is clicked', async () => {
			const onOpenChange = vi.fn();
			render(AlertDialogFixture, { open: true, withBackdrop: true, onOpenChange });
			const backdrop = page.getByTestId('backdrop');
			await expect.element(backdrop).toHaveAttribute('data-open', '');
			await frame();
			await userEvent.click(backdrop, { position: { x: 2, y: 2 }, force: true });
			await frame();
			expect(onOpenChange).not.toHaveBeenCalled();
			await expect.element(page.getByRole('alertdialog')).toHaveAttribute('data-open', '');
		});

		it('keeps the trigger data-popup-open attribute and handle.isOpen when a bound close is refused', async () => {
			const handle = AlertDialog.createHandle<number>();
			render(AlertDialogFixture, { handle, triggerCount: 1, open: false, holdOpen: true });
			click(trigger(1));
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			await expect.element(trigger(1)).toHaveAttribute('data-popup-open', '');
			expect(handle.isOpen).toBe(true);

			click(button('Close'));
			await frame();
			await expect.element(page.getByRole('alertdialog')).toHaveAttribute('data-open', '');
			await expect.element(trigger(1)).toHaveAttribute('data-popup-open', '');
			expect(handle.isOpen).toBe(true);
		});

		it('rewires the trigger and keeps pointer dismissal disabled after the root remounts while open', async () => {
			const handle = AlertDialog.createHandle<number>();
			const screen = render(AlertDialogFixture, { handle, detached: true, triggerCount: 1 });
			click(trigger(1));
			const alert = page.getByRole('alertdialog');
			await expect.element(alert).toBeVisible();
			await expect.element(trigger(1)).toHaveAttribute('aria-controls', alert.element().id);

			await screen.rerender({ rootMounted: false });
			await popupClosed();
			await screen.rerender({ rootMounted: true });
			expect(popup()).toBeNull();

			click(trigger(1));
			await expect.element(alert).toBeVisible();
			await expect.element(trigger(1)).toHaveAttribute('aria-controls', alert.element().id);

			await frame();
			internalBackdrop()!.click();
			await frame();
			await expect.element(alert).toBeVisible();
			expect(handle.isOpen).toBe(true);
		});

		it('enforces alert dialog state for handle-backed roots', async () => {
			const handle = AlertDialog.createHandle();
			render(AlertDialogStateHarness, { handle });
			const state = page.getByTestId('alert-dialog-state');
			await expect.element(state).toHaveAttribute('data-modal', 'true');
			await expect.element(state).toHaveAttribute('data-disable-pointer-dismissal', 'true');
			await expect.element(state).toHaveAttribute('data-role', 'alertdialog');

			click(button('Open'));
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			expect(handle.isOpen).toBe(true);

			await frame();
			internalBackdrop()!.click();
			await frame();
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			expect(handle.isOpen).toBe(true);
		});

		it('renders the internal backdrop and hides the page from assistive technology while open', async () => {
			render(AlertDialogFixture, { open: true });
			await expect.element(page.getByRole('alertdialog')).toBeVisible();
			expect(internalBackdrop()).not.toBeNull();
			await expect
				.poll(() => page.getByRole('button', { name: 'Outside', exact: true }).elements().length)
				.toBe(0);
		});
	});

	describe('focus', () => {
		it('focuses the first tabbable control and returns focus to the trigger on Escape', async () => {
			render(AlertDialogFixture);
			click(trigger());
			await frame();
			await expect.element(button('Inside')).toHaveFocus();
			await userEvent.keyboard('{Escape}');
			await popupClosed();
			await expect.element(trigger()).toHaveFocus();
		});

		it('keeps Tab inside the popup', async () => {
			render(AlertDialogFixture);
			click(trigger());
			await frame();
			await expect.element(button('Inside')).toHaveFocus();
			await userEvent.keyboard('{Tab}');
			await expect.element(button('Close')).toHaveFocus();
			await userEvent.keyboard('{Tab}');
			await expect.element(button('Inside')).toHaveFocus();
		});

		it('focuses initialFocus on open and finalFocus on close', async () => {
			const final = document.createElement('button');
			final.textContent = 'Final';
			document.body.append(final);
			try {
				render(AlertDialogFixture, {
					initialFocus: () => button('Close').element() as HTMLElement,
					finalFocus: final
				});
				click(trigger());
				await frame();
				await expect.element(button('Close')).toHaveFocus();
				click(button('Close'));
				await popupClosed();
				await frame();
				expect(document.activeElement).toBe(final);
			} finally {
				final.remove();
			}
		});
	});

	describe('nested', () => {
		it('keeps Escape on an alert dialog nested in a dialog and counts it on the parent', async () => {
			render(AlertDialogFixture, { scenario: 'nested' });
			click(button('Open'));
			await expect.element(page.getByTestId('parent-popup')).toHaveAttribute('data-open', '');
			click(button('Delete'));
			const alert = page.getByRole('alertdialog');
			await expect.element(alert).toHaveAttribute('data-nested', '');
			const parent = page.getByTestId('parent-popup');
			await expect.element(parent).toHaveAttribute('data-nested-dialog-open', '');
			expect(parent.element().getAttribute('style')).toContain('--nested-dialogs: 1');

			await frame();
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => alert.elements().length).toBe(0);
			await expect.element(parent).toHaveAttribute('data-open', '');
			await expect.element(parent).not.toHaveAttribute('data-nested-dialog-open');
		});
	});

	it('accepts only alert dialog handles', () => {
		expect(AlertDialog.createHandle()).toBeInstanceOf(DialogHandle);
		expectTypeOf<ReturnType<typeof AlertDialog.createHandle<number>>>().toExtend<
			NonNullable<AlertDialogRootProps['handle']>
		>();
		expectTypeOf<ReturnType<typeof Dialog.createHandle<number>>>().not.toExtend<
			NonNullable<AlertDialogRootProps['handle']>
		>();
		expectTypeOf<ReturnType<typeof Dialog.createHandle<number>>>().not.toExtend<
			NonNullable<AlertDialogTriggerProps['handle']>
		>();
	});

	it('throws when a trigger is rendered outside a root and without a handle', () => {
		expect(() => render(AlertDialog.Trigger)).toThrow(
			'Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.'
		);
	});
});
