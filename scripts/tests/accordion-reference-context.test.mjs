// Immutable Accordion I:9/H:8 context assertions against the installed @base-ui/react 1.8.0.
// MIT attribution: parity/accordion/UPSTREAM_LICENSE. Svelte assertions run in accordion.test.ts.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const reference = createRequire(new URL('../../apps/fixtures/package.json', import.meta.url));
const local = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const { JSDOM } = local('jsdom');
const React = reference('react');
const { createRoot } = reference('react-dom/client');
const { Accordion } = reference('@base-ui/react/accordion');
for (const [part, line, message] of [
  ['Item', 9, 'Base UI: AccordionRootContext is missing. Accordion parts must be placed within <Accordion.Root>.'],
  ['Header', 8, 'Base UI: AccordionItemContext is missing. Accordion parts must be placed within <Accordion.Item>.'],
]) test(`${part[0]}:${line} React reference missing context retains exact upstream message`, async () => {
  const dom = new JSDOM('<div id="target"></div>');
  const saved = Object.fromEntries(['window', 'document', 'navigator', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator, IS_REACT_ACT_ENVIRONMENT: true })) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const root = createRoot(dom.window.document.getElementById('target'));
  try {
    await assert.rejects(async () => { await React.act(async () => { root.render(React.createElement(Accordion[part])); }); }, { message });
  } finally {
    await React.act(async () => { root.unmount(); }); dom.window.close();
    for (const [key, descriptor] of Object.entries(saved)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
});
