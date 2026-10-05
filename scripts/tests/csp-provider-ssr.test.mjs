// Supplemental paired SSR context witness; no ordinary declaration credit.
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
test('CSPProvider SSR without browser globals preserves wrapperless context defaults and shadowing in both frameworks', () => {
  const script = `
    import assert from 'node:assert/strict';
    import { createRequire } from 'node:module';
    import Fixture from './packages/base/tests/ssr/CSPFixture.svelte';
    const baseRequire = createRequire(new URL('./packages/base/package.json', import.meta.url));
    const require = createRequire(new URL('./apps/fixtures/package.json', import.meta.url));
    assert.equal(require('@base-ui/react/package.json').version, '1.8.0');
    assert.equal(typeof window, 'undefined'); assert.equal(typeof document, 'undefined');
    const { createElement: h } = require('react');
    const { renderToString } = require('react-dom/server');
    const { CSPProvider } = require('@base-ui/react/csp-provider');
    const { useCSPContext } = require('@base-ui/react/internals/csp-context');
    function Probe({ name }) { const context = useCSPContext(); return h('output', { 'data-testid': name }, (context.nonce ?? 'undefined') + '|' + String(context.disableStyleElements)); }
    const react = renderToString(h('main', {}, h(Probe, { name: 'outside' }), h(CSPProvider, { nonce: 'outer', disableStyleElements: true }, h(Probe, { name: 'outer' }), h(CSPProvider, {}, h(Probe, { name: 'inner-omitted' })), h(CSPProvider, { nonce: 'inner', disableStyleElements: false }, h(Probe, { name: 'inner-explicit' })), h(Probe, { name: 'outer-sibling' })), h(Probe, { name: 'after' })));
    const { render } = baseRequire('svelte/server');
    const svelte = render(Fixture).body;
    const { JSDOM } = baseRequire('jsdom');
    const expected = ['undefined|false', 'outer|true', 'undefined|undefined', 'inner|false', 'outer|true', 'undefined|false'];
    for (const body of [react, svelte]) {
      const main = new JSDOM(body).window.document.querySelector('main');
      assert.deepEqual([...main.children].map(node => node.tagName), Array(6).fill('OUTPUT'));
      assert.deepEqual([...main.children].map(node => node.textContent), expected);
    }
  `;
  execFileSync(
    process.execPath,
    ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script],
    { cwd: new URL('../../', import.meta.url), stdio: 'pipe' },
  );
});
