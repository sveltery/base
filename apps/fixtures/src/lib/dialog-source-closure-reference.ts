// Actual pinned React public counterpart; MIT: parity/dialog/UPSTREAM_LICENSE.
import { createElement as h, useCallback, useRef, useState, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
export function mountDialogSourceClosureReference(target: HTMLElement, keep: boolean) {
  const handle = Dialog.createHandle<number>();
  function Fixture() {
    const [first, setFirst] = useState<HTMLElement | null>(null);
    const [second, setSecond] = useState<HTMLElement | null>(null);
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const [visible, setVisible] = useState(true);
    const [id, setId] = useState<string | undefined>('closure-portal');
    const [portal, setPortal] = useState<HTMLElement | null>(null);
    const [viewport, setViewport] = useState<HTMLElement | null>(null);
    const [completed, setCompleted] = useState<boolean[]>([]);
    const actions = useRef<Dialog.Root.Actions | null>(null);
    const firstRef = useCallback((node: HTMLElement | null) => { setFirst(node); setContainer(node); }, []);
    function command(value: string) {
      if (value === 'second') setContainer(second);
      if (value === 'id') setId('closure-renamed');
      if (value === 'clear-id') setId(undefined);
      if (value === 'unmount') actions.current?.unmount();
      if (value === 'remove') setVisible(false);
    }
    const pane = ({ payload }: { payload: number | undefined }): ReactElement => h(Dialog.Portal, {
      container, keepMounted: keep, ref: setPortal,
      render: props => h('div', { 'data-testid': 'closure-wrapper' }, h('section', { ...props, id, 'data-testid': 'closure-portal' })),
    }, h(Dialog.Viewport, { ref: setViewport, className: state => `viewport${state.open ? ' active' : ''}`, style: state => ({ opacity: Number(state.open), '--open': Number(state.open) }) },
      h(Dialog.Popup, null, h(Dialog.Title, null, 'Source closure'), h(Dialog.Description, null, 'Public parts'),
        h('output', { 'data-testid': 'closure-payload' }, payload), h(Dialog.Close, { id: 'closure-close' }, 'Close closure'))));
    return h('main', { 'data-hydrated': !!first, ref: (node: HTMLElement | null) => { if (node) Object.assign(node, { closureCommand: command, closureRefs: () => ({ portal: !!portal, viewport: !!viewport, actions: !!actions.current }) }); } },
      h('aside', { 'data-testid': 'closure-first', ref: firstRef }),
      h('aside', { 'data-testid': 'closure-second', ref: setSecond }),
      h('output', { 'data-testid': 'closure-refs' }, JSON.stringify({ portal: !!portal, viewport: !!viewport, actions: !!actions.current })),
      h('output', { 'data-testid': 'closure-completed' }, JSON.stringify(completed)),
      visible && h(Dialog.Trigger, { handle, id: 'closure-trigger', payload: 7 }, 'Open closure'),
      visible && h(Dialog.Root<number>, { handle, modal: false, actionsRef: actions, children: pane, onOpenChange: (open, details) => { if (!open) details.preventUnmountOnClose(); }, onOpenChangeComplete: open => setCompleted(value => [...value, open]) }));
  }
  const root = createRoot(target); root.render(h(Fixture));
  return () => root.unmount();
}
