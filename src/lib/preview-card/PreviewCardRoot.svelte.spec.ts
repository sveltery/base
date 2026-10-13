// Assertions follow Base UI v1.9.0 packages/react/src/preview-card/root/PreviewCardRoot.test.tsx
// and packages/react/test/popupConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `defaultOpen` (a root takes an initial `open` instead), `actionsRef` mocks
// (`close` and `unmount` are exports of the root), and the JSDOM-only branches.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PreviewCardHarness from '../../tests/PreviewCardHarness.svelte';
import PreviewCardNestedHarness from '../../tests/PreviewCardNestedHarness.svelte';
import { REASONS } from '@sveltery/utils';
import { CLOSE_DELAY, OPEN_DELAY } from './constants.js';
import {
	advance,
	byId,
	dispatch,
	enter,
	hover,
	leave,
	pointerDown,
	resetBrowserPointer
} from '../../tests/previewCardEvents.js';

type Mode = 'contained' | 'detached' | 'multiple';

const MODES: { name: string; mode: Mode }[] = [
	{ name: 'contained triggers', mode: 'contained' },
	{ name: 'detached triggers', mode: 'detached' },
	{ name: 'multiple detached triggers', mode: 'multiple' }
];

function link() {
	return page.getByTestId('trigger').element() as HTMLElement;
}

function content() {
	return byId('popup');
}

beforeEach(resetBrowserPointer);

