<script lang="ts">
  import { untrack } from 'svelte';
  import { Root, Content, Title, Description, Close, Viewport } from '../../src/lib/toast/index.js';
  import { provider, type ToastProviderContext } from '../../src/lib/toast/context.js';
  let { capture, indexKeys }: { capture: (context: ToastProviderContext) => void; indexKeys: boolean } = $props();
  const context = provider();
  untrack(() => capture(context));
</script>
<Viewport>
  {#each context.manager.toasts as toast, index (indexKeys ? index : toast.id)}
    <Root {toast} swipeDirection={[]} data-toast={toast.id}>
      <Content><Title/><Description/><Close>Close</Close></Content>
    </Root>
  {/each}
</Viewport>
