<script lang="ts">
  import type { SvelteStore } from '@sveltery/utils/store';
  let {
    store,
    initialValue,
    cleanup,
  }: {
    store: SvelteStore<{ value: number | undefined }, undefined, Record<string, never>>;
    initialValue: number;
    cleanup: boolean;
  } = $props();
  let value = $state.raw({ current: initialValue });
  if (cleanup) store.useSyncedValueWithCleanup('value', () => value.current);
  else store.useSyncedValue('value', () => value.current);
  export const updateValue = (next: number) => {
    value = { current: next };
  };
</script>

<output>Store synchronization owner</output>
