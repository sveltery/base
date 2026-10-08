// Derived from Base UI v1.8.0 packages/react/src/utils/popupStateMapping.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from './state-attributes.js';
import * as CommonPopupDataAttributes from './CommonPopupDataAttributes.js';
import * as CommonTriggerDataAttributes from './CommonTriggerDataAttributes.js';
import type { PopupTransitionStatus } from './useTransitionStatus.svelte.js';

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
	transitionStatus: PopupTransitionStatus;
}> = {
	open: popupStateMapping.open,
	anchorHidden: popupStateMapping.anchorHidden,
	transitionStatus(value: PopupTransitionStatus): Record<string, string> | null {
		if (value === 'starting') return { [CommonPopupDataAttributes.startingStyle]: '' };
		if (value === 'ending') return { [CommonPopupDataAttributes.endingStyle]: '' };
		return null;
	}
};
