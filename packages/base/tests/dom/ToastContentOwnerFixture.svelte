<script lang="ts">
  import Content from '../../src/lib/toast/Content.svelte';
  import { setRootContext } from '../../src/lib/toast/root-context.js';
  let { recalculateHeight }: { recalculateHeight: (flush?: boolean) => void } = $props();
  setRootContext({
    toast: { id: 'content-owner' },
    expanded: false,
    visibleIndex: 0,
    setTitleId: () => () => {},
    setDescriptionId: () => () => {},
    get recalculateHeight() {
      return recalculateHeight;
    },
  });
</script>

<Content data-testid="content-owner">Content</Content>
