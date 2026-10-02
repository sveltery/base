// Supplemental questioned-behavior reproduction against actual @base-ui/react 1.8.0.
// Pinned 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: parity/dialog/UPSTREAM_LICENSE.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const reference = createRequire(new URL('../../apps/fixtures/package.json', import.meta.url));
const local = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const { JSDOM } = local('jsdom');

async function fixture(render) {
  const dom = new JSDOM('<div id="target"></div>', { pretendToBeVisual: true, url: 'http://localhost' });
  const values = { window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement, Element: dom.window.Element, Node: dom.window.Node,
    MutationObserver: dom.window.MutationObserver, getComputedStyle: dom.window.getComputedStyle,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true, BASE_UI_ANIMATIONS_DISABLED: true };
  const saved = Object.fromEntries(Object.keys(values).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const React = reference('react'); const { createRoot } = reference('react-dom/client'); const { Dialog } = reference('@base-ui/react/dialog');
  const root = createRoot(dom.window.document.getElementById('target'));
  const settle = () => React.act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
  try { await render({ React, Dialog, root, document: dom.window.document, act: React.act, settle }); }
  finally { await React.act(async () => root.unmount()); dom.window.close(); for (const [key, descriptor] of Object.entries(saved)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } }
}

test('pinned canceled openWithPayload and ordinary close/unmount retain the payload write', async () => {
  await fixture(async ({ React, Dialog, root, document, act, settle }) => {
    const handle = Dialog.createHandle(); const actions = React.createRef(); let cancel = true;
    await act(async () => root.render(React.createElement(Dialog.Root, { handle, actionsRef: actions, onOpenChange(_open, details) { if (cancel) details.cancel(); } },
      ({ payload }) => React.createElement('span', { id: 'payload' }, String(payload ?? 'No payload')))));
    await act(async () => handle.openWithPayload(8));
    assert.equal(handle.isOpen, false); assert.equal(document.getElementById('payload').textContent, '8');
    cancel = false; await act(async () => handle.open(null)); await act(async () => handle.close()); await settle();
    assert.equal(handle.isOpen, false); assert.equal(document.getElementById('payload').textContent, '8');
    await act(async () => actions.current.unmount()); assert.equal(document.getElementById('payload').textContent, '8');
  });
});

test('pinned forceUnmount while logically open remounts without changing the logical open state', async () => {
  await fixture(async ({ React, Dialog, root, document, act, settle }) => {
    const handle = Dialog.createHandle(); const actions = React.createRef(); const completions = [];
    await act(async () => root.render(React.createElement(Dialog.Root, { handle, actionsRef: actions, defaultOpen: true, onOpenChangeComplete: value => completions.push(value) },
      React.createElement(Dialog.Portal, null, React.createElement(Dialog.Popup, null, 'Dialog Content')))));
    await settle(); const popup = document.querySelector('[role=dialog]'); await act(async () => actions.current.unmount()); await settle();
    assert.equal(handle.isOpen, true); assert.ok(document.querySelector('[role=dialog]')); assert.equal(document.querySelector('[role=dialog]') === popup, false); assert.ok(completions.includes(false));
  });
});

test('pinned external controlled opening prefers the previously focused external button', async () => {
  await fixture(async ({ React, Dialog, root, document, act, settle }) => {
    const h = React.createElement;
    let closeDetails;
    function App() {
      const [open, setOpen] = React.useState(false); const [triggerId, setTriggerId] = React.useState(null);
      return h('div', null, h(Dialog.Root, { open, triggerId, onOpenChange(value, details) { setOpen(value); if (!value) closeDetails = details; } }, ({ payload }) => h(React.Fragment, null,
        h(Dialog.Trigger, { id: 'one', payload: 1 }, 'One'), h(Dialog.Trigger, { id: 'two', payload: 2 }, 'Two'),
        h(Dialog.Portal, null, h(Dialog.Popup, null, h('span', { id: 'payload' }, payload), h(Dialog.Close, { id: 'close' }, 'Close'))))),
      h('button', { id: 'external', onClick() { setTriggerId('two'); setOpen(true); } }, 'Open programmatically'));
    }
    await act(async () => root.render(h(App)));
    const external = document.getElementById('external'); external.focus();
    await act(async () => external.click()); await settle(); assert.equal(document.getElementById('payload').textContent, '2');
    await act(async () => document.getElementById('close').click()); await settle();
    assert.equal(document.getElementById('payload'), null); assert.equal(document.activeElement, external);
    assert.equal(closeDetails.trigger, undefined);
  });
});

for (const strict of [false, true]) test(`pinned completion characterization with renderer StrictMode=${strict}`, async () => {
  await fixture(async ({ React, Dialog, root, document, act, settle }) => {
    const h = React.createElement; const completions = [];
    function TestDialog({ open }) {
      return h(Dialog.Root, { open, onOpenChangeComplete: value => completions.push(value) },
        h(Dialog.Trigger, null, 'Open'), h(Dialog.Portal, null,
          h(Dialog.Popup, { style: { position: 'fixed', zIndex: 10 }, 'data-testid': 'dialog-popup' },
            h('p', null, 'Dialog content'), h(Dialog.Close, null, 'Close'))));
    }
    function App() {
      const [open, setOpen] = React.useState(false);
      return h('div', null, h('button', { id: 'external', onClick: () => setOpen(true) }, 'Open externally'), h(TestDialog, { open }));
    }
    await act(async () => root.render(strict ? h(React.StrictMode, null, h(App)) : h(App)));
    await act(async () => document.getElementById('external').click()); await settle();
    assert.ok(document.querySelector('[data-testid=dialog-popup]'));
    // R1399 is guarded out of JSDOM; its source renderer also defaults to StrictMode replay.
    // These actual JSDOM observations receive no browser source declaration credit.
    assert.equal(completions.length, strict ? 2 : 1); assert.equal(completions[0], true);
  });
});

test('D:230 actual pinned JSDOM detached production payload warning body', async () => {
  await fixture(async ({ Dialog }) => {
    const originalEnvironment = process.env.NODE_ENV;
    const originalWarn = console.warn; const calls = [];
    console.warn = (...args) => calls.push(args);
    process.env.NODE_ENV = 'production';
    try {
      const handle = Dialog.createHandle(); handle.openWithPayload(8);
      assert.equal(handle.isOpen, false); assert.equal(calls.length, 0);
    } finally { process.env.NODE_ENV = originalEnvironment; console.warn = originalWarn; }
  });
});

for (const popup of ['absent', 'remove-on-close']) test(`pinned close with Popup ${popup} retains mounted state without a completion`, async () => {
  await fixture(async ({ React, Dialog, root, act, settle }) => {
    const h = React.createElement; const handle = Dialog.createHandle(); const completions = []; const actions = React.createRef();
    function App() {
      const [shown, setShown] = React.useState(popup !== 'absent');
      return h(Dialog.Root, { handle, actionsRef: actions, onOpenChange(value) { if (!value && popup === 'remove-on-close') setShown(false); }, onOpenChangeComplete: value => completions.push(value) },
        shown ? h(Dialog.Portal, null, h(Dialog.Popup, null, 'Dialog Content')) : null);
    }
    await act(async () => root.render(h(React.StrictMode, null, h(App))));
    await act(async () => handle.openWithPayload(8)); await settle();
    await act(async () => handle.close()); await settle();
    assert.equal(handle.isOpen, false); assert.equal(handle.store.select('mounted'), true);
    assert.equal(completions.filter(value => !value).length, 0);
    await act(async () => actions.current.unmount());
    assert.equal(handle.store.select('mounted'), false); assert.equal(completions.filter(value => !value).length, 1);
  });
});
