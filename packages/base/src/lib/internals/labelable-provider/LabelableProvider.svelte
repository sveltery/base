<script lang="ts">
  // Base UI v1.8.0 LabelableProvider; MIT: THIRD_PARTY_NOTICES.md.
  import type { Snippet } from 'svelte';
  import { useBaseUiId } from '../useBaseUiId.js';
  import { createLabelableProvider } from './createLabelableProvider.svelte.js';
  let { children }: { children?: Snippet } = $props();
  const instanceId = $props.id();
  createLabelableProvider(useBaseUiId(undefined, instanceId));
</script>

{@render children?.()}
