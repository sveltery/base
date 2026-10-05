<script lang="ts">
  // Original NavigationMenuPortal/provider with the canonical full FloatingPortal (MIT).
  import type { ComponentProps } from 'svelte';
  import FloatingPortal from '../floating-ui/components/FloatingPortal.svelte';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { provideNavigationMenuPortalContext } from './portal/NavigationMenuPortalContext.js';
  import type { NavigationMenuPortalProps } from './types.js';
  let {
    keepMounted = false,
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
    ref = $bindable(null),
    ...portalProps
  }: NavigationMenuPortalProps = $props();
  const root = useNavigationMenuRootContext();
  provideNavigationMenuPortalContext(() => keepMounted);
  const shouldRender = $derived(root.mounted || keepMounted);
</script>
{#if shouldRender}<FloatingPortal {...(portalProps as ComponentProps<typeof FloatingPortal>)} ref={(node) => { ref = node; }} />{/if}
