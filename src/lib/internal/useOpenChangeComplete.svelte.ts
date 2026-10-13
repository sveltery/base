// Derived from Base UI v1.9.0 packages/react/src/internals/useOpenChangeComplete.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { getAbortSignal, untrack } from 'svelte';
import { runOnceAnimationsFinish } from './animations-finished.js';

export function useOpenChangeComplete(
	parameters: () => {
		enabled?: boolean;
		open?: boolean;
		element: HTMLElement | null;
		onComplete: () => void;
		/** Group completions that become ready in the same turn. Default false. */
		batch?: boolean;
	}
) {
	$effect(() => {
		const { enabled = true, open, element, onComplete, batch = false } = parameters();
		if (!enabled || !element) return;
		// Upstream passes `open` into useAnimationsFinished as waitForStartingStyleRemoved.
		runOnceAnimationsFinish(
			element,
			() => untrack(onComplete),
			getAbortSignal(),
			batch,
			open === true
		);
	});
}
