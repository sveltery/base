// Derived from Base UI v1.8.0 packages/utils/src/visuallyHidden.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
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
	top: 0,
	left: 0
};

export const visuallyHiddenInput: Record<string, string | number> = {
	...visuallyHiddenBase,
	position: 'absolute'
};