describe.each(MODES)('PreviewCard.Root with $name', ({ mode }) => {
	describe('uncontrolled open', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('opens when the trigger is hovered', async () => {
			render(PreviewCardHarness, { mode });
			hover(link());
			await advance(OPEN_DELAY);
			expect(content()?.textContent).toContain('Content');
			expect(link().hasAttribute('data-popup-open')).toBe(true);
		});

		it('does not open before the open delay passed', async () => {
			render(PreviewCardHarness, { mode });
			hover(link());
			await advance(OPEN_DELAY - 1);
			expect(content()).toBeNull();
		});

		it('closes when the trigger is unhovered', async () => {
			render(PreviewCardHarness, { mode });
			hover(link());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();

			dispatch(link(), 'mouseleave');
			await advance(CLOSE_DELAY - 1);
			expect(content()).not.toBeNull();
			await advance(1);
			await advance(100);
			expect(content()).toBeNull();
		});

		it('opens when the trigger is focused by keyboard', async () => {
			render(PreviewCardHarness, { mode });
			await userEvent.keyboard('{Tab}{Tab}{Tab}{Tab}');
			expect(document.activeElement).toBe(link());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
		});

		it('closes when the trigger is blurred', async () => {
			render(PreviewCardHarness, { mode });
			await userEvent.keyboard('{Tab}{Tab}{Tab}{Tab}');
			expect(document.activeElement).toBe(link());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();

			link().blur();
			await advance(CLOSE_DELAY);
			await advance(100);
			expect(content()).toBeNull();
		});
	});

	describe('prop: onOpenChange', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('is called with the open state before the change', async () => {
			const onOpenChange = vi.fn();
			render(PreviewCardHarness, { mode, onOpenChange });
			expect(content()).toBeNull();

			hover(link());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();

			dispatch(link(), 'mouseleave');
			await advance(CLOSE_DELAY);
			await advance(100);
			expect(content()).toBeNull();
			expect(onOpenChange.mock.calls.map(([open]) => open)).toEqual([true, false]);
			expect(onOpenChange.mock.calls[0][1].reason).toBe(REASONS.triggerHover);
			expect(onOpenChange.mock.calls[0][1].trigger).toBe(link());
		});

		it('does not close after hovering out of a popup opened externally', async () => {
			render(PreviewCardHarness, { mode });
			(page.getByRole('button', { name: 'Show' }).element() as HTMLElement).click();
			await advance(50);
			expect(content()).not.toBeNull();

			const positioner = byId('positioner')!;
			dispatch(positioner, 'mouseenter');
			dispatch(positioner, 'mouseleave');
			await advance(CLOSE_DELAY + 50);
			expect(content()).not.toBeNull();
		});

		it('closes after hovering out of a popup opened by its trigger', async () => {
			render(PreviewCardHarness, { mode });
			hover(link());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();

			const positioner = byId('positioner')!;
			dispatch(positioner, 'mouseenter');
			dispatch(positioner, 'mouseleave');
			await advance(CLOSE_DELAY);
			await advance(100);
			expect(content()).toBeNull();
		});

		it('does not call onOpenChange again when the trigger is re-hovered while open', async () => {
			const onOpenChange = vi.fn();
			render(PreviewCardHarness, { mode, onOpenChange });
			hover(link());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			expect(onOpenChange).toHaveBeenCalledTimes(1);

			dispatch(link(), 'mouseleave');
			enter(link());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			expect(onOpenChange).toHaveBeenCalledTimes(1);
		});
	});

	describe('prop: open', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('closes when the trigger is unhovered after opening initially', async () => {
			render(PreviewCardHarness, { mode, open: true });
			await advance(50);
			expect(content()).not.toBeNull();

			dispatch(link(), 'mouseleave');
			await advance(CLOSE_DELAY);
			await advance(100);
			expect(content()).toBeNull();
		});

		it('does not close after hovering out of a popup opened without trigger hover', async () => {
			render(PreviewCardHarness, { mode, open: true });
			await advance(50);
			expect(content()).not.toBeNull();

			const positioner = byId('positioner')!;
			dispatch(positioner, 'mouseenter');
			dispatch(positioner, 'mouseleave');
			await advance(CLOSE_DELAY + 50);
			expect(content()).not.toBeNull();
		});

		it('opens from an initial open without a trigger event', async () => {
			render(PreviewCardHarness, { mode, open: true });
			await expect.poll(content).not.toBeNull();
			expect(content()?.hasAttribute('data-open')).toBe(true);
		});
	});

	describe('prop: delay', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('opens after the delay with rest type by default', async () => {
			render(PreviewCardHarness, { mode, delay: 100 });
			enter(link());
			await advance(99);
			expect(content()).toBeNull();
			await advance(1);
			expect(content()).not.toBeNull();
		});
	});

	describe('prop: closeDelay', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('closes after the delay', async () => {
			render(PreviewCardHarness, { mode, closeDelay: 100 });
			enter(link());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();

			dispatch(link(), 'mouseleave');
			await advance(99);
			expect(content()).not.toBeNull();
			await advance(1);
			await advance(100);
			expect(content()).toBeNull();
		});
	});

	describe('dismissal', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('reopens on hover after Escape closes it', async () => {
			render(PreviewCardHarness, { mode, delay: 100 });
			hover(link());
			await advance(100);
			expect(content()).not.toBeNull();

			document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
			await advance(50);
			await advance(100);
			expect(content()).toBeNull();

			enter(link());
			await advance(100);
			expect(content()).not.toBeNull();
		});
	});

	describe('root actions', () => {
		it('removes the preview card when unmount is called after a prevented unmount', async () => {
			const onOpenChange = vi.fn((open: boolean, details) => {
				if (!open) details.preventUnmountOnClose();
			});
			render(PreviewCardHarness, { mode, delay: 0, closeDelay: 0, onOpenChange });
			await userEvent.hover(link());
			await expect.poll(() => byId('positioner')).not.toBeNull();

			await userEvent.unhover(link());
			await expect.poll(() => onOpenChange.mock.calls.length).toBe(2);
			await tick();
			expect(byId('positioner')).not.toBeNull();

			(page.getByRole('button', { name: 'Call unmount' }).element() as HTMLElement).click();
			await expect.poll(() => byId('positioner')).toBeNull();
		});

		it('closes the preview card when close is called', async () => {
			const onOpenChange = vi.fn();
			render(PreviewCardHarness, { mode, delay: 0, onOpenChange });
			await userEvent.hover(link());
			await expect.poll(content).not.toBeNull();

			(page.getByRole('button', { name: 'Call close' }).element() as HTMLElement).click();
			await expect.poll(() => byId('positioner')).toBeNull();
			expect(link().hasAttribute('data-popup-open')).toBe(false);
			expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
			expect(onOpenChange.mock.lastCall?.[1].reason).toBe(REASONS.imperativeAction);
		});
	});
});

