// Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import type { useAnchorPositioning } from '../../internals/anchor-positioning/useAnchorPositioning.svelte.js';
export type TooltipPositionerContext = ReturnType<typeof useAnchorPositioning>;
const POSITIONER = Symbol('Tooltip.Positioner');
export function provideTooltipPositionerContext(value: TooltipPositionerContext) { setContext(POSITIONER, value); }
export function useTooltipPositionerContext() {
  const context = getContext<TooltipPositionerContext | undefined>(POSITIONER);
  if (context === undefined) throw new Error('Base UI: TooltipPositionerContext is missing. TooltipPositioner parts must be placed within <Tooltip.Positioner>.');
  return context;
}
