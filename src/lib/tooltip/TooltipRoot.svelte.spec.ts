// Assertions follow Base UI v1.9.0 packages/react/src/tooltip/root/TooltipRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `defaultOpen` and `defaultTriggerId` are an initial `open` and `triggerId`.
// `actionsRef` is `bind:this` with `close()` and `unmount()`.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TooltipCursorHarness from '../../tests/TooltipCursorHarness.svelte';
import TooltipHarness from '../../tests/TooltipHarness.svelte';
import TooltipHoverableHarness from '../../tests/TooltipHoverableHarness.svelte';
import TooltipPairHarness from '../../tests/TooltipPairHarness.svelte';
import TooltipPopoverHarness from '../../tests/TooltipPopoverHarness.svelte';
import TooltipRemountHarness from '../../tests/TooltipRemountHarness.svelte';
import TooltipSpacedHarness from '../../tests/TooltipSpacedHarness.svelte';
import { clickElement } from '../../tests/menu/mouse.js';
import { byTestId, fire, hoverWithMouse } from '../../tests/tooltip-events.js';
import { OPEN_DELAY } from './constants.js';
import type { TooltipChangeEventDetails } from './types.js';

const flags = globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean };

beforeEach(() => {
	flags.BASE_UI_ANIMATIONS_DISABLED = true;
});

afterEach(() => {
	vi.useRealTimers();
	document.body.click();
});

async function advance(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);
	await tick();
}

function trigger() {
	const element = byTestId('trigger');
	if (!element) throw new Error('trigger missing');
	return element;
}

function content() {
	return page.getByText('Content').query();
}

