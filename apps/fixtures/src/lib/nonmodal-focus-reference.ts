// Source-derived supplements against Base UI v1.8.0 / 47b40521. MIT; see parity/dialog/UPSTREAM_LICENSE.
import { createElement as h, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
export function mountNonmodalFocusReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const [visible, setVisible] = useState(true);
    const actions = useRef<Dialog.Root.Actions>(null);
    const [requests, setRequests] = useState<{ open: boolean; reason: string; trigger: string | null; type: string; target: string | null; related: string | null }[]>([]);
    return h('main', { 'data-hydrated': 'true', ref: node => {
      if (!node) return;
      const host = node as HTMLElement & { nonmodalCommand?: (command: string) => void };
      host.nonmodalCommand = command => { if (command === 'remove') setVisible(false); else if (command === 'close') actions.current?.close(); };
      return () => { delete host.nonmodalCommand; };
    } },
    h('button', { id: 'before' }, 'Before'),
    h(Dialog.Root, { modal: scenario === 'trap' ? 'trap-focus' : false, disablePointerDismissal: scenario === 'disabled', actionsRef: actions, onOpenChange: (open, details) => {
      const event = details.event as FocusEvent;
      setRequests(previous => [...previous, { open, reason: details.reason, trigger: details.trigger?.id ?? null, type: event.type, target: (event.target as HTMLElement | null)?.id || null, related: (event.relatedTarget as HTMLElement | null)?.id || null }]);
    } },
      h(Dialog.Trigger, { id: 'nonmodal-a' }, 'Trigger A'),
      scenario === 'multiple' ? h(Dialog.Trigger, { id: 'nonmodal-b' }, 'Trigger B') : null,
      visible ? h(Dialog.Portal, { keepMounted: scenario === 'keep' }, h(Dialog.Popup, { initialFocus: scenario === 'entry' ? false : undefined, style: { position: 'relative', zIndex: 1 } },
        h('input', { id: 'first', 'aria-label': 'First', tabIndex: 0 }),
        scenario === 'nested' ? h(Dialog.Root, null, h(Dialog.Trigger, { id: 'child-trigger' }, 'Child'), h(Dialog.Portal, null, h(Dialog.Popup, { style: { position: 'relative', zIndex: 2 } }, h('input', { id: 'child-first', 'aria-label': 'Child first' }), h(Dialog.Close, null, 'Child close')))) : null,
        h('button', { id: 'last', tabIndex: 0 }, 'Last'))) : null),
    scenario !== 'edge' ? h('button', { id: 'after' }, 'After') : null, scenario !== 'edge' ? h('button', { id: 'end' }, 'End') : null,
    h('output', { 'data-testid': 'requests' }, JSON.stringify(requests)));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
