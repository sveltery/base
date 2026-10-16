// Derived from Base UI v1.9.0 packages/react/src/toolbar/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const ToolbarSeparatorDataAttributes = {
	/**
	 * Indicates the orientation of the separator, which is perpendicular to the toolbar.
	 * @type {'horizontal' | 'vertical'}
	 */
	orientation: 'data-orientation'
} as const;

export const ToolbarRootDataAttributes = {
	/** Present when the toolbar is disabled. */
	disabled: 'data-disabled',
	/**
	 * Indicates the orientation of the toolbar.
	 * @type {'horizontal' | 'vertical'}
	 */
	orientation: 'data-orientation'
} as const;

export const ToolbarGroupDataAttributes = {
	/** Present when the group is disabled. */
	disabled: 'data-disabled',
	/**
	 * Indicates the orientation of the toolbar.
	 * @type {'horizontal' | 'vertical'}
	 */
	orientation: 'data-orientation'
} as const;

export const ToolbarButtonDataAttributes = {
	/** Present when the button is disabled. */
	disabled: 'data-disabled',
	/**
	 * Indicates the orientation of the toolbar.
	 * @type {'horizontal' | 'vertical'}
	 */
	orientation: 'data-orientation',
	/** Present when the button remains focusable when disabled. */
	focusable: 'data-focusable'
} as const;

export const ToolbarLinkDataAttributes = {
	/**
	 * Indicates the orientation of the toolbar.
	 * @type {'horizontal' | 'vertical'}
	 */
	orientation: 'data-orientation'
} as const;

export const ToolbarInputDataAttributes = {
	/** Present when the input is disabled. */
	disabled: 'data-disabled',
	/**
	 * Indicates the orientation of the toolbar.
	 * @type {'horizontal' | 'vertical'}
	 */
	orientation: 'data-orientation',
	/** Present when the input remains focusable when disabled. */
	focusable: 'data-focusable'
} as const;
