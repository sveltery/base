<script lang="ts">
  import { getToastManager } from '../../src/lib/toast/getToastManager.js';
  const { add } = getToastManager();
</script>
<button type="button" onclick={() => add({ title: 'title', description: 'description', actionProps: { id: 'action', children: 'action' } })}>add</button>
