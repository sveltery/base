<script lang="ts">
  // D1444: Root remount state lives in this route owner, independent of the persistent header.
  import * as Dialog from '../../../../packages/base/src/lib/dialog/index.js';
  import type { DialogHandle } from '../../../../packages/base/src/lib/dialog/handle.svelte.js';
  import type { Payload } from './dialog-handle-cases.js';
  let { handle }: { handle: DialogHandle<Payload> } = $props();
  let mounted = $state(true);
</script>
{#if mounted}
  <Dialog.Root {handle}><Dialog.Portal><Dialog.Popup>Dialog Content<button type="button" onclick={() => { mounted = false; }}>Unmount root</button></Dialog.Popup></Dialog.Portal></Dialog.Root>
{:else}<button type="button" onclick={() => { mounted = true; }}>Remount root</button>{/if}
