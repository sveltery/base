// Derived from Base UI v1.9.0 packages/react/src/avatar/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const AvatarImageDataAttributes = {
	/** Present while the image is loading. */
	loading: 'data-loading',
	/** Present when the image failed to load. */
	error: 'data-error',
	/** Present when the image begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the image is animating out. */
	endingStyle: 'data-ending-style'
} as const;
