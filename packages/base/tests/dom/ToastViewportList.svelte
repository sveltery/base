<script lang="ts">
  // List/Button topology adapted from pinned toast/utils/test-utils.tsx; MIT.
  import { getToastManager } from '../../src/lib/toast/getToastManager.js';
  import Root from '../../src/lib/toast/Root.svelte';
  import Title from '../../src/lib/toast/Title.svelte';
  import Description from '../../src/lib/toast/Description.svelte';
  import Close from '../../src/lib/toast/Close.svelte';
  import Action from '../../src/lib/toast/Action.svelte';
  let { indexKeys = false }: { indexKeys?: boolean } = $props();
  const manager = getToastManager();
</script>

{#each manager.toasts as toast, index (indexKeys ? index : toast.id)}
  <Root {toast} swipeDirection={[]} data-testid="root">
    <Title data-testid="title" />
    <Description data-testid="description" />
    <Close aria-label="close-press" />
    <Action data-testid="action" />
  </Root>
{/each}
