// Derived from Base UI v1.8.0 packages/react/src/internals/useOpenChangeComplete.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

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
		const controller = new AbortController();
		// Upstream passes `open` into useAnimationsFinished as waitForStartingStyleRemoved
		// and `batch` through as the batch flag.
		runOnceAnimationsFinish(element, onComplete, controller.signal, batch, open === true);
		return () => controller.abort();
	});
}
