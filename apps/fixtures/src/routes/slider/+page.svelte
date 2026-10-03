<script lang="ts">
  import { onMount } from "svelte";
  import Fixture from "../../lib/SliderBrowserFixture.svelte";
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if ((!data.reference && !data.scenario.includes("fresh-client")) || !host)
      return;
    const node = host;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    if (!data.reference) {
      void import("../../lib/slider-hydration.js").then(({ mountSlider }) => {
        if (!disposed) cleanup = mountSlider(node, data.scenario);
      });
      return () => {
        disposed = true;
        cleanup?.();
      };
    }
    void import("../../lib/slider-reference.js").then(
      ({ mountSliderReference }) => {
        if (!disposed) cleanup = mountSliderReference(node, data.scenario);
      },
    );
    return () => {
      disposed = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference || data.scenario.includes("fresh-client")}<section
    bind:this={host}
  ></section>{:else}<Fixture scenario={data.scenario} />{/if}

<style>
  :global(#slider-control) {
    position: relative;
    touch-action: none;
    margin: 30px;
  }
  :global(#slider-control.horizontal) {
    width: 300px;
    height: 20px;
  }
  :global(#slider-control.vertical) {
    width: 20px;
    height: 300px;
  }
  :global(#slider-track) {
    width: 100%;
    height: 100%;
    background: #ddd;
  }
  :global(#slider-indicator) {
    background: #88f;
  }
  :global([data-testid^="thumb-"]) {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: blue;
  }
</style>
