<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/UseRenderSsrFixture.svelte';
  let { data } = $props(); let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/use-render-ssr-reference.js').then(({ hydrateUseRenderReference }) => { if (!stopped) cleanup = hydrateUseRenderReference(node); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<!-- eslint-disable-next-line svelte/no-at-html-tags -- Trusted static React SSR fixture. -->
{#if data.reference}<div bind:this={host}>{@html data.html}</div>{:else}<Fixture/>{/if}
