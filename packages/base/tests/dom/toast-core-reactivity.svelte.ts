import { flushSync } from 'svelte';
import { createToastFacade } from '../../src/lib/toast/facade';
import type { ToastStore } from '../../src/lib/toast/store';

// Exercises Svelte's external subscription integration without rendering a Toast part.
export function observeCore(store: ToastStore, observe: (titles: string[]) => void) {
  const facade = createToastFacade(store);
  const cleanup = $effect.root(() => {
    $effect(() => {
      observe(facade.toasts.map((toast) => String(toast.title)));
    });
  });
  flushSync();
  return cleanup;
}
