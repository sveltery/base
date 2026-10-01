// Actual pinned React counterparts, source-derived supplements. MIT: parity/dialog/UPSTREAM_LICENSE.
import { createElement as h, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
export function mountRegressionReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const [visible, setVisible] = useState(true);
    const [owner, setOwner] = useState(false);
    const [container, setContainer] = useState<ShadowRoot | null>(null);
    const [calls, setCalls] = useState<{ open: boolean; canceled: boolean; trigger: string | null }[]>([]);
    const [completed, setCompleted] = useState<boolean[]>([]);
    const actions = useRef<Dialog.Root.Actions>(null);
    const cancelNext = useRef(true);
    const retained = useRef<Dialog.Root.ChangeEventDetails | null>(null);
    return h('main', { 'data-hydrated': 'true', ref: node => {
      if (!node) return;
      const host = node as HTMLElement & { regressionCommand?: (command: string) => void };
      host.regressionCommand = command => {
        if (command === 'close') actions.current?.close();
        else if (command === 'unmount') actions.current?.unmount();
        else if (command === 'remove') setVisible(false);
        else if (command === 'late-defer') retained.current?.preventUnmountOnClose();
      };
      return () => { delete host.regressionCommand; };
    } }, h('button', { id: 'before' }, 'Before'),
    h(Dialog.Root, { modal: false, open: scenario === 'controlled' ? owner : undefined, actionsRef: actions, onOpenChange(open, details) {
      if (!open && (scenario === 'cancel' || scenario === 'controlled') && cancelNext.current) {
        details.preventUnmountOnClose(); details.cancel(); cancelNext.current = false; retained.current = details;
      } else if (!open && scenario === 'defer') details.preventUnmountOnClose();
      setCalls(previous => [...previous, { open, canceled: details.isCanceled, trigger: details.trigger?.id ?? null }]);
      if (!details.isCanceled) setOwner(open);
    }, onOpenChangeComplete: open => setCompleted(previous => [...previous, open]) },
    h(Dialog.Trigger, { id: 'regression-trigger' }, 'Open'),
    visible ? h(Dialog.Portal, { container: scenario.startsWith('shadow') ? container : undefined, keepMounted: scenario === 'shadow-keep' },
      h(Dialog.Popup, { initialFocus: scenario === 'shadow-entry' || scenario === 'shadow-keep' ? false : undefined, style: { position: 'relative', zIndex: 1 } },
        scenario === 'disabled' || scenario === 'enabled' ? h(Dialog.Close, { nativeButton: false, disabled: scenario === 'disabled', render: h('a', { href: '#activated' }) }, 'Link close') :
        scenario.startsWith('shadow') ? h('div', { id: 'content-host', ref: node => {
          if (node && !node.shadowRoot) node.attachShadow({ mode: 'open' }).innerHTML = '<button id="first">First</button><slot></slot>';
        } }, h('button', { id: 'last', tabIndex: 0 }, 'Last')) : h(Dialog.Close, null, 'Close'))) : null),
    h('button', { id: 'after' }, 'After'),
    h('div', { id: 'portal-host', ref: node => { if (node && !node.shadowRoot) setContainer(node.attachShadow({ mode: 'open' })); } }),
    h('button', { id: 'end' }, 'End'),
    h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)), h('output', { 'data-testid': 'completed' }, JSON.stringify(completed)));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
