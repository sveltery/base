import { userEvent } from 'vitest/browser';

/**
 * Moves the real pointer to the bottom-right corner of the viewport, where no test renders.
 * The pointer stays where the last test in the tab left it, whatever its spec file, and Chrome
 * sends hover events to whatever renders under it, so `setup.ts` parks it before every test.
 * The root element keeps the locator stable while an earlier test's overlay still unmounts, and
 * `force` skips the actionability check that such an overlay would fail. `clientWidth` survives
 * a test that stubs `window.innerWidth`.
 */
export async function parkPointer() {
	const root = document.documentElement;
	await userEvent.hover(root, {
		position: { x: root.clientWidth - 1, y: root.clientHeight - 1 },
		force: true
	});
}
