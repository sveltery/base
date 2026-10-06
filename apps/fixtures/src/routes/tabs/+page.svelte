<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/TabsBrowserFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if ((!data.reference && !data.scenario.includes('fresh-client')) || !host) return;
    const node = host;
    let disposed = false,
      cleanup: (() => void) | undefined;
    if (data.reference)
      void import('../../lib/tabs-reference.js').then(({ mountTabsReference }) => {
        if (!disposed) cleanup = mountTabsReference(node, data.scenario);
      });
    else
      void import('../../lib/tabs-hydration.js').then(({ mountTabs }) => {
        if (!disposed) cleanup = mountTabs(node, data.scenario);
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference || data.scenario.includes('fresh-client')}<section bind:this={host}
  ></section>{:else}<Fixture scenario={data.scenario} />{/if}

<style>
  :global(.tabs-list) {
    position: relative;
    display: flex;
    width: 400px;
    padding: 4px;
    border: 2px solid transparent;
    gap: 4px;
    overflow: auto;
  }
  :global(.tabs-list[data-orientation='vertical']) {
    flex-direction: column;
    height: 190px;
  }
  :global(.tabs-tab) {
    display: block;
    box-sizing: border-box;
    width: 100px;
    height: 40px;
    padding: 6px;
    border: 0;
    background: #eee;
  }
  :global(.tabs-indicator) {
    position: absolute;
    width: var(--active-tab-width);
    height: var(--active-tab-height);
    left: var(--active-tab-left);
    top: var(--active-tab-top);
    border: 2px solid blue;
    pointer-events: none;
    box-sizing: border-box;
  }
  :global([data-ending-style]) {
    opacity: 0 !important;
  }
</style>
