// Derived from Base UI v1.8.0 packages/react/src/internals/direction-context/DirectionContext.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import type { DirectionReading, TextDirection } from '../direction-provider/types.js';
import { defineOptionalContext } from './context.js';

const [readDirection, provideDirection] = defineOptionalContext<DirectionReading>({
	direction: 'ltr'
});

/** Descendants read `.direction`, so the provider prop stays the source of truth. */
export function setDirectionContext(read: () => TextDirection) {
	provideDirection({
		get direction() {
			return read();
		}
	});
}

/**
 * Nearest provider direction, or `ltr` when none is mounted.
 * Call during component init. Read `.direction` in the template, in `$derived`, or in an event handler.
 */
export function useDirection(): DirectionReading {
	return readDirection();
}
