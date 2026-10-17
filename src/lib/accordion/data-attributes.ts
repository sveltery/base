// Derived from Base UI v1.9.0 packages/react/src/accordion/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import * as attributes from './attributes.js';

export const AccordionRootDataAttributes = {
	/** Present when the accordion is disabled. */
	disabled: 'data-disabled',
	/** Indicates the orientation of the accordion. */
	orientation: 'data-orientation'
} as const;

export const AccordionItemDataAttributes = {
	/**
	 * Indicates the index of the accordion item.
	 * @type {number}
	 */
	index: attributes.index,
	/** Present when the accordion item is disabled. */
	disabled: 'data-disabled',
	/** Present when the accordion item is open. */
	open: 'data-open'
} as const;

export const AccordionHeaderDataAttributes = {
	/**
	 * Indicates the index of the accordion item.
	 * @type {number}
	 */
	index: attributes.index,
	/** Present when the accordion item is disabled. */
	disabled: 'data-disabled',
	/** Present when the accordion item is open. */
	open: 'data-open'
} as const;

export const AccordionTriggerDataAttributes = {
	/**
	 * Indicates the index of the accordion item.
	 * @type {number}
	 */
	index: attributes.index,
	/** Present when the accordion panel is open. */
	panelOpen: 'data-panel-open',
	/** Present when the accordion item is disabled. */
	disabled: 'data-disabled'
} as const;

export const AccordionPanelCssVariables = {
	/**
	 * The accordion panel's height.
	 * @type {number}
	 */
	accordionPanelHeight: '--accordion-panel-height',
	/**
	 * The accordion panel's width.
	 * @type {number}
	 */
	accordionPanelWidth: '--accordion-panel-width'
} as const;

export const AccordionPanelDataAttributes = {
	/**
	 * Indicates the index of the accordion item.
	 * @type {number}
	 */
	index: attributes.index,
	/** Present when the accordion panel is open. */
	open: 'data-open',
	/** Indicates the orientation of the accordion. */
	orientation: 'data-orientation',
	/** Present when the accordion item is disabled. */
	disabled: 'data-disabled',
	/** Present when the panel begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the panel is animating out. */
	endingStyle: 'data-ending-style'
} as const;
