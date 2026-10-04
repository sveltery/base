<script lang="ts">
  import { onMount } from 'svelte';
  import type { DialogHandle } from '../../../../packages/base/src/lib/dialog/handle.svelte.js';
  import type { Payload } from './dialog-handle-cases.js';
  let { handle, action, id = null }: { handle: DialogHandle<Payload>; action: 'open' | 'payload' | 'close'; id?: string | null } = $props();
  onMount(() => { if (action === 'payload') handle.openWithPayload(8); else if (action === 'close') handle.close(); else handle.open(id); });
</script>
