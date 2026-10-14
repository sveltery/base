import { userEvent } from 'vitest/browser';

/**
 * Moves the real pointer to the bottom-right pixel of the viewport, off the next test's elements.
 * A fixture fixed to the bottom-right corner is the exception and is hovered on mount.
 * `force` skips the actionability check that an unmounting overlay would fail, and `clientWidth`
 * survives a test that stubs `window.innerWidth`.
 */
export async function parkPointer() {
	const root = document.documentElement;
	await userEvent.hover(root, {
		position: { x: root.clientWidth - 1, y: root.clientHeight - 1 },
		force: true
	});
}
