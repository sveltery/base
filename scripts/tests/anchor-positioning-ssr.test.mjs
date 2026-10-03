// Supplemental no-browser-global SSR witness, not an ordinary declaration port.
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
test('private native and actual React anchor policies SSR without browser measurements', () => {
  const script = `
    import assert from 'node:assert/strict';
    import { createRequire } from 'node:module';
    import Fixture from './apps/fixtures/src/lib/AnchorPositioningFixture.svelte';
    const baseRequire = createRequire(new URL('./packages/base/package.json', import.meta.url));
    const require = createRequire(new URL('./apps/fixtures/package.json', import.meta.url));
    assert.equal(typeof window, 'undefined'); assert.equal(typeof document, 'undefined');
    const { render } = baseRequire('svelte/server');
    for (const scenario of ['default', 'closed', 'virtual', 'arrow', 'logical']) {
      const html = render(Fixture, { props: { scenario } }).body;
      assert.match(html, /data-positioned="false"/); assert.match(html, /position: fixed/);
      assert.match(html, /opacity: 0/); assert.doesNotMatch(html, /translate\\(/);
      if (scenario === 'logical') assert.match(html, /data-side="inline-start"/);
    }
    const { createElement: h, useRef } = require('react');
    const { renderToString } = require('react-dom/server');
    const { useAnchorPositioningWithHook } = require('@base-ui/react/internals/useAnchorPositioning');
    const { useFloating } = require(require.resolve('@base-ui/react/package.json').replace('package.json', 'floating-ui-react/hooks/useFloating.js'));
    const { DirectionProvider } = require('@base-ui/react/direction-provider');
    assert.equal(require('@base-ui/react/package.json').version, '1.8.0');
    function Reference({ logical = false }) {
      const anchor = useRef(null);
      const positioned = useAnchorPositioningWithHook({ anchor, mounted: true, side: logical ? 'inline-start' : 'bottom', keepMounted: true, disableAnchorTracking: false, collisionAvoidance: {} }, useFloating);
      assert.equal(positioned.isPositioned, false);
      return h('div', { style: positioned.positionerStyles, 'data-side': positioned.side });
    }
    const react = renderToString(h(Reference)); assert.match(react, /position:fixed/);
    assert.match(react, /top:0/); assert.match(react, /left:0/); assert.match(react, /opacity:0/);
    assert.doesNotMatch(react, /translate\\(/);
    const logical = renderToString(h(DirectionProvider, { direction: 'rtl' }, h(Reference, { logical: true })));
    assert.match(logical, /data-side="inline-start"/);
  `;
  execFileSync(process.execPath, ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script], { cwd: new URL('../../', import.meta.url), stdio: 'pipe' });
});
