// Shared setup for the Toast specs. Upstream runs these cases in JSDOM with animations
// disabled and a fake clock, so a closed toast unmounts as soon as its effects run.
import { tick, type ComponentProps } from 'svelte';
import { afterEach, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { GetToastManagerReturnValue } from '#lib';
import ToastHarness from './ToastHarness.svelte';

type AnimationsFlag = { BASE_UI_ANIMATIONS_DISABLED?: boolean };

/** Disables exit animations for every test in the calling suite. */
export function disableAnimations() {
	let previous: boolean | undefined;
	beforeEach(() => {
		previous = (globalThis as AnimationsFlag).BASE_UI_ANIMATIONS_DISABLED;
		(globalThis as AnimationsFlag).BASE_UI_ANIMATIONS_DISABLED = true;
	});
	afterEach(() => {
		(globalThis as AnimationsFlag).BASE_UI_ANIMATIONS_DISABLED = previous;
	});
}

/** Runs the animation-dependent body with real exit animations. */
export async function withAnimations(body: () => Promise<void>) {
	const flag = globalThis as AnimationsFlag;
	const previous = flag.BASE_UI_ANIMATIONS_DISABLED;
	flag.BASE_UI_ANIMATIONS_DISABLED = false;
	try {
		await body();
	} finally {
		flag.BASE_UI_ANIMATIONS_DISABLED = previous;
	}
}

/**
 * Fakes the clock for every test in the calling suite. Animation frames stay real so the
 * browser keeps painting; with animations disabled no toast waits for one.
 */
export function useFakeClock() {
	beforeEach(() => {
		vi.useFakeTimers({
			toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']
		});
	});
	afterEach(() => {
		vi.useRealTimers();
	});
}

/** Advances the fake clock, then lets Svelte apply what the timers changed. */
export async function advance(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);
	await tick();
}

export function byTestId(testId: string, root: ParentNode = document) {
	return root.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
}

export function allByTestId(testId: string, root: ParentNode = document) {
	return [...root.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`)];
}

export function textOf(testId: string, root: ParentNode = document) {
	return byTestId(testId, root)?.textContent ?? null;
}

/** The close button of a toast. It is `aria-hidden` until the viewport expands. */
export function closeButton(root: ParentNode = document) {
	const button = root.querySelector<HTMLElement>('[aria-label="close-press"]');
	if (!button) throw new Error('No close button rendered');
	return button;
}

export function button(name: string, root: ParentNode = document) {
	const match = [...root.querySelectorAll<HTMLElement>('button')].find(
		(element) => element.textContent?.trim() === name
	);
	if (!match) throw new Error(`No button named "${name}"`);
	return match;
}

/** Clicks with a synthetic event, as upstream's `fireEvent.click`, and flushes Svelte. */
export async function click(element: HTMLElement) {
	element.click();
	await tick();
}

/** Renders ToastHarness and returns the manager its list renders from. */
export function renderToasts(props: Omit<ComponentProps<typeof ToastHarness>, 'onManager'> = {}) {
	let manager: GetToastManagerReturnValue | undefined;
	const view = render(ToastHarness, {
		...props,
		onManager(value) {
			manager = value;
		}
	});
	if (!manager) throw new Error('ToastHarness did not hand over its manager');
	return { manager, view };
}

export function css(element: HTMLElement, property: string) {
	return element.style.getPropertyValue(property);
}

/** Synthetic pointer ids have no active pointer to capture, so capture is a no-op. */
export function stubPointerCapture(element: HTMLElement) {
	Object.defineProperty(element, 'setPointerCapture', { value: () => {}, configurable: true });
	Object.defineProperty(element, 'releasePointerCapture', { value: () => {}, configurable: true });
}

/** An exit animation that never finishes, so a closed toast stays mounted while ending. */
export function holdExit(element: HTMLElement) {
	Object.defineProperty(element, 'getAnimations', {
		value: () => [{ finished: new Promise(() => {}) }],
		configurable: true
	});
}

/** `mouseenter` and `mouseleave` do not bubble, so these target the viewport itself. */
export function mouseEnter(element: HTMLElement) {
	element.dispatchEvent(new MouseEvent('mouseenter'));
}

export function mouseLeave(element: HTMLElement) {
	element.dispatchEvent(new MouseEvent('mouseleave'));
}
