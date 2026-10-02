<script lang="ts">
  import { onMount } from 'svelte';
  import { mountCollapsibleReference } from '../../lib/collapsible-reference.js';
  let { data } = $props(); let host = $state<HTMLDivElement>();
  onMount(() => host ? mountCollapsibleReference(host, data.scenario) : undefined);
</script>
<div bind:this={host}></div>