describe.for([
	{ name: 'contained triggers', mode: 'contained' as const },
	{ name: 'detached triggers', mode: 'detached' as const },
	{ name: 'multiple detached triggers', mode: 'multiple' as const }
])('Tooltip.Root when using $name', ({ mode }) => {
	describe('uncontrolled open', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('opens when the trigger is hovered', async () => {
			render(TooltipHarness, { mode });
			hoverWithMouse(trigger());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
		});

		it('does not open when a touch pointer hovers the trigger', async () => {
			render(TooltipHarness, { mode });
			fire.pointerDown(trigger(), { pointerType: 'touch' });
			fire.mouseEnter(trigger());
			fire.mouseMove(trigger());
			await advance(OPEN_DELAY);
			expect(content()).toBeNull();
		});

		it('closes when the trigger is unhovered', async () => {
			render(TooltipHarness, { mode });
			hoverWithMouse(trigger());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			fire.mouseLeave(trigger());
			await advance(0);
			expect(content()).toBeNull();
		});

		it('opens when the trigger is focused', async () => {
			render(TooltipHarness, { mode });
			await userEvent.keyboard('{Tab}');
			expect(document.activeElement).toBe(trigger());
			await advance(0);
			expect(content()).not.toBeNull();
		});

		it('closes when the trigger is blurred', async () => {
			render(TooltipHarness, { mode });
			await userEvent.keyboard('{Tab}');
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			trigger().blur();
			await advance(OPEN_DELAY);
			expect(content()).toBeNull();
		});
	});

	describe('bound open', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('calls onOpenChange when the open state changes', async () => {
			const before: boolean[] = [];
			const view = render(TooltipHarness, {
				mode,
				bound: true,
				rootProps: {
					onOpenChange: () => before.push(view.component.getOpen())
				}
			});
			expect(content()).toBeNull();
			fire.mouseEnter(trigger());
			fire.mouseMove(trigger());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			fire.mouseLeave(trigger());
			await advance(0);
			expect(content()).toBeNull();
			expect(before).toEqual([false, true]);
		});

		it('does not call onOpenChange again when the trigger is re-hovered while open', async () => {
			const onOpenChange = vi.fn();
			render(TooltipHarness, { mode, bound: true, rootProps: { onOpenChange } });
			fire.mouseEnter(trigger());
			fire.mouseMove(trigger());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			expect(onOpenChange.mock.calls.map(([open]) => open)).toEqual([true]);
			fire.mouseEnter(trigger());
			fire.mouseMove(trigger());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			expect(onOpenChange.mock.calls.map(([open]) => open)).toEqual([true]);
		});
	});

	it('closes when the trigger is unhovered after opening initially', async () => {
		render(TooltipHarness, { mode, rootProps: { open: true } });
		await expect.poll(content).not.toBeNull();
		fire.mouseLeave(trigger());
		await expect.poll(content).toBeNull();
	});

	describe('delays', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('opens after the trigger delay', async () => {
			render(TooltipHarness, { mode, triggerProps: { delay: 100 } });
			fire.mouseEnter(trigger());
			fire.mouseMove(trigger());
			await advance(0);
			expect(content()).toBeNull();
			await advance(100);
			expect(content()).not.toBeNull();
		});

		it('closes after the trigger closeDelay', async () => {
			render(TooltipHarness, { mode, triggerProps: { closeDelay: 100 } });
			fire.mouseEnter(trigger());
			fire.mouseMove(trigger());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			fire.mouseLeave(trigger());
			await advance(0);
			expect(content()).not.toBeNull();
			await advance(100);
			expect(content()).toBeNull();
		});
	});

	it('does not prevent unmounting on later closes', async () => {
		let preventNextClose = true;
		render(TooltipHarness, {
			mode,
			rootProps: {
				onOpenChange: (open: boolean, details: TooltipChangeEventDetails) => {
					if (!open && preventNextClose) {
						preventNextClose = false;
						details.preventUnmountOnClose();
					}
				}
			},
			triggerProps: { delay: 0, closeDelay: 0 }
		});
		hoverWithMouse(trigger());
		await expect.poll(() => byTestId('positioner')).not.toBeNull();
		fire.mouseLeave(trigger());
		await expect.poll(() => trigger().hasAttribute('data-popup-open')).toBe(false);
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(byTestId('positioner')).not.toBeNull();
		hoverWithMouse(trigger());
		await expect.poll(() => trigger().hasAttribute('data-popup-open')).toBe(true);
		fire.mouseLeave(trigger());
		await expect.poll(() => byTestId('positioner')).toBeNull();
	});

	describe('actions through bind:this', () => {
		it('unmounts the tooltip when unmount() is called', async () => {
			const view = render(TooltipHarness, {
				mode,
				rootProps: {
					onOpenChange: (_open: boolean, details: TooltipChangeEventDetails) =>
						details.preventUnmountOnClose()
				},
				triggerProps: { delay: 0 }
			});
			hoverWithMouse(trigger());
			await expect.poll(() => byTestId('positioner')).not.toBeNull();
			fire.mouseLeave(trigger());
			await expect.poll(() => trigger().hasAttribute('data-popup-open')).toBe(false);
			expect(byTestId('positioner')).not.toBeNull();
			view.component.unmount();
			await expect.poll(() => byTestId('positioner')).toBeNull();
		});

		it('closes the tooltip when close() is called', async () => {
			const onOpenChange = vi.fn();
			const view = render(TooltipHarness, {
				mode,
				rootProps: { onOpenChange },
				triggerProps: { delay: 0 }
			});
			hoverWithMouse(trigger());
			await expect.poll(() => byTestId('popup')).not.toBeNull();
			view.component.close();
			await expect.poll(() => byTestId('positioner')).toBeNull();
			expect(trigger().hasAttribute('data-popup-open')).toBe(false);
			expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
			expect(onOpenChange.mock.lastCall?.[1].reason).toBe('imperative-action');
		});
	});

	describe('prop: disabled', () => {
		it('does not open when disabled', async () => {
			render(TooltipHarness, { mode, rootProps: { disabled: true }, triggerProps: { delay: 0 } });
			hoverWithMouse(trigger());
			await tick();
			expect(content()).toBeNull();
			trigger().focus();
			await tick();
			expect(content()).toBeNull();
		});

		it('does not open on focus when the trigger is disabled', async () => {
			render(TooltipHarness, { mode, triggerProps: { disabled: true, delay: 0 } });
			trigger().focus();
			await tick();
			expect(content()).toBeNull();
		});

		it('closes if open when becoming disabled', async () => {
			const view = render(TooltipHarness, {
				mode,
				rootProps: { open: true },
				triggerProps: { delay: 0 }
			});
			await expect.poll(content).not.toBeNull();
			await view.rerender({ mode, rootProps: { open: true, disabled: true } });
			expect(content()).toBeNull();
		});

		it('stays closed when initially open and disabled', async () => {
			render(TooltipHarness, { mode, rootProps: { open: true, disabled: true } });
			await tick();
			expect(content()).toBeNull();
		});

		it('marks the trigger as disabled when the root is disabled', () => {
			render(TooltipHarness, { mode, rootProps: { disabled: true } });
			expect(trigger().hasAttribute('data-trigger-disabled')).toBe(true);
		});

		it('keeps the tooltip disabled when the root is disabled and the trigger opts back in', async () => {
			render(TooltipHarness, {
				mode,
				rootProps: { disabled: true },
				triggerProps: { disabled: false, delay: 0 }
			});
			expect(trigger().hasAttribute('data-trigger-disabled')).toBe(false);
			hoverWithMouse(trigger());
			await tick();
			expect(content()).toBeNull();
		});
	});

	describe.for([
		{ rootProps: { disableHoverablePopup: true }, pointerEvents: 'none' },
		{ rootProps: { disableHoverablePopup: false }, pointerEvents: '' },
		{ rootProps: { trackCursorAxis: 'both' as const }, pointerEvents: 'none' },
		{ rootProps: { trackCursorAxis: 'x' as const }, pointerEvents: '' }
	])('positioner pointer-events with $rootProps', ({ rootProps, pointerEvents }) => {
		it(`sets pointer-events to "${pointerEvents}"`, async () => {
			render(TooltipHarness, { mode, rootProps, triggerProps: { delay: 0 } });
			hoverWithMouse(trigger());
			await expect.poll(() => byTestId('positioner')).not.toBeNull();
			expect(byTestId('positioner')?.style.pointerEvents).toBe(pointerEvents);
		});
	});

	it('marks the popup as instant when opened by focus, but not when opened by hover', async () => {
		render(TooltipHarness, { mode, triggerProps: { delay: 0, closeDelay: 0 } });
		trigger().focus();
		await expect.poll(() => byTestId('popup')?.getAttribute('data-instant')).toBe('focus');
		trigger().blur();
		await expect.poll(() => byTestId('popup')).toBeNull();
		hoverWithMouse(trigger());
		await expect.poll(() => byTestId('popup')).not.toBeNull();
		expect(byTestId('popup')?.hasAttribute('data-instant')).toBe(false);
	});

	it('lets allowPropagation() keep Escape propagating while still closing', async () => {
		const stopPropagation = vi.spyOn(Event.prototype, 'stopPropagation');
		render(TooltipHarness, {
			mode,
			rootProps: {
				open: true,
				onOpenChange: (open: boolean, details: TooltipChangeEventDetails) => {
					if (!open && details.reason === 'escape-key') details.allowPropagation();
				}
			},
			triggerProps: { delay: 0 }
		});
		await expect.poll(content).not.toBeNull();
		fire.keyDown(document.body, 'Escape');
		await expect.poll(content).toBeNull();
		expect(stopPropagation).toHaveBeenCalledTimes(0);
		stopPropagation.mockRestore();
	});

	describe('dismissal', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('closes when Escape is pressed', async () => {
			const onOpenChange = vi.fn();
			render(TooltipHarness, {
				mode,
				rootProps: { open: true, onOpenChange },
				triggerProps: { delay: 0 }
			});
			await advance(0);
			expect(content()).not.toBeNull();
			fire.keyDown(document.body, 'Escape');
			await advance(0);
			expect(content()).toBeNull();
			expect(onOpenChange.mock.calls.map(([open, details]) => [open, details.reason])).toEqual([
				[false, 'escape-key']
			]);
		});

		it('does not open when the trigger was clicked before the delay', async () => {
			render(TooltipHarness, { mode });
			hoverWithMouse(trigger());
			await advance(OPEN_DELAY / 2);
			fire.click(trigger());
			await advance(OPEN_DELAY / 2);
			expect(content()).toBeNull();
		});

		it('does not open when the trigger receives pointerdown before the delay', async () => {
			render(TooltipHarness, { mode });
			fire.pointerEnter(trigger());
			fire.mouseEnter(trigger());
			fire.mouseMove(trigger());
			await advance(OPEN_DELAY / 2);
			fire.pointerDown(trigger());
			await advance(OPEN_DELAY / 2);
			expect(content()).toBeNull();
		});

		it('opens when the trigger was clicked before the delay and closeOnClick is false', async () => {
			render(TooltipHarness, { mode, triggerProps: { closeOnClick: false } });
			hoverWithMouse(trigger());
			await advance(OPEN_DELAY / 2);
			fire.click(trigger());
			await advance(OPEN_DELAY / 2);
			expect(content()).not.toBeNull();
		});

		it('closes when the trigger is clicked after the delay', async () => {
			render(TooltipHarness, { mode });
			hoverWithMouse(trigger());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			fire.click(trigger());
			await tick();
			expect(content()).toBeNull();
		});

		it('does not close when the trigger is clicked after the delay and closeOnClick is false', async () => {
			render(TooltipHarness, { mode, triggerProps: { closeOnClick: false } });
			hoverWithMouse(trigger());
			await advance(OPEN_DELAY);
			expect(content()).not.toBeNull();
			fire.click(trigger());
			await tick();
			expect(content()).not.toBeNull();
		});

		it('reopens on hover after the trigger is clicked closed', async () => {
			render(TooltipHarness, { mode, triggerProps: { delay: 100 } });
			hoverWithMouse(trigger());
			await advance(100);
			expect(content()).not.toBeNull();
			fire.click(trigger());
			await advance(0);
			expect(content()).toBeNull();
			fire.mouseEnter(trigger());
			fire.mouseMove(trigger());
			await advance(100);
			expect(content()).not.toBeNull();
		});
	});
});

