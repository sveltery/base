// Derived from Base UI v1.8.0 packages/react/src/popover/**/*DataAttributes.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import { REASONS } from '../internal/event-details.js';
import {
	pressableTriggerOpenStateMapping,
	triggerOpenStateMapping
} from '../internal/popupStateMapping.js';

export const sideAttribute = 'data-side';
export const alignAttribute = 'data-align';
export const instantAttribute = 'data-instant';
export const uncenteredAttribute = 'data-uncentered';
export const disabledAttribute = 'data-disabled';
export const activationDirectionAttribute = 'data-activation-direction';
export const transitioningAttribute = 'data-transitioning';

export function triggerOpenAttributes(
	openedByThis: boolean,
	reason: string | null
): StateAttributesMapping<{ open: boolean }> {
	return {
		open(value: boolean) {
			if (value && openedByThis && reason === REASONS.triggerPress) {
				return pressableTriggerOpenStateMapping.open!(value);
			}
			return triggerOpenStateMapping.open!(openedByThis && value);
		}
	};
}
