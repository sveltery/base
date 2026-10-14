// Derived from Base UI v1.9.0 packages/react/src/tabs/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import * as attributes from './attributes.js';

export const TabsRootDataAttributes = {
	/** Indicates the direction of the activation (based on the previous active tab). */
	activationDirection: attributes.activationDirectionAttribute,
	/** Indicates the orientation of the tabs. */
	orientation: attributes.orientationAttribute
} as const;

export const TabsTabDataAttributes = {
	/** Indicates the direction of the activation (based on the previous active tab). */
	activationDirection: attributes.activationDirectionAttribute,
	/** Indicates the orientation of the tabs. */
	orientation: attributes.orientationAttribute,
	/** Present when the tab is disabled. */
	disabled: 'data-disabled',
	/** Present when the tab is active. */
	active: 'data-active'
} as const;

export const TabsIndicatorCssVariables = {
	/** Indicates the distance on the left side from the parent's container if the tab is active. */
	activeTabLeft: attributes.activeTabLeft,
	/** Indicates the distance on the right side from the parent's container if the tab is active. */
	activeTabRight: attributes.activeTabRight,
	/** Indicates the distance on the top side from the parent's container if the tab is active. */
	activeTabTop: attributes.activeTabTop,
	/** Indicates the distance on the bottom side from the parent's container if the tab is active. */
	activeTabBottom: attributes.activeTabBottom,
	/** Indicates the width of the tab if it is active. */
	activeTabWidth: attributes.activeTabWidth,
	/** Indicates the height of the tab if it is active. */
	activeTabHeight: attributes.activeTabHeight
} as const;

export const TabsIndicatorDataAttributes = {
	/** Indicates the direction of the activation (based on the previous active tab). */
	activationDirection: attributes.activationDirectionAttribute,
	/** Indicates the orientation of the tabs. */
	orientation: attributes.orientationAttribute
} as const;

export const TabsPanelDataAttributes = {
	/** Indicates the index of the tab panel. */
	index: 'data-index',
	/** Indicates the direction of the activation (based on the previous active tab). */
	activationDirection: attributes.activationDirectionAttribute,
	/** Indicates the orientation of the tabs. */
	orientation: attributes.orientationAttribute,
	/** Present when the panel is hidden. */
	hidden: 'data-hidden',
	/** Present when the panel begins animating in. */
	startingStyle: attributes.startingStyle,
	/** Present when the panel is animating out. */
	endingStyle: attributes.endingStyle
} as const;

export const TabsListDataAttributes = {
	/** Indicates the direction of the activation (based on the previous active tab). */
	activationDirection: attributes.activationDirectionAttribute,
	/** Indicates the orientation of the tabs. */
	orientation: attributes.orientationAttribute
} as const;
