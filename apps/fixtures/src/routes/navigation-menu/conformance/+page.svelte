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
    void Promise.all([import('react'), import('react-dom/client'), import('../../../lib/navigation-menu-conformance-reference.js')]).then(([React, { hydrateRoot }, { NavigationMenuConformanceReference }]) => {
      if (stopped) return;
      const root = hydrateRoot(node, React.createElement(NavigationMenuConformanceReference, { part: data.part, probe: data.probe }));
      cleanup = () => root.unmount();
    });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<!-- eslint-disable svelte/no-at-html-tags -- Trusted actual Original React conformance SSR markup. -->
{#if data.reference}<section bind:this={host}>{@html data.html}</section>{:else}<Fixture part={data.part} probe={data.probe} />{/if}
