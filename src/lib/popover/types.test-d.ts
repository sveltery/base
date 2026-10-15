// Type tests, checked by `pnpm check`. Nothing here runs.
// The event types follow Base UI v1.9.0 packages/react/src/internals/createBaseUIEventDetails.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { expectTypeOf } from 'vitest';
import type { PopoverChangeEventDetails } from './types.js';

export function onOpenChange(details: PopoverChangeEventDetails) {
	if (details.reason === 'trigger-hover') {
		expectTypeOf(details.event).toEqualTypeOf<MouseEvent>();
	} else if (details.reason === 'trigger-focus') {
		expectTypeOf(details.event).toEqualTypeOf<FocusEvent>();
	} else if (details.reason === 'trigger-press') {
		expectTypeOf(details.event).toEqualTypeOf<
			MouseEvent | PointerEvent | TouchEvent | KeyboardEvent
		>();
	} else if (details.reason === 'close-press') {
		expectTypeOf(details.event).toEqualTypeOf<MouseEvent | KeyboardEvent | PointerEvent>();
	} else if (details.reason === 'imperative-action') {
		expectTypeOf(details.event).toEqualTypeOf<Event>();
	}
}
