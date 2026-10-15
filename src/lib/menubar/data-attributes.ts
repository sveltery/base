// Derived from Base UI v1.9.0 packages/react/src/menubar/index.ts and MenubarDataAttributes.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export const MenubarDataAttributes = {
	/** Present when the corresponding menubar is modal. */
	modal: 'data-modal',
	/** Determines the orientation of the menubar. */
	orientation: 'data-orientation',
	/** Present when any submenu within the menubar is open. */
	hasSubmenuOpen: 'data-has-submenu-open'
} as const;
