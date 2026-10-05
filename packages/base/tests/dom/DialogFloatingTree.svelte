<script lang="ts">
  import { untrack } from 'svelte';
  import { provideFloatingTree } from '../../src/lib/floating-ui/components/FloatingTree.svelte.js';
  import type { FloatingTreeStore } from '../../src/lib/floating-ui/components/FloatingTreeStore.js';
  import Node from './DialogFloatingNode.svelte';
  let { tree }: { tree: FloatingTreeStore } = $props();
  provideFloatingTree(untrack(() => tree));
  let child = $state(true);
  export function removeChild() { child = false; }
</script>
<Node id="parent">{#if child}<Node id="child"/>{/if}</Node>
