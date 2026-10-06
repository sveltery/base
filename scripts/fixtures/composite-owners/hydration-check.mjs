// jsdom supplements do not replace secured Chromium acceptance.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const tooling = createRequire(process.argv[2]);
const { JSDOM } = tooling('jsdom');
const dom = new JSDOM(
  `<!doctype html><html><body><main>${readFileSync(new URL('./ssr.html', import.meta.url), 'utf8')}</main></body></html>`,
  { url: 'http://localhost' },
);
for (const key of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLInputElement',
  'HTMLFormElement',
  'HTMLButtonElement',
  'HTMLMediaElement',
  'Element',
  'SVGElement',
  'Node',
  'Text',
  'Comment',
  'Event',
  'FocusEvent',
  'KeyboardEvent',
  'MouseEvent',
  'MutationObserver',
  'getComputedStyle',
])
  Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const { hydrate, flushSync, tick, unmount } = await import('svelte');
const { default: Consumer } = await import('./Consumer.svelte');
const target = document.querySelector('main');
const originalRadio = document.querySelector('[data-consumer-host="radio-a"]');
const originalGroup = document.querySelector('[role="radiogroup"]');
const warnings = [];
const warn = console.warn;
console.warn = (...args) => {
  warnings.push(args);
  warn(...args);
};
let app;
try {
  app = hydrate(Consumer, { target });
  flushSync();
  await tick();
  assert.equal(document.querySelector('[data-consumer-host="radio-a"]'), originalRadio);
  assert.equal(app.snapshot().radioHost, originalGroup);
  assert.equal(warnings.length, 0, 'Hydration must preserve SSR hosts without warnings');
  const key = async (host, value) => {
    host.dispatchEvent(
      new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
    );
    flushSync();
    // Composite deliberately focuses in the Source queued microtask.
    await tick();
  };
  const host = (id) => {
    // Radio's authored id belongs to its hidden labelable input. The data
    // attribute is forwarded to the actual public Composite span host.
    const value = id.startsWith('radio-')
      ? document.querySelector(`[data-consumer-host="${id}"]`)
      : document.getElementById(id);
    assert(value instanceof HTMLElement, id);
    return value;
  };
  host('radio-a').focus();
  await key(host('radio-a'), 'ArrowDown');
  assert.equal(document.activeElement, host('radio-b'));
  assert.equal(host('radio-b').getAttribute('aria-checked'), 'true');
  assert.deepEqual(app.snapshot().changes, ['b']);
  app.cancelNavigation();
  flushSync();
  await key(host('radio-b'), 'ArrowDown');
  assert.equal(
    app.snapshot().canceledKeys,
    1,
    'The group consumer must cancel its actual navigation pipeline',
  );
  assert.equal(document.activeElement, host('radio-b'));
  assert.deepEqual(
    app.snapshot().changes,
    ['b'],
    'Consumer cancellation must suppress Composite navigation',
  );
  app.reorder();
  flushSync();
  await tick();
  assert.equal(
    host('radio-a'),
    originalRadio,
    'Keyed reorder must retain the actual registered host',
  );
  assert.deepEqual(
    [...document.querySelectorAll('[role="radio"]')].map((element) =>
      element.getAttribute('data-consumer-host'),
    ),
    ['radio-c', 'radio-a', 'radio-b'],
  );
  host('toolbar-c').focus();
  await key(host('toolbar-c'), 'ArrowRight');
  assert.equal(
    document.activeElement,
    host('toolbar-a'),
    'Registration order must follow reordered DOM',
  );
  host('toggle-c').focus();
  await key(host('toggle-c'), 'ArrowRight');
  assert.equal(document.activeElement, host('toggle-a'));
  app.removeMiddle();
  flushSync();
  await tick();
  assert.equal(document.getElementById('toolbar-a'), null);
  host('toolbar-c').focus();
  await key(host('toolbar-c'), 'ArrowRight');
  assert.equal(
    document.activeElement,
    host('toolbar-b'),
    'Removed registration must no longer receive focus',
  );
  const detached = host('toolbar-c');
  app.teardown();
  flushSync();
  await tick();
  assert.equal(app.snapshot().radioHost, null);
  assert.equal(target.children.length, 0);
  await key(detached, 'ArrowRight');
  await tick();
  assert.equal(
    target.children.length,
    0,
    'Detached event delivery must not revive a destroyed owner',
  );
  await unmount(app);
  app = undefined;
  assert.equal(warnings.length, 0);
} finally {
  console.warn = warn;
  if (app) await unmount(app);
  dom.window.close();
}
console.log(
  'Packed public native hydration preserves actual SSR hosts; cancellation, keyed registration/reorder/removal and teardown: PASS',
);
