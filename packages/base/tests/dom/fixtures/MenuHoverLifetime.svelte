<!-- Authored actual Source/native regression; zero Original declaration credit. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { useHoverInteractionSharedState } from '../../../src/lib/floating-ui/hooks/useHoverInteractionSharedState.svelte.js';
  import type { FloatingRootStore } from '../../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
  let { first }: { first: FloatingRootStore } = $props();
  let store = $state.raw(untrack(() => first));
  const getInteraction = useHoverInteractionSharedState(() => store);
  export function change(next: FloatingRootStore) { store = next; }
  export function current() { return getInteraction(); }
</script>
