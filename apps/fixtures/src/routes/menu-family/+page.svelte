<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Fixture from '../../lib/MenuFamilyFixture.svelte';
  import type { mountMenuFamilyReference } from '../../lib/menu-family-reference.js';
  let { data } = $props();
  let host = $state<HTMLElement>();
  let fixture = $state<{ command(value: string): void; snapshot(): object }>();
  onMount(() => {
    if (!host) return;
    const node = host; let stopped = false; let reference: ReturnType<typeof mountMenuFamilyReference> | undefined;
    Object.assign(node, { menuCommand: (value: string) => (reference ?? fixture)?.command(value), menuSnapshot: () => (reference ?? fixture)?.snapshot() });
    if (data.reference) void import('../../lib/menu-family-reference.js').then(({ mountMenuFamilyReference }) => {
      if (!stopped) { reference = mountMenuFamilyReference(node, data); node.dataset.hydrated = 'true'; }
    });
    else void tick().then(() => { if (!stopped) node.dataset.hydrated = 'true'; });
    return () => { stopped = true; reference?.stop(); };
  });
</script>
<main bind:this={host}>{#if !data.reference}<Fixture {...data} bind:this={fixture} />{/if}</main>
<style>
  :global([data-testid=popup]), :global([data-testid=sub-popup]), :global([data-testid=edit-popup]) { background: white; color: black; border: 1px solid black; padding: 8px; }
  :global([role^=menuitem]) { display: block; padding: 4px; }
  :global(#menubar) { display: flex; align-items: flex-start; gap: 20px; width: max-content; }
  :global(#menubar[aria-orientation=vertical]) { flex-direction: column; }
  :global([data-current]) { animation: enter 800ms linear; }
  :global([data-previous]) { animation: leave 800ms linear; }
  @keyframes enter { from { opacity: .8; } to { opacity: 1; } }
  @keyframes leave { from { opacity: 1; } to { opacity: .8; } }
</style>
