// Activation direction from Base UI v1.8.0 TabsRoot.computeActivationDirection
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { TabsActivationDirection, TabsOrientation } from './types.js';

/**
 * `left`/`right` follow horizontal layout. `up`/`down` follow vertical layout.
 * Equal positions, or a null selection, are `none`.
 * When a tab element is not mounted yet, comparable number or string values decide.
 */
export function activationDirection(
	oldValue: unknown,
	newValue: unknown,
	orientation: TabsOrientation,
	oldPosition: number | null,
	newPosition: number | null
): TabsActivationDirection {
	if (oldValue == null || newValue == null) return 'none';

	const [backward, forward] =
		orientation === 'horizontal' ? (['left', 'right'] as const) : (['up', 'down'] as const);

	const oldMissing = oldPosition == null;
	const newMissing = newPosition == null;
	if (oldMissing || newMissing) {
		// One tab is not mounted yet. Comparable values still imply a direction.
		// Both missing is `none`: the two absences are not an ordering.
		if (
			oldMissing !== newMissing &&
			(typeof oldValue === 'number' || typeof oldValue === 'string') &&
			typeof oldValue === typeof newValue
		) {
			return (newValue as number | string) > (oldValue as number | string) ? forward : backward;
		}
		return 'none';
	}

	if (newPosition < oldPosition) return backward;
	if (newPosition > oldPosition) return forward;
	return 'none';
}
