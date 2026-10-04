// Actual pinned AlertDialog aliases and generic payload SSR/hydration counterpart (MIT).
import { createElement as h } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { AlertDialog } from '@base-ui/react/alert-dialog';
export function alertHydrationTree() {
  const handle = AlertDialog.createHandle<number>();
  return h('div', null, h(AlertDialog.Root<number>, { handle, defaultOpen: true, children: ({ payload }: { payload: number | undefined }) => h('div', null,
    h('output', { 'data-testid': 'ssr-payload' }, payload ?? 'No payload'),
    h(AlertDialog.Portal, null, h(AlertDialog.Backdrop), h(AlertDialog.Viewport, null, h(AlertDialog.Popup, null,
      h(AlertDialog.Title, null, 'Hydrated confirmation'), h(AlertDialog.Description, null, 'SSR anatomy'), h(AlertDialog.Close, null, 'Close hydrated'))))),
  }), h(AlertDialog.Trigger, { handle, payload: 7, ...{ 'data-testid': 'ssr-trigger' } }, 'Hydrated trigger'));
}
export function hydrateAlertReference(target: HTMLElement) {
  const root = hydrateRoot(target, alertHydrationTree()); return () => root.unmount();
}
