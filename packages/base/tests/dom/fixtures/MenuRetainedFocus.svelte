<!-- Authored actual Source/native regression; zero Original declaration credit. -->
<script lang="ts">
  import * as Menu from '../../../src/lib/menu/index.parts.js';
  let { log }: { log: (value: string) => void } = $props();
  let actions = $state<{ unmount: () => void; close: () => void } | null>(null);
  let finalFocus = $state<(type: string) => HTMLElement | null>(() => {
    log('old');
    return document.getElementById('old-target');
  });
  export function replace() {
    finalFocus = () => {
      log('new');
      return document.getElementById('new-target');
    };
  }
  export function close() {
    actions?.close();
  }
  export function finish() {
    actions?.unmount();
  }
</script>

<button id="old-target">Old</button><button id="new-target">New</button>
<Menu.Root
  defaultOpen
  bind:actions
  onOpenChange={(open, details) => {
    if (!open) details.preventUnmountOnClose();
  }}
>
  <Menu.Trigger id="opener">Open</Menu.Trigger>
  <Menu.Portal
    ><Menu.Positioner
      ><Menu.Popup {finalFocus}><Menu.Item id="inside">Inside</Menu.Item></Menu.Popup
      ></Menu.Positioner
    ></Menu.Portal
  >
</Menu.Root>
