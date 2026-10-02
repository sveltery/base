<script lang="ts">
  import { useDirection } from '../../../../packages/base/src/lib/direction-provider/index.js';
  let { id = 'direction', beforeRead }: { id?: string; beforeRead?: () => void } = $props();
  const direction = useDirection();
  let observed = $state('');
  function readAcrossWrite() {
    const before = direction(); beforeRead?.(); observed = `${before}|${direction()}`;
  }
</script>

<span data-testid={id}>{direction()}</span>
{#if beforeRead}
  <button onclick={readAcrossWrite}>Read across owner write</button>
  <output data-testid="read-observation">{observed}</output>
{/if}
