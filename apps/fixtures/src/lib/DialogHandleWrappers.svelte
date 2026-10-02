<script lang="ts">
  import Trigger from '../../../../packages/base/src/lib/dialog/Trigger.svelte';
  import type { DialogHandle } from '../../../../packages/base/src/lib/dialog/handle.svelte.js';
  import type { Payload } from './dialog-handle-cases.js';
  let { handle, nesting }: { handle: DialogHandle<Payload>; nesting: number } = $props();
</script>
{#snippet trigger()}<Trigger {handle} id="trigger">Trigger</Trigger>{/snippet}
{#if nesting === 0}{@render trigger()}
{:else if nesting === 1}<div>{@render trigger()}</div>
{:else if nesting === 2}<div><div>{@render trigger()}</div></div>
{:else}<div><div><div>{@render trigger()}</div></div></div>{/if}
