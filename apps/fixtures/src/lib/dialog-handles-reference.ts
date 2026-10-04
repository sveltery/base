// Real @base-ui/react1.8.0 complete portable D topology adapters, not a substitute implementation.
// Immutable47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: parity/dialog/UPSTREAM_LICENSE.
import { createElement as h, Fragment, StrictMode, memo, useLayoutEffect, useState, type ReactElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
import { containedCases, overlapCases, reparentCases, noTriggerCases, generatedTriggerCases, type HandleFixtureApi, type Payload } from './dialog-handle-cases.js';
type Handle = Dialog.Handle<Payload>;
function MountAction({ handle, action, id = null }: { handle: Handle; action: 'open' | 'payload' | 'close'; id?: string | null }) {
  useLayoutEffect(() => { if (action === 'payload') handle.openWithPayload(8); else if (action === 'close') handle.close(); else handle.open(id); }, [handle, action, id]);
  return null;
}
function Wrappers({ handle, nesting, id }: { handle: Handle; nesting: number; id?: string }) {
  let trigger: ReactElement = h(Dialog.Trigger, { handle, id }, 'Trigger');
  for (let level = 0; level < nesting; level++) trigger = h('div', null, trigger);
  return trigger;
}
function AccessorTriggers({ handle }: { handle: Handle }) {
  const [payloads, setPayloads] = useState([1,2]);
  return h('div', null, h(Dialog.Trigger, { handle, id: 'trigger-1', payload: () => payloads[0] }, 'Dialog 1'),
    h(Dialog.Trigger, { handle, id: 'trigger-2', payload: () => payloads[1] }, 'Dialog 2'), h('button', { type: 'button', onClick: () => setPayloads([8,16]) }, 'Update payloads'));
}
const PersistentTrigger = memo(({ handle }: { handle: Handle }) => h(Dialog.Trigger, { handle, id: 'trigger' }, 'Trigger'));
function RouteRoot({ handle }: { handle: Handle }) {
  const [mounted, setMounted] = useState(true);
  return mounted ? h(Dialog.Root, { handle }, h(Dialog.Portal, null, h(Dialog.Popup, null, 'Dialog Content', h('button', { type: 'button', onClick: () => setMounted(false) }, 'Unmount root'))))
    : h('button', { type: 'button', onClick: () => setMounted(true) }, 'Remount root');
}

export function mountHandlesReference(node: HTMLElement, line: number) {
  (globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED: boolean }).BASE_UI_ANIMATIONS_DISABLED = true;
  function App() {
    const [handleA] = useState(() => Dialog.createHandle<Payload>()); const [handleB] = useState(() => Dialog.createHandle<Payload>());
    const [current, setCurrent] = useState(handleA); const [ready, setReady] = useState(line !== 186); const [mounted, setMounted] = useState(true);
    const [attached, setAttached] = useState(line !== 549); const [dirty, setDirty] = useState(line === 412);
    const [phase, setPhase] = useState<'outgoing' | 'overlap' | 'incoming'>(line === 845 ? 'overlap' : 'outgoing');
    const [nesting, setNesting] = useState([1664,1682,1711].includes(line) ? 0 : 3);
    const [mode, setMode] = useState<'uncontrolled' | 'controlled'>(line === 1518 ? 'controlled' : 'uncontrolled');
    const [open, setOpen] = useState([1078,1711].includes(line));
    const [triggerId, setTriggerId] = useState<string | null>(line === 1078 ? 'trigger-2' : line === 1711 ? 'trigger' : null);
    const [payloads, setPayloads] = useState([1,2]);
    const contained = containedCases.includes(line); const overlap = overlapCases.includes(line); const reparent = reparentCases.includes(line);
    const controlled = [1078,1100,1711].includes(line) || mode === 'controlled';
    const rootHandle = contained ? undefined : attached ? current : undefined;
    const handle = (which?: 'A' | 'B') => which === 'A' ? handleA : which === 'B' ? handleB : current;
    const api: HandleFixtureApi = {
      open(id, which) { handle(which).open(id); }, payload(value, which) { handle(which).openWithPayload(value); }, close(which) { handle(which).close(); }, isOpen(which) { return handle(which).isOpen; },
      async phase(value) { flushSync(() => setPhase(value)); }, async wrappers(value, recreate = false) { flushSync(() => { setNesting(value); if (recreate) setCurrent(Dialog.createHandle<Payload>()); }); },
      async recreate() { flushSync(() => setCurrent(Dialog.createHandle<Payload>())); }, async mount() { flushSync(() => { setReady(true); setMounted(true); }); }, warnings: [],
    };
    function remount() { if (line === 1518) setMode('uncontrolled'); if (line === 1579) setMode('controlled'); setMounted(true); }
    function triggers() {
      if (reparent) return h(Wrappers, { handle: current, nesting, id: line === 1711 ? 'trigger' : undefined });
      if (line === 1835) return h(AccessorTriggers, { handle: current });
      if (noTriggerCases.includes(line)) return null;
      return h(Fragment, null,
        line === 641 ? h(Dialog.Trigger, { handle: current, id: 'other', payload: 9 }, 'Other') : null,
        line === 2028 ? h(Dialog.Trigger, { handle: handleA, id: 'a', payload: 1 }, 'A trigger')
          : h(Dialog.Trigger, { handle: contained ? undefined : current,
            id: generatedTriggerCases.includes(line) ? undefined : line === 2088 || line === 2129 ? 'trigger1' : [1078,1100,1157,1323].includes(line) ? 'trigger-1' : 'trigger',
            payload: line === 641 ? 5 : line === 1955 ? 7 : [186,249,412,987,1020,1100,1157,1764,1802,2088,2129].includes(line) ? payloads[0] : undefined,
          }, line === 1157 ? 'Dialog 1' : [939,987,1020,1048,1078,1274,1323,1764,1802,1891,2088,2129].includes(line) ? 'Trigger 1' : line === 1100 ? 'One' : 'Trigger'),
        [939,987,1020,1048,1078,1100,1157,1274,1323,1764,1802,1891,2088,2129].includes(line) ? h(Dialog.Trigger, { handle: contained ? undefined : current, id: generatedTriggerCases.includes(line) ? undefined : line === 2088 || line === 2129 ? 'trigger2' : 'trigger-2', payload: [939,1048,1078,1274,1323,1891].includes(line) ? undefined : payloads[1] }, line === 1157 ? 'Dialog 2' : line === 1100 ? 'Two' : 'Trigger 2') : null,
        line === 939 || line === 1274 ? h(Dialog.Trigger, { handle: contained ? undefined : current }, 'Trigger 3') : null);
    }
    function content(payload: Payload | undefined) {
      const value = typeof payload === 'function' ? payload() : payload;
      if ([99,126,159].includes(line)) return line === 126 ? h('span', { 'data-testid': 'payload' }, value ?? 'No payload') : null;
      return h(Fragment, null,
        [186,249,412,641,1389,1955].includes(line) ? h('span', { 'data-testid': 'payload' }, value ?? 'No payload') : null,
        h(Dialog.Portal, null, h(Dialog.Popup, { children: undefined, ...{ 'data-testid': line === 1921 || line === 2088 || line === 2129 ? 'content' : 'dialog-popup' } },
          [987,1100,1157,1764,1835].includes(line) ? h('span', { 'data-testid': 'content' }, typeof payload === 'function' ? payload() : payload)
            : line === 2088 || line === 2129 ? typeof payload === 'function' ? payload() : payload : line === 1921 ? 'Content' : 'Dialog Content',
          line === 1020 || line === 1802 ? h('span', null, typeof payload === 'function' ? payload() : payload) : null,
          [249,1323,1389,1518,1955].includes(line) ? h('button', { type: 'button', onClick: () => setMounted(false) }, 'Unmount root') : null,
          line === 1157 ? h('button', { type: 'button', onClick: () => setPayloads([8,16]) }, 'Update payloads') : null,
          [939,987,1100,1274,1646,1664,1682,1746,1764].includes(line) ? h(Dialog.Close, null, 'Close') : null)));
    }
    const rootContent = overlap ? h(Fragment, null,
      phase === 'outgoing' || phase === 'overlap' ? h(Dialog.Root, { key: 'outgoing', handle: current, modal: line === 871 ? false : true }, h(Dialog.Portal, null, h(Dialog.Popup, null, line === 845 ? 'First' : 'Outgoing'))) : null,
      phase === 'overlap' || phase === 'incoming' ? h(Fragment, null, h(Dialog.Root, { key: 'incoming', handle: current, modal: line === 871 ? false : true }, h(Dialog.Portal, null, h(Dialog.Popup, null, line === 845 ? 'Second' : 'Incoming'))), line === 871 ? h(MountAction, { handle: current, action: 'open', id: 'trigger' }) : null) : null)
      : mounted ? h(Dialog.Root<Payload>, { key: mode, handle: rootHandle, open: controlled ? mode === 'controlled' ? true : open : undefined,
        triggerId: controlled ? mode === 'controlled' ? 'trigger' : triggerId : undefined, defaultOpen: line === 159,
        modal: [490,549,871,1711,1835,1891,2028].includes(line) ? false : true, disablePointerDismissal: [490,549,1835,2028].includes(line),
        onOpenChange(value) { if (line === 1100) setOpen(value); },
        children: ({ payload }: { payload: Payload | undefined }) => h(Fragment, null, contained ? triggers() : null,
          [99,126,159].includes(line) ? h(MountAction, { handle: current, action: line === 99 ? 'open' : line === 126 ? 'payload' : 'close' }) : null, content(payload)),
      }) : null;
    return h('main', { 'data-hydrated': 'true', ref: (host: HTMLElement | null) => { if (host) Object.assign(host, { api }); } },
      dirty ? h(Dialog.Root<Payload>, { handle: handleB, children: ({ payload }: { payload: Payload | undefined }) => h(Fragment, null,
        h('span', { 'data-testid': 'dirty-payload' }, typeof payload === 'function' ? payload() : payload ?? 'No payload'), h(Dialog.Portal, null, h(Dialog.Popup, null, 'Dirty dialog', h('button', { type: 'button', onClick: () => setDirty(false) }, 'Unmount dirty root')))) })
        : line === 1444 ? h(Fragment, null, h(PersistentTrigger, { handle: handleA }), h(RouteRoot, { handle: handleA }))
          : ready ? h(Fragment, null,
            !contained && line !== 612 ? triggers() : null,
            line === 490 ? h(Fragment, null, h('button', { type: 'button', onClick: () => setCurrent(handleA) }, 'Use handle A'), h('button', { type: 'button', onClick: () => setCurrent(handleB) }, 'Use handle B')) : null,
            line === 549 ? h('button', { type: 'button', onClick: () => setAttached(value => !value) }, 'Toggle handle') : null,
            line === 412 ? h('button', { type: 'button', onClick: () => setCurrent(handleB) }, 'Switch to handle B') : null,
            line === 2028 ? h('button', { type: 'button', onClick: () => setCurrent(handleB) }, 'Switch root to B') : null,
            line === 1518 || line === 1579 ? h('button', { type: 'button', onClick: () => setMounted(false) }, 'Unmount root') : null,
            !mounted ? h('button', { type: 'button', onClick: remount }, line === 1518 ? 'Remount uncontrolled root' : line === 1579 ? 'Remount controlled root' : 'Remount root') : null,
            rootContent,
            line === 612 ? triggers() : null,
            line === 641 ? h(MountAction, { handle: current, action: 'open', id: 'trigger' }) : null,
            line === 1100 ? h('button', { type: 'button', onClick: () => { setTriggerId('trigger-2'); setOpen(true); } }, 'Open programmatically') : null) : null);
  }
  // The pin's @mui/internal-test-utils createRenderer defaults strict/strictEffects to true.
  const root = createRoot(node); root.render(h(StrictMode, null, h(App))); return () => root.unmount();
}
