<!-- Authored public native focusout lifetime supplement; zero Original declaration credit. -->
<script lang="ts">
  import { Menu } from '@sveltery/base/menu';
  import type { MenuRoot } from '../../src/lib/menu/types.js';

  let { report }: { report: (open: boolean, details: MenuRoot.ChangeEventDetails) => void } =
    $props();
  let popupVisible = $state(true);
</script>

<button id="focusout-outside">Outside menu</button>
<Menu.Root defaultOpen modal={false} onOpenChange={report}>
  <Menu.Trigger id="focusout-trigger">Menu</Menu.Trigger>
  <Menu.Positioner data-testid="focusout-positioner">
    <button id="remove-focusout-owner" onclick={() => (popupVisible = false)}>Remove popup</button>
    {#if popupVisible}
      <Menu.Popup data-testid="focusout-popup" finalFocus={false}>
        <Menu.Item id="focusout-item">Menu item</Menu.Item>
      </Menu.Popup>
    {/if}
  </Menu.Positioner>
</Menu.Root>
