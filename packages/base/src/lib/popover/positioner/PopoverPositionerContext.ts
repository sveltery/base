// Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import type { useAnchorPositioning } from '../../internals/anchor-positioning/useAnchorPositioning.svelte.js';
export type PopoverPositionerContext = ReturnType<typeof useAnchorPositioning>;
const POSITIONER = Symbol('Popover.Positioner');
export function providePopoverPositionerContext(value: PopoverPositionerContext) {
  setContext(POSITIONER, value);
}
export function usePopoverPositionerContext() {
  const context = getContext<PopoverPositionerContext | undefined>(POSITIONER);
  if (context === undefined)
    throw new Error(
      'Base UI: PopoverPositionerContext is missing. PopoverPositioner parts must be placed within <Popover.Positioner>.',
    );
  return context;
}
