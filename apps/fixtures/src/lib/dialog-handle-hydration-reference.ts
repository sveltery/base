// D:19 exact pinned topology. MIT: parity/dialog/UPSTREAM_LICENSE.
import { createElement as h } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
export function hydrationTree() {
  const handle = Dialog.createHandle();
  const children = h('div', null, h(Dialog.Root, { handle, defaultOpen: true, defaultTriggerId: 'trigger' }), h(Dialog.Trigger, { handle, id: 'trigger' }, 'Trigger'));
  return { handle, children };
}
export function hydrateReference(node: HTMLElement) {
  const { children } = hydrationTree(); const root = hydrateRoot(node, children);
  return () => root.unmount();
}
