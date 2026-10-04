<script lang="ts">
  // Original submenu provider/Root composition (MIT).
  import Root from './Root.svelte';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { provideMenuSubmenuRootContext } from './submenu-root/MenuSubmenuRootContext.js';
  import type { MenuSubmenuRootProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let { actions = $bindable(null), ...props }: MenuSubmenuRootProps = $props();
  const parentMenu = useMenuRootContext().store;
  provideMenuSubmenuRootContext({ parentMenu });
</script>
<Root {...props} bind:actions />
