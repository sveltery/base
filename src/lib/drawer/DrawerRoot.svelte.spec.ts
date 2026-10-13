// Assertions follow Base UI v1.9.0 packages/react/src/drawer/root/DrawerRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: the render count of an inactive detached trigger (Svelte has no component re-render
// to count), the nested swipe progress store and its subscriber count (internal context API), and
// the React Strict Mode, `useId` fallback, and passive-effect ordering of provider registration.
// The provider half of that test is kept. `setActiveSnapPoint` from the root context is internal,
// so the canceled snap point change is driven by a swipe. The invalid uncontrolled value has no
// public path here (see docs/upstream-differences.md, Drawer). DrawerRoot.spec.tsx narrows
// `details.event` by reason, which this port's change details do not do for any component.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { platform, REASONS } from '@sveltery/utils';
import DrawerHarness from '../../tests/DrawerHarness.svelte';
import DrawerRootScenarios from '../../tests/DrawerRootScenarios.svelte';
import { downSwipe, frame, pointAt, rightSwipe, swipe } from '../../tests/drawer-gestures.js';
import { Drawer, type DrawerChangeEventDetails, type DrawerSnapPoint } from './index.js';

let restoreHitTest: (() => void) | undefined;
afterEach(() => {
	restoreHitTest?.();
	restoreHitTest = undefined;
});

function popup() {
	return document.querySelector<HTMLElement>('[data-testid="popup"]');
}

function viewport() {
	return document.querySelector<HTMLElement>('[data-testid="viewport"]')!;
}

function backdrop() {
	return document.querySelector<HTMLElement>('[data-testid="backdrop"]')!;
}

function activeSnap() {
	return document.querySelector('[data-testid="active-snap"]')!.textContent;
}

function button(name: string) {
	return page.getByRole('button', { name, exact: true });
}

async function openPopup() {
	await expect.poll(popup).not.toBeNull();
	restoreHitTest = pointAt(popup()!);
	return popup()!;
}

const snapPoints: DrawerSnapPoint[] = ['100px', '300px', 1];
const fullHeight = { viewportStyle: 'height: 600px', popupStyle: 'height: 600px' };

function snapGesture(snapPoint: DrawerSnapPoint | null, props: Record<string, unknown> = {}) {
	return render(DrawerHarness, {
		snapPoints,
		snapPoint,
		backdrop: true,
		...fullHeight,
		...props
	});
}

