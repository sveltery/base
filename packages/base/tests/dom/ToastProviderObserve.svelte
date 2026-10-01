<script lang="ts">
  import { provider } from '../../src/lib/toast/context.js';
  let { active = false, observe }: {
    active?: boolean;
    observe?: (toasts: { id: string; limited?: boolean }[]) => void;
  } = $props();
  const { store } = provider();
  $effect.pre(() => {
    if (active) observe?.(store.state.toasts.map((toast) => ({ id: toast.id, limited: toast.limited })));
  });
</script>
