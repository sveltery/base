// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md.
import { TransitionStatusDataAttributes } from '../../internals/stateAttributesMapping.js';

/**
 * Present when the collapsible panel is open.
 */
export const open = 'data-open';
/**
 * Present when the collapsible panel is closed.
 */
export const closed = 'data-closed';
/**
 * Present when the panel begins animating in.
 */
export const startingStyle = TransitionStatusDataAttributes.startingStyle;
/**
 * Present when the panel is animating out.
 */
export const endingStyle = TransitionStatusDataAttributes.endingStyle;
