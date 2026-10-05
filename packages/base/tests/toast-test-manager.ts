// Test fixture routing from pinned ToastProvider; MIT: parity/toast/UPSTREAM_LICENSE.
// Runtime Provider owns this subscription in its native effect; this helper mounts no component.
import type { ToastManager } from '../src/lib/toast/createToastManager';
import type { ToastStore } from '../src/lib/toast/store';

export function subscribeToManager(store: ToastStore, manager: ToastManager) {
  return manager[' subscribe'](({ action, options }) => {
    const id = options.id;
    if (action === 'promise' && options.promise) store.promiseToast(options.promise, options);
    else if (action === 'update' && id) store.updateToast(id, options.updates);
    else if (action === 'close') store.closeToast(id);
    else store.addToast(options);
  });
}
