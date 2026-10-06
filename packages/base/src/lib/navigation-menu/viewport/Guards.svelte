<script lang="ts">
  // Original Viewport Guards and actual forward/reverse tabbability handoff (MIT).
  import type { Snippet } from 'svelte';
  import FocusGuard from '../../utils/FocusGuard.svelte';
  import { getNextTabbable, getPreviousTabbable } from '../../floating-ui/utils/tabbable.js';
  import { isOutsideEvent } from '../../floating-ui/utils/tabbable.js';
  import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext.js';
  import { useNavigationMenuPositionerContext } from '../positioner/NavigationMenuPositionerContext.js';
  let { children }: { children?: Snippet } = $props();
  const root = useNavigationMenuRootContext();
  const hasPositioner = Boolean(useNavigationMenuPositionerContext(true));
  const referenceElement = $derived(root.positionerElement || root.viewportElement);
</script>

{#if !root.floatingRootContext && !hasPositioner}
  {@render children?.()}
{:else}
  <FocusGuard
    bind:ref={root.beforeInsideRef.current}
    onfocusin={(event) => {
      if (referenceElement && isOutsideEvent(event, referenceElement))
        getNextTabbable(referenceElement)?.focus();
      else root.beforeOutsideRef.current?.focus();
    }}
  />
  {@render children?.()}
  <FocusGuard
    bind:ref={root.afterInsideRef.current}
    onfocusin={(event) => {
      if (referenceElement && isOutsideEvent(event, referenceElement))
        getPreviousTabbable(referenceElement)?.focus();
      else root.afterOutsideRef.current?.focus();
    }}
  />
{/if}
