<script lang="ts">
  import { untrack } from 'svelte';
  import { getToastManager } from '../../src/lib/toast/getToastManager.js';
  import { provider } from '../../src/lib/toast/context.js';
  import type { ToastStore } from '../../src/lib/toast/store.js';
  let { onStore }: { onStore?: (store: ToastStore) => void } = $props();
  const { add } = getToastManager();
  const { store } = provider();
  untrack(() => onStore?.(store));
</script>
<button type="button" data-window-focused={store.state.isWindowFocused} onclick={() => add({ title: 'title', description: 'description', actionProps: { id: 'action', children: 'action' } })}>add</button>
