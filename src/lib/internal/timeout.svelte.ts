// Derived from Base UI v1.8.0 packages/utils/src/useTimeout.ts (`useTimeout`) and
// packages/utils/src/useAnimationFrame.ts (`useAnimationFrame`)
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream disposes the timer with `useOnMount`. This registers the same cleanup
// with `$effect` when the factory runs during component init. There is no ref.

import { AnimationFrame, Interval, Timeout } from './timeout.js';

function createdOutsideInit(error: unknown) {
	if (!(error instanceof Error)) return false;
	return (
		error.message.includes('effect_orphan') ||
		error.message.includes('lifecycle_outside_component') ||
		error.message.includes('effect_in_unowned_derived')
	);
}

/** `$effect` cleanup when this runs during init. A module-level owner keeps `clear` itself. */
function registerScope(clear: () => void) {
	try {
		$effect(() => () => {
			clear();
		});
	} catch (error) {
		if (!createdOutsideInit(error)) throw error;
	}
}

export function useTimeout() {
	const timeout = new Timeout();
	registerScope(timeout.clear);
	return timeout;
}

export function useAnimationFrame() {
	const frame = new AnimationFrame();
	registerScope(() => frame.cancel());
	return frame;
}

export function useInterval() {
	const interval = new Interval();
	registerScope(interval.clear);
	return interval;
}
