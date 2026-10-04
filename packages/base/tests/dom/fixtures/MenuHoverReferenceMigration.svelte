<!-- Authored actual Source/native regression; zero Original declaration credit. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { useHoverReferenceInteraction } from '../../../src/lib/floating-ui/hooks/useHoverReferenceInteraction.svelte.js';
  import type { FloatingRootStore } from '../../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
  let { first, second }: { first: FloatingRootStore; second: FloatingRootStore } = $props();
  let store = $state.raw(untrack(() => first));
  const getReferenceProps = useHoverReferenceInteraction(() => store);
  const referenceProps = $derived(getReferenceProps());
  export function change() { store = second; }
</script>
<button id="migrating-hover" {...referenceProps}>Hover</button>