function injectStyle(css: string) {
	const style = document.createElement('style');
	style.textContent = css;
	document.head.append(style);
	return () => style.remove();
}

let removeStyle: (() => void) | undefined;

afterEach(() => {
	removeStyle?.();
	removeStyle = undefined;
});

describe('Tooltip.Root popup conformance', () => {
	const popup = () => byTestId('popup');

	it('opens the popup with the open prop', async () => {
		const view = render(TooltipHarness, { rootProps: { open: false }, triggerProps: { delay: 0 } });
		expect(popup()).toBeNull();
		await view.rerender({ rootProps: { open: true }, triggerProps: { delay: 0 } });
		await expect.poll(popup).not.toBeNull();
	});

	it('opens initially and still closes on Escape', async () => {
		render(TooltipHarness, { rootProps: { open: true }, triggerProps: { delay: 0 } });
		await expect.poll(popup).not.toBeNull();
		await userEvent.keyboard('{Escape}');
		await expect.poll(popup).toBeNull();
	});

	it('stays open on Escape when open is bound to a value the root cannot change', async () => {
		render(TooltipHarness, { locked: true, triggerProps: { delay: 0 } });
		await expect.poll(popup).not.toBeNull();
		await userEvent.keyboard('{Escape}');
		await tick();
		expect(popup()).not.toBeNull();
	});

	it('calls onOpenChange with the new open state and the change details', async () => {
		const onOpenChange = vi.fn();
		render(TooltipHarness, { rootProps: { onOpenChange }, triggerProps: { delay: 0 } });
		expect(onOpenChange).not.toHaveBeenCalled();
		hoverWithMouse(trigger());
		await expect.poll(popup).not.toBeNull();
		expect(onOpenChange).toHaveBeenCalledTimes(1);
		expect(onOpenChange.mock.calls[0][0]).toBe(true);
		expect(onOpenChange.mock.calls[0][1].reason).toBe('trigger-hover');
		expect(onOpenChange.mock.calls[0][1].trigger).toBe(trigger());
		await userEvent.keyboard('{Escape}');
		await expect.poll(popup).toBeNull();
		expect(onOpenChange).toHaveBeenCalledTimes(2);
		expect(onOpenChange.mock.calls[1][0]).toBe(false);
		expect(onOpenChange.mock.calls[1][1].reason).toBe('escape-key');
	});

	it('reports no trigger when Escape closes the popup', async () => {
		const onOpenChange = vi.fn();
		render(TooltipHarness, { rootProps: { onOpenChange }, triggerProps: { delay: 0 } });
		hoverWithMouse(trigger());
		await expect.poll(popup).not.toBeNull();
		await userEvent.keyboard('{Escape}');
		await expect.poll(popup).toBeNull();
		expect(
			onOpenChange.mock.calls.map(([open, details]) => [open, details.reason, details.trigger])
		).toEqual([
			[true, 'trigger-hover', trigger()],
			[false, 'escape-key', undefined]
		]);
	});

	it('keeps the popup closed when the open change is canceled', async () => {
		const onOpenChange = vi.fn((open: boolean, details: TooltipChangeEventDetails) => {
			if (open) details.cancel();
		});
		render(TooltipHarness, { rootProps: { onOpenChange }, triggerProps: { delay: 0 } });
		hoverWithMouse(trigger());
		await expect.poll(() => onOpenChange.mock.calls.length).toBe(1);
		await tick();
		expect(onOpenChange.mock.calls[0][0]).toBe(true);
		expect(onOpenChange.mock.calls[0][1].reason).toBe('trigger-hover');
		expect(popup()).toBeNull();
		expect(trigger().hasAttribute('data-popup-open')).toBe(false);
	});

	describe('prop: onOpenChangeComplete', () => {
		it('is not called on mount when closed', async () => {
			const onOpenChangeComplete = vi.fn();
			render(TooltipHarness, { rootProps: { onOpenChangeComplete } });
			await tick();
			expect(onOpenChangeComplete).not.toHaveBeenCalled();
		});

		it('is called on open when there is no enter animation', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(TooltipHarness, { rootProps: { open: false, onOpenChangeComplete } });
			await view.rerender({ rootProps: { open: true, onOpenChangeComplete } });
			await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true]]);
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(onOpenChangeComplete.mock.calls).toEqual([[true]]);
		});

		it('is called on close when there is no exit animation', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(TooltipHarness, { rootProps: { open: true, onOpenChangeComplete } });
			await expect.poll(popup).not.toBeNull();
			await view.rerender({ rootProps: { open: false, onOpenChangeComplete } });
			await expect.poll(popup).toBeNull();
			await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true], [false]]);
		});

		describe('with animations', () => {
			beforeEach(() => {
				flags.BASE_UI_ANIMATIONS_DISABLED = false;
				removeStyle = injectStyle(`
					@keyframes tooltip-occ-enter { from { opacity: 0; } }
					@keyframes tooltip-occ-exit { to { opacity: 0; } }
					.occ[data-open] { animation: tooltip-occ-enter 200ms; }
					.occ[data-ending-style] { animation: tooltip-occ-exit 200ms; }
				`);
			});

			const isAnimating = () =>
				popup()
					?.getAnimations()
					.some((animation) => animation.playState === 'running') ?? false;

			it('is called on open once the enter animation finishes', async () => {
				const onOpenChangeComplete = vi.fn();
				const view = render(TooltipHarness, {
					rootProps: { open: false, onOpenChangeComplete },
					popupProps: { class: 'occ' }
				});
				await view.rerender({
					rootProps: { open: true, onOpenChangeComplete },
					popupProps: { class: 'occ' }
				});
				await expect.poll(isAnimating).toBe(true);
				expect(onOpenChangeComplete).not.toHaveBeenCalled();
				await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true]]);
			});

			it('is called on close once the exit animation finishes', async () => {
				const onOpenChangeComplete = vi.fn();
				const view = render(TooltipHarness, {
					rootProps: { open: true, onOpenChangeComplete },
					popupProps: { class: 'occ' }
				});
				await expect.poll(() => onOpenChangeComplete.mock.calls.length).toBe(1);
				onOpenChangeComplete.mockClear();
				await view.rerender({
					rootProps: { open: false, onOpenChangeComplete },
					popupProps: { class: 'occ' }
				});
				await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(true);
				await expect.poll(isAnimating).toBe(true);
				expect(onOpenChangeComplete).not.toHaveBeenCalled();
				await expect.poll(popup).toBeNull();
				expect(onOpenChangeComplete.mock.calls).toEqual([[false]]);
			});
		});
	});

	describe('animations', () => {
		beforeEach(() => {
			flags.BASE_UI_ANIMATIONS_DISABLED = false;
		});

		it('removes the popup when there is no exit animation defined', async () => {
			const view = render(TooltipHarness, { rootProps: { open: true } });
			await expect.poll(popup).not.toBeNull();
			await view.rerender({ rootProps: { open: false } });
			await expect.poll(popup).toBeNull();
		});

		it('hides the kept-mounted popup once the exit animation finishes', async () => {
			removeStyle = injectStyle(`
				@keyframes tooltip-keep { to { opacity: 0; } }
				.keep[data-open] { opacity: 1; }
				.keep[data-ending-style] { animation: tooltip-keep 150ms; }
			`);
			const props = { portalProps: { keepMounted: true }, popupProps: { class: 'keep' } };
			const view = render(TooltipHarness, { ...props, rootProps: { open: true } });
			await expect.poll(popup).not.toBeNull();
			await view.rerender({ ...props, rootProps: { open: false } });
			await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(true);
			expect(popup()?.getAnimations().length).not.toBe(0);
			expect(byTestId('positioner')?.hidden).toBe(false);
			await expect.poll(() => byTestId('positioner')?.hidden).toBe(true);
		});
	});
});

