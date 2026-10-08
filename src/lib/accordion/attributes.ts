// Derived from Base UI v1.8.0
// packages/react/src/accordion/item/stateAttributesMapping.ts,
// packages/react/src/accordion/root/AccordionRoot.tsx rootStateAttributesMapping,
// and packages/react/src/accordion/panel/AccordionPanelCssVars.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import { collapsibleOpenStateMapping, transitionStatusMapping } from '../collapsible/attributes.js';
import type { AccordionItemState, AccordionPanelState, AccordionRootState } from './types.js';

export const index = 'data-index';

export const rootStateAttributesMapping: StateAttributesMapping<AccordionRootState> = {
	value: () => null
};

export const accordionStateAttributesMapping: StateAttributesMapping<AccordionItemState> = {
	...collapsibleOpenStateMapping,
	index: (value) => ({ [index]: String(value) }),
	...transitionStatusMapping,
	value: () => null
};

export const accordionPanelAttributesMapping: StateAttributesMapping<AccordionPanelState> =
	accordionStateAttributesMapping;

export function accordionDimensionStyle(
	height: number | undefined,
	width: number | undefined
): string {
	const heightValue = height === undefined ? 'auto' : `${height}px`;
	const widthValue = width === undefined ? 'auto' : `${width}px`;
	return `--accordion-panel-height:${heightValue};--accordion-panel-width:${widthValue}`;
}
