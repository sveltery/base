// Adapted from Accordion stateAttributesMapping and triggerOpenStateMapping,
// Base UI v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
import type { AccordionItemState, AccordionPanelState } from './types.js';
export function stateAttributes(
  state: AccordionItemState | AccordionPanelState,
  trigger = false,
): Record<string, unknown> {
  return {
    ...(trigger
      ? { 'data-panel-open': state.open ? '' : undefined }
      : { 'data-open': state.open ? '' : undefined, 'data-closed': state.open ? undefined : '' }),
    'data-disabled': state.disabled ? '' : undefined,
    'data-orientation': state.orientation,
    'data-hidden': state.hidden ? '' : undefined,
    // Trigger only overrides open mapping: its generic index mapping omits zero.
    'data-index': trigger ? state.index || undefined : String(state.index),
    ...('transitionStatus' in state
      ? {
          'data-starting-style': state.transitionStatus === 'starting' ? '' : undefined,
          'data-ending-style': state.transitionStatus === 'ending' ? '' : undefined,
        }
      : {}),
    // Trigger has no value mapping; generic getStateAttributesProps stringifies truthy arrays.
    ...(trigger ? { 'data-value': state.value.toString() } : {}),
  };
}
