<script lang="ts">
  // Original MenuPortal/provider/owner-role composition (MIT).
  import type { ComponentProps } from 'svelte';
  import FloatingPortal from '../floating-ui/components/FloatingPortal.svelte';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { provideMenuPortalContext } from './portal/MenuPortalContext.js';
  import type { MenuPortalProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let { keepMounted = false, ref = $bindable(null), ...portalProps }: MenuPortalProps = $props();
  const { store, parent } = useMenuRootContext();
  provideMenuPortalContext(() => keepMounted);
  const shouldRender = $derived(store.useState('mounted') || keepMounted);
  const portalOwnerRole = parent.type === 'menu' || parent.type === 'menubar' ? 'group' : undefined;
</script>
{#if shouldRender}<FloatingPortal {...(portalProps as ComponentProps<typeof FloatingPortal>)} ref={(node) => { ref = node; }} {portalOwnerRole} />{/if}
