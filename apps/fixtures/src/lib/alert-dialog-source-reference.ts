// Actual Base UI 1.8.0 counterpart of immutable AlertDialogRoot.test.tsx topologies (MIT).
import { createElement as h, Fragment, StrictMode, useRef, useState, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { AlertDialog } from '../../node_modules/@base-ui/react/alert-dialog/index.mjs';
import { useDialogRootContext } from '../../node_modules/@base-ui/react/dialog/root/DialogRootContext.mjs';

// Internal context is loaded through the actual package's supported source alias in the fixture.
function State() {
  const store = useDialogRootContext();
  return h('div', { 'data-testid': 'alert-dialog-state', 'data-modal': String(store.useState('modal')), 'data-disable-pointer-dismissal': String(store.useState('disablePointerDismissal')), 'data-role': store.useState('role') });
}
function Wrappers({ handle, nesting }: { handle: AlertDialog.Handle<number>; nesting: number }): ReactElement {
  return nesting > 0 ? h('div', null, h(Wrappers, { handle, nesting: nesting - 1 })) : h(AlertDialog.Trigger, { handle }, 'Trigger');
}

export function mountAlertDialogSourceReference(target: HTMLElement, line: number) {
  const animation = [1094, 1177].includes(line);
  (globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED: boolean }).BASE_UI_ANIMATIONS_DISABLED = !animation;
  function Fixture() {
    const [first] = useState(() => AlertDialog.createHandle<number>());
    const [current, setCurrent] = useState(first);
    const [mounted, setMounted] = useState(true);
    const [nesting, setNesting] = useState(line === 726 ? 0 : 3);
    const defaultOpen = [32, 78, 97, 121, 196, 216, 366, 1047].includes(line);
    const controlled = [57, 236, 1064, 1094, 1147, 1177, 11].includes(line);
    const [open, setOpen] = useState([57, 1064, 1094].includes(line));
    const withHandle = [78, 97, 236, 600, 649, 708, 726, 744, 777, 795, 833, 868, 902, 931, 965, 1006].includes(line);
    const detached = line === 97 || line >= 600 && line <= 1006;
    const reparent = [708, 726, 777].includes(line);
    const multiple = [57, 436, 469, 497, 795, 833, 965, 1006].includes(line);
    const three = [390, 600].includes(line);
    const noTrigger = [121, 366, 1064, 1094, 1147, 1177, 11].includes(line);
    const actions = useRef<AlertDialog.Root.Actions | null>(null);
    const retained = useRef(true);
    const [changes, setChanges] = useState<{ open: boolean; reason: string; triggerId?: string }[]>([]);
    const [completed, setCompleted] = useState<boolean[]>([]);
    const api = {
      open(id: string | null) { current.open(id); }, payload(value: number) { current.openWithPayload(value); }, close() { current.close(); }, isOpen() { return current.isOpen; },
      unmount() { actions.current?.unmount(); }, exportedClose() { actions.current?.close(); }, exportedUnmount() { actions.current?.unmount(); },
      async owner(value: boolean) { flushSync(() => setOpen(value)); }, async remove() { flushSync(() => setMounted(false)); }, async mount() { flushSync(() => setMounted(true)); },
      async wrappers(value: number, recreate = false) { flushSync(() => { setNesting(value); if (recreate) setCurrent(AlertDialog.createHandle<number>()); }); },
      async recreate() { flushSync(() => setCurrent(AlertDialog.createHandle<number>())); },
      snapshot() { return { changes, completed, actions: !!actions.current, isOpen: current.isOpen }; },
    };
    function triggers() {
      if (noTrigger) return null;
      if (reparent) return h(Wrappers, { handle: current, nesting });
      if (multiple || three) return h(Fragment, null,
        h(AlertDialog.Trigger, { handle: detached ? current : undefined, id: 'trigger-1', payload: 1 }, 'Trigger 1'),
        h(AlertDialog.Trigger, { handle: detached ? current : undefined, id: 'trigger-2', payload: 2 }, 'Trigger 2'),
        three ? h(AlertDialog.Trigger, { handle: detached ? current : undefined, id: 'trigger-3' }, 'Trigger 3') : null);
      return h(AlertDialog.Trigger, { handle: detached ? current : undefined, id: 'trigger', ...{ 'data-testid': 'trigger' } }, line === 649 ? 'Trigger' : 'Open');
    }
    function popup(payload: number | undefined) {
      return h(AlertDialog.Popup, { ...(line === 10 ? { id: 'TestId' } : {}), ...{ 'data-testid': 'popup' }, className: line === 1094 ? 'alert-exit' : line === 1177 ? 'alert-enter' : undefined },
        line === 32 ? h(Fragment, null, h(AlertDialog.Title, null, 'title text'), h(AlertDialog.Description, null, 'description text')) : null,
        line === 236 ? h(AlertDialog.Title, null, 'Confirm') : null,
        [436, 795, 965, 1006].includes(line) ? h('span', { 'data-testid': 'content' }, payload)
          : [469, 833].includes(line) ? h('span', null, payload)
            : h('span', { 'data-testid': 'content' }, line === 868 || line === 931 ? 'Content' : multiple || three || detached ? 'Alert dialog content' : 'Dialog'),
        line === 649 ? h('button', { type: 'button', onClick: () => setMounted(false) }, 'Unmount root') : null,
        ![469, 497, 833, 868, 965, 1006].includes(line) ? h(AlertDialog.Close, null, line === 236 ? 'Cancel' : 'Close') : null);
    }
    return h('main', { 'data-hydrated': 'true', ref: (node: HTMLElement | null) => { if (node) Object.assign(node, { alertApi: api }); } },
      h('style', null, '@keyframes alert-out{to{opacity:0}}@keyframes alert-in{from{opacity:0}}.alert-exit[data-ending-style]{animation:alert-out 1ms}.alert-enter[data-starting-style]{animation:alert-in 1ms}'),
      detached ? triggers() : null,
      !mounted ? h('button', { type: 'button', onClick: () => setMounted(true) }, 'Remount root') : null,
      [1064, 1094].includes(line) ? h('button', { type: 'button', onClick: () => setOpen(false) }, 'Close') : null,
      [1147, 1177].includes(line) ? h('button', { type: 'button', onClick: () => setOpen(true) }, 'Open') : null,
      mounted ? h(AlertDialog.Root<number>, { handle: withHandle ? current : undefined, defaultOpen, open: controlled ? open : undefined, triggerId: line === 57 ? 'trigger-2' : undefined,
        defaultTriggerId: [78, 97].includes(line) ? 'trigger' : undefined, actionsRef: actions,
        onOpenChange(value, details) { setChanges(calls => [...calls, { open: value, reason: details.reason, ...(details.trigger?.id ? { triggerId: details.trigger.id } : {}) }]); if (line === 236 && value) setOpen(true); if ([281, 320].includes(line) && !value && retained.current) { details.preventUnmountOnClose(); if (line === 320) retained.current = false; } },
        onOpenChangeComplete(value) { setCompleted(calls => [...calls, value]); },
        children: ({ payload }: { payload: number | undefined }) => h(Fragment, null, !detached ? triggers() : null, line === 868 ? h(State) : null,
          h(AlertDialog.Portal, null, line === 32 ? h(AlertDialog.Backdrop) : null, line === 121 ? h(AlertDialog.Viewport, { id: 'alert-viewport', ...{ 'data-testid': 'viewport' } }, popup(payload)) : popup(payload))),
      }) : null,
      h('output', { 'data-testid': 'changes' }, JSON.stringify(changes)), h('output', { 'data-testid': 'completed' }, JSON.stringify(completed)));
  }
  // Source createRenderer uses actual StrictMode/strictEffects by default.
  const root = createRoot(target); root.render(h(StrictMode, null, h(Fixture)));
  return () => root.unmount();
}
