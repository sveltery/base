// Supplemental actual pinned Toast.Root lifetime witness; MIT: parity/toast/UPSTREAM_LICENSE.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Toast } from '@base-ui/react/toast';

export function mountToastRootRefReference(target: HTMLElement) {
  let manager!: ReturnType<typeof Toast.useToastManager>;
  function Contents() {
    manager = Toast.useToastManager();
    return createElement(
      Toast.Viewport,
      null,
      manager.toasts.map((toast) =>
        createElement(
          Toast.Root,
          { key: toast.id, toast, swipeDirection: [], 'data-toast': toast.id },
          createElement(Toast.Title, null, toast.title),
        ),
      ),
    );
  }
  const root = createRoot(target);
  flushSync(() =>
    root.render(createElement(Toast.Provider, { timeout: 0 }, createElement(Contents))),
  );
  return {
    get manager() {
      return manager;
    },
    commit(action: () => void) {
      flushSync(action);
    },
    unmount() {
      flushSync(() => root.unmount());
    },
  };
}
