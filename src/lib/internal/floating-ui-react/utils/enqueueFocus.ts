// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/enqueueFocus.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { useAnimationFrame } from '../../timeout.svelte.js';

export function enqueueFocus(
	element: HTMLElement,
	options?: { preventScroll?: boolean; shouldFocus?: () => boolean }
) {
	const frame = useAnimationFrame();
	frame.request(() => {
		if (options?.shouldFocus && !options.shouldFocus()) return;
		element.focus({ preventScroll: options?.preventScroll });
	});
	return () => frame.cancel();
}
