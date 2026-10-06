<script lang="ts">
  import { onMount } from 'svelte';
  import AccordionFixture from '../../lib/AccordionFixture.svelte';
  let { data } = $props();
  let target = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !target) return;
    const element = target;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/accordion-hydration-reference.js').then((module) => {
      if (!disposed) cleanup = module.hydrateAccordionReference(element, data.scenario);
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  });
</script>

<!-- eslint-disable svelte/no-at-html-tags -- Rendered pinned React fixture markup contains no external content. -->
{#if data.reference}<main bind:this={target} data-hydrated="false">{@html data.html}</main
  >{:else}<AccordionFixture scenario={data.scenario} />{/if}
