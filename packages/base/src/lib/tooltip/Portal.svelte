<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { setContext } from 'svelte';
  import FloatingPortal from '../utils/FloatingPortalLite.svelte';
  import { PORTAL, useTooltipRootContext } from './context.js';
  import type { TooltipPortalProps } from './types.js';
  let { keepMounted = false, ref = $bindable(), ...portalProps }: TooltipPortalProps = $props();
  const store = useTooltipRootContext();
  setContext(PORTAL, {
    get keepMounted() {
      return keepMounted;
    },
  });
  function forwardedRef(node: HTMLElement | null) {
    ref = node;
    return () => {
      if (ref === node) ref = null;
    };
  }
</script>

{#if store.select('mounted') || keepMounted}
  <FloatingPortal {...portalProps} ref={forwardedRef} />
{/if}
