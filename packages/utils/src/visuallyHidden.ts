// Derived from Base UI v1.9.0 packages/utils/src/visuallyHidden.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// React's style object uses unitless 1 and -1, which it treats as pixels.
// These strings include the unit so a native Svelte `style` attribute can use them.

const visuallyHiddenBase: Record<string, string | number> = {
	clipPath: 'inset(50%)',
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	border: 0,
	padding: 0,
	width: '1px',
	height: '1px',
	margin: '-1px'
};

export const visuallyHidden: Record<string, string | number> = {
	...visuallyHiddenBase,
	position: 'fixed',
	margin: 0,
	top: 0,
	left: 0
};

export const visuallyHiddenInput: Record<string, string | number> = {
	...visuallyHiddenBase,
	position: 'absolute'
};

/** `visuallyHidden` as a `style` attribute, for elements that take no style object. */
export const visuallyHiddenStyle =
	'clip-path: inset(50%); overflow: hidden; white-space: nowrap; border: 0px; padding: 0px; width: 1px; height: 1px; margin: 0px; position: fixed; top: 0px; left: 0px';
