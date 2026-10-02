<script lang="ts">
  import { onMount } from 'svelte';
  import { mountAccordionReference } from '../../lib/accordion-reference.js';
  let { data } = $props(); let host = $state<HTMLDivElement>();
  onMount(() => host ? mountAccordionReference(host, data.scenario) : undefined);
</script>
<div bind:this={host}></div>
