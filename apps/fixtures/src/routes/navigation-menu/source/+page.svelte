<script lang="ts">
  import { onMount, mount, unmount } from 'svelte';
  import Fixture from '../../../lib/NavigationMenuSourceFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!host) return;
    if (!data.reference) {
      const native = mount(Fixture, { target: host, props: { scenario: data.scenario, direction: data.direction, orientation: data.orientation, side: data.side } });
      return () => { void unmount(native); };
    }
    let stopped = false;
    let cleanup: (() => void) | undefined;
    const node = host;
    void Promise.all([import('react'), import('react-dom/client'), import('../../../lib/navigation-menu-source-original.js')]).then(([React, { createRoot }, { NavigationMenuSourceOriginal }]) => {
      if (stopped) return;
      const root = createRoot(node);
      root.render(React.createElement(NavigationMenuSourceOriginal, { scenario: data.scenario, direction: data.direction, orientation: data.orientation, side: data.side }));
      cleanup = () => root.unmount();
    });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<section bind:this={host}></section>
