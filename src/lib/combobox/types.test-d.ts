// Type tests, checked by `pnpm check`. Nothing here runs.
// The event types follow Base UI v1.9.0 packages/react/src/internals/createBaseUIEventDetails.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { expectTypeOf } from 'vitest';
import type { ComboboxChangeEventDetails, ComboboxHighlightEventDetails } from './types.js';

export function onValueChange(details: ComboboxChangeEventDetails) {
	if (details.reason === 'item-press') {
		expectTypeOf(details.event).toEqualTypeOf<MouseEvent | KeyboardEvent | PointerEvent>();
	} else if (details.reason === 'list-navigation') {
		expectTypeOf(details.event).toEqualTypeOf<KeyboardEvent>();
	} else if (details.reason === 'chip-remove-press') {
		expectTypeOf(details.event).toEqualTypeOf<PointerEvent | MouseEvent | KeyboardEvent>();
	} else if (details.reason === 'cancel-open') {
		expectTypeOf(details.event).toEqualTypeOf<MouseEvent>();
	}
}

export function onItemHighlighted(details: ComboboxHighlightEventDetails) {
	if (details.reason === 'keyboard') {
		expectTypeOf(details.event).toEqualTypeOf<KeyboardEvent>();
	} else if (details.reason === 'pointer') {
		expectTypeOf(details.event).toEqualTypeOf<MouseEvent | PointerEvent>();
	} else {
		expectTypeOf(details.event).toEqualTypeOf<Event>();
	}
}
