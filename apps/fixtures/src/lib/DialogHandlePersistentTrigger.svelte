<script lang="ts">
  import Trigger from '../../../../packages/base/src/lib/dialog/Trigger.svelte';
  import type { DialogHandle } from '../../../../packages/base/src/lib/dialog/handle.svelte.js';
  import type { Payload } from './dialog-handle-cases.js';
  let { handle }: { handle: DialogHandle<Payload> } = $props();
</script>

<Trigger {handle} id="trigger">Trigger</Trigger>
