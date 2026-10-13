// Assertions follow Base UI v1.9.0 packages/react/test/viewportConformanceTests.tsx
// and packages/react/src/preview-card/viewport/PreviewCardViewport.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: the Strict Mode variants and "cleans up the transition when a lagging payload
// remounts the current container". A trigger's payload is read where it is used, so the
// content never renders with a stale payload that arrives a render later.
import { userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PreviewCardViewportHarness from '../../tests/PreviewCardViewportHarness.svelte';
import { byId, resetBrowserPointer, settlePositioning } from '../../tests/previewCardEvents.js';

beforeEach(resetBrowserPointer);
afterEach(settlePositioning);

function trigger(testId: string) {
	return byId(testId)!;
}

async function activate(testId: string) {
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	trigger(testId).focus();
}

function directionTokens(viewport: HTMLElement) {
	return (viewport.getAttribute('data-activation-direction') ?? '').split(' ').filter(Boolean);
}

describe('PreviewCard.Viewport', () => {
	beforeEach(async () => {
		await userEvent.keyboard('a');
	});

	it('renders children in the `current` container by default', async () => {
		render(PreviewCardViewportHarness, { open: true, content: 'static' });

		await expect.poll(() => byId('content')).not.toBeNull();
		const current = byId('content')!.closest('[data-current]');
		expect(current).not.toBeNull();
		expect(current!.textContent).toBe('Content');
		expect(document.querySelector('[data-previous]')).toBeNull();

		const viewport = byId('viewport')!;
		expect(viewport.hasAttribute('data-transitioning')).toBe(false);
		expect(viewport.hasAttribute('data-activation-direction')).toBe(false);
	});

	it('remounts the `current` container when the active trigger changes', async () => {
		render(PreviewCardViewportHarness, {
			content: 'images',
			triggers: [
				{ id: 'trigger-1', payload: 'first', testid: 'trigger1', text: 'Trigger 1' },
				{ id: 'trigger-2', payload: 'second', testid: 'trigger2', text: 'Trigger 2' }
			]
		});

		await activate('trigger1');
		await expect.poll(() => byId('payload-image-1')).not.toBeNull();
		const firstContainer = byId('payload-image-1')!.closest('[data-current]');
		expect(firstContainer).not.toBeNull();

		await activate('trigger2');
		await expect.poll(() => byId('payload-image-2')?.closest('[data-current]')).not.toBeNull();
		expect(byId('payload-image-2')!.closest('[data-current]')).not.toBe(firstContainer);
	});

	it('does not restart a transition when the active trigger remounts while closed and retained', async () => {
		const onOpenChange = (open: boolean, details: { preventUnmountOnClose(): void }) => {
			if (!open) details.preventUnmountOnClose();
		};
		const props = {
			open: true,
			triggerId: 'trigger-1',
			onOpenChange,
			content: 'static' as const
		};
		const view = render(PreviewCardViewportHarness, { ...props, triggerKey: 'a' });
		await expect.poll(() => byId('content')).not.toBeNull();

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => byId('popup')?.hasAttribute('data-closed')).toBe(true);

		await view.rerender({ ...props, open: false, triggerKey: 'b' });

		expect(byId('popup')!.hasAttribute('data-closed')).toBe(true);
		expect(byId('viewport')!.hasAttribute('data-transitioning')).toBe(false);
		expect(document.querySelector('[data-previous]')).toBeNull();
	});

	describe.each([
		{
			side: 'top',
			direction: 'ltr',
			expected: { position: 'absolute', bottom: '0px', left: '0px' }
		},
		{
			side: 'top',
			direction: 'rtl',
			expected: { position: 'absolute', bottom: '0px', left: '0px' }
		},
		{ side: 'bottom', direction: 'ltr', expected: {} },
		{ side: 'bottom', direction: 'rtl', expected: {} },
		{
			side: 'left',
			direction: 'ltr',
			expected: { position: 'absolute', top: '0px', right: '0px' }
		},
		{
			side: 'left',
			direction: 'rtl',
			expected: { position: 'absolute', top: '0px', right: '0px' }
		},
		{ side: 'right', direction: 'ltr', expected: {} },
		{ side: 'right', direction: 'rtl', expected: {} },
		{
			side: 'inline-start',
			direction: 'ltr',
			expected: { position: 'absolute', top: '0px', right: '0px' }
		},
		{ side: 'inline-start', direction: 'rtl', expected: {} },
		{ side: 'inline-end', direction: 'ltr', expected: {} },
		{
			side: 'inline-end',
			direction: 'rtl',
			expected: { position: 'absolute', top: '0px', right: '0px' }
		}
	] as const)('side=$side in $direction mode', ({ side, direction, expected }) => {
		it('anchors the popup', async () => {
			render(PreviewCardViewportHarness, {
				open: true,
				side,
				direction,
				collisionAvoidance: { side: 'none' },
				content: 'static'
			});
			await expect.poll(() => byId('content')).not.toBeNull();

			const { style } = byId('popup')!;
			const anchored = expected as Record<string, string>;
			expect(style.position).toBe(anchored.position ?? '');
			expect(style.top).toBe(anchored.top ?? '');
			expect(style.right).toBe(anchored.right ?? '');
			expect(style.bottom).toBe(anchored.bottom ?? '');
			expect(style.left).toBe(anchored.left ?? '');
		});
	});

	describe('morphing containers', () => {
		let style: HTMLStyleElement | undefined;

		function addMorphStyles(duration: string) {
			style = document.createElement('style');
			style.textContent = `
				[data-transitioning] [data-previous] { animation: pc-slide-out ${duration} ease-out forwards; }
				[data-transitioning] [data-current] { animation: pc-slide-in ${duration} ease-out forwards; }
				@keyframes pc-slide-out {
					from { transform: translateX(0); opacity: 1; }
					to { transform: translateX(-30%); opacity: 0; }
				}
				@keyframes pc-slide-in {
					from { transform: translateX(30%); opacity: 0; }
					to { transform: translateX(0); opacity: 1; }
				}
			`;
			document.head.append(style);
		}

		afterEach(() => {
			style?.remove();
			style = undefined;
		});

		function positioned(top: number, left: number) {
			return `position: absolute; top: ${top}px; left: ${left}px; width: 100px; height: 50px`;
		}

		function twoTriggers(first: [number, number], second: [number, number]) {
			return [
				{
					id: 'trigger-1',
					payload: 0,
					testid: 'trigger1',
					text: 'Trigger 1',
					style: positioned(...first)
				},
				{
					id: 'trigger-2',
					payload: 1,
					testid: 'trigger2',
					text: 'Trigger 2',
					style: positioned(...second)
				}
			];
		}

		it('creates morphing containers during transitions', async () => {
			addMorphStyles('0.3s');
			render(PreviewCardViewportHarness, { triggers: twoTriggers([10, 10], [100, 200]) });

			await activate('trigger1');
			await expect.poll(() => byId('content')?.textContent).toBe('Content 0');
			const viewport = byId('viewport')!;
			expect(viewport.hasAttribute('data-transitioning')).toBe(false);
			expect(viewport.hasAttribute('data-activation-direction')).toBe(false);

			await activate('trigger2');

			await expect.poll(() => document.querySelector('[data-previous]')).not.toBeNull();
			const previous = document.querySelector<HTMLElement>('[data-previous]')!;
			expect(viewport.getAttribute('data-transitioning')).toBe('');
			expect(directionTokens(viewport)).toEqual(['right', 'down']);
			expect(previous.hasAttribute('inert')).toBe(true);
			expect(previous.textContent?.trim()).toBe('Content 0');
			expect(document.querySelector('[data-current]')!.textContent?.trim()).toBe('Content 1');

			await expect.poll(() => document.querySelector('[data-previous]')).toBeNull();
			expect(viewport.hasAttribute('data-transitioning')).toBe(false);
			expect(byId('content')!.textContent).toBe('Content 1');
		});

		it.todo(
			'sets --popup-width and --popup-height on the previous container (the shared PopupViewport leaves them off)'
		);

		it('sets `data-activation-direction` from the previous to the new trigger', async () => {
			addMorphStyles('0.2s');
			render(PreviewCardViewportHarness, { triggers: twoTriggers([100, 200], [10, 10]) });

			await activate('trigger1');
			await expect.poll(() => byId('content')?.textContent).toBe('Content 0');

			await activate('trigger2');

			await expect.poll(() => directionTokens(byId('viewport')!)).toEqual(['left', 'up']);
		});

		it('creates morphing containers after a kept-mounted popup closes and reopens', async () => {
			addMorphStyles('0.2s');
			const view = render(PreviewCardViewportHarness, {
				triggers: twoTriggers([10, 10], [100, 200]),
				keepMounted: true,
				open: false
			});
			const props = {
				triggers: twoTriggers([10, 10], [100, 200]),
				keepMounted: true
			};

			await activate('trigger1');
			await expect.poll(() => byId('content')?.textContent).toBe('Content 0');

			await activate('trigger2');
			await expect.poll(() => document.querySelector('[data-previous]')).not.toBeNull();
			await expect.poll(() => document.querySelector('[data-previous]')).toBeNull();

			await view.rerender({ ...props, open: false });
			await expect.poll(() => byId('popup')?.hasAttribute('data-closed')).toBe(true);
			await expect.poll(() => byId('popup')?.hasAttribute('data-ending-style')).toBe(false);

			await activate('trigger1');
			await expect.poll(() => byId('content')?.textContent).toBe('Content 0');

			await activate('trigger2');
			await expect.poll(() => document.querySelector('[data-previous]')).not.toBeNull();
			expect(document.querySelector('[data-previous]')!.textContent?.trim()).toBe('Content 0');
			expect(document.querySelector('[data-current]')!.textContent?.trim()).toBe('Content 1');
		});

		it('shows the latest content after rapid trigger changes', async () => {
			addMorphStyles('0.2s');
			render(PreviewCardViewportHarness, {
				triggers: [
					{ id: 'trigger-1', payload: 1, testid: 'trigger1', text: 'Trigger 1' },
					{ id: 'trigger-2', payload: 2, testid: 'trigger2', text: 'Trigger 2' },
					{ id: 'trigger-3', payload: 3, testid: 'trigger3', text: 'Trigger 3' }
				]
			});

			await activate('trigger1');
			await activate('trigger2');
			await activate('trigger3');
			await activate('trigger1');

			await expect.poll(() => byId('content')?.textContent).toBe('Content 1');
		});

		it('keeps the latest transition active during rapid trigger changes', async () => {
			addMorphStyles('10s');
			render(PreviewCardViewportHarness, {
				triggers: [
					{ id: 'trigger-1', payload: 1, testid: 'trigger1', text: 'Trigger 1' },
					{ id: 'trigger-2', payload: 2, testid: 'trigger2', text: 'Trigger 2' },
					{ id: 'trigger-3', payload: 3, testid: 'trigger3', text: 'Trigger 3' }
				]
			});

			await activate('trigger1');
			await expect.poll(() => byId('content')?.textContent).toBe('Content 1');
			await activate('trigger2');

			const currentOf = (text: string) =>
				[...document.querySelectorAll('[data-current]')].find((el) =>
					el.textContent?.includes(text)
				);
			await expect.poll(() => currentOf('Content 2')?.getAnimations().length).toBe(1);
			await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

			await activate('trigger3');
			await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

			expect(currentOf('Content 3')?.getAnimations()).toHaveLength(1);
			expect(byId('viewport')!.getAttribute('data-transitioning')).toBe('');
			expect(document.querySelector('[data-previous]')!.textContent).toContain('Content 2');

			await expect
				.poll(() => document.querySelector('[data-previous]')?.hasAttribute('data-ending-style'))
				.toBe(true);
			expect(currentOf('Content 3')!.hasAttribute('data-starting-style')).toBe(false);
		});
	});
});
