// Derived from Base UI v1.8.0
// packages/react/src/tabs/root/stateAttributesMapping.ts,
// packages/react/src/tabs/panel/TabsPanelDataAttributes.ts and
// packages/react/src/tabs/indicator/TabsIndicatorCssVars.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { TabsActivationDirection, TabsOrientation } from './types.js';

export const activationDirectionAttribute = 'data-activation-direction';
export const orientationAttribute = 'data-orientation';

export const tabsStateAttributesMapping: StateAttributesMapping<{
	orientation: TabsOrientation;
	tabActivationDirection: TabsActivationDirection;
}> = {
	tabActivationDirection(direction) {
		return { [activationDirectionAttribute]: direction };
	}
};

/** Present when the tab panel begins animating in. */
export const startingStyle = 'data-starting-style';
/** Present when the tab panel is animating out. */
export const endingStyle = 'data-ending-style';

const STARTING_HOOK = { [startingStyle]: '' };
const ENDING_HOOK = { [endingStyle]: '' };

export const panelStateAttributesMapping: StateAttributesMapping<{
	orientation: TabsOrientation;
	tabActivationDirection: TabsActivationDirection;
	hidden: boolean;
	transitionStatus: 'starting' | 'ending' | 'idle' | undefined;
}> = {
	...tabsStateAttributesMapping,
	transitionStatus(value) {
		if (value === 'starting') return STARTING_HOOK;
		if (value === 'ending') return ENDING_HOOK;
		return null;
	}
};

export const indicatorStateAttributesMapping: StateAttributesMapping<{
	orientation: TabsOrientation;
	tabActivationDirection: TabsActivationDirection;
	activeTabPosition: unknown;
	activeTabSize: unknown;
}> = {
	...tabsStateAttributesMapping,
	activeTabPosition: () => null,
	activeTabSize: () => null
};

export const activeTabLeft = '--active-tab-left';
export const activeTabRight = '--active-tab-right';
export const activeTabTop = '--active-tab-top';
export const activeTabBottom = '--active-tab-bottom';
export const activeTabWidth = '--active-tab-width';
export const activeTabHeight = '--active-tab-height';
