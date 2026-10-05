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
</script>
{#if store.select('mounted') || keepMounted}
  <FloatingPortal {...props} bind:ref>
    {#if store.select('mounted') && store.select('modal') === true}
      <InternalBackdrop bind:ref={store.context.internalBackdropRef.current} inert={!store.select('open')} />
    {/if}
    {@render children?.()}
  </FloatingPortal>
{/if}
