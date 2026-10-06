// Supplemental actual pinned Toast.Content witness; MIT: parity/toast/UPSTREAM_LICENSE.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Toast } from '@base-ui/react/toast';
import { ToastRootContext } from '../../node_modules/@base-ui/react/toast/root/ToastRootContext.mjs';

export function mountToastContentOwnerReference(
  target: HTMLElement,
  recalculateHeight: (flush?: boolean) => void,
) {
  const root = createRoot(target);
  flushSync(() =>
    root.render(
      createElement(
        ToastRootContext.Provider,
        {
          value: {
            toast: { id: 'content-owner' },
            visibleIndex: 0,
            expanded: false,
            setTitleId: () => {},
            setDescriptionId: () => {},
            recalculateHeight,
          },
        },
        createElement(Toast.Content, { 'data-testid': 'content-owner' }, 'Content'),
      ),
    ),
  );
  return () => flushSync(() => root.unmount());
}
