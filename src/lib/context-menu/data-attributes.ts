// Derived from Base UI v1.9.0 packages/react/src/context-menu/index.ts and the *DataAttributes.ts
// and *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const ContextMenuTriggerDataAttributes = {
	/** Present when the corresponding context menu is open. */
	popupOpen: 'data-popup-open',
	/** Present when the corresponding context menu is open. */
	pressed: 'data-pressed'
} as const;

export {
	MenuArrowDataAttributes as ContextMenuArrowDataAttributes,
	MenuBackdropDataAttributes as ContextMenuBackdropDataAttributes,
	MenuCheckboxItemDataAttributes as ContextMenuCheckboxItemDataAttributes,
	MenuCheckboxItemIndicatorDataAttributes as ContextMenuCheckboxItemIndicatorDataAttributes,
	MenuItemDataAttributes as ContextMenuItemDataAttributes,
	MenuLinkItemDataAttributes as ContextMenuLinkItemDataAttributes,
	MenuPopupDataAttributes as ContextMenuPopupDataAttributes,
	MenuPositionerCssVariables as ContextMenuPositionerCssVariables,
	MenuPositionerDataAttributes as ContextMenuPositionerDataAttributes,
	MenuRadioItemDataAttributes as ContextMenuRadioItemDataAttributes,
	MenuRadioItemIndicatorDataAttributes as ContextMenuRadioItemIndicatorDataAttributes,
	MenuSeparatorDataAttributes as ContextMenuSeparatorDataAttributes,
	MenuSubmenuTriggerDataAttributes as ContextMenuSubmenuTriggerDataAttributes
} from '../menu/data-attributes.js';
