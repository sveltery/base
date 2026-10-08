import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { safePolygon } from './floating-ui-react/safePolygon.js';
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
		const open = page.getByRole('button', { name: 'Open' });
		await open.click();
		await expect.poll(() => page.getByTestId('open').element().textContent).toBe('true');

		const before = page.getByRole('button', { name: 'Before' }).element();
		const target = page.getByTestId('focus-target').element();
		const beforeContent = page.getByTestId('before-content').element();
		before.focus();
		target.focus();
		await expect.poll(() => document.activeElement).toBe(beforeContent);
		await expect.poll(() => page.getByTestId('open').element().textContent).toBe('true');

		target.focus();
		await expect
			.poll(() => document.activeElement)
			.toBe(page.getByRole('button', { name: 'After' }).element());
		await expect.poll(() => page.getByTestId('open').element().textContent).toBe('false');
	});

	it('locks a touch-opened popup only when it is nearly as wide as the viewport', async () => {
		function touch(name: string) {
			page
				.getByRole('button', { name })
				.element()
				.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
		}

		const narrow = render(AnchoredScrollLockHarness, { enabled: true, wide: false });
		touch('Touch');
		await expect.poll(overflowLocked).toBe(false);
		narrow.unmount();

		render(AnchoredScrollLockHarness, { enabled: true, wide: true });
		touch('Touch');
		await expect.poll(overflowLocked).toBe(true);
	});

	it('blocks pointer events outside the safe polygon when asked', async () => {
		const view = render(AnchoredPopupHarness, { scenario: 'block' });
		await page.getByRole('button', { name: 'Open' }).hover();
		await expect.element(page.getByRole('dialog', { name: 'Notice' })).toBeVisible();
		await expect.poll(() => document.body.style.pointerEvents).toBe('none');
		view.unmount();
		expect(document.body.style.pointerEvents).not.toBe('none');
	});

	it('switches to the trigger under the pointer and leaves a refused trigger alone', async () => {
		const switched = render(AnchoredPopupHarness, { scenario: 'switch' });
		const first = page.getByRole('button', { name: 'A' });
		const second = page.getByRole('button', { name: 'B' });
		await first.hover();
		await expect.element(page.getByRole('dialog', { name: 'Notice' })).toBeVisible();
		await expect.poll(() => page.getByTestId('active').element().textContent).toBe('trigger-a');
		await second.hover();
		await expect.poll(() => page.getByTestId('active').element().textContent).toBe('trigger-b');
		await expect
			.poll(() => {
				const popup = page.getByTestId('positioner').element().getBoundingClientRect().left;
				const next = second.element().getBoundingClientRect().left;
				return Math.abs(popup - next) < 30;
			})
			.toBe(true);
		switched.unmount();

		render(AnchoredPopupHarness, { scenario: 'refuse' });
		const kept = page.getByRole('button', { name: 'A' });
		await kept.click();
		await expect.element(page.getByTestId('positioner')).toHaveAttribute('data-positioned', '');
		const placed = page.getByTestId('positioner').element().getBoundingClientRect().left;
		await page.getByRole('button', { name: 'B' }).hover();
		await expect.poll(() => page.getByTestId('active').element().textContent).toBe('trigger-a');
		await expect
			.poll(() => {
				const left = page.getByTestId('positioner').element().getBoundingClientRect().left;
				return Math.abs(left - placed) < 2;
			})
			.toBe(true);
	});

	it('keeps a pending close timer when a hover delay changes', async () => {
		render(AnchoredPopupHarness, { scenario: 'delay' });
		await page.getByRole('button', { name: 'Open' }).hover();
		const popup = page.getByRole('dialog', { name: 'Notice' });
		await expect.element(popup).toBeVisible();
		await page.getByTestId('outside').hover();
		await page.getByTestId('longer').click();
		await expect.poll(() => popup.elements().length, { timeout: 1500 }).toBe(0);
	});

	it('rounds a fractional anchor to device pixels', async () => {
		render(AnchoredPopupHarness, { scenario: 'pixels' });
		await page.getByRole('button', { name: 'Open' }).click();
		const positioner = page.getByTestId('positioner');
		await expect.element(positioner).toHaveAttribute('data-positioned', '');
		await expect.poll(() => positioner.element().style.left).toBe('10px');
		await expect.poll(() => positioner.element().style.top).toBe('36px');
	});

	it('keeps the popup in place, with available size, while it is closing', async () => {
		render(AnchoredPopupHarness, { scenario: 'closing' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		const positioner = page.getByTestId('positioner');
		const popup = page.getByTestId('popup');
		await expect.element(positioner).toHaveAttribute('data-positioned', '');
		await expect
			.poll(() => positioner.element().style.getPropertyValue('--available-width'))
			.toMatch(/px$/);
		const placed = positioner.element().getBoundingClientRect().top;
		expect(placed).toBeGreaterThan(8);
		await trigger.click();
		await expect.element(popup).toHaveAttribute('data-ending-style', '');
		expect(Math.abs(positioner.element().getBoundingClientRect().top - placed)).toBeLessThan(2);
		expect(positioner.element().style.opacity).not.toBe('0');
		expect(positioner.element().style.getPropertyValue('--available-width')).toMatch(/px$/);
		await trigger.click();
		await expect.element(popup).toBeVisible();
		expect(positioner.element().style.getPropertyValue('--available-width')).toMatch(/px$/);
		expect(positioner.element().style.getPropertyValue('--available-height')).toMatch(/px$/);
	});
});

describe('safe polygon', () => {
	function rect(x: number, y: number, width: number, height: number) {
		return {
			x,
			y,
			width,
			height,
			top: y,
			right: x + width,
			bottom: y + height,
			left: x,
			toJSON() {
				return {};
			}
		} as DOMRect;
	}

	it('cancels the 40ms close when clear runs before the timer', async () => {
		const reference = document.createElement('div');
		const floating = document.createElement('div');
		// Floating is wider, so the safe polygon includes a point beside the trough.
		// That point arms the 40ms close. A point inside the trough does not.
		reference.getBoundingClientRect = () => rect(100, 100, 80, 20);
		floating.getBoundingClientRect = () => rect(60, 160, 160, 40);
		let closed = 0;
		const handle = safePolygon();
		const onMove = handle({
			x: 140,
			y: 119,
			placement: 'bottom',
			elements: { domReference: reference, floating },
			onClose() {
				closed += 1;
			}
		});
		onMove(new MouseEvent('mousemove', { clientX: 92, clientY: 144 }));
		handle.clear?.();
		await new Promise((resolve) => setTimeout(resolve, 70));
		expect(closed).toBe(0);

		const again = safePolygon();
		const moveAgain = again({
			x: 140,
			y: 119,
			placement: 'bottom',
			elements: { domReference: reference, floating },
			onClose() {
				closed += 1;
			}
		});
		moveAgain(new MouseEvent('mousemove', { clientX: 92, clientY: 144 }));
		await new Promise((resolve) => setTimeout(resolve, 70));
		expect(closed).toBe(1);
	});
});
