// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/enqueueFocus.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). The `sync` option follows v1.9.0
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { AnimationFrame } from '@sveltery/utils';

export function enqueueFocus(
	element: HTMLElement,
	options?: { preventScroll?: boolean; sync?: boolean; shouldFocus?: () => boolean }
) {
	if (options?.sync) {
		if (!options.shouldFocus || options.shouldFocus()) {
			element.focus({ preventScroll: options.preventScroll });
		}
		return () => {};
	}
	// eslint-disable-next-line sveltery/no-unscoped-timer -- the returned cleanup cancels it
	const frame = new AnimationFrame();
	frame.request(() => {
		if (options?.shouldFocus && !options.shouldFocus()) return;
		element.focus({ preventScroll: options?.preventScroll });
	});
	return () => frame.cancel();
}
