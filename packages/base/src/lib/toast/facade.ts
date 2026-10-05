import type { ToastManagerFacade } from './types.js';
import type { ToastStore } from './store.js';

/** Stable public context facade with canonical native selected reads. */
export function createToastFacade<Data extends object>(
  store: ToastStore,
): ToastManagerFacade<Data> {
  return {
    get toasts() {
      return store.useState('toasts');
    },
    add: store.addToast,
    update: store.updateToast,
    close: store.closeToast,
    promise: store.promiseToast,
  };
}
