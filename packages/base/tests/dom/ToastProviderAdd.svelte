<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { getToastManager } from '../../src/lib/toast/getToastManager.js';
  import { provider, type ToastProviderContext } from '../../src/lib/toast/context.js';
  let { active = false, scenario = 'timeout', onClose, capture }: {
    active?: boolean;
    scenario?: string;
    onClose?: () => void;
    capture?: (context: ToastProviderContext) => void;
  } = $props();
  const manager = getToastManager();
  const context = provider();
  untrack(() => capture?.(context));
  onMount(() => {
    if (active && scenario === 'mount') manager.add({ id: 'toast', title: 'Toast', onClose });
  });
  $effect.pre(() => {
    if (!active || scenario === 'mount') return;
    const currentScenario = scenario;
    const currentOnClose = onClose;
    untrack(() => {
      if (currentScenario === 'limit') {
        manager.add({ id: 'first', title: 'First', timeout: 0 });
        manager.add({ id: 'second', title: 'Second', timeout: 0 });
      } else {
        manager.add({ id: 'toast', title: 'Toast', onClose: currentOnClose });
      }
    });
  });
</script>
<output data-testid="titles">{manager.toasts.map((toast) => toast.title).join(',')}</output>
