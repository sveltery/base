// Assertions follow Base UI v1.9.0 packages/react/test/viewportConformanceTests.tsx as run by
// packages/react/src/tooltip/viewport/TooltipViewport.test.tsx (openOn: 'focus')
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TooltipViewportHarness from '../../tests/TooltipViewportHarness.svelte';
import { byTestId } from '../../tests/tooltip-events.js';
import type { TooltipChangeEventDetails } from './types.js';

const flags = globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean };
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

let removeStyle: (() => void) | undefined;

beforeEach(() => {
	flags.BASE_UI_ANIMATIONS_DISABLED = true;
});

afterEach(() => {
	removeStyle?.();
	removeStyle = undefined;
	flags.BASE_UI_ANIMATIONS_DISABLED = true;
});

function injectStyle(css: string) {
	const style = document.createElement('style');
	style.textContent = css;
	document.head.append(style);
	removeStyle = () => style.remove();
}

async function activate(testid: string) {
	await frame();
	byTestId(testid)!.focus();
	await tick();
}

const current = () => document.querySelector<HTMLElement>('[data-current]');
const previous = () => document.querySelector<HTMLElement>('[data-previous]');
const directionTokens = (viewport: HTMLElement) =>
	(viewport.getAttribute('data-activation-direction') ?? '').split(' ').filter(Boolean);

function morphStyles(duration: string) {
	return `
		[data-transitioning] [data-previous] { animation: tt-slide-out ${duration} ease-out forwards; }
		[data-transitioning] [data-current] { animation: tt-slide-in ${duration} ease-out forwards; }
		@keyframes tt-slide-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-30%); opacity: 0; } }
		@keyframes tt-slide-in { from { transform: translateX(30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
	`;
}

const at = (top: number, left: number) =>
	`position: absolute; top: ${top}px; left: ${left}px; width: 100px; height: 50px`;

