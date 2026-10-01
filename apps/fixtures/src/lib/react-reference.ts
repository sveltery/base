import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
/** Exact pinned runtime, not a substitute implementation. Shared contained-first probes only. */
export function mountReference(node: HTMLElement, params: URLSearchParams) {
  function Fixture() {
    const [open, setOpen] = useState(params.has('initial'));
    const [log, setLog] = useState<object[]>([]);
    const modal = params.get('modal') === 'false' ? false : params.get('modal') === 'trap-focus' ? 'trap-focus' : true;
    return h('main', { 'data-hydrated': 'true' },
      h('input', { 'aria-label': 'before' }),
      h('button', { onClick: () => setOpen(v => !v) }, 'Owner toggle'),
      h(Dialog.Root, { open: params.get('mode') === 'held' ? open : undefined, defaultOpen: params.has('initial'), modal,
        onOpenChange(next, details) { setLog(l => [...l, { channel: 'consumer', open: next, reason: details.reason, trigger: details.trigger?.id, event: details.event.type }]); if (params.get('cancel') === (next ? 'open' : 'close')) details.cancel(); },
      },
      h(Dialog.Trigger, { id: 'trigger' }, 'Open'),
      h(Dialog.Portal, { keepMounted: params.has('keep') },
        h(Dialog.Backdrop, { ...{ 'data-testid': 'backdrop' }, style: { position: 'fixed', inset: 0 } }),
        h(Dialog.Popup, { ...{ 'data-testid': 'popup' }, style: { position: 'fixed', left: 200, top: 80, width: 300, background: 'white' } },
          h(Dialog.Title, null, 'Dialog title'), h(Dialog.Description, null, 'Dialog description'),
          h('input', { 'aria-label': 'first' }), h('input', { 'aria-label': 'second' }), h(Dialog.Close, null, 'Close')))),
      h('input', { 'aria-label': 'after' }), h('output', { 'data-testid': 'log' }, JSON.stringify(log)));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
