<script lang="ts">
  // Original DialogPortal → FloatingPortal/InternalBackdrop composition (MIT).
  import { setContext } from 'svelte';
  import FloatingPortal from '../floating-ui/components/FloatingPortal.svelte';
  import InternalBackdrop from '../utils/InternalBackdrop.svelte';
  import { PORTAL, useDialogRootContext } from './context.js';
  import type { DialogPortalProps } from './types.js';
  let { keepMounted = false, children, ref = $bindable(), ...props }: DialogPortalProps = $props();
  const store = useDialogRootContext();
  setContext(PORTAL, { get keepMounted() { return keepMounted; } });
  function forwardedRef(node: HTMLElement | null) {
    ref = node;
    return () => { if (ref === node) ref = null; };
  }
</script>
{#if store.select('mounted') || keepMounted}
  <FloatingPortal {...props} ref={forwardedRef}>
    {#if store.select('mounted') && store.select('modal') === true}
      <InternalBackdrop ref={store.context.internalBackdropRef} inert={!store.select('open')} />
    {/if}
    {@render children?.()}
  </FloatingPortal>
{/if}
