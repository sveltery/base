<!-- Authored native owner migration supplement; zero Original declaration credit. -->
<script lang="ts">
  import { Menu } from '../../src/lib/menu/index.js';
  import type { MenuStore } from '../../src/lib/menu/store/MenuStore.svelte.js';
  import type { FloatingTreeStore } from '../../src/lib/floating-ui/components/FloatingTreeStore.js';
  import TreeOwner from './MenuTreeTriggerOwner.svelte';

  let { first, second }: { first: FloatingTreeStore; second: FloatingTreeStore } = $props();
  const handle = Menu.createHandle();
  let ownersVisible = $state(true);

  export function activateFirst() {
    handle.open('first-tree-trigger');
  }
  export function activateSecond() {
    handle.open('second-tree-trigger');
  }
  export function store() {
    return handle.store as MenuStore<unknown>;
  }
  export function replaceTreeAndHideOwners() {
    store().set('floatingTreeRoot', first);
    ownersVisible = false;
  }
</script>

<TreeOwner tree={first} parentNodeId="first-parent-node">
  <Menu.Trigger {handle} id="first-tree-trigger" closeDelay={0}>First owner</Menu.Trigger>
</TreeOwner>
<TreeOwner tree={second} parentNodeId="second-parent-node">
  <Menu.Trigger {handle} id="second-tree-trigger" closeDelay={0}>Second owner</Menu.Trigger>
</TreeOwner>
<button data-testid="other-menu-item">Other item</button>
<Menu.Root
  {handle}
  modal={false}
  onOpenChange={(nextOpen, details) => {
    // Retain the real open menu while observing each canonical close request.
    if (!nextOpen) details.cancel();
  }}
>
  {#if ownersVisible}
    <Menu.Portal keepMounted>
      <Menu.Positioner data-testid="tree-positioner">
        <Menu.Popup data-testid="tree-popup" finalFocus={false}>
          <Menu.Item>Menu item</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  {/if}
</Menu.Root>
