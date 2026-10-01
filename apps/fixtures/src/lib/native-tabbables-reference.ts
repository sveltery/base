// Supplemental reference against real pinned Base UI v1.8.0 (47b40521).
import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
import { mountNativeTabbables } from './native-tabbables-content.js';
export function mountNativeTabbablesReference(node: HTMLElement, scenario: string) {
  const root = createRoot(node);
  root.render(h('main', { 'data-hydrated': 'true' },
    h(Dialog.Root, null,
      h(Dialog.Trigger, null, 'Open native dialog'),
      h(Dialog.Portal, null, h(Dialog.Popup, null,
        h(Dialog.Title, null, 'Native tab stops'),
        h(Dialog.Close, { id: 'native-close' }, 'Close'),
        h('div', { ref: (node: HTMLDivElement | null) => node ? mountNativeTabbables(node, scenario) : undefined }))))));
  return () => root.unmount();
}
