<script lang="ts">
  // Newly authored witness using the canonical owner; MIT: THIRD_PARTY_NOTICES.md.
  import { useCompositeListItem } from '../../src/lib/internals/composite/list/useCompositeListItem.svelte.js';
  let { id, revision = 0 }: { id: string; revision?: number } = $props();
  const metadata = $derived({ revision });
  const item = new useCompositeListItem(() => ({ label: id, metadata }));
</script>

<div data-testid={id} {@attach item.attach}>{id}</div>
