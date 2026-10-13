// Derived from Base UI v1.9.0 packages/react/src/dialog/utils/stateAttributesMapping.ts
// and the dialog `*DataAttributes.ts` files
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import { popupStateMapping, popupTransitionStateMapping } from '../internal/popupStateMapping.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';

/** How many dialogs are nested within this one. */
export const nestedDialogsVar = '--nested-dialogs';

export const dialogStateAttributesMapping: StateAttributesMapping<{
	open: boolean;
	transitionStatus: TransitionStatusValue;
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
	transitionStatus: TransitionStatusValue;
}> = {
	open: popupStateMapping.open,
	transitionStatus: popupTransitionStateMapping.transitionStatus
};
