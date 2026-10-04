<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '$lib/AlertDialogSsrFixture.svelte';
  import { hydrateAlertReference } from '$lib/alert-dialog-hydration-reference.js';
  let { data } = $props();
  let host = $state<HTMLElement>(null!);
  let hydrated = $state(false);
  onMount(() => { hydrated = true; if (data.reference) return hydrateAlertReference(host); });
</script>
{#if data.reference}<main bind:this={host} data-hydrated={hydrated}>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- Exact trusted actual React server fixture; no user content. -->
  {@html data.html}
</main>{:else}<Fixture/>{/if}
