<script lang="ts">
  import { onMount, mount, unmount } from 'svelte';
  import Fixture from '../../../lib/NavigationMenuSourceFixture.svelte';
  import * as sourceMocks from '../../../lib/navigation-menu-source-mocks.js';
  import { createNavigationMenuTestTransport } from '../../../lib/navigation-menu-test-transport.js';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!host) return;
    const transport = createNavigationMenuTestTransport();
    const globals = window as typeof window & { navigationMenuMocks?: typeof sourceMocks; navigationMenuTestTransport?: typeof transport };
    Object.assign(globals, { navigationMenuMocks: sourceMocks, navigationMenuTestTransport: transport });
    function deleteGlobals() { delete globals.navigationMenuMocks; delete globals.navigationMenuTestTransport; }
    async function teardown() { await transport.dispose(); deleteGlobals(); }
    if (!data.reference) {
      const native = mount(Fixture, { target: host, props: { scenario: data.scenario, direction: data.direction, orientation: data.orientation, side: data.side } });
      transport.ready(undefined, async () => { await unmount(native); deleteGlobals(); });
      return () => { void teardown(); };
    }
    let stopped = false;
    let cleanup: (() => void) | undefined;
    const node = host;
    void Promise.all([import('../../../lib/navigation-menu-reference-renderer.js'), import('../../../lib/navigation-menu-source-original.js')]).then(async ([{ React, renderer, referenceTransport }, { NavigationMenuSourceOriginal }]) => {
      if (stopped) return;
      let view: { unmount(): void } | undefined;
      await renderer.act(async () => {
        view = renderer.render(React.createElement(NavigationMenuSourceOriginal, { scenario: data.scenario, direction: data.direction, orientation: data.orientation, side: data.side }), { container: node, reactStrictMode: true });
      });
      if (stopped) { view?.unmount(); renderer.cleanup(); teardown(); return; }
      transport.ready(referenceTransport, () => { view?.unmount(); renderer.cleanup(); deleteGlobals(); });
      cleanup = () => { void teardown(); };
    });
    return () => { stopped = true; if (cleanup) cleanup(); else teardown(); };
  });
</script>
<section bind:this={host}></section>
