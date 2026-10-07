// Derived from Base UI v1.8.0 packages/react/src/internals/direction-context/DirectionContext.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import type { DirectionReading, TextDirection } from '../direction-provider/types.js';
import { createGetterContext } from './getter-context.js';

const LTR: DirectionReading = {
	get direction(): TextDirection {
		return 'ltr';
	}
};

/**
 * Holds the provider's direction getter.
 * Descendants read `.direction` so the prop stays the source of truth.
 */
export class DirectionContextValue implements DirectionReading {
	constructor(private readonly readDirection: () => TextDirection) {}

	get direction(): TextDirection {
		return this.readDirection();
	}
}

const directionContext = createGetterContext<DirectionReading>(LTR);

export function setDirectionContext(readDirection: () => TextDirection) {
	directionContext.provide(new DirectionContextValue(readDirection));
}

/**
 * Nearest provider direction, or `ltr` when none is mounted.
 * Call during component init. Read `.direction` in the template, in `$derived`, or in an event handler.
 */
export function useDirection(): DirectionReading {
	return directionContext.read();
}
