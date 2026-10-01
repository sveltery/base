<script lang="ts">
  import { untrack } from 'svelte';
  import Provider from '../../src/lib/toast/Provider.svelte';
  import type { ToastManager } from '../../src/lib/toast/createToastManager.js';
  import type { ToastProviderContext } from '../../src/lib/toast/context.js';
  import Add from './ToastProviderAdd.svelte';
  import Observe from './ToastProviderObserve.svelte';
  let { scenario = 'timeout', onClose, observe, capture, manager: initialManager }: {
    scenario?: string;
    onClose?: () => void;
    observe?: (toasts: { id: string; limited?: boolean }[]) => void;
    capture?: (context: ToastProviderContext) => void;
    manager?: ToastManager;
  } = $props();
  let timeout = $state(5000);
  let limit = $state(3);
  let active = $state(false);
  let showChild = $state(true);
  let showProvider = $state(true);
  let manager = $state.raw(untrack(() => initialManager));
  export function configure(options: { timeout?: number; limit?: number; active?: boolean; showChild?: boolean; showProvider?: boolean; manager?: ToastManager }) {
    if (options.timeout !== undefined) timeout = options.timeout;
    if (options.limit !== undefined) limit = options.limit;
    if (options.active !== undefined) active = options.active;
    if (options.showChild !== undefined) showChild = options.showChild;
    if (options.showProvider !== undefined) showProvider = options.showProvider;
    if (Object.hasOwn(options, 'manager')) manager = options.manager;
  }
</script>
{#if showProvider}
  <Provider {timeout} {limit} toastManager={manager}>
    {#if showChild}
      <Add {active} {scenario} {onClose} {capture} />
      <Observe {active} {observe} />
    {/if}
  </Provider>
{/if}
