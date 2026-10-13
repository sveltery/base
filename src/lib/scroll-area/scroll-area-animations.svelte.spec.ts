// Assertions follow Base UI v1.9.0 packages/react/src/scroll-area/viewport/ScrollAreaViewport.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { cdp, page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ScrollAreaAnimationHarness from '../../tests/ScrollAreaAnimationHarness.svelte';

function box(viewport: HTMLElement) {
	const element = viewport.ownerDocument.createElement('div');
	element.style.cssText = 'width: 50px; height: 50px';
	viewport.append(element);
	return element;
}

function nextFrame() {
	return new Promise((resolve) => requestAnimationFrame(resolve));
}

describe('<ScrollArea.Viewport /> subtree animations', () => {
	it.each([
		['no infinite animation', undefined],
		['infinite iterations', { duration: 1000, iterations: Infinity }],
		['infinite duration', { duration: Infinity, iterations: 1 }]
	] as const)(
		'recomputes overflow after a subtree animation finishes with %s',
		async (_description, infiniteTiming) => {
			render(ScrollAreaAnimationHarness, {
				setup: (viewport) => {
					// A transform grows the scrollable overflow without resizing anything observed.
					box(viewport).animate(
						{ transform: ['translateX(0)', 'translateX(500px)'] },
						{ duration: 150, fill: 'forwards' }
					);
					if (infiniteTiming) box(viewport).animate({ opacity: [1, 0.5] }, infiniteTiming);
				}
			});
			const root = page.getByTestId('root');
			expect(root.element()).not.toHaveAttribute('data-has-overflow-x');

			await expect.element(root).toHaveAttribute('data-has-overflow-x', '');
		}
	);

	it('releases a finished animation target while another animation is paused', async () => {
		let targetRef: WeakRef<HTMLElement> | undefined;
		let animationsRead = false;
		render(ScrollAreaAnimationHarness, {
			setup: (viewport) => {
				const target = box(viewport);
				const pausedTarget = box(viewport);
				targetRef = new WeakRef(target);
				for (const element of [target, pausedTarget]) {
					element.animate({ opacity: [0, 1] }, { duration: 1000, fill: 'forwards' }).pause();
				}
				// A spy would retain the Animation objects in its recorded results.
				const getAnimations = viewport.getAnimations.bind(viewport);
				viewport.getAnimations = (options) => {
					animationsRead = true;
					return getAnimations(options);
				};
			}
		});
		await expect.poll(() => animationsRead).toBe(true);

		const viewport = page.getByTestId('viewport').element();
		viewport.firstElementChild!.getAnimations()[0].finish();
		await Promise.resolve();
		viewport.firstElementChild!.remove();
		await nextFrame();
		await cdp().send('HeapProfiler.collectGarbage');

		expect(targetRef!.deref()).toBeUndefined();
		expect(viewport.firstElementChild!.getAnimations()[0].playState).toBe('paused');
	});
});
