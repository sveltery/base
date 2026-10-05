<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../../lib/NavigationMenuConformanceFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([import('react'), import('react-dom/client'), import('../../../lib/navigation-menu-conformance-reference.js')]).then(([React, { createRoot }, { NavigationMenuConformanceReference }]) => {
      if (stopped) return;
      const root = createRoot(node);
      root.render(React.createElement(NavigationMenuConformanceReference, { part: data.part, probe: data.probe }));
      cleanup = () => root.unmount();
    });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<section bind:this={host}></section>{:else}<Fixture part={data.part} probe={data.probe} />{/if}
