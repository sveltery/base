<script lang="ts">
  import { getContext, untrack } from 'svelte';
  import { ClosePartContext, type ClosePartContextValue } from '../../src/lib/utils/closePart.svelte.js';

  const closePart = getContext<ClosePartContextValue | undefined>(ClosePartContext);
  $effect(() => untrack(() => closePart?.register()));
</script>

<button type="button">Close-part lifecycle witness</button>
