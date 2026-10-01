<script lang="ts">
  import { getToastManager } from '../../src/lib/toast/getToastManager.js';
  import { provider } from '../../src/lib/toast/context.js';
  const { add } = getToastManager();
  const { store } = provider();
</script>
<button type="button" data-window-focused={store.state.isWindowFocused} onclick={() => add({ title: 'title', description: 'description', actionProps: { id: 'action', children: 'action' } })}>add</button>
