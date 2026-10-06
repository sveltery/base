<script lang="ts">
  // D1835: function payloads retain a separate state owner from Dialog.Root.
  import Trigger from '../../../../packages/base/src/lib/dialog/Trigger.svelte';
  import type { DialogHandle } from '../../../../packages/base/src/lib/dialog/handle.svelte.js';
  import type { Payload } from './dialog-handle-cases.js';
  let { handle }: { handle: DialogHandle<Payload> } = $props();
  let payloads = $state([1, 2]);
</script>

<div>
  <Trigger {handle} id="trigger-1" payload={() => payloads[0]}>Dialog 1</Trigger>
  <Trigger {handle} id="trigger-2" payload={() => payloads[1]}>Dialog 2</Trigger>
  <button
    type="button"
    onclick={() => {
      payloads = [8, 16];
    }}>Update payloads</button
  >
</div>