describe('Drawer.Root', () => {
	it('exposes the attributes rendered by borrowed trigger and close parts', async () => {
		render(DrawerRootScenarios, { scenario: 'borrowed-parts' });

		expect(button('Disabled').element()).toHaveAttribute('data-disabled', '');
		expect(button('Close').element()).toHaveAttribute('data-disabled', '');

		await button('Open').click();
		await expect.element(button('Open')).toHaveAttribute('data-popup-open', '');
	});

	it('uses a size-based swipe threshold', async () => {
		const onOpenChange = vi.fn();
		render(DrawerHarness, { swipeDirection: 'right', popupStyle: 'width: 200px', onOpenChange });
		await openPopup();

		await rightSwipe(viewport(), 100, 190, { start: 1000, move: 1100, end: 1600 });
		expect(onOpenChange).not.toHaveBeenCalled();

		await rightSwipe(viewport(), 100, 220, { start: 2000, move: 2100, end: 2600 });
		expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
	});

	it('supports detached triggers with handles', async () => {
		const handle = Drawer.createHandle<number>();
		render(DrawerRootScenarios, { scenario: 'detached', handle });

		expect(document.querySelector('[data-testid="payload"]')).toBeNull();

		(button('Trigger 1').element() as HTMLElement).click();
		await expect.element(page.getByTestId('payload')).toHaveTextContent('1');

		(page.getByText('Close').element() as HTMLElement).click();
		await expect.poll(() => document.querySelector('[data-testid="payload"]')).toBeNull();

		(button('Trigger 2').element() as HTMLElement).click();
		await expect.element(page.getByTestId('payload')).toHaveTextContent('2');
	});

	it('supports imperative actions with handles', async () => {
		const handle = Drawer.createHandle<number>();
		render(DrawerRootScenarios, { scenario: 'detached', handle });
		const trigger1 = button('Trigger 1').element();
		const trigger2 = button('Trigger 2').element();
		expect(document.querySelector('[role="dialog"]')).toBeNull();

		handle.open('trigger-2');
		await expect.poll(() => document.querySelector('[role="dialog"]')).not.toBeNull();
		expect(page.getByTestId('payload').element().textContent).toBe('2');
		expect(trigger2).toHaveAttribute('aria-expanded', 'true');
		expect(trigger2.getAttribute('aria-controls')).toBe(
			document.querySelector('[role="dialog"]')!.id
		);
		expect(trigger1).toHaveAttribute('aria-expanded', 'false');

		handle.close();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(trigger2).toHaveAttribute('aria-expanded', 'false');

		handle.openWithPayload(8);
		await expect.poll(() => document.querySelector('[role="dialog"]')).not.toBeNull();
		expect(page.getByTestId('payload').element().textContent).toBe('8');
		expect(trigger1).toHaveAttribute('aria-expanded', 'false');
		expect(trigger2).toHaveAttribute('aria-expanded', 'false');
	});

	it('attaches fresh root state when a handle-backed root remounts', async () => {
		const handle = Drawer.createHandle<number>();
		render(DrawerRootScenarios, { scenario: 'remount', handle });
		const trigger = button('Trigger').element();

		expect(page.getByTestId('payload').element().textContent).toBe('No payload');

		await button('Trigger').click();
		await expect.element(page.getByText('Drawer content')).toBeVisible();
		expect(page.getByTestId('payload').element().textContent).toBe('1');
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(trigger.getAttribute('aria-controls')).toBe(
			document.querySelector('[role="dialog"]')!.id
		);

		(button('Unmount root').element() as HTMLElement).click();
		await tick();
		expect(handle.isOpen).toBe(false);
		expect(page.getByText('Drawer content').query()).toBeNull();

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		handle.openWithPayload(8);
		handle.open('trigger');
		handle.close();
		const detachedWarnings = warn.mock.calls.filter(([message]) =>
			String(message).includes('no root using this handle is mounted')
		);
		warn.mockRestore();
		expect(handle.isOpen).toBe(false);
		expect(detachedWarnings).toHaveLength(3);

		await button('Remount root').click();
		expect(page.getByTestId('payload').element().textContent).toBe('No payload');
		expect(page.getByText('Drawer content').query()).toBeNull();
		await expect.element(button('Trigger')).toHaveAttribute('aria-expanded', 'false');
		expect(trigger).not.toHaveAttribute('aria-controls');

		await button('Trigger').click();
		await expect.element(page.getByText('Drawer content')).toBeVisible();
		expect(page.getByTestId('payload').element().textContent).toBe('1');
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(trigger.getAttribute('aria-controls')).toBe(
			document.querySelector('[role="dialog"]')!.id
		);
	});

	it('synchronizes trigger aria-controls with the popup id', async () => {
		render(DrawerRootScenarios, { scenario: 'aria-controls' });
		const trigger = button('Open').element();
		await button('Open').click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).not.toBeNull();
		expect(trigger.getAttribute('aria-controls')).toBe(popup()!.id);
	});

	describe('snap points', () => {
		it('resets the active snap point when closing', async () => {
			render(DrawerHarness, { snapPoints, snapPoint: 1, close: true });
			await openPopup();
			(page.getByTestId('close').element() as HTMLElement).click();
			await tick();
			expect(activeSnap()).toBe('100px');
		});

		it('resets to the default snap point when provided', async () => {
			render(DrawerHarness, { snapPoints, defaultSnapPoint: '300px', close: true, ...fullHeight });
			const element = await openPopup();
			await expect
				.poll(() => element.style.getPropertyValue('--drawer-snap-point-offset'))
				.toBe('300px');

			(page.getByTestId('close').element() as HTMLElement).click();
			await tick();
			expect(activeSnap()).toBe('300px');
		});

		it('provides event details when snap point changes', async () => {
			const onSnapPointChange = vi.fn();
			render(DrawerHarness, { snapPoints, snapPoint: 1, close: true, onSnapPointChange });
			await openPopup();
			(page.getByTestId('close').element() as HTMLElement).click();
			await tick();

			expect(onSnapPointChange).toHaveBeenCalled();
			expect(onSnapPointChange.mock.calls[0][1].reason).toBe(REASONS.closePress);
		});

		it('does not reset snap point when a close is canceled', async () => {
			render(DrawerHarness, { snapPoints, snapPoint: 1, close: true, cancelClose: true });
			await openPopup();
			expect(activeSnap()).toBe('1');

			(page.getByTestId('close').element() as HTMLElement).click();
			await tick();
			expect(activeSnap()).toBe('1');
		});

		it('honors canceled snap point changes', async () => {
			const onSnapPointChange = vi.fn((next: DrawerSnapPoint | null, details) => {
				if (next === '100px') details.cancel();
			});
			render(DrawerHarness, {
				snapPoints: ['100px', '300px'],
				defaultSnapPoint: '300px',
				onSnapPointChange,
				...fullHeight
			});
			const element = await openPopup();
			await expect
				.poll(() => element.style.getPropertyValue('--drawer-snap-point-offset'))
				.toBe('300px');

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 300, time: 1000 },
				{ type: 'move', x: 100, y: 301, time: 1010 },
				{ type: 'move', x: 100, y: 480, time: 2010 },
				{ type: 'up', x: 100, y: 480, time: 2011 }
			]);

			expect(onSnapPointChange).toHaveBeenLastCalledWith(
				'100px',
				expect.objectContaining({ reason: REASONS.swipe })
			);
			expect(activeSnap()).toBe('undefined');
			expect(element.style.getPropertyValue('--drawer-snap-point-offset')).toBe('300px');
		});

		it('restores snap point and swipe offsets when swipe close is canceled', async () => {
			snapGesture('100px', { cancelSwipeClose: true });
			const element = await openPopup();

			await downSwipe(viewport(), 100, 260, { start: 1000, move: 1010, end: 1040 });

			expect(activeSnap()).toBe('100px');
			expect(element).toHaveAttribute('data-open', '');
			expect(element).not.toHaveAttribute('data-swipe-dismiss');
			expect(element).not.toHaveAttribute('data-ending-style');
			expect(element.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
		});

		it('does not restore snap point when a controlled swipe close is accepted by the parent', async () => {
			snapGesture('300px');
			await openPopup();

			await downSwipe(viewport(), 100, 260, { start: 1000, move: 1010, end: 1040 });
			expect(activeSnap()).toBe('100px');
		});

		it('damps active snap point overshoot after the swipe direction is established', async () => {
			render(DrawerHarness, {
				defaultSnapPoint: 1,
				snapPoints: ['100px', 1],
				viewportStyle: 'height: 400px',
				popupStyle: 'height: 400px'
			});
			const element = await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 200, time: 1000 },
				{ type: 'move', x: 100, y: 200, time: 1005 },
				{ type: 'move', x: 100, y: 100, time: 1010 },
				{ type: 'move', x: 100, y: 50, time: 1020 }
			]);

			expect(element.style.transform).toBe('');
			expect(
				Number.parseFloat(element.style.getPropertyValue('--drawer-swipe-movement-y'))
			).toBeCloseTo(-Math.sqrt(150));
		});

		it('allows dragging past a snap point when snapToSequentialPoints is enabled', async () => {
			snapGesture('100px', { snapToSequentialPoints: true, backdrop: false });
			await openPopup();

			await downSwipe(viewport(), 500, 50, { start: 1000, move: 1010, end: 1040 });
			expect(activeSnap()).toBe('1');
		});

		it.each([false, true])(
			'advances on a short flick with a trailing stationary sample: %s',
			async (phantom) => {
				snapGesture('100px', { snapToSequentialPoints: true });
				await openPopup();

				await swipe(viewport(), [
					{ type: 'down', x: 100, y: 500, time: 992 },
					{ type: 'move', x: 100, y: 500, time: 1000 },
					{ type: 'move', x: 100, y: 488, time: 1016 },
					{ type: 'move', x: 100, y: 476, time: 1032 },
					{ type: 'move', x: 100, y: 464, time: 1048 },
					...(phantom ? [{ type: 'move' as const, x: 100, y: 463.5, time: 1064 }] : []),
					{ type: 'up', x: 100, y: phantom ? 463.5 : 464, time: phantom ? 1072 : 1056 }
				]);

				expect(activeSnap()).toBe('300px');
			}
		);

		it('stays on the current snap point after repeated stationary samples', async () => {
			snapGesture('100px', { snapToSequentialPoints: true });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 500, time: 992 },
				{ type: 'move', x: 100, y: 500, time: 1000 },
				{ type: 'move', x: 100, y: 460, time: 1016 },
				{ type: 'move', x: 100, y: 460, time: 1032 },
				{ type: 'move', x: 100, y: 460, time: 1048 },
				{ type: 'move', x: 100, y: 460, time: 1064 },
				{ type: 'up', x: 100, y: 460, time: 1072 }
			]);

			expect(activeSnap()).toBe('100px');
		});

		it('advances to the next snap point on fast flicks when snapToSequentialPoints is enabled', async () => {
			snapGesture('100px', { snapToSequentialPoints: true });
			await openPopup();

			await downSwipe(viewport(), 500, 460, { start: 2000, move: 2010, end: 2050 });
			expect(activeSnap()).toBe('300px');
		});

		it('keeps the drawer open on low-velocity swipes near a snap point', async () => {
			const onOpenChange = vi.fn();
			snapGesture('100px', { onOpenChange, backdrop: false });
			await openPopup();

			await downSwipe(viewport(), 100, 120, { start: 1000, move: 1005, settle: 1015, end: 1035 });

			expect(onOpenChange).not.toHaveBeenCalledWith(false, expect.anything());
			expect(activeSnap()).toBe('100px');
		});

		it('keeps the drawer open when the release velocity reverses during an upward swipe', async () => {
			const onOpenChange = vi.fn();
			snapGesture('100px', { onOpenChange, backdrop: false });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 300, time: 1000 },
				{ type: 'move', x: 100, y: 299, time: 1003 },
				{ type: 'move', x: 100, y: 120, time: 1010 },
				{ type: 'move', x: 100, y: 140, time: 1015 },
				{ type: 'up', x: 100, y: 140, time: 1025 }
			]);

			expect(onOpenChange).not.toHaveBeenCalledWith(false, expect.anything());
		});

		it('chooses the nearest sequential snap point on a slow drag', async () => {
			snapGesture('100px', { snapToSequentialPoints: true });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 500, time: 1000 },
				{ type: 'move', x: 100, y: 499, time: 1010 },
				{ type: 'move', x: 100, y: 350, time: 2010 },
				{ type: 'up', x: 100, y: 350, time: 2011 }
			]);

			expect(activeSnap()).toBe('300px');
		});

		it('advances a sequential snap point toward dismissal', async () => {
			snapGesture(1, { snapToSequentialPoints: true });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 101, time: 1010 },
				{ type: 'move', x: 100, y: 140, time: 1020 },
				{ type: 'up', x: 100, y: 140, time: 1021 }
			]);

			expect(activeSnap()).toBe('300px');
		});

		it('dismisses past the final sequential snap point', async () => {
			snapGesture('100px', { snapToSequentialPoints: true });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 101, time: 1010 },
				{ type: 'move', x: 100, y: 160, time: 1020 },
				{ type: 'up', x: 100, y: 160, time: 1021 }
			]);

			await expect.poll(popup).toBeNull();
		});

		it('dismisses when a slow snap-point drag ends closer to closed', async () => {
			snapGesture('100px', { snapToSequentialPoints: true });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 101, time: 1010 },
				{ type: 'move', x: 100, y: 180, time: 2010 },
				{ type: 'up', x: 100, y: 180, time: 2011 }
			]);

			await expect.poll(popup).toBeNull();
		});

		it('dismisses from upward snap points using upward velocity', async () => {
			snapGesture('100px', { swipeDirection: 'up' });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 500, time: 1000 },
				{ type: 'move', x: 100, y: 499, time: 1010 },
				{ type: 'move', x: 100, y: 420, time: 1020 },
				{ type: 'up', x: 100, y: 420, time: 1021 }
			]);

			await expect.poll(popup).toBeNull();
		});

		it('opens from a controlled null snap point', async () => {
			snapGesture(null);
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 99, time: 1010 },
				{ type: 'move', x: 100, y: 60, time: 1020 },
				{ type: 'up', x: 100, y: 60, time: 1021 }
			]);

			expect(activeSnap()).toBe('1');
		});

		it('dismisses from a controlled null snap point', async () => {
			snapGesture(null);
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 101, time: 1010 },
				{ type: 'move', x: 100, y: 160, time: 1020 },
				{ type: 'up', x: 100, y: 160, time: 1021 }
			]);

			await expect.poll(popup).toBeNull();
		});

		it('keeps the first sequential snap point on a fast opening flick', async () => {
			snapGesture(1, { snapToSequentialPoints: true });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 99, time: 1010 },
				{ type: 'move', x: 100, y: 40, time: 1020 },
				{ type: 'up', x: 100, y: 40, time: 1021 }
			]);

			expect(activeSnap()).toBe('1');
		});

		it('keeps the current snap point after a sub-threshold drag', async () => {
			snapGesture('300px');
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 101, time: 1010 },
				{ type: 'move', x: 100, y: 105, time: 2010 },
				{ type: 'up', x: 100, y: 105, time: 2011 }
			]);

			expect(activeSnap()).toBe('300px');
		});

		it('dismisses a non-sequential snap point when closed is nearest', async () => {
			snapGesture('100px');
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 101, time: 1010 },
				{ type: 'move', x: 100, y: 180, time: 2010 },
				{ type: 'up', x: 100, y: 180, time: 2011 }
			]);

			await expect.poll(popup).toBeNull();
		});

		it('finishes a controlled accepted dismissal while kept mounted', async () => {
			snapGesture('100px', { keepMounted: true, snapToSequentialPoints: true });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 101, time: 1010 },
				{ type: 'move', x: 100, y: 160, time: 1020 },
				{ type: 'up', x: 100, y: 160, time: 1021 }
			]);
			await frame();

			await expect.element(page.getByTestId('popup')).toHaveAttribute('data-closed', '');
		});

		it('restores a snap point when a controlled parent rejects dismissal', async () => {
			// Root's open change resets the snap point to the default ('100px') even when the parent
			// rejects the close, so only a non-default start shows that the rejection restores it.
			snapGesture('300px', { holdOpen: true });
			const element = await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 101, time: 1010 },
				{ type: 'move', x: 100, y: 160, time: 1020 },
				{ type: 'up', x: 100, y: 160, time: 1021 }
			]);
			await frame();

			expect(activeSnap()).toBe('300px');
			expect(element).toHaveAttribute('data-open', '');
		});
	});

	describe('swipe dismissal', () => {
		it('clears swipe-dismiss styles when swipe close is canceled', async () => {
			render(DrawerHarness, {
				cancelSwipeClose: true,
				backdrop: true,
				viewportStyle: 'height: 300px',
				popupStyle: 'height: 200px'
			});
			const element = await openPopup();

			await downSwipe(viewport(), 100, 250, { start: 1000, move: 1010, end: 1040 });

			expect(element).not.toHaveAttribute('data-swipe-dismiss');
			expect(backdrop()).not.toHaveAttribute('data-swipe-dismiss');
			expect(element).not.toHaveAttribute('data-ending-style');
			expect(backdrop()).not.toHaveAttribute('data-swiping');
			expect(element).toHaveAttribute('data-open', '');
			expect(element.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
		});

		it('does not dismiss a controlled drawer via swipe when open is always true', async () => {
			const onOpenChange = vi.fn();
			render(DrawerHarness, {
				holdOpen: true,
				onOpenChange,
				backdrop: true,
				viewportStyle: 'height: 300px',
				popupStyle: 'height: 200px'
			});
			const element = await openPopup();

			await downSwipe(viewport(), 100, 250, { start: 1000, move: 1010, end: 1040 });

			// The parent still learns about the dismiss intent.
			expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
			await frame();

			expect(element).not.toHaveAttribute('data-swipe-dismiss');
			expect(backdrop()).not.toHaveAttribute('data-swipe-dismiss');
			expect(element).not.toHaveAttribute('data-ending-style');
			expect(element).toHaveAttribute('data-open', '');
		});

		it('closes an uncontrolled drawer after a slow long drag', async () => {
			render(DrawerHarness, { popupStyle: 'height: 200px' });
			await openPopup();

			await swipe(viewport(), [
				{ type: 'down', x: 100, y: 100, time: 1000 },
				{ type: 'move', x: 100, y: 101, time: 1010 },
				{ type: 'move', x: 100, y: 250, time: 2010 },
				{ type: 'up', x: 100, y: 250, time: 2011 }
			]);

			await expect.poll(popup).toBeNull();
		});
	});

	it('throws a descriptive error when the root context is missing', () => {
		expect(() => render(Drawer.Popup)).toThrow(
			'Base UI: DrawerRootContext is missing. Drawer parts must be placed within <Drawer.Root>.'
		);
	});

	it('reports and unregisters an open drawer with the provider', async () => {
		const screen = render(DrawerRootScenarios, {
			scenario: 'provider-registration',
			open: true
		});
		await expect.element(page.getByTestId('background')).toHaveAttribute('data-active', '');

		await screen.rerender({ showDrawer: false });
		await expect.element(page.getByTestId('background')).toHaveAttribute('data-inactive', '');
	});

	describe('CloseWatcher', () => {
		class CloseWatcherStub extends EventTarget {
			static instances: CloseWatcherStub[] = [];
			active = true;

			constructor() {
				super();
				CloseWatcherStub.instances.push(this);
			}

			destroy() {
				this.active = false;
			}

			// Mirrors the browser: `cancel` fires first and can only be prevented while the page has
			// history-action activation. Otherwise the watcher is destroyed before `close` fires.
			requestClose(cancelable: boolean) {
				if (!this.active) return;
				const cancelEvent = new Event('cancel', { cancelable });
				this.dispatchEvent(cancelEvent);
				if (cancelEvent.defaultPrevented) return;
				this.destroy();
				this.dispatchEvent(new Event('close'));
			}
		}

		const win = window as Window & { CloseWatcher?: unknown };
		const originalCloseWatcher = win.CloseWatcher;
		const originalAndroid = platform.os.android;

		beforeEach(() => {
			CloseWatcherStub.instances = [];
			win.CloseWatcher = CloseWatcherStub;
			platform.os.android = true;
		});

		afterEach(() => {
			win.CloseWatcher = originalCloseWatcher;
			platform.os.android = originalAndroid;
		});

		function currentWatcher() {
			return CloseWatcherStub.instances[CloseWatcherStub.instances.length - 1];
		}

		async function requestClose(cancelable = true) {
			currentWatcher().requestClose(cancelable);
			await tick();
		}

		function dialog() {
			return document.querySelector('[role="dialog"]');
		}

		async function renderDrawer(props: Record<string, unknown> = {}) {
			const screen = render(DrawerRootScenarios, {
				scenario: 'close-watcher',
				open: true,
				...props
			});
			await expect.poll(dialog).not.toBeNull();
			await expect.poll(() => CloseWatcherStub.instances.length).toBeGreaterThan(0);
			return screen;
		}

		it('closes when the watcher requests a close', async () => {
			const onOpenChange = vi.fn();
			await renderDrawer({ onOpenChange });

			await requestClose();

			expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(
				false,
				expect.objectContaining({ reason: REASONS.closeWatcher })
			);
			await expect.poll(dialog).toBeNull();
			expect(currentWatcher().active).toBe(false);
		});

		it('keeps the same watcher active when a cancelable close request is canceled', async () => {
			let shouldCancel = true;
			const onOpenChange = vi.fn((_open: boolean, details: DrawerChangeEventDetails) => {
				if (shouldCancel) details.cancel();
			});
			await renderDrawer({ onOpenChange });
			const watcher = currentWatcher();
			const instanceCount = CloseWatcherStub.instances.length;

			await requestClose();

			expect(onOpenChange).toHaveBeenCalledTimes(1);
			expect(dialog()).not.toBeNull();
			expect(CloseWatcherStub.instances).toHaveLength(instanceCount);
			expect(watcher.active).toBe(true);

			shouldCancel = false;
			await requestClose();

			expect(onOpenChange).toHaveBeenCalledTimes(2);
			await expect.poll(dialog).toBeNull();
			expect(watcher.active).toBe(false);
		});

		it('closes on a close request that cannot be prevented even if onOpenChange cancels it', async () => {
			const onOpenChange = vi.fn((_open: boolean, details: DrawerChangeEventDetails) => {
				details.cancel();
			});
			await renderDrawer({ onOpenChange });

			await requestClose(false);

			expect(onOpenChange).toHaveBeenCalledTimes(1);
			const details = onOpenChange.mock.calls[0][1];
			expect(details.event.cancelable).toBe(false);
			expect(details.isCanceled).toBe(false);
			await expect.poll(dialog).toBeNull();
			expect(currentWatcher().active).toBe(false);
		});

		it.each([false, true])(
			'steps through content on back presses until one cannot be prevented (one-way open: %s)',
			async (oneWay) => {
				await renderDrawer({ steps: 2, oneWay });
				await expect.poll(() => dialog()?.textContent).toBe('step 2');
				const watcher = currentWatcher();
				const instanceCount = CloseWatcherStub.instances.length;

				await requestClose();
				await expect.poll(() => dialog()?.textContent).toBe('step 1');
				expect(CloseWatcherStub.instances).toHaveLength(instanceCount);
				expect(watcher.active).toBe(true);

				await requestClose(false);
				await expect.poll(dialog).toBeNull();
				expect(watcher.active).toBe(false);
			}
		);

		it('destroys the watcher on unmount', async () => {
			const onOpenChange = vi.fn((_open: boolean, details: DrawerChangeEventDetails) => {
				details.cancel();
			});
			const screen = await renderDrawer({ onOpenChange });
			const watcher = currentWatcher();

			await requestClose();
			expect(watcher.active).toBe(true);

			screen.unmount();
			expect(watcher.active).toBe(false);
		});
	});

	it('closes on Escape', async () => {
		render(DrawerHarness, {});
		await openPopup();
		await frame();
		await userEvent.keyboard('{Escape}');
		await expect.poll(popup).toBeNull();
	});
});
