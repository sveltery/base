<script lang="ts">
  // Original Content FloatingNode provider boundary, native Svelte context (MIT).
  import type { Snippet } from 'svelte';
  import { provideFloatingNode } from '../../floating-ui/components/FloatingTree.svelte.js';
  let { nodeId, children }: { nodeId: string | undefined; children?: Snippet } = $props();
  provideFloatingNode(() => nodeId);
</script>

{@render children?.()}
