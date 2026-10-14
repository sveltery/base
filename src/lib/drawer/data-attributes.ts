// Derived from Base UI v1.9.0 packages/react/src/drawer/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export { DrawerBackdropCssVars as DrawerBackdropCssVariables } from './attributes.js';

export const DrawerBackdropDataAttributes = {
	/** Present when the drawer is open. */
	open: 'data-open',
	/** Present when the drawer is closed. */
	closed: 'data-closed',
	/** Present when the drawer begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the drawer is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export { DrawerPopupCssVars as DrawerPopupCssVariables } from './attributes.js';

export { DrawerPopupDataAttributes } from './attributes.js';

export { DrawerSwipeAreaDataAttributes } from './attributes.js';

export { DrawerViewportCssVars as DrawerViewportCssVariables } from './attributes.js';

export const DrawerViewportDataAttributes = {
	/** Present when the drawer is open. */
	open: 'data-open',
	/** Present when the drawer is closed. */
	closed: 'data-closed',
	/** Present when the drawer begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the drawer is animating out. */
	endingStyle: 'data-ending-style',
	/** Present when the drawer is nested within another drawer. */
	nested: 'data-nested'
} as const;

export { DialogTriggerDataAttributes as DrawerTriggerDataAttributes } from '../dialog/data-attributes.js';

export { DialogCloseDataAttributes as DrawerCloseDataAttributes } from '../dialog/data-attributes.js';
