// Derived from Base UI v1.9.0 packages/react/src/toggle-group/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const ToggleGroupDataAttributes = {
	/** Present when the toggle group is disabled. */
	disabled: 'data-disabled',
	/**
	 * Indicates the orientation of the toggle group.
	 * @type {'horizontal' | 'vertical'}
	 */
	orientation: 'data-orientation',
	/** Present when the toggle group allows multiple buttons to be in the pressed state at the same time. */
	multiple: 'data-multiple'
} as const;
