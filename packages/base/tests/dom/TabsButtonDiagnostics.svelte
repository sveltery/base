<script lang="ts">
  import { Tabs } from '../../src/lib/tabs/index.js';
  import type { HTMLAttributes } from 'svelte/elements';
  let { native }: { native: boolean } = $props();
</script>
<Tabs.Root defaultValue={0}>
  <Tabs.List>
    <Tabs.Tab value={0} nativeButton={native}>
      {#snippet render(props, _state, children)}
        {#if native}<div {...props as HTMLAttributes<HTMLDivElement>}>{@render children?.()}</div>
        {:else}<button {...props as HTMLAttributes<HTMLButtonElement>}>{@render children?.()}</button>{/if}
      {/snippet}
      Mismatch
    </Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
