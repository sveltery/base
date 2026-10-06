import type { CollapsibleRootState } from './types.js';
export function stateAttributes(
  state: CollapsibleRootState,
  trigger = false,
): Record<string, unknown> {
  return {
    ...(trigger
      ? { 'data-panel-open': state.open ? '' : undefined }
      : { 'data-open': state.open ? '' : undefined, 'data-closed': state.open ? undefined : '' }),
    'data-disabled': state.disabled ? '' : undefined,
    'data-starting-style': state.transitionStatus === 'starting' ? '' : undefined,
    'data-ending-style': state.transitionStatus === 'ending' ? '' : undefined,
  };
}
