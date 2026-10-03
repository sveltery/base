<script lang="ts">
  import { onMount } from 'svelte';
  import { mountRootHandlesReference } from './dialog-root-handles-reference.js';
  import type { RootVariant } from './dialog-root-cases.js';
  let { line, variant }: { line: number; variant: RootVariant } = $props();
  let host = $state<HTMLElement>(null!);
  onMount(() => mountRootHandlesReference(host, line, variant));
</script>
<div bind:this={host}></div>
