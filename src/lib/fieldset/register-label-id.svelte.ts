// Derived from Base UI v1.8.0 packages/react/src/utils/useRegisteredLabelId.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import type { LegendIdUpdate } from './context.svelte.js';

/**
 * Publishes the legend id after render, matching upstream's layout effect:
 * server HTML keeps the id on the legend and omits `aria-labelledby` until
 * this runs. Cleanup clears the id only when it is still the one we published.
 */
export function registerLabelId(
	getId: () => string | undefined,
	setLabelId: (next: LegendIdUpdate) => void
) {
	$effect(() => {
		const id = getId();
		setLabelId(id);
		return () => {
			setLabelId((current) => (current === id ? undefined : current));
		};
	});
}
