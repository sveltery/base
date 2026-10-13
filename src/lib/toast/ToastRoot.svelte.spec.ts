// Assertions follow Base UI v1.9.0 packages/react/src/toast/root/ToastRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance is not ported, nor the test of the exported state attribute mapping:
// the swipe cases assert `data-swipe-direction` on the element instead.
// Vitest's browser `userEvent` has no touch pointer, so the "real pointer swipe" cases drag with
// the mouse. Synthetic pointer ids have no active pointer, so `setPointerCapture` is stubbed.
// The portaled-content case moves the button to `<body>` with an attachment.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ToastRootHarness from '../../tests/ToastRootHarness.svelte';
import {
	allByTestId,
	button,
	byTestId,
	click,
	closeButton,
	css,
	disableAnimations,
	renderToasts,
	textOf,
	withAnimations
} from '../../tests/toast.js';
import type { ToastManagerAddOptions } from './types.js';

disableAnimations();

/** An exit transition long enough to keep a closed toast mounted for the whole test. */
function exitTransition(selector: string) {
	return `${selector} { opacity: 1; transition: opacity 10s; }
		${selector}[data-ending-style] { opacity: 0; }`;
}

function stubPointerCapture(element: HTMLElement) {
	Object.defineProperty(element, 'setPointerCapture', { value: () => {}, configurable: true });
	Object.defineProperty(element, 'releasePointerCapture', { value: () => {}, configurable: true });
}

function pointer(type: string, target: EventTarget, init: PointerEventInit) {
	target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 1, ...init }));
}

async function simulateSwipe(
	element: HTMLElement,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
	releaseTarget: HTMLElement | Document = element,
	releaseType: 'pointerup' | 'pointercancel' = 'pointerup'
) {
	stubPointerCapture(element);
	// Each event is its own task in a browser. Svelte's `on` attaches pointer listeners in a
	// microtask, so the document release listener exists only after the press has settled.
	pointer('pointerdown', element, { clientX: startX, clientY: startY, button: 0 });
	await tick();

	// An initial move close to the start, as a finger moves slightly before the main swipe,
	// so the first-move adjustment does not swallow the swipe.
	pointer('pointermove', element, {
		clientX: startX + Math.sign(endX - startX),
		clientY: startY + Math.sign(endY - startY)
	});
	await tick();
	pointer('pointermove', element, { clientX: endX, clientY: endY });
	await tick();
	pointer(releaseType, releaseTarget, { clientX: endX, clientY: endY });
	await tick();
}

function root() {
	return byTestId('root')!;
}

function roots() {
	return allByTestId('root');
}

const swipeToast: ToastManagerAddOptions = {
	id: 'swipe-test-toast',
	title: 'Swipe Me',
	description: 'Swipe to dismiss'
};

async function addSwipeToast(
	swipeDirection: NonNullable<Parameters<typeof renderToasts>[0]>['swipeDirection'],
	options: Partial<ToastManagerAddOptions> = {}
) {
	const harness = renderToasts({ swipeDirection, addOptions: { ...swipeToast, ...options } });
	await click(button('add'));
	return harness;
}

