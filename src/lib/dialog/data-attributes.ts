// Derived from Base UI v1.9.0 packages/react/src/dialog/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import * as attributes from './attributes.js';

export const DialogBackdropDataAttributes = {
	/** Present when the dialog is open. */
	open: 'data-open',
	/** Present when the dialog is closed. */
	closed: 'data-closed',
	/** Present when the dialog begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the dialog is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const DialogCloseDataAttributes = {
	/** Present when the button is disabled. */
	disabled: 'data-disabled'
} as const;

export const DialogPopupCssVariables = {
	/** Indicates how many dialogs are nested within. */
	nestedDialogs: attributes.nestedDialogsVar
} as const;

export const DialogPopupDataAttributes = {
	/** Present when the dialog is open. */
	open: 'data-open',
	/** Present when the dialog is closed. */
	closed: 'data-closed',
	/** Present when the dialog begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the dialog is animating out. */
	endingStyle: 'data-ending-style',
	/** Present when the dialog is nested within another dialog. */
	nested: 'data-nested',
	/** Present when the dialog has other open dialogs nested within it. */
	nestedDialogOpen: 'data-nested-dialog-open'
} as const;

export const DialogViewportDataAttributes = {
	/** Present when the dialog is open. */
	open: 'data-open',
	/** Present when the dialog is closed. */
	closed: 'data-closed',
	/** Present when the dialog begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the dialog is animating out. */
	endingStyle: 'data-ending-style',
	/** Present when the dialog is nested within another dialog. */
	nested: 'data-nested',
	/** Present when the dialog has other open dialogs nested within it. */
	nestedDialogOpen: 'data-nested-dialog-open'
} as const;

export const DialogTriggerDataAttributes = {
	/** Present when the trigger is disabled. */
	disabled: 'data-disabled',
	/** Present when the corresponding dialog is open. */
	popupOpen: 'data-popup-open'
} as const;
