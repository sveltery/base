<!-- Native production tree/node context fixture; no substitute event emitter. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    provideFloatingNode,
    provideFloatingTree,
  } from '../../src/lib/floating-ui/components/FloatingTree.svelte.js';
  import type { FloatingTreeStore } from '../../src/lib/floating-ui/components/FloatingTreeStore.js';

  let {
    tree,
    parentNodeId,
    children,
  }: { tree: FloatingTreeStore; parentNodeId: string; children: Snippet } = $props();
  provideFloatingTree(tree);
  provideFloatingNode(() => parentNodeId);
</script>

{@render children()}
