// Derived from Base UI v1.8.0 packages/react/src/checkbox/indicator/CheckboxIndicator.tsx,
// packages/react/src/radio/indicator/RadioIndicator.tsx, and
// packages/utils/src/useAnimationFrame.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { useAnimationFrame } from './timeout.svelte.js';

/**
 * Clears a status on the next frame while `rendered` is true.
 * Checkbox and Radio indicators share this frame setup.
 */
export function clearStatusOnAnimationFrame(rendered: () => boolean, clear: () => void) {
	const settleFrame = useAnimationFrame();
	$effect(() => {
		if (!rendered()) return;
		settleFrame.request(() => {
			clear();
		});
		return () => settleFrame.cancel();
	});
}
