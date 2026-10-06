// Supplemental reproducer against real @base-ui/react 1.8.0. No ordinary declaration credit.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const reference = createRequire(new URL('../../apps/fixtures/package.json', import.meta.url));
const local = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const { JSDOM } = local('jsdom');
test('React reference nested replacement Items sharing a host publish index zero independently', async () => {
  const dom = new JSDOM('<div id="target"></div>');
  const globals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
    MutationObserver: dom.window.MutationObserver,
    requestAnimationFrame: (callback) => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const saved = Object.fromEntries(
    Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  for (const [key, value] of Object.entries(globals))
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const React = reference('react');
  const { createRoot } = reference('react-dom/client');
  const { Accordion } = reference('@base-ui/react/accordion');
  const indexes = { outer: [], inner: [] };
  const root = createRoot(dom.window.document.getElementById('target'));
  try {
    await React.act(async () => {
      root.render(
        React.createElement(
          Accordion.Root,
          null,
          React.createElement(Accordion.Item, {
            className: (state) => {
              indexes.outer.push(state.index);
              return '';
            },
            render: (props) =>
              React.createElement(Accordion.Item, {
                ...props,
                'data-testid': 'shared-host',
                className: (state) => {
                  indexes.inner.push(state.index);
                  return '';
                },
              }),
          }),
          React.createElement(Accordion.Item, { 'data-testid': 'sibling' }, 'Sibling'),
        ),
      );
    });
    assert.deepEqual(
      { outer: indexes.outer.at(-1), inner: indexes.inner.at(-1) },
      { outer: 0, inner: 0 },
    );
    assert.equal(
      dom.window.document.querySelector('[data-testid=shared-host]').getAttribute('data-index'),
      '0',
    );
    assert.equal(
      dom.window.document.querySelector('[data-testid=sibling]').getAttribute('data-index'),
      '1',
    );
  } finally {
    await React.act(async () => {
      root.unmount();
    });
    dom.window.close();
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