describe('<Toast.Root />', () => {
	it('renders a non-modal dialog with the stacking CSS variables', async () => {
		const { manager } = renderToasts();

		manager.add({ title: 'first' });
		await tick();
		manager.add({ title: 'second' });
		await tick();

		const [newest, oldest] = roots();
		expect(newest.getAttribute('role')).toBe('dialog');
		expect(newest.getAttribute('aria-modal')).toBe('false');
		expect(newest.getAttribute('tabindex')).toBe('0');
		expect(css(newest, '--toast-index')).toBe('0');
		expect(css(oldest, '--toast-index')).toBe('1');
		expect(css(newest, '--toast-height')).toBe(`${newest.offsetHeight}px`);
	});

	it('sets the vertical offset CSS variable', async () => {
		const { manager } = renderToasts();

		manager.add({ title: 'first' });
		await tick();
		manager.add({ title: 'second' });
		await tick();

		const [newest, oldest] = roots();
		expect(css(newest, '--toast-offset-y')).toBe('0px');
		expect(css(oldest, '--toast-offset-y')).toBe(`${newest.offsetHeight}px`);
	});

	it('keeps dynamic title and description ids synchronized with mounted label parts', async () => {
		const view = render(ToastRootHarness, { scenario: 'labels' });
		const rootElement = root();

		expect(rootElement.getAttribute('aria-labelledby')).toBe(byTestId('title')!.id);
		expect(rootElement.getAttribute('aria-describedby')).toBe(byTestId('description')!.id);
		expect(byTestId('title')!.id).toMatch(/^base-ui-/);

		await view.rerender({ mode: 'explicit' });
		expect(rootElement.getAttribute('aria-labelledby')).toBe(byTestId('title')!.id);
		expect(rootElement.getAttribute('aria-describedby')).toBe(byTestId('description')!.id);
		expect(textOf('title')).toBe('Explicit title');
		expect(textOf('description')).toBe('Explicit description');

		await view.rerender({ mode: 'none' });
		expect(rootElement.hasAttribute('aria-labelledby')).toBe(false);
		expect(rootElement.hasAttribute('aria-describedby')).toBe(false);

		await view.rerender({ mode: 'fallback' });
		expect(rootElement.getAttribute('aria-labelledby')).toBe(byTestId('title')!.id);
		expect(rootElement.getAttribute('aria-describedby')).toBe(byTestId('description')!.id);
		expect(textOf('title')).toBe('Toast title');
		expect(textOf('description')).toBe('Toast description');
	});

	it('recalculates height when content mutates', async () => {
		const { manager } = renderToasts({ content: true, rootStyle: 'width: 30px' });

		const toastId = manager.add({ id: 'resizable-toast', title: 'Loading', description: 'Short' });
		await tick();
		const toastRoot = root();

		await expect.poll(() => css(toastRoot, '--toast-height')).toBe(`${toastRoot.offsetHeight}px`);
		const initialHeight = parseInt(css(toastRoot, '--toast-height'), 10);

		manager.update(toastId, {
			title: 'Success',
			description: 'This content is longer than before and should cause the height to increase'
		});

		await expect
			.poll(() => parseInt(css(toastRoot, '--toast-height'), 10))
			.toBeGreaterThan(initialHeight);
		expect(css(toastRoot, '--toast-height')).toBe(`${toastRoot.offsetHeight}px`);
	});

	it('clears the starting state and restores the height when re-adding an ending toast', async () => {
		await withAnimations(async () => {
			const { manager } = renderToasts({ css: exitTransition('[data-testid="root"]') });

			manager.add({ id: 'save', title: 'Saved', timeout: 0 });
			await tick();
			const toastRoot = root();
			await expect.poll(() => toastRoot.hasAttribute('data-starting-style')).toBe(false);
			const initialHeight = css(toastRoot, '--toast-height');
			expect(initialHeight).toBe(`${toastRoot.offsetHeight}px`);

			manager.close('save');
			await tick();
			expect(toastRoot.hasAttribute('data-ending-style')).toBe(true);
			expect(css(toastRoot, '--toast-height')).toBe('');

			manager.add({ id: 'save', title: 'Saved', timeout: 0 });
			await tick();
			expect(root()).toBe(toastRoot);

			await expect.poll(() => toastRoot.hasAttribute('data-starting-style')).toBe(false);
			await expect.poll(() => css(toastRoot, '--toast-height')).toBe(initialHeight);
			expect(toastRoot.hasAttribute('data-ending-style')).toBe(false);
		});
	});

	it('registers an active toast after its root remounts', async () => {
		const view = render(ToastRootHarness, { scenario: 'remount' });

		await userEvent.click(page.getByRole('button', { name: 'add' }));
		const initialRoot = root();
		await expect.poll(() => initialRoot.hasAttribute('data-starting-style')).toBe(false);
		const initialHeight = parseInt(css(initialRoot, '--toast-height'), 10);

		await view.rerender({ showToasts: false });
		expect(byTestId('root')).toBe(null);

		await view.rerender({ longTitle: true, showToasts: true });
		const remountedRoot = root();
		expect(remountedRoot).not.toBe(initialRoot);

		await expect
			.poll(() => parseInt(css(remountedRoot, '--toast-height'), 10))
			.toBeGreaterThan(initialHeight);

		await userEvent.keyboard('{F6}');
		await userEvent.keyboard('{Tab}');

		expect(document.activeElement).toBe(remountedRoot);
	});

	it('keeps stacking intact when re-adding an ending toast among other toasts', async () => {
		await withAnimations(async () => {
			const { manager } = renderToasts({
				content: true,
				rootTestId: 'id',
				css: exitTransition('[data-testid^="toast-"]')
			});

			manager.add({ id: 't1', title: 'One', timeout: 0 });
			await tick();
			manager.add({ id: 't2', title: 'Two', timeout: 0 });
			await tick();
			manager.close('t1');
			await tick();

			const toast1 = byTestId('toast-t1')!;
			expect(toast1.hasAttribute('data-ending-style')).toBe(true);

			manager.add({ id: 't1', title: 'One', timeout: 0 });
			await tick();

			await expect.poll(() => toast1.hasAttribute('data-starting-style')).toBe(false);
			await expect.poll(() => css(toast1, '--toast-height')).toBe(`${toast1.offsetHeight}px`);

			// The revived toast is frontmost and its content is not hidden as "behind".
			expect(css(toast1, '--toast-index')).toBe('0');
			expect(byTestId('content-t1')!.hasAttribute('data-behind')).toBe(false);

			// The unrelated toast is unaffected and stacks behind the revived one.
			const toast2 = byTestId('toast-t2')!;
			expect(toast2.hasAttribute('data-ending-style')).toBe(false);
			expect(css(toast2, '--toast-index')).toBe('1');
			expect(byTestId('content-t2')!.hasAttribute('data-behind')).toBe(true);
		});
	});

	it('clears swipe state when re-adding a swipe-dismissed toast', async () => {
		await withAnimations(async () => {
			const { manager } = renderToasts({
				swipeDirection: 'right',
				css: exitTransition('[data-testid="root"]')
			});

			manager.add({ id: 'save', title: 'Saved', timeout: 0 });
			await tick();
			const toastRoot = root();

			await simulateSwipe(toastRoot, 100, 100, 160, 100);

			expect(toastRoot.hasAttribute('data-ending-style')).toBe(true);
			expect(toastRoot.getAttribute('data-swipe-direction')).toBe('right');

			manager.add({ id: 'save', title: 'Saved', timeout: 0 });
			await tick();
			expect(root()).toBe(toastRoot);

			await expect.poll(() => toastRoot.hasAttribute('data-starting-style')).toBe(false);
			await expect.poll(() => toastRoot.hasAttribute('data-swipe-direction')).toBe(false);
			expect(css(toastRoot, '--toast-swipe-movement-x')).toBe('0px');
			expect(css(toastRoot, '--toast-swipe-movement-y')).toBe('0px');
		});
	});

	it('clears swipe state when a retained root is reused for another toast', async () => {
		await withAnimations(async () => {
			const { manager } = renderToasts({
				swipeDirection: 'right',
				keyByIndex: true,
				rootTestId: 'index',
				css: exitTransition('[data-testid^="root-"]')
			});

			for (let index = 0; index < 3; index += 1) {
				manager.add({ title: 'Saved', timeout: 0 });
				await tick();
			}

			const swipedRoot = byTestId('root-1')!;
			await simulateSwipe(swipedRoot, 100, 100, 160, 100);
			expect(swipedRoot.getAttribute('data-swipe-direction')).toBe('right');

			// Index keys shift every retained root onto a different toast, so this root now
			// renders a toast that was never swiped.
			manager.add({ title: 'Saved', timeout: 0 });
			await tick();
			expect(byTestId('root-1')).toBe(swipedRoot);

			await expect.poll(() => swipedRoot.hasAttribute('data-swipe-direction')).toBe(false);
			expect(swipedRoot.hasAttribute('data-ending-style')).toBe(false);
			expect(css(swipedRoot, '--toast-swipe-movement-x')).toBe('0px');
			expect(css(swipedRoot, '--toast-swipe-movement-y')).toBe('0px');
		});
	});

	it('moves focus to the next toast when closing in an index-keyed list', async () => {
		await withAnimations(async () => {
			const { manager } = renderToasts({
				keyByIndex: true,
				rootTestId: 'index',
				css: exitTransition('[data-testid^="root-"]')
			});

			// With index keys, each add shifts every retained root to a different toast,
			// so the store's elements must be re-registered per toast id.
			for (let index = 0; index < 3; index += 1) {
				manager.add({ title: 'Saved', timeout: 0 });
				await tick();
			}

			await userEvent.keyboard('{F6}');
			await userEvent.keyboard('{Tab}');
			expect(document.activeElement).toBe(byTestId('root-0'));

			await userEvent.keyboard('{Escape}');

			// Focus hands off to the next active toast, not the one animating out.
			await expect.poll(() => document.activeElement).toBe(byTestId('root-1'));
		});
	});

	it('closes when pressing escape', async () => {
		renderToasts();

		const addButton = page.getByRole('button', { name: 'add' });
		(addButton.element() as HTMLElement).focus();
		await userEvent.click(addButton);

		await userEvent.keyboard('{F6}');
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(root());
		await userEvent.keyboard('{Escape}');

		expect(roots()).toHaveLength(0);
	});

	it('ignores Escape when focus is in portaled content', async () => {
		render(ToastRootHarness, { scenario: 'portal' });

		await userEvent.click(page.getByRole('button', { name: 'add' }));

		// The button is a child of the toast in the component tree, but it lives outside the
		// toast in the DOM and owns the Escape key.
		const portaled = byTestId('portaled')!;
		expect(portaled.parentElement).toBe(document.body);
		portaled.focus();
		await userEvent.keyboard('{Escape}');

		expect(roots()).toHaveLength(1);
	});

	describe('swipe behavior', () => {
		it.each([
			['left', -60, 0],
			['right', 60, 0],
			['up', 0, -60],
			['down', 0, 60]
		] as const)('dismisses with a real %s pointer swipe', async (direction, deltaX, deltaY) => {
			await addSwipeToast(direction);
			const toastElement = root();
			const rect = toastElement.getBoundingClientRect();
			const start = { x: rect.width / 2, y: rect.height / 2 };

			await userEvent.dragAndDrop(page.getByTestId('root'), page.getByTestId('root'), {
				sourcePosition: start,
				targetPosition: { x: start.x + deltaX, y: start.y + deltaY },
				steps: 10
			});

			await expect.poll(() => byTestId('root')).toBe(null);
		});

		it('closes toast when swiping in the specified direction beyond threshold', async () => {
			await addSwipeToast('up');

			// Swipe up (starting at y=100, ending at y=55, which is > 40px threshold)
			await simulateSwipe(root(), 100, 100, 100, 55);

			expect(byTestId('root')).toBe(null);
		});

		it('locks to a single axis on the first move of a two-axis swipe', async () => {
			await addSwipeToast(['down', 'right']);
			const toastElement = root();
			stubPointerCapture(toastElement);

			pointer('pointerdown', toastElement, { clientX: 100, clientY: 100, button: 0 });
			pointer('pointermove', toastElement, { clientX: 101, clientY: 101 });
			pointer('pointermove', toastElement, { clientX: 120, clientY: 150 });
			await tick();

			expect(css(toastElement, '--toast-swipe-movement-x')).toBe('0px');
			expect(css(toastElement, '--toast-swipe-movement-y')).toBe('49px');

			pointer('pointerup', toastElement, { clientX: 120, clientY: 150 });
			await tick();
		});

		it('does not close toast when swiping in the specified direction below threshold', async () => {
			await addSwipeToast('up');

			// Swipe up but only by 10px (below 40px threshold)
			await simulateSwipe(root(), 100, 100, 100, 90);

			expect(roots()).toHaveLength(1);
			expect(root().hasAttribute('data-swipe-direction')).toBe(false);
		});

		it('does not close toast when swiping in a non-specified direction', async () => {
			await addSwipeToast('up');

			// Swipe down (opposite of allowed direction)
			await simulateSwipe(root(), 100, 100, 100, 150);

			expect(roots()).toHaveLength(1);
		});

		describe('supports multiple swipe directions', () => {
			it.each([
				['up + right', ['up', 'right'], [150, 100], [100, 50]],
				['right + left', ['right', 'left'], [150, 100], [50, 100]],
				['up + down', ['up', 'down'], [100, 50], [100, 150]]
			] as const)('%s', async (_name, directions, first, second) => {
				await addSwipeToast([...directions]);

				await simulateSwipe(root(), 100, 100, first[0], first[1]);
				expect(byTestId('root')).toBe(null);

				await click(button('add'));
				await simulateSwipe(root(), 100, 100, second[0], second[1]);
				expect(byTestId('root')).toBe(null);
			});
		});

		it('cancels a vertical swipe when the pointer changes its mind', async () => {
			await addSwipeToast('up');
			const toastElement = root();
			stubPointerCapture(toastElement);

			pointer('pointerdown', toastElement, { clientX: 100, clientY: 100, button: 0 });
			pointer('pointermove', toastElement, { clientX: 100, clientY: 99, movementY: -1 });

			// Swipe up well past the dismiss threshold to arm the gesture.
			pointer('pointermove', toastElement, { clientX: 100, clientY: 10, movementY: -89 });
			await tick();
			expect(toastElement.getAttribute('data-swipe-direction')).toBe('up');

			// Reversing moves the cancel baseline to the turning point, so the swipe is now
			// measured as zero progress from there rather than 50px from the original press,
			// and the change of mind wins.
			pointer('pointermove', toastElement, { clientX: 100, clientY: 50, movementY: 40 });
			pointer('pointerup', toastElement, { clientX: 100, clientY: 50 });
			await tick();

			expect(roots()).toHaveLength(1);
			expect(toastElement.hasAttribute('data-swipe-direction')).toBe(false);
			expect(css(toastElement, '--toast-swipe-movement-y')).toBe('0px');
		});

		it('cancels a horizontal swipe when the pointer changes its mind', async () => {
			await addSwipeToast('right');
			const toastElement = root();
			stubPointerCapture(toastElement);

			pointer('pointerdown', toastElement, { clientX: 100, clientY: 100, button: 0 });
			pointer('pointermove', toastElement, { clientX: 101, clientY: 100, movementX: 1 });
			pointer('pointermove', toastElement, { clientX: 190, clientY: 100, movementX: 89 });
			await tick();
			expect(toastElement.getAttribute('data-swipe-direction')).toBe('right');

			pointer('pointermove', toastElement, { clientX: 150, clientY: 100, movementX: -40 });
			pointer('pointerup', toastElement, { clientX: 150, clientY: 100 });
			await tick();

			expect(roots()).toHaveLength(1);
			expect(toastElement.hasAttribute('data-swipe-direction')).toBe(false);
			expect(css(toastElement, '--toast-swipe-movement-x')).toBe('0px');
		});

		it('locks the gesture to the horizontal axis when it starts sideways', async () => {
			await addSwipeToast(['down', 'right']);
			const toastElement = root();
			stubPointerCapture(toastElement);

			pointer('pointerdown', toastElement, { clientX: 100, clientY: 100, button: 0 });
			pointer('pointermove', toastElement, { clientX: 100, clientY: 100 });

			// Mostly sideways, so the gesture locks to the horizontal axis.
			pointer('pointermove', toastElement, { clientX: 95, clientY: 98 });

			// Left is not a dismissible direction, so nothing gets armed.
			pointer('pointermove', toastElement, { clientX: 90, clientY: 98 });
			await tick();
			expect(toastElement.hasAttribute('data-swipe-direction')).toBe(false);

			// Back at the origin the horizontal delta is exactly zero.
			pointer('pointermove', toastElement, { clientX: 100, clientY: 98 });
			await tick();
			expect(toastElement.hasAttribute('data-swipe-direction')).toBe(false);

			// Dragging far downwards and slightly right: without the axis lock the larger
			// vertical delta would arm `down` instead.
			pointer('pointermove', toastElement, { clientX: 110, clientY: 220 });
			await tick();
			expect(toastElement.getAttribute('data-swipe-direction')).toBe('right');

			pointer('pointermove', toastElement, { clientX: 160, clientY: 220 });
			pointer('pointerup', toastElement, { clientX: 160, clientY: 220 });
			await tick();

			expect(byTestId('root')).toBe(null);
		});

		it('locks the gesture to the vertical axis when it starts upright', async () => {
			await addSwipeToast(['down', 'right']);
			const toastElement = root();
			stubPointerCapture(toastElement);

			pointer('pointerdown', toastElement, { clientX: 100, clientY: 100, button: 0 });
			pointer('pointermove', toastElement, { clientX: 100, clientY: 100 });

			// Mostly upright, so the gesture locks to the vertical axis.
			pointer('pointermove', toastElement, { clientX: 98, clientY: 95 });

			pointer('pointermove', toastElement, { clientX: 98, clientY: 90 });
			await tick();
			expect(toastElement.hasAttribute('data-swipe-direction')).toBe(false);

			pointer('pointermove', toastElement, { clientX: 98, clientY: 100 });
			await tick();
			expect(toastElement.hasAttribute('data-swipe-direction')).toBe(false);

			// Dragging far to the right and slightly down: without the axis lock the larger
			// horizontal delta would arm `right` instead.
			pointer('pointermove', toastElement, { clientX: 220, clientY: 110 });
			await tick();
			expect(toastElement.getAttribute('data-swipe-direction')).toBe('down');

			pointer('pointermove', toastElement, { clientX: 220, clientY: 160 });
			pointer('pointerup', toastElement, { clientX: 220, clientY: 160 });
			await tick();

			expect(byTestId('root')).toBe(null);
		});

		it('does not start a swipe from a non-primary pointer button', async () => {
			await addSwipeToast('right');
			const toastElement = root();
			stubPointerCapture(toastElement);

			pointer('pointerdown', toastElement, { clientX: 100, clientY: 100, button: 2 });
			await tick();

			expect(toastElement.hasAttribute('data-swiping')).toBe(false);

			pointer('pointermove', toastElement, { clientX: 200, clientY: 100 });
			pointer('pointerup', toastElement, { clientX: 200, clientY: 100 });
			await tick();

			expect(roots()).toHaveLength(1);
		});

		it('applies [data-swiping] attribute when swiping', async () => {
			await addSwipeToast('up');
			const toastElement = root();
			stubPointerCapture(toastElement);

			pointer('pointerdown', toastElement, { clientX: 100, clientY: 100, button: 0 });
			await tick();

			expect(toastElement.getAttribute('data-swiping')).toBe('');
		});

		it.each([
			['down', 100, 150],
			['left', 50, 100],
			['right', 150, 100]
		] as const)(
			'dismisses toast when swiped %s with that swipe direction',
			async (direction, x, y) => {
				await addSwipeToast(direction);

				await simulateSwipe(root(), 100, 100, x, y);

				expect(byTestId('root')).toBe(null);
			}
		);

		it('allows swiping in multiple directions when specified', async () => {
			await addSwipeToast(['up', 'right']);

			// First test upward swipe
			await simulateSwipe(root(), 100, 100, 100, 50);
			expect(byTestId('root')).toBe(null);

			await click(button('add'));
			await simulateSwipe(root(), 100, 100, 150, 100);
			expect(byTestId('root')).toBe(null);
		});

		it('does not dismiss when swiped in non-specified direction', async () => {
			await addSwipeToast('up');
			const toastElement = root();

			// Swipe right (not allowed)
			await simulateSwipe(toastElement, 100, 100, 150, 100);
			expect(roots()).toHaveLength(1);

			// Swipe down (not allowed)
			await simulateSwipe(toastElement, 100, 100, 100, 150);
			expect(roots()).toHaveLength(1);
		});

		it('does not dismiss when swipe distance is below threshold', async () => {
			await addSwipeToast('up');

			// Small upward swipe (below threshold)
			await simulateSwipe(root(), 100, 100, 100, 95);

			expect(roots()).toHaveLength(1);
		});

		it('prevents native touchmove only during an active touch swipe', async () => {
			render(ToastRootHarness, { scenario: 'static' });
			const toastElement = root();
			stubPointerCapture(toastElement);

			const beforeSwipeEvent = new Event('touchmove', { bubbles: true, cancelable: true });
			toastElement.dispatchEvent(beforeSwipeEvent);
			expect(beforeSwipeEvent.defaultPrevented).toBe(false);

			pointer('pointerdown', toastElement, {
				clientX: 100,
				clientY: 100,
				button: 0,
				pointerType: 'touch'
			});

			const duringSwipeEvent = new Event('touchmove', { bubbles: true, cancelable: true });
			toastElement.dispatchEvent(duringSwipeEvent);
			expect(duringSwipeEvent.defaultPrevented).toBe(true);

			pointer('pointercancel', toastElement, { pointerType: 'touch' });

			const afterSwipeEvent = new Event('touchmove', { bubbles: true, cancelable: true });
			toastElement.dispatchEvent(afterSwipeEvent);
			expect(afterSwipeEvent.defaultPrevented).toBe(false);
		});

		it.each([
			['data-base-ui-swipe-ignore', 'base'],
			['the legacy data-swipe-ignore', 'legacy']
		] as const)('does not start swiping from elements with %s', async (_name, ignore) => {
			render(ToastRootHarness, { scenario: 'static', ignore });
			const toastElement = root();
			stubPointerCapture(toastElement);

			pointer('pointerdown', byTestId('ignore-target')!, {
				clientX: 100,
				clientY: 100,
				button: 0
			});
			await tick();
			expect(toastElement.hasAttribute('data-swiping')).toBe(false);

			pointer('pointerdown', toastElement, { clientX: 100, clientY: 100, button: 0 });
			await tick();
			expect(toastElement.hasAttribute('data-swiping')).toBe(true);
		});

		it('ignores swipe gestures when toast is anchored', async () => {
			const anchor = document.createElement('div');
			document.body.appendChild(anchor);

			try {
				await addSwipeToast('up', { positionerProps: { anchor } });

				await simulateSwipe(root(), 100, 100, 100, 55);

				expect(roots()).toHaveLength(1);
				expect(root().hasAttribute('data-swiping')).toBe(false);
			} finally {
				anchor.remove();
			}
		});
	});

	describe('drag behavior regression', () => {
		async function addDragToast() {
			renderToasts({ content: true, addOptions: { title: 'T', description: 'D' } });
			await click(button('add'));
			return root();
		}

		function expectDragReset(toastElement: HTMLElement) {
			expect(toastElement.hasAttribute('data-swiping')).toBe(false);
			expect(toastElement.hasAttribute('data-swipe-direction')).toBe(false);
			expect(css(toastElement, '--toast-swipe-movement-x')).toBe('0px');
			expect(css(toastElement, '--toast-swipe-movement-y')).toBe('0px');
			expect(toastElement.style.transition).toBe('');
			expect(toastElement.style.transform).toBe('');
		}

		it('resets drag state after releasing a far swipe even when the release lands on the document', async () => {
			const toastElement = await addDragToast();

			// Default swipeDirection=['down','right']. Dragging left triggers the damped, opposite-
			// direction path. Release on the document to cover browsers that don't deliver the final
			// pointer event back to the toast root.
			await simulateSwipe(toastElement, 300, 100, -5000, 100, document);

			expectDragReset(toastElement);

			await simulateSwipe(toastElement, 100, 100, 150, 100);

			expect(byTestId('root')).toBe(null);
		});

		it('resets drag state after a document pointercancel', async () => {
			const toastElement = await addDragToast();

			await simulateSwipe(toastElement, 300, 100, -5000, 100, document, 'pointercancel');

			expectDragReset(toastElement);
		});
	});

	describe('object identity', () => {
		// Regression test for https://github.com/mui/base-ui/issues/3922
		// Toast calculations should use ID-based lookups, not referential equality.
		it('works correctly when toast objects are recreated (not referentially equal)', async () => {
			const { manager } = renderToasts({ copy: true });

			manager.add({ id: 'test-toast', title: 'Test Title', description: 'Test Description' });
			await tick();

			// The toast index is the toast's position by id, not -1 from a reference lookup.
			expect(css(root(), '--toast-index')).toBe('0');

			// The close button also relies on the ID-based lookup.
			await click(closeButton());

			expect(byTestId('root')).toBe(null);
		});

		it('correctly calculates indices for multiple toasts with recreated objects', async () => {
			const { manager } = renderToasts({ copy: true });

			manager.add({ title: 'Toast 1' });
			manager.add({ title: 'Toast 2' });
			manager.add({ title: 'Toast 3' });
			await tick();

			const indices = roots().map((element) => css(element, '--toast-index'));
			expect(indices).toEqual(['0', '1', '2']);
		});
	});
});
