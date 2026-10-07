// Derived from Base UI v1.8.0 scroll-area CssVars modules
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export const scrollAreaCornerHeight = '--scroll-area-corner-height';
export const scrollAreaCornerWidth = '--scroll-area-corner-width';

export const scrollAreaThumbHeight = '--scroll-area-thumb-height';
export const scrollAreaThumbWidth = '--scroll-area-thumb-width';

export const scrollAreaOverflowXStart = '--scroll-area-overflow-x-start';
export const scrollAreaOverflowXEnd = '--scroll-area-overflow-x-end';
export const scrollAreaOverflowYStart = '--scroll-area-overflow-y-start';
export const scrollAreaOverflowYEnd = '--scroll-area-overflow-y-end';

export const OVERFLOW_EDGE_VARS = [
	scrollAreaOverflowXStart,
	scrollAreaOverflowXEnd,
	scrollAreaOverflowYStart,
	scrollAreaOverflowYEnd
] as const;
