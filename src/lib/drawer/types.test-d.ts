// Type tests, checked by `pnpm check`. Nothing here runs.
// The event types follow Base UI v1.9.0 packages/react/src/internals/createBaseUIEventDetails.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { expectTypeOf } from 'vitest';
import type { DrawerChangeEventDetails, DrawerSnapPointChangeEventDetails } from './types.js';

export function onOpenChange(details: DrawerChangeEventDetails) {
	if (details.reason === 'swipe') {
		expectTypeOf(details.event).toEqualTypeOf<PointerEvent | TouchEvent>();
	} else if (details.reason === 'escape-key') {
		expectTypeOf(details.event).toEqualTypeOf<KeyboardEvent>();
	} else if (details.reason === 'outside-press') {
		expectTypeOf(details.event).toEqualTypeOf<MouseEvent | PointerEvent | TouchEvent>();
	} else if (details.reason === 'close-watcher') {
		expectTypeOf(details.event).toEqualTypeOf<Event>();
	}
}

export function onSnapPointChange(details: DrawerSnapPointChangeEventDetails) {
	if (details.reason === 'swipe') {
		expectTypeOf(details.event).toEqualTypeOf<PointerEvent | TouchEvent>();
	} else if (details.reason === 'focus-out') {
		expectTypeOf(details.event).toEqualTypeOf<FocusEvent | KeyboardEvent>();
	}
}
