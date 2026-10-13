// Derived from Base UI v1.9.0 packages/react/src/utils/popupStateMapping.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { transitionStatusMapping, type StateAttributesMapping } from './state-attributes.js';
import * as CommonPopupDataAttributes from './CommonPopupDataAttributes.js';
import * as CommonTriggerDataAttributes from './CommonTriggerDataAttributes.js';
import type { TransitionStatusValue } from './useTransitionStatus.svelte.js';

export { CommonPopupDataAttributes, CommonTriggerDataAttributes };

export const triggerOpenStateMapping: StateAttributesMapping<{ open: boolean }> = {
	open(value: boolean): Record<string, string> | null {
		if (value) return { [CommonTriggerDataAttributes.popupOpen]: '' };
		return null;
	}
};

export const pressableTriggerOpenStateMapping: StateAttributesMapping<{ open: boolean }> = {
	open(value: boolean): Record<string, string> | null {
		if (value) {
			return {
				[CommonTriggerDataAttributes.popupOpen]: '',
				[CommonTriggerDataAttributes.pressed]: ''
			};
		}
		return null;
	}
};

export const popupStateMapping: StateAttributesMapping<{ open: boolean; anchorHidden: boolean }> = {
	open(value: boolean): Record<string, string> | null {
		if (value) return { [CommonPopupDataAttributes.open]: '' };
		return { [CommonPopupDataAttributes.closed]: '' };
	},
	anchorHidden(value: boolean): Record<string, string> | null {
		if (value) return { [CommonPopupDataAttributes.anchorHidden]: '' };
		return null;
	}
};

export const popupTransitionStateMapping: StateAttributesMapping<{
	open: boolean;
	anchorHidden: boolean;
	transitionStatus: TransitionStatusValue;
}> = {
	open: popupStateMapping.open,
	anchorHidden: popupStateMapping.anchorHidden,
	transitionStatus: transitionStatusMapping.transitionStatus
};
