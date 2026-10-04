// Actual published Base UI1.8.0 caller; physical Original pin47b40521 supplies node business.
import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Popover } from '@base-ui/react/popover';
import { PreviewCard } from '@base-ui/react/preview-card';

export function mountPopupPortalRealmReference(host: HTMLElement, container: HTMLElement, lite: boolean) {
  const root = createRoot(host);
  const child = h('span', { 'data-testid': 'realm-child' }, 'Child');
  flushSync(() => root.render(lite
    ? h(PreviewCard.Root, { defaultOpen: true }, h(PreviewCard.Portal, { container, 'data-testid': 'realm-portal' }, child))
    : h(Popover.Root, { defaultOpen: true }, h(Popover.Portal, { container, 'data-testid': 'realm-portal' }, child))));
  return () => flushSync(() => root.unmount());
}
