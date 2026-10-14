// Derived from Base UI v1.9.0 packages/react/src/combobox/utils/parts.ts and
// utils/stateAttributesMapping.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import { fieldValidityMapping } from '../field/attributes.js';
import { pressableTriggerOpenStateMapping } from '../internal/popupStateMapping.js';
import type { Side } from '../internal/popups/index.js';
import type { StateAttributesMapping } from '../internal/state-attributes.js';

/** The arrow keys that move the chip highlight backwards and forwards, in that order. */
export function getChipNavigationKeys(direction: 'ltr' | 'rtl') {
	return direction === 'rtl'
		? (['ArrowRight', 'ArrowLeft'] as const)
		: (['ArrowLeft', 'ArrowRight'] as const);
}

/** Where focus lands once the chip at `index` is removed, or `undefined` for the input. */
export function getIndexAfterChipRemoval(index: number, chipCount: number) {
	const nextIndex = index >= chipCount - 1 ? chipCount - 2 : index;
	return nextIndex >= 0 ? nextIndex : undefined;
}

/**
 * Whether an input event is typing: a composition commit, or an edit with an `inputType`.
 * Autofill may omit `inputType` or report `insertReplacementText`.
 */
export function isTypedInput(event: Event) {
	if (event.type === 'compositionend') return true;
	const inputType = (event as InputEvent).inputType;
	return inputType != null && inputType !== '' && inputType !== 'insertReplacementText';
}

interface ControlState {
	open: boolean;
	valid: boolean | null;
	popupSide: Side | null;
	listEmpty: boolean;
	placeholder?: boolean;
}

export const triggerStateAttributesMapping: StateAttributesMapping<ControlState> = {
	...(pressableTriggerOpenStateMapping as StateAttributesMapping<ControlState>),
	...(fieldValidityMapping as StateAttributesMapping<ControlState>),
	popupSide: (side) => (side ? { 'data-popup-side': side } : null),
	listEmpty: (empty) => (empty ? { 'data-list-empty': '' } : null)
};