describe('Tooltip.Viewport conformance', () => {
	it('renders children in the current container by default', () => {
		render(TooltipViewportHarness, { rootProps: { open: true }, content: 'static' });
		const container = byTestId('content')!.closest('[data-current]');
		expect(container?.textContent).toBe('Content');
		expect(previous()).toBeNull();
		const viewport = byTestId('viewport')!;
		expect(viewport.hasAttribute('data-transitioning')).toBe(false);
		expect(viewport.hasAttribute('data-activation-direction')).toBe(false);
	});

	it('remounts the current container when the active trigger changes', async () => {
		render(TooltipViewportHarness, {
			content: 'images',
			triggers: [
				{ payload: 'first', testid: 'trigger1', label: 'Trigger 1' },
				{ payload: 'second', testid: 'trigger2', label: 'Trigger 2' }
			]
		});
		await activate('trigger1');
		await expect.poll(() => byTestId('payload-image-1')).not.toBeNull();
		const firstContainer = byTestId('payload-image-1')!.closest('[data-current]');
		expect(firstContainer).not.toBeNull();
		await activate('trigger2');
		await expect
			.poll(() => byTestId('payload-image-2')?.closest('[data-current]') ?? null)
			.not.toBeNull();
		expect(byTestId('payload-image-2')!.closest('[data-current]')).not.toBe(firstContainer);
	});

	it('does not restart a transition when the active trigger remounts while closed and retained', async () => {
		const rootProps = {
			triggerId: 'trigger',
			onOpenChange: (open: boolean, details: TooltipChangeEventDetails) => {
				if (!open) details.preventUnmountOnClose();
			}
		};
		const view = render(TooltipViewportHarness, {
			bound: true,
			initiallyOpen: true,
			rootProps,
			triggers: [{ key: 'a', id: 'trigger', label: 'Trigger' }]
		});
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => byTestId('popup')?.hasAttribute('data-closed')).toBe(true);
		await view.rerender({ triggers: [{ key: 'b', id: 'trigger', label: 'Trigger' }] });
		expect(byTestId('popup')?.hasAttribute('data-closed')).toBe(true);
		expect(byTestId('viewport')?.hasAttribute('data-transitioning')).toBe(false);
		expect(previous()).toBeNull();
	});

	const anchored = { position: 'absolute', top: '0px', right: '0px' };
	const fromBottom = { position: 'absolute', bottom: '0px', left: '0px' };
	it.for([
		{ side: 'top', direction: 'ltr', expected: fromBottom },
		{ side: 'top', direction: 'rtl', expected: fromBottom },
		{ side: 'bottom', direction: 'ltr', expected: {} },
		{ side: 'bottom', direction: 'rtl', expected: {} },
		{ side: 'left', direction: 'ltr', expected: anchored },
		{ side: 'left', direction: 'rtl', expected: anchored },
		{ side: 'right', direction: 'ltr', expected: {} },
		{ side: 'right', direction: 'rtl', expected: {} },
		{ side: 'inline-start', direction: 'ltr', expected: anchored },
		{ side: 'inline-start', direction: 'rtl', expected: {} },
		{ side: 'inline-end', direction: 'ltr', expected: {} },
		{ side: 'inline-end', direction: 'rtl', expected: anchored }
	] as const)(
		'anchors the popup for side=$side in $direction mode',
		async ({ side, direction, expected }) => {
			render(TooltipViewportHarness, {
				rootProps: { open: true },
				direction,
				positionerProps: { side, collisionAvoidance: { side: 'none' } }
			});
			const expectedStyle = {
				position: '',
				top: '',
				right: '',
				bottom: '',
				left: '',
				...expected
			};
			await expect
				.poll(() => {
					const { style } = byTestId('popup')!;
					return {
						position: style.position,
						top: style.top,
						right: style.right,
						bottom: style.bottom,
						left: style.left
					};
				})
				.toEqual(expectedStyle);
		}
	);

	describe('morphing containers', () => {
		beforeEach(() => {
			flags.BASE_UI_ANIMATIONS_DISABLED = false;
		});

		function renderPositioned(first: [number, number], second: [number, number], duration: string) {
			injectStyle(morphStyles(duration));
			return render(TooltipViewportHarness, {
				content: 'payload-div',
				triggers: [
					{ payload: 0, testid: 'trigger1', label: 'Trigger 1', style: at(...first) },
					{ payload: 1, testid: 'trigger2', label: 'Trigger 2', style: at(...second) }
				]
			});
		}

		it('creates morphing containers during transitions', async () => {
			renderPositioned([10, 10], [100, 200], '0.3s');
			await activate('trigger1');
			await expect.poll(() => byTestId('content')?.textContent).toBe('Content 0');
			const viewport = byTestId('viewport')!;
			expect(viewport.hasAttribute('data-transitioning')).toBe(false);
			expect(viewport.hasAttribute('data-activation-direction')).toBe(false);

			await activate('trigger2');
			await expect.poll(previous).not.toBeNull();
			const previousContainer = previous()!;
			expect(viewport.getAttribute('data-transitioning')).toBe('');
			expect(directionTokens(viewport)).toEqual(['right', 'down']);
			expect(previousContainer.hasAttribute('inert')).toBe(true);
			expect(previousContainer.textContent).toBe('Content 0');
			expect(current()?.textContent).toBe('Content 1');

			await expect.poll(previous, { timeout: 3000 }).toBeNull();
			expect(viewport.hasAttribute('data-transitioning')).toBe(false);
			expect(byTestId('content')?.textContent).toBe('Content 1');
		});

		it('sets --popup-width and --popup-height on the previous container', async () => {
			renderPositioned([10, 10], [100, 200], '0.3s');
			await activate('trigger1');
			await expect.poll(() => byTestId('content')?.textContent).toBe('Content 0');
			const { width, height } = getComputedStyle(byTestId('popup')!);

			await activate('trigger2');
			await expect.poll(previous).not.toBeNull();
			expect(previous()!.style.getPropertyValue('--popup-width')).toBe(width);
			expect(previous()!.style.getPropertyValue('--popup-height')).toBe(height);
		});

		it('sets data-activation-direction from the previous to the new trigger', async () => {
			renderPositioned([100, 200], [10, 10], '0.2s');
			await activate('trigger1');
			await expect.poll(() => byTestId('content')?.textContent).toBe('Content 0');
			await activate('trigger2');
			await expect.poll(() => directionTokens(byTestId('viewport')!)).toEqual(['left', 'up']);
		});

		it('creates morphing containers after a kept-mounted popup closes and reopens', async () => {
			injectStyle(morphStyles('0.2s'));
			const view = render(TooltipViewportHarness, {
				bound: true,
				keepMounted: true,
				triggers: [
					{ payload: 0, testid: 'trigger1', label: 'Trigger 1' },
					{ payload: 1, testid: 'trigger2', label: 'Trigger 2' }
				]
			});
			await activate('trigger1');
			await expect.poll(() => current()?.textContent?.trim()).toBe('Content 0');
			await activate('trigger2');
			await expect.poll(previous).not.toBeNull();
			await expect.poll(previous, { timeout: 3000 }).toBeNull();

			(view.getByRole('button', { name: 'Close externally' }).element() as HTMLElement).click();
			await expect
				.poll(() => byTestId('popup')?.hasAttribute('data-ending-style') ?? false)
				.toBe(false);
			await expect.poll(() => byTestId('popup')?.hasAttribute('data-closed')).toBe(true);

			await activate('trigger1');
			await expect.poll(() => current()?.textContent?.trim()).toBe('Content 0');
			await activate('trigger2');
			await expect.poll(previous).not.toBeNull();
			expect(previous()?.textContent?.trim()).toBe('Content 0');
			expect(current()?.textContent?.trim()).toBe('Content 1');
		});

		it('shows the latest content after rapid trigger changes', async () => {
			injectStyle(morphStyles('0.2s'));
			render(TooltipViewportHarness, {
				triggers: [1, 2, 3].map((number) => ({
					payload: number,
					testid: `trigger${number}`,
					label: `Trigger ${number}`
				}))
			});
			await activate('trigger1');
			await activate('trigger2');
			await activate('trigger3');
			await activate('trigger1');
			await expect.poll(() => current()?.textContent?.trim()).toBe('Content 1');
			await expect.poll(previous, { timeout: 3000 }).toBeNull();
			expect(current()?.textContent?.trim()).toBe('Content 1');
		});

		it('keeps the latest transition active during rapid trigger changes', async () => {
			injectStyle(morphStyles('10s'));
			render(TooltipViewportHarness, {
				triggers: [1, 2, 3].map((number) => ({
					payload: number,
					testid: `trigger${number}`,
					label: `Trigger ${number}`
				}))
			});
			await activate('trigger1');
			await expect.poll(() => current()?.textContent?.trim()).toBe('Content 1');
			await activate('trigger2');
			await expect.poll(() => current()?.getAnimations().length).toBe(1);
			await frame();
			await activate('trigger3');
			await frame();
			expect(current()?.textContent?.trim()).toBe('Content 3');
			expect(current()?.getAnimations()).toHaveLength(1);
			expect(byTestId('viewport')?.getAttribute('data-transitioning')).toBe('');
			expect(previous()?.textContent?.trim()).toBe('Content 2');
			await expect.poll(() => previous()?.getAttribute('data-ending-style')).toBe('');
			expect(current()?.hasAttribute('data-starting-style')).toBe(false);
		});
	});
});
