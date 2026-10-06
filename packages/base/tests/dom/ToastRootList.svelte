<script lang="ts">
  import { untrack } from 'svelte';
  import { Root, Content, Title, Description, Close, Viewport } from '../../src/lib/toast/index.js';
  import { provider, type ToastProviderContext } from '../../src/lib/toast/context.js';
  let {
    capture,
    indexKeys,
    showRoots,
    withContent,
  }: {
    capture: (context: ToastProviderContext) => void;
    indexKeys: boolean;
    showRoots: boolean;
    withContent: boolean;
  } = $props();
  const context = provider();
  untrack(() => capture(context));
</script>

<Viewport>
  {#if showRoots}
    {#each context.manager.toasts as toast, index (indexKeys ? index : toast.id)}
      <Root {toast} swipeDirection={[]} data-toast={toast.id}>
        {#if withContent}<Content><Title /><Description /><Close>Close</Close></Content>
        {:else}<Title /><Description /><Close>Close</Close>{/if}
      </Root>
    {/each}
  {/if}
</Viewport>
