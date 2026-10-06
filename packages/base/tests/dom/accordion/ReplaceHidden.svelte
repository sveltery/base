<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { Accordion } from '../../../src/lib/accordion/index.js';
  let { overrideHidden = false }: { overrideHidden?: boolean } = $props();
  let alternate = $state(false);
  export function replace() {
    alternate = true;
  }
</script>

{#snippet host(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}
  {#if alternate}<section
      {...props as HTMLAttributes<HTMLElement>}
      {...overrideHidden ? { hidden: false } : {}}>{@render children?.()}</section
    >{:else}<div
      {...props as HTMLAttributes<HTMLDivElement>}
      {...overrideHidden ? { hidden: false } : {}}>{@render children?.()}</div
    >{/if}
{/snippet}
<Accordion.Root>
  <Accordion.Item value="a">
    <Accordion.Trigger>A</Accordion.Trigger>
    <Accordion.Panel hiddenUntilFound render={host} data-testid="replacement-panel"
      >Panel</Accordion.Panel
    >
  </Accordion.Item>
</Accordion.Root>
