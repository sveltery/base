<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '$lib/DialogHandleSsrFixture.svelte';
  import { hydrateReference } from '$lib/dialog-handle-hydration-reference.js';
  let { data }: { data: { reference: boolean; html: string } } = $props();
  let host = $state<HTMLElement>(null!);
  let hydrated = $state(false);
  onMount(() => { hydrated = true; if (data.reference) return hydrateReference(host); });
</script>
{#if data.reference}
  <main bind:this={host} data-hydrated={hydrated}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- Exact trusted React SSR fixture markup, with no user content. -->
    {@html data.html}
  </main>
{:else}<Fixture/>{/if}
