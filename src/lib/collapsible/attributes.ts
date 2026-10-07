// Derived from Base UI v1.8.0
// packages/react/src/collapsible/root/stateAttributesMapping.ts,
// packages/react/src/utils/collapsibleOpenStateMapping.ts and
// packages/react/src/internals/stateAttributesMapping.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { CollapsibleRootState, TransitionStatus } from './types.js';

/** Present when the collapsible panel is open. */
export const open = 'data-open';
/** Present when the collapsible panel is closed. */
export const closed = 'data-closed';
/** Present when the collapsible panel is open, on the trigger. */
export const panelOpen = 'data-panel-open';
/** Present when the panel begins animating in. */
export const startingStyle = 'data-starting-style';
/** Present when the panel is animating out. */
export const endingStyle = 'data-ending-style';

const OPEN_HOOK = { [open]: '' };
const CLOSED_HOOK = { [closed]: '' };
const PANEL_OPEN_HOOK = { [panelOpen]: '' };
const STARTING_HOOK = { [startingStyle]: '' };
const ENDING_HOOK = { [endingStyle]: '' };

export const transitionStatusMapping: StateAttributesMapping<{
	transitionStatus: TransitionStatus;
}> = {
	transitionStatus(value) {
		if (value === 'starting') return STARTING_HOOK;
		if (value === 'ending') return ENDING_HOOK;
		return null;
	}
};

export const collapsibleOpenStateMapping: StateAttributesMapping<{ open: boolean }> = {
	open(value) {
		return value ? OPEN_HOOK : CLOSED_HOOK;
	}
};

export const triggerOpenStateMapping: StateAttributesMapping<{ open: boolean }> = {
	open(value) {
		if (value) return PANEL_OPEN_HOOK;
		return null;
	}
};

export const collapsibleStateAttributesMapping: StateAttributesMapping<CollapsibleRootState> = {
	...collapsibleOpenStateMapping,
	...transitionStatusMapping
};

export const triggerStateAttributesMapping: StateAttributesMapping<CollapsibleRootState> = {
	...triggerOpenStateMapping,
	...transitionStatusMapping
};
