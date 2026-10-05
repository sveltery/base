<script lang="ts">
  // Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { onDestroy, untrack } from 'svelte';
  import { setProviderContext, type ToastProviderContext } from './context.js';
  import { createToastFacade } from './facade.js';
  import { ToastStore } from './store.js';
  import type { ToastProviderProps } from './types.js';

  let { children, timeout = 5000, limit = 3, toastManager }: ToastProviderProps = $props();
  const store = untrack(() => new ToastStore({
    timeout,
    limit,
    viewport: null,
    toasts: [],
    hovering: false,
    focused: false,
    isWindowFocused: true,
    prevFocusElement: null,
  }));
  const context: ToastProviderContext = { store, manager: createToastFacade(store) };
  setProviderContext(context);

  // Committed inputs synchronize before descendants' pre/mount effects run.
  // Reading the store while synchronizing must not subscribe this effect to it.
  $effect.pre(() => {
    const nextTimeout = timeout;
    const nextLimit = limit;
    untrack(() => store.syncProviderProps(nextTimeout, nextLimit));
  });
  $effect(() => {
    const manager = toastManager;
    if (!manager) return;
    return manager[' subscribe'](({ action, options }) => {
      const id = options.id;
      if (action === 'promise' && options.promise) {
        store.promiseToast(options.promise, options);
      } else if (action === 'update' && id) {
        store.updateToast(id, options.updates);
      } else if (action === 'close') {
        store.closeToast(id);
      } else {
        store.addToast(options);
      }
    });
  });
  onDestroy(store.dispose);
</script>

{@render children?.()}
