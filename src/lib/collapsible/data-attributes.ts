// Derived from Base UI v1.9.0 packages/react/src/collapsible/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import * as attributes from './attributes.js';

export const CollapsibleRootDataAttributes = {
	/** Present when the collapsible is open. */
	open: attributes.open,
	/** Present when the collapsible is closed. */
	closed: attributes.closed,
	/** Present when the collapsible begins animating in. */
	startingStyle: attributes.startingStyle,
	/** Present when the collapsible is animating out. */
	endingStyle: attributes.endingStyle
} as const;

export const CollapsibleTriggerDataAttributes = {
	/** Present when the collapsible panel is open. */
	panelOpen: attributes.panelOpen
} as const;

export const CollapsiblePanelCssVariables = {
	/** The collapsible panel's height. */
	collapsiblePanelHeight: '--collapsible-panel-height',
	/** The collapsible panel's width. */
	collapsiblePanelWidth: '--collapsible-panel-width'
} as const;

export const CollapsiblePanelDataAttributes = {
	/** Present when the collapsible panel is open. */
	open: attributes.open,
	/** Present when the collapsible panel is closed. */
	closed: attributes.closed,
	/** Present when the panel begins animating in. */
	startingStyle: attributes.startingStyle,
	/** Present when the panel is animating out. */
	endingStyle: attributes.endingStyle
} as const;
