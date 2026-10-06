<script lang="ts">
  // Original submenu provider/Root composition (MIT).
  import Root from './Root.svelte';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { provideMenuSubmenuRootContext } from './submenu-root/MenuSubmenuRootContext.js';
  import type { MenuSubmenuRootProps } from './types.js';
  let { actions = $bindable(null), ...props }: MenuSubmenuRootProps = $props();
  const parentMenu = useMenuRootContext().store;
  provideMenuSubmenuRootContext({ parentMenu });
</script>

<Root {...props} bind:actions />
