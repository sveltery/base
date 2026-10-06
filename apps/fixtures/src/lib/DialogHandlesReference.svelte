<script lang="ts">
  import { onMount } from 'svelte';
  import { mountHandlesReference } from './dialog-handles-reference.js';
  let { line }: { line: number } = $props();
  let host = $state<HTMLElement>(null!);
  onMount(() => mountHandlesReference(host, line));
</script>

<div bind:this={host}></div>
