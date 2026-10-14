// Derived from Base UI v1.9.0 packages/react/src/alert-dialog/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export { DialogBackdropDataAttributes as AlertDialogBackdropDataAttributes } from '../dialog/data-attributes.js';

export { DialogCloseDataAttributes as AlertDialogCloseDataAttributes } from '../dialog/data-attributes.js';

export { DialogPopupCssVariables as AlertDialogPopupCssVariables } from '../dialog/data-attributes.js';

export { DialogPopupDataAttributes as AlertDialogPopupDataAttributes } from '../dialog/data-attributes.js';

export const AlertDialogTriggerDataAttributes = {
	/** Present when the trigger is disabled. */
	disabled: 'data-disabled',
	/** Present when the corresponding alert dialog is open. */
	popupOpen: 'data-popup-open'
} as const;

export { DialogViewportDataAttributes as AlertDialogViewportDataAttributes } from '../dialog/data-attributes.js';
