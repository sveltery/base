// Derived from Base UI v1.8.0 packages/react/src/dialog/utils/stateAttributesMapping.ts
// and the dialog `*DataAttributes.ts` files
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import { popupStateMapping, popupTransitionStateMapping } from '../internal/popupStateMapping.js';
import type { PopupTransitionStatus } from '../internal/useTransitionStatus.svelte.js';

/** How many dialogs are nested within this one. */
export const nestedDialogsVar = '--nested-dialogs';

export const dialogStateAttributesMapping: StateAttributesMapping<{
	open: boolean;
	transitionStatus: PopupTransitionStatus;
	nested: boolean;
	nestedDialogOpen: boolean;
}> = {
	open: popupStateMapping.open,
	transitionStatus: popupTransitionStateMapping.transitionStatus,
	nestedDialogOpen(value) {
		return value ? { 'data-nested-dialog-open': '' } : null;
	}
};

export const dialogTransitionAttributesMapping: StateAttributesMapping<{
	open: boolean;
	transitionStatus: PopupTransitionStatus;
}> = {
	open: popupStateMapping.open,
	transitionStatus: popupTransitionStateMapping.transitionStatus
};

/** Arrow and Home/End keys stay inside the dialog instead of reaching a parent composite. */
export const COMPOSITE_KEYS = new Set([
	'ArrowUp',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'Home',
	'End'
]);
