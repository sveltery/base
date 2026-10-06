<script lang="ts">
  import type { FloatingRootStore } from '../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
  import { useClientPoint } from '../../src/lib/floating-ui/hooks/useClientPoint.svelte.js';
  let { store, enabled = true }: { store: FloatingRootStore; enabled?: boolean } = $props();
  useClientPoint(
    () => store,
    () => ({ enabled }),
  );
  export function setEnabled(value: boolean) {
    enabled = value;
  }
</script>
