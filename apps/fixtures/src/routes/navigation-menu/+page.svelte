<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/NavigationMenuBrowserFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([import('react'), import('react-dom/client'), import('../../lib/navigation-menu-reference.js')]).then(([React, { hydrateRoot }, { NavigationMenuReference }]) => {
      if (stopped) return;
      const root = hydrateRoot(node, React.createElement(NavigationMenuReference, { scenario: data.scenario, direction: data.direction, orientation: data.orientation, onHydrated: () => { node.dataset.hydrated = 'true'; } }));
      cleanup = () => root.unmount();
    });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<!-- eslint-disable svelte/no-at-html-tags -- Trusted actual Original React SSR fixture markup, without external content. -->
{#if data.reference}<section bind:this={host} data-hydrated="false">{@html data.html}</section>{:else}<Fixture scenario={data.scenario} direction={data.direction} orientation={data.orientation} />{/if}
