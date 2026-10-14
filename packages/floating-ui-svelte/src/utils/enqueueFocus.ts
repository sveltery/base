// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/utils/enqueueFocus.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { AnimationFrame, contains } from '@sveltery/utils';

// One focus is queued at a time across the page: a later request, sync or not, supersedes it.
let queued: { frame: AnimationFrame; element: HTMLElement | null } | null = null;

export function enqueueFocus(
	element: HTMLElement | null,
	options?: {
		preventScroll?: boolean;
		sync?: boolean;
		shouldFocus?: () => boolean;
	}
) {
	queued?.frame.cancel();
	queued = null;

	const exec = () => {
		if (options?.shouldFocus && !options.shouldFocus()) return;
		element?.focus({ preventScroll: options?.preventScroll });
	};

	if (options?.sync) {
		exec();
		return () => {};
	}

	// eslint-disable-next-line sveltery/no-unscoped-timer -- the returned cleanup or the next request cancels it
	const entry = { frame: new AnimationFrame(), element };
	queued = entry;
	entry.frame.request(() => {
		// The shared scheduler still runs a callback cancelled during its own frame's batch.
		// A native cancelAnimationFrame, as upstream uses, would skip it.
		if (queued !== entry) return;
		queued = null;
		exec();
	});
	return () => {
		if (queued !== entry) return;
		entry.frame.cancel();
		queued = null;
	};
}

export function focusQueuedWithin(container: Element | null) {
	return contains(container, queued?.element);
}
