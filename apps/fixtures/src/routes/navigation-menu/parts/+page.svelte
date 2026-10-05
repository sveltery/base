<script lang="ts">
  import { onMount, mount, hydrate, unmount } from 'svelte';
  import Native from '../../../lib/NavigationMenuPartsSourceFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!host) return;
    const node = data.hydrate ? host.querySelector<HTMLElement>('[data-testid="parts-hydration-host"]') : host;
    if (!node) return;
    if (!data.reference) {
      const instance = (data.hydrate ? hydrate : mount)(Native, { target: node, props: { scenario: data.scenario } });
      return () => { void unmount(instance); };
    }
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([import('react'), import('react-dom/client'), import('../../../lib/navigation-menu-parts-source-original.js')]).then(([React, { createRoot, hydrateRoot }, { NavigationMenuPartsOriginal }]) => {
      if (stopped) return;
      const element = React.createElement(NavigationMenuPartsOriginal, { scenario: data.scenario });
      const root = data.hydrate ? hydrateRoot(node, element) : createRoot(node);
      if (!data.hydrate) root.render(element);
      cleanup = () => root.unmount();
    });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<!-- eslint-disable svelte/no-at-html-tags -- Trusted immutable Original/native SSR fixture output. -->
<section bind:this={host}>{@html data.html}</section>