describe('Tooltip.Root scenarios', () => {
	it('does not open once the hovered trigger has unmounted', async () => {
		vi.useFakeTimers();
		const view = render(TooltipHarness, {});
		hoverWithMouse(trigger());
		await advance(1);
		await view.rerender({ showTrigger: false });
		await advance(OPEN_DELAY);
		expect(content()).toBeNull();
	});

	describe('animations', () => {
		beforeEach(() => {
			flags.BASE_UI_ANIMATIONS_DISABLED = false;
		});

		it('toggles instant animations for adjacent tooltips only while opening', async () => {
			removeStyle = injectStyle(`
				.tooltip { transition: opacity 10s; }
				.tooltip[data-starting-style], .tooltip[data-ending-style] { opacity: 0; }
				.tooltip[data-instant] { transition: none; }
			`);
			render(TooltipPairHarness, {});
			const first = byTestId('trigger-1')!;
			const second = byTestId('trigger-2')!;
			await userEvent.hover(first);
			await expect.poll(() => byTestId('popup-1')).not.toBeNull();
			expect(byTestId('popup-1')?.dataset.instant).toBeUndefined();
			await userEvent.unhover(first);
			await userEvent.hover(second);
			await expect.poll(() => byTestId('popup-2')).not.toBeNull();
			const secondPopup = byTestId('popup-2')!;
			await expect.poll(() => secondPopup.dataset.instant).toBe('delay');
			expect(secondPopup.getAnimations().length).toBe(0);
			await expect.poll(() => secondPopup.hasAttribute('data-starting-style')).toBe(false);
			await userEvent.unhover(second);
			await expect.poll(() => secondPopup.dataset.endingStyle).toBe('');
			expect(secondPopup.dataset.instant).toBeUndefined();
			expect(secondPopup.getAnimations().length).toBe(1);
		});

		it('unmounts an exiting tooltip when another tooltip opens', async () => {
			removeStyle = injectStyle(`
				.tooltip[data-ending-style] { transition: opacity 10s; opacity: 0; }
				.tooltip[data-instant] { transition: none; }
			`);
			render(TooltipPairHarness, { timeout: 30000 });
			const first = byTestId('trigger-1')!;
			await userEvent.hover(first);
			await expect.poll(() => byTestId('popup-1')).not.toBeNull();
			const firstPopup = byTestId('popup-1')!;
			await userEvent.unhover(first);
			await expect.poll(() => firstPopup.getAnimations().length).toBe(1);
			await userEvent.hover(byTestId('trigger-2')!);
			await expect.poll(() => byTestId('popup-2')).not.toBeNull();
			await expect.poll(() => byTestId('popup-1')).toBeNull();
		});

		it('removes inline opacity: 0 before user CSS transitions run', async () => {
			removeStyle = injectStyle(`.inline-opacity { transition: opacity 200ms; opacity: 1; }`);
			render(TooltipHarness, {
				triggerProps: { delay: 0 },
				popupProps: { class: 'inline-opacity' }
			});
			await userEvent.hover(trigger());
			await expect.poll(() => byTestId('popup')).not.toBeNull();
			const element = byTestId('popup')!;
			await expect
				.poll(() => ({
					opacity: Number(getComputedStyle(element).opacity),
					opacityAnimationCount: element
						.getAnimations()
						.filter((a) => (a as CSSTransition).transitionProperty === 'opacity').length
				}))
				.toEqual({ opacity: 1, opacityAnimationCount: 0 });
		});
	});

	it('unmounts on a normal close after a prevented close and an initially open remount', async () => {
		render(TooltipRemountHarness, {});
		const toggle = page.getByRole('button', { name: 'Toggle' });
		await page.getByRole('button', { name: 'Open tooltip' }).click();
		await expect.poll(() => byTestId('positioner')).not.toBeNull();
		await page.getByRole('button', { name: 'Close tooltip' }).click();
		await expect.element(toggle).not.toHaveAttribute('data-popup-open');
		expect(byTestId('positioner')).not.toBeNull();
		await page.getByRole('button', { name: 'Unmount root' }).click();
		await expect.poll(() => byTestId('positioner')).toBeNull();
		await page.getByRole('button', { name: 'Remount open' }).click();
		await expect.element(toggle).toHaveAttribute('data-popup-open');
		await expect.poll(() => byTestId('positioner')).not.toBeNull();
		await page.getByRole('button', { name: 'Close tooltip' }).click();
		await expect.poll(() => byTestId('positioner')).toBeNull();
	});

	describe('cursor tracking', () => {
		function centerX(element: Element) {
			const rect = element.getBoundingClientRect();
			return rect.left + rect.width / 2;
		}

		function cursorTarget() {
			const element = page.getByRole('button', { name: 'Trigger' }).element();
			const rect = element.getBoundingClientRect();
			return { element, rect, y: rect.top + 20 };
		}

		it('tracks the cursor on the first delayed hover when trackCursorAxis is x', async () => {
			render(TooltipCursorHarness, {});
			const { element, rect, y } = cursorTarget();
			const x = rect.left + 240;
			hoverWithMouse(element, { clientX: x, clientY: y });
			await expect.poll(() => byTestId('positioner')).not.toBeNull();
			await expect
				.poll(() => Math.abs(centerX(byTestId('positioner')!) - x))
				.toBeLessThanOrEqual(2);
		});

		it('stops tracking the cursor after trackCursorAxis is disabled while closed', async () => {
			const view = render(TooltipCursorHarness, { trackCursorAxis: 'x' });
			const { element, rect, y } = cursorTarget();
			const x = rect.left + 240;
			hoverWithMouse(element, { clientX: x, clientY: y });
			await expect.poll(() => byTestId('positioner')).not.toBeNull();
			await expect
				.poll(() => Math.abs(centerX(byTestId('positioner')!) - x))
				.toBeLessThanOrEqual(2);
			fire.mouseLeave(element);
			await expect.poll(() => byTestId('positioner')).toBeNull();
			await view.rerender({ trackCursorAxis: 'none' });
			fire.mouseEnter(element, { clientX: x, clientY: y });
			fire.mouseMove(element, { clientX: x, clientY: y });
			await expect.poll(() => byTestId('positioner')).not.toBeNull();
			await expect
				.poll(() => Math.abs(centerX(byTestId('positioner')!) - centerX(element)))
				.toBeLessThanOrEqual(2);
		});

		it('updates the tracked cursor position after closing and reopening', async () => {
			render(TooltipCursorHarness, {});
			const { element, rect, y } = cursorTarget();
			const firstX = rect.left + 240;
			const secondX = rect.left + 60;
			hoverWithMouse(element, { clientX: firstX, clientY: y });
			await expect.poll(() => byTestId('positioner')).not.toBeNull();
			await expect
				.poll(() => Math.abs(centerX(byTestId('positioner')!) - firstX))
				.toBeLessThanOrEqual(2);
			fire.mouseLeave(element);
			await expect.poll(() => byTestId('positioner')).toBeNull();
			fire.mouseEnter(element, { clientX: secondX, clientY: y });
			fire.mouseMove(element, { clientX: secondX, clientY: y });
			await expect.poll(() => byTestId('positioner')).not.toBeNull();
			await expect
				.poll(() => Math.abs(centerX(byTestId('positioner')!) - secondX))
				.toBeLessThanOrEqual(2);
		});
	});

	describe('hoverable popup', () => {
		function center(element: Element) {
			const rect = element.getBoundingClientRect();
			return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
		}

		async function openByHover() {
			const element = page.getByRole('button', { name: 'Trigger' }).element();
			hoverWithMouse(element);
			await expect.poll(() => byTestId('popup')).not.toBeNull();
			const popupElement = byTestId('popup')!;
			// Positioning resolves after the popup mounts.
			await expect
				.poll(() => popupElement.getBoundingClientRect().top)
				.toBe(element.getBoundingClientRect().bottom);
			return { element, popupElement };
		}

		it('survives the trip from the trigger to the popup, then closes after leaving it', async () => {
			render(TooltipHoverableHarness, {});
			const { element, popupElement } = await openByHover();
			fire.mouseLeave(element, center(popupElement));
			fire.mouseEnter(popupElement);
			await tick();
			expect(byTestId('popup')).not.toBeNull();
			fire.mouseLeave(popupElement, {
				relatedTarget: document.body,
				...center(page.getByRole('button', { name: 'Outside' }).element())
			});
			await expect.poll(() => byTestId('popup')).toBeNull();
		});

		it('closes on that same trip when disableHoverablePopup is set', async () => {
			render(TooltipHoverableHarness, { disableHoverablePopup: true });
			const { element, popupElement } = await openByHover();
			fire.mouseLeave(element, center(popupElement));
			fire.mouseEnter(popupElement);
			await tick();
			expect(byTestId('popup')).toBeNull();
		});
	});

	describe('popover portaled from the popup', () => {
		async function openPopover() {
			render(TooltipPopoverHarness, {});
			await expect.poll(() => byTestId('tip')).not.toBeNull();
			clickElement(byTestId('popover-trigger')!);
			await expect.poll(() => byTestId('popover')?.hasAttribute('data-open')).toBe(true);
			expect(byTestId('tip')!.contains(byTestId('popover'))).toBe(false);
		}

		it('keeps the tooltip open on a press inside the popover', async () => {
			await openPopover();
			clickElement(byTestId('popover')!);
			await tick();
			expect(byTestId('tip-open')!.textContent).toBe('true');
			expect(byTestId('popover')?.hasAttribute('data-open')).toBe(true);
		});

		it('closes the tooltip on a press outside both popups', async () => {
			await openPopover();
			clickElement(byTestId('outside')!);
			await tick();
			expect(byTestId('tip-open')!.textContent).toBe('false');
		});
	});

	it('keeps the tooltip open when moving across spaced triggers without a closeDelay', async () => {
		render(TooltipSpacedHarness, {});
		const [first, second, third] = page.getByRole('button').elements();
		const popupVisible = () => byTestId('popup') != null;
		await userEvent.hover(first);
		await expect.poll(popupVisible).toBe(true);
		await userEvent.unhover(first);
		await userEvent.hover(second);
		await expect.poll(popupVisible).toBe(true);
		fire.mouseLeave(second, { relatedTarget: document.body, clientX: 120, clientY: 0 });
		await userEvent.hover(third);
		await expect.poll(popupVisible).toBe(true);
		fire.mouseMove(document.body, { clientX: 300, clientY: 0 });
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(popupVisible()).toBe(true);
	});
});
