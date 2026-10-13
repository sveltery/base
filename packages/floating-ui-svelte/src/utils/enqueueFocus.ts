// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/utils/enqueueFocus.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { AnimationFrame } from '@sveltery/utils';

// One focus is queued at a time across the page: a later request, sync or not, supersedes it.
let queued: AnimationFrame | null = null;

export function enqueueFocus(
	element: HTMLElement,
	options?: { preventScroll?: boolean; sync?: boolean; shouldFocus?: () => boolean }
) {
	queued?.cancel();
	queued = null;

	const exec = () => {
		if (options?.shouldFocus && !options.shouldFocus()) return;
		element.focus({ preventScroll: options?.preventScroll });
	};

	if (options?.sync) {
		exec();
		return () => {};
	}

	// eslint-disable-next-line sveltery/no-unscoped-timer -- the returned cleanup or the next request cancels it
	const frame = new AnimationFrame();
	queued = frame;
	frame.request(exec);
	return () => {
		if (queued !== frame) return;
		frame.cancel();
		queued = null;
	};
}
