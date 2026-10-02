<script lang="ts">
  import { onMount } from 'svelte';
  import CollapsibleFixture from '../../lib/CollapsibleFixture.svelte';
  let { data } = $props();
  let target: HTMLElement | undefined = $state();
  onMount(() => {
    if (!data.reference || !target) return;
    const element = target;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/collapsible-hydration-reference.js').then(module => {
      if (!disposed) cleanup = module.hydrateCollapsibleReference(element, data.scenario);
    });
    return () => { disposed = true; cleanup?.(); };
  });
</script>
<!-- eslint-disable svelte/no-at-html-tags -- Rendered exact-pin React fixture markup contains no external content. -->
{#if data.reference}<main bind:this={target} data-hydrated="false">{@html data.html}</main>{:else}<CollapsibleFixture scenario={data.scenario} />{/if}