describe('nested preview card interactions', () => {
	function click(element: Element) {
		element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
	}

	it('keeps the parent preview card open when clicking the nested trigger', async () => {
		render(PreviewCardNestedHarness, { parentOpen: true });
		expect(byId('parent-popup')).not.toBeNull();

		click(byId('child-trigger')!);
		await tick();

		expect(byId('parent-popup')).not.toBeNull();
	});

	it('keeps the parent preview card open when a press starts in the nested popup and ends outside', async () => {
		render(PreviewCardNestedHarness, { parentOpen: true, childOpen: true });
		expect(byId('parent-popup')).not.toBeNull();
		await expect.poll(() => byId('child-popup')).not.toBeNull();

		pointerDown(byId('child-popup')!);
		click(byId('outside')!);

		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(byId('parent-popup')).not.toBeNull();
		expect(byId('child-popup')).not.toBeNull();
	});

	it('keeps the parent preview card open when hovering the nested trigger', async () => {
		render(PreviewCardNestedHarness, { parentOpen: true });
		expect(byId('parent-popup')).not.toBeNull();

		hover(byId('child-trigger')!);
		await tick();

		expect(byId('parent-popup')).not.toBeNull();
	});

	describe('race condition between close timers and hover-open logic', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('keeps the parent open and re-opens the child when re-entering after a partial close', async () => {
			render(PreviewCardNestedHarness, { parentOpen: true });
			const parentPositioner = byId('parent-positioner')!;
			const childTrigger = byId('child-trigger')!;

			enter(childTrigger);
			await advance(OPEN_DELAY);

			let childPositioner = byId('child-positioner')!;
			leave(childPositioner);
			leave(parentPositioner);
			dispatch(document.body, 'mousemove');

			await advance(CLOSE_DELAY / 2);
			enter(parentPositioner);

			await advance(CLOSE_DELAY);
			await advance(100);
			expect(byId('parent-popup')).not.toBeNull();
			expect(byId('child-popup')).toBeNull();

			enter(childTrigger);
			await advance(OPEN_DELAY);

			expect(byId('parent-popup')).not.toBeNull();
			childPositioner = byId('child-positioner')!;
			leave(childTrigger, childPositioner);
			leave(parentPositioner, childPositioner);
			dispatch(childPositioner, 'mouseenter');

			await advance(CLOSE_DELAY);
			expect(byId('parent-popup')).not.toBeNull();
			expect(byId('child-popup')).not.toBeNull();
		});
	});

	describe('synchronized closing', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('closes the parent popup as soon as the child popup closes', async () => {
			render(PreviewCardNestedHarness, { parentOpen: false });

			const parentTrigger = byId('parent-trigger')!;
			dispatch(parentTrigger, 'mouseenter');
			await advance(OPEN_DELAY);

			const parentPositioner = byId('parent-positioner')!;
			const childTrigger = byId('child-trigger')!;

			leave(parentTrigger, parentPositioner);
			dispatch(parentPositioner, 'mouseenter');
			dispatch(childTrigger, 'mouseenter');
			await advance(OPEN_DELAY);

			const childPositioner = byId('child-positioner')!;
			leave(childTrigger, childPositioner);
			leave(parentPositioner, childPositioner);
			dispatch(childPositioner, 'mouseenter');
			dispatch(childPositioner, 'mouseleave');
			dispatch(document.body, 'mousemove');

			await advance(CLOSE_DELAY + 10);
			await advance(100);

			expect(byId('child-popup')).toBeNull();
			expect(byId('parent-popup')).toBeNull();
		});
	});
});

