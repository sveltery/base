<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import {
    provideFloatingNode,
    useFloatingNodeId,
  } from '../../src/lib/floating-ui/components/FloatingTree.svelte.js';
  let { id, children }: { id: string; children?: Snippet } = $props();
  // Native generated ids are supplied at setup; provider ownership remains separate from registration.
  const nodeId = useFloatingNodeId(untrack(() => id));
  provideFloatingNode(() => nodeId);
</script>

{@render children?.()}
