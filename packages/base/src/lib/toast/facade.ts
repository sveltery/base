import type { ToastManagerFacade } from './types.js';
import type { ToastStore } from './store.js';

/** Internal factory for the future context accessor; no component context is created here. */
export function createToastFacade<Data extends object>(store: ToastStore): ToastManagerFacade<Data> {
  return {
    get toasts() { return store.getSnapshot().toasts; },
    add: store.addToast,
    update: store.updateToast,
    close: store.closeToast,
    promise: store.promiseToast,
  };
}