describe('popup conformance', () => {
	function popupClosed() {
		return content() === null;
	}

	it('opens the popup with the `open` prop', async () => {
		const view = render(PreviewCardHarness, { open: false });
		expect(content()).toBeNull();

		await view.rerender({ open: true });
		await expect.poll(content).not.toBeNull();
	});

	it('opens initially and stays uncontrolled', async () => {
		render(PreviewCardHarness, { open: true });
		await expect.poll(content).not.toBeNull();

		await userEvent.keyboard('{Escape}');
		await expect.poll(popupClosed).toBe(true);
	});

	describe('prop: onOpenChange', () => {
		it('is called with the new open state and the change details', async () => {
			const onOpenChange = vi.fn();
			render(PreviewCardHarness, { onOpenChange, delay: 0 });
			expect(onOpenChange).not.toHaveBeenCalled();

			hover(link());
			await expect.poll(content).not.toBeNull();
			expect(onOpenChange).toHaveBeenCalledTimes(1);
			expect(onOpenChange).toHaveBeenNthCalledWith(
				1,
				true,
				expect.objectContaining({ reason: REASONS.triggerHover, trigger: link() })
			);

			await userEvent.keyboard('{Escape}');
			await expect.poll(popupClosed).toBe(true);
			expect(onOpenChange).toHaveBeenCalledTimes(2);
			expect(onOpenChange).toHaveBeenNthCalledWith(
				2,
				false,
				expect.objectContaining({ reason: REASONS.escapeKey })
			);
		});

		it('keeps the popup closed when the open change is canceled', async () => {
			const onOpenChange = vi.fn((nextOpen: boolean, details: { cancel: () => void }) => {
				if (nextOpen) details.cancel();
			});
			render(PreviewCardHarness, { onOpenChange, delay: 0 });

			hover(link());
			await expect.poll(() => onOpenChange.mock.calls.length).toBe(1);
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(onOpenChange).toHaveBeenCalledTimes(1);
			expect(onOpenChange).toHaveBeenNthCalledWith(
				1,
				true,
				expect.objectContaining({ reason: REASONS.triggerHover })
			);
			expect(content()).toBeNull();
			expect(link().hasAttribute('data-popup-open')).toBe(false);
		});
	});

	describe('prop: onOpenChangeComplete', () => {
		let style: HTMLStyleElement | undefined;

		afterEach(() => {
			style?.remove();
			style = undefined;
		});

		function isAnimating() {
			return content()!
				.getAnimations()
				.some((animation) => animation.playState === 'running');
		}

		function addAnimation() {
			style = document.createElement('style');
			style.textContent = `
				@keyframes pc-enter { from { opacity: 0; } }
				@keyframes pc-exit { to { opacity: 0; } }
				.pc-animated[data-open] { animation: pc-enter 200ms; }
				.pc-animated[data-ending-style] { animation: pc-exit 200ms; }
			`;
			document.head.append(style);
		}

		it('is not called on mount when closed', async () => {
			const onOpenChangeComplete = vi.fn();
			render(PreviewCardHarness, { onOpenChangeComplete });
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(onOpenChangeComplete).not.toHaveBeenCalled();
		});

		it('is called on open when there is no enter animation', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(PreviewCardHarness, { open: false, onOpenChangeComplete });

			await view.rerender({ open: true, onOpenChangeComplete });
			await expect.poll(() => onOpenChangeComplete.mock.calls.length).toBeGreaterThan(0);
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(onOpenChangeComplete.mock.calls).toEqual([[true]]);
		});

		it('is called on close when there is no exit animation', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(PreviewCardHarness, { open: true, onOpenChangeComplete });
			await expect.poll(() => onOpenChangeComplete.mock.calls.length).toBe(1);

			await view.rerender({ open: false, onOpenChangeComplete });
			await expect.poll(popupClosed).toBe(true);
			await expect.poll(() => onOpenChangeComplete.mock.lastCall?.[0]).toBe(false);
			expect(onOpenChangeComplete.mock.calls).toEqual([[true], [false]]);
		});

		it('is called on open once the enter animation finishes', async () => {
			addAnimation();
			const onOpenChangeComplete = vi.fn();
			const view = render(PreviewCardHarness, {
				open: false,
				popupClass: 'pc-animated',
				onOpenChangeComplete
			});

			await view.rerender({ open: true, popupClass: 'pc-animated', onOpenChangeComplete });
			await expect.poll(() => content() !== null && isAnimating()).toBe(true);
			expect(onOpenChangeComplete).not.toHaveBeenCalled();

			await expect.poll(() => onOpenChangeComplete.mock.calls.length).toBeGreaterThan(0);
			expect(onOpenChangeComplete.mock.calls).toEqual([[true]]);
		});

		it('is called on close once the exit animation finishes', async () => {
			addAnimation();
			const onOpenChangeComplete = vi.fn();
			const view = render(PreviewCardHarness, {
				open: true,
				popupClass: 'pc-animated',
				onOpenChangeComplete
			});
			await expect.poll(() => onOpenChangeComplete.mock.calls.length).toBeGreaterThan(0);
			onOpenChangeComplete.mockClear();

			await view.rerender({ open: false, popupClass: 'pc-animated', onOpenChangeComplete });
			await expect.poll(() => content()?.hasAttribute('data-ending-style')).toBe(true);
			await expect.poll(isAnimating).toBe(true);
			expect(onOpenChangeComplete).not.toHaveBeenCalled();

			await expect.poll(popupClosed).toBe(true);
			expect(onOpenChangeComplete.mock.calls).toEqual([[false]]);
		});
	});

	describe('animations', () => {
		let style: HTMLStyleElement | undefined;

		afterEach(() => {
			style?.remove();
			style = undefined;
		});

		it('removes the popup when there is no exit animation defined', async () => {
			const view = render(PreviewCardHarness, { open: true });
			await expect.poll(content).not.toBeNull();

			await view.rerender({ open: false });
			await expect.poll(popupClosed).toBe(true);
		});

		it('hides the kept-mounted popup once the exit animation finishes', async () => {
			style = document.createElement('style');
			style.textContent = `
				@keyframes pc-keep-exit { to { opacity: 0; } }
				.pc-keep[data-open] { opacity: 1; }
				.pc-keep[data-ending-style] { animation: pc-keep-exit 150ms; }
			`;
			document.head.append(style);

			const view = render(PreviewCardHarness, {
				open: true,
				keepMounted: true,
				popupClass: 'pc-keep'
			});
			await expect.poll(content).not.toBeNull();

			await view.rerender({ open: false, keepMounted: true, popupClass: 'pc-keep' });

			await expect.poll(() => content()?.hasAttribute('data-ending-style')).toBe(true);
			expect(content()!.getAnimations()).not.toHaveLength(0);
			expect(byId('positioner')!.hasAttribute('hidden')).toBe(false);

			await expect.poll(() => byId('positioner')!.hasAttribute('hidden')).toBe(true);
		});
	});
});
