<script lang="ts">
  // Actual source CompositeRoot used directly; MIT: parity/radio/UPSTREAM_LICENSE.
  import CompositeRoot from '../../src/lib/internals/composite/root/CompositeRoot.svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  let { renderOverride = false }: { renderOverride?: boolean } = $props();
</script>

{#snippet host(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: import('svelte').Snippet | undefined,
)}
  <section {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</section>
{/snippet}
<CompositeRoot id="composite" render={renderOverride ? host : undefined}>
  <input id="textbox" type="text" value="hello" />
</CompositeRoot>
