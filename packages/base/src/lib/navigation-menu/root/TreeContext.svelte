<script lang="ts">
  // Original separate TreeContext/FloatingNode provider boundary, native Svelte context (MIT).
  import { untrack, type Snippet } from 'svelte';
  import { provideFloatingNode } from '../../floating-ui/components/FloatingTree.svelte.js';
  import { provideNavigationMenuTreeContext } from './NavigationMenuRootContext.js';
  let { nodeId, children }: { nodeId: string | undefined; children?: Snippet } = $props();
  provideNavigationMenuTreeContext(untrack(() => nodeId));
  provideFloatingNode(() => nodeId);
</script>
{@render children?.()}
