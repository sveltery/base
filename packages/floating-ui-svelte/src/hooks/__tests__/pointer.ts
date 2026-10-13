import { userEvent } from 'vitest/browser';

/**
 * Moves the real pointer to the bottom-right corner of the viewport. Chrome re-sends mouse
 * events to whatever renders under a resting pointer, so a pointer left on or near the
 * centre would hover a later test's trigger. `unhover` parks it on the body's centre.
 */
export async function parkPointer() {
	await userEvent.hover(document.documentElement, {
		position: { x: window.innerWidth - 1, y: window.innerHeight - 1 },
		force: true
	});
}
