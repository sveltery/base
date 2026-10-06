<script lang="ts">
  import { onMount, mount, hydrate, unmount } from 'svelte';
  import Native from '../../../lib/NavigationMenuPartsSourceFixture.svelte';
  import { createNavigationMenuTestTransport } from '../../../lib/navigation-menu-test-transport.js';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!host) return;
    const node = data.hydrate
      ? host.querySelector<HTMLElement>('[data-testid="parts-hydration-host"]')
      : host;
    if (!node) return;
    const transport = createNavigationMenuTestTransport();
    const globals = window as typeof window & { navigationMenuTestTransport?: typeof transport };
    globals.navigationMenuTestTransport = transport;
    function deleteGlobals() {
      delete globals.navigationMenuTestTransport;
    }
    async function teardown() {
      await transport.dispose();
      deleteGlobals();
    }
    if (!data.reference) {
      const instance = (data.hydrate ? hydrate : mount)(Native, {
        target: node,
        props: { scenario: data.scenario },
      });
      transport.ready(undefined, async () => {
        await unmount(instance);
        deleteGlobals();
      });
      return () => {
        void teardown();
      };
    }
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([
      import('../../../lib/navigation-menu-reference-renderer.js'),
      import('../../../lib/navigation-menu-parts-source-original.js'),
    ]).then(async ([{ React, renderer, referenceTransport }, { NavigationMenuPartsOriginal }]) => {
      if (stopped) return;
      const element = React.createElement(NavigationMenuPartsOriginal, { scenario: data.scenario });
      let view: { unmount(): void } | undefined;
      await renderer.act(async () => {
        view = renderer.render(element, {
          container: node,
          hydrate: data.hydrate,
          reactStrictMode: true,
        });
      });
      if (stopped) {
        view?.unmount();
        renderer.cleanup();
        teardown();
        return;
      }
      transport.ready(referenceTransport, () => {
        view?.unmount();
        renderer.cleanup();
        deleteGlobals();
      });
      cleanup = () => {
        void teardown();
      };
    });
    return () => {
      stopped = true;
      if (cleanup) cleanup();
      else teardown();
    };
  });
</script>

<!-- eslint-disable svelte/no-at-html-tags -- Trusted immutable Original/native SSR fixture output. -->
<section bind:this={host}>{@html data.html}</section>
