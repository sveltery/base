// Derived from Base UI v1.8.0 scroll-area data attributes and stateAttributes.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { ScrollAreaRootState } from './types.js';

export const scrolling = 'data-scrolling';
export const hasOverflowX = 'data-has-overflow-x';
export const hasOverflowY = 'data-has-overflow-y';
export const overflowXStart = 'data-overflow-x-start';
export const overflowXEnd = 'data-overflow-x-end';
export const overflowYStart = 'data-overflow-y-start';
export const overflowYEnd = 'data-overflow-y-end';
export const orientationAttribute = 'data-orientation';
export const hovering = 'data-hovering';

const attr = (name: string) => (value: boolean) => (value ? { [name]: '' } : null);

export const scrollAreaStateAttributesMapping: StateAttributesMapping<ScrollAreaRootState> = {
	hasOverflowX: attr(hasOverflowX),
	hasOverflowY: attr(hasOverflowY),
	overflowXStart: attr(overflowXStart),
	overflowXEnd: attr(overflowXEnd),
	overflowYStart: attr(overflowYStart),
	overflowYEnd: attr(overflowYEnd),
	cornerHidden: () => null
};
