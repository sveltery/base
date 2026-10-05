// Original useNavigationMenuAnchorPositioning late active-root hook boundary (MIT).
import { useFloating } from '../../floating-ui/hooks/useFloating.svelte.js';
import { useAnchorPositioningWithHook } from '../../internals/anchor-positioning/useAnchorPositioning.svelte.js';
import type { AnchorPositioningOptions } from '../../internals/anchor-positioning/types.js';
export function useNavigationMenuAnchorPositioning(
  getParams: () => AnchorPositioningOptions,
  floatingId: string,
) {
  return useAnchorPositioningWithHook(getParams, (getOptions) =>
    useFloating(getOptions, floatingId),
  );
}
