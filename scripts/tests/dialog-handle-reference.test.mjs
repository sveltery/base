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
