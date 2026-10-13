// Derived from Base UI v1.9.0
// packages/react/src/tabs/root/stateAttributesMapping.ts,
// packages/react/src/tabs/panel/TabsPanelDataAttributes.ts and
// packages/react/src/tabs/indicator/TabsIndicatorCssVars.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import {
	transitionStatusMapping,
	type StateAttributesMapping
} from '../internal/state-attributes.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
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

export const panelStateAttributesMapping: StateAttributesMapping<{
	orientation: TabsOrientation;
	tabActivationDirection: TabsActivationDirection;
	hidden: boolean;
	transitionStatus: TransitionStatusValue;
}> = {
	...tabsStateAttributesMapping,
	...transitionStatusMapping
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
