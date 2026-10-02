<script lang="ts">
  import { useDirection } from '../../../../packages/base/src/lib/direction-provider/index.js';
  let { id = 'direction' }: { id?: string } = $props();
  const direction = useDirection();
</script>

<span data-testid={id}>{direction()}</span>
