<!-- Authored native current-host release supplement; zero unchanged Source assertion credit. -->
<script lang="ts">
  import * as Menu from '../../../src/lib/menu/index.parts.js';
  const handle = Menu.createHandle();
  let shown = $state(true);
  let host = $state.raw<HTMLElement | null>(null);

  export function removeTrigger() {
    shown = false;
  }
  export function snapshot() {
    return {
      host,
      registered: handle.store.context.triggerElements.getById('current-host-release'),
    };
  }
</script>

<Menu.Root {handle}>
  {#if shown}<Menu.Trigger id="current-host-release" bind:ref={host}>Open</Menu.Trigger>{/if}
</Menu.Root>
