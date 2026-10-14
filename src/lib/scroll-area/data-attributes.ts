// Derived from Base UI v1.9.0 packages/react/src/scroll-area/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import * as cssVars from './css-vars.js';
import * as attributes from './attributes.js';

export const ScrollAreaRootCssVariables = {
	/** The scroll area's corner height. */
	scrollAreaCornerHeight: cssVars.scrollAreaCornerHeight,
	/** The scroll area's corner width. */
	scrollAreaCornerWidth: cssVars.scrollAreaCornerWidth
} as const;

export const ScrollAreaRootDataAttributes = {
	/** Present when the user scrolls inside the scroll area. */
	scrolling: attributes.scrolling,
	/** Present when the scroll area content is wider than the viewport. */
	hasOverflowX: attributes.hasOverflowX,
	/** Present when the scroll area content is taller than the viewport. */
	hasOverflowY: attributes.hasOverflowY,
	/** Present when there is overflow on the horizontal start side. */
	overflowXStart: attributes.overflowXStart,
	/** Present when there is overflow on the horizontal end side. */
	overflowXEnd: attributes.overflowXEnd,
	/** Present when there is overflow on the vertical start side. */
	overflowYStart: attributes.overflowYStart,
	/** Present when there is overflow on the vertical end side. */
	overflowYEnd: attributes.overflowYEnd
} as const;

export const ScrollAreaViewportCssVariables = {
	/** The distance from the horizontal start edge in pixels. */
	scrollAreaOverflowXStart: cssVars.scrollAreaOverflowXStart,
	/** The distance from the horizontal end edge in pixels. */
	scrollAreaOverflowXEnd: cssVars.scrollAreaOverflowXEnd,
	/** The distance from the vertical start edge in pixels. */
	scrollAreaOverflowYStart: cssVars.scrollAreaOverflowYStart,
	/** The distance from the vertical end edge in pixels. */
	scrollAreaOverflowYEnd: cssVars.scrollAreaOverflowYEnd
} as const;

export const ScrollAreaViewportDataAttributes = {
	/** Present when the user scrolls inside the scroll area. */
	scrolling: attributes.scrolling,
	/** Present when the scroll area content is wider than the viewport. */
	hasOverflowX: attributes.hasOverflowX,
	/** Present when the scroll area content is taller than the viewport. */
	hasOverflowY: attributes.hasOverflowY,
	/** Present when there is overflow on the horizontal start side. */
	overflowXStart: attributes.overflowXStart,
	/** Present when there is overflow on the horizontal end side. */
	overflowXEnd: attributes.overflowXEnd,
	/** Present when there is overflow on the vertical start side. */
	overflowYStart: attributes.overflowYStart,
	/** Present when there is overflow on the vertical end side. */
	overflowYEnd: attributes.overflowYEnd
} as const;

export const ScrollAreaScrollbarCssVariables = {
	/** The scroll area thumb's height. */
	scrollAreaThumbHeight: cssVars.scrollAreaThumbHeight,
	/** The scroll area thumb's width. */
	scrollAreaThumbWidth: cssVars.scrollAreaThumbWidth
} as const;

export const ScrollAreaScrollbarDataAttributes = {
	/** Indicates the orientation of the scrollbar. */
	orientation: attributes.orientationAttribute,
	/** Present when the pointer is over the scroll area. */
	hovering: attributes.hovering,
	/** Present when the user scrolls inside the scroll area. */
	scrolling: attributes.scrolling,
	/** Present when the scroll area content is wider than the viewport. */
	hasOverflowX: attributes.hasOverflowX,
	/** Present when the scroll area content is taller than the viewport. */
	hasOverflowY: attributes.hasOverflowY,
	/** Present when there is overflow on the horizontal start side. */
	overflowXStart: attributes.overflowXStart,
	/** Present when there is overflow on the horizontal end side. */
	overflowXEnd: attributes.overflowXEnd,
	/** Present when there is overflow on the vertical start side. */
	overflowYStart: attributes.overflowYStart,
	/** Present when there is overflow on the vertical end side. */
	overflowYEnd: attributes.overflowYEnd
} as const;

export const ScrollAreaContentDataAttributes = {
	/** Present when the user scrolls inside the scroll area. */
	scrolling: attributes.scrolling,
	/** Present when the scroll area content is wider than the viewport. */
	hasOverflowX: attributes.hasOverflowX,
	/** Present when the scroll area content is taller than the viewport. */
	hasOverflowY: attributes.hasOverflowY,
	/** Present when there is overflow on the horizontal start side. */
	overflowXStart: attributes.overflowXStart,
	/** Present when there is overflow on the horizontal end side. */
	overflowXEnd: attributes.overflowXEnd,
	/** Present when there is overflow on the vertical start side. */
	overflowYStart: attributes.overflowYStart,
	/** Present when there is overflow on the vertical end side. */
	overflowYEnd: attributes.overflowYEnd
} as const;

export const ScrollAreaThumbDataAttributes = {
	/** Indicates the orientation of the scrollbar. */
	orientation: attributes.orientationAttribute,
	/** Present when the user scrolls inside the scroll area. */
	scrolling: attributes.scrolling
} as const;
