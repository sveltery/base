<script lang="ts">
  import { onMount } from 'svelte';
  import type { DialogHandle } from '../../src/lib/dialog/handle.svelte.js';
  let {
    handle,
    action,
    triggerId = null,
  }: {
    handle: DialogHandle<number>;
    action: 'open' | 'payload' | 'close';
    triggerId?: string | null;
  } = $props();
  onMount(() => {
    if (action === 'payload') handle.openWithPayload(8);
    else if (action === 'open') handle.open(triggerId);
    else handle.close();
  });
</script>
