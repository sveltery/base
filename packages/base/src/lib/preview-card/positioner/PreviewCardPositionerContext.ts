// Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import type { useAnchorPositioning } from '../../internals/anchor-positioning/useAnchorPositioning.svelte.js';
export type PreviewCardPositionerContext = ReturnType<typeof useAnchorPositioning>;
const POSITIONER = Symbol('PreviewCard.Positioner');
export function providePreviewCardPositionerContext(value: PreviewCardPositionerContext) {
  setContext(POSITIONER, value);
}
export function usePreviewCardPositionerContext() {
  const context = getContext<PreviewCardPositionerContext | undefined>(POSITIONER);
  if (context === undefined)
    throw new Error(
      'Base UI: PreviewCardPositionerContext is missing. PreviewCardPositioner parts must be placed within <PreviewCard.Positioner>.',
    );
  return context;
}
