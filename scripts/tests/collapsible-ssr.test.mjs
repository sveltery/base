// Paired ordinary Panel SSR assertion ports. Base UI v1.8.0; MIT: parity/collapsible/UPSTREAM_LICENSE.
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
for (const [line, scenario] of [[799, 'open'], [830, 'inline']]) {
  test(`P:${line} paired exact-pin React/Svelte SSR initial keyframe suppression`, () => {
    const script = `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      import Fixture from './packages/base/tests/ssr/Collapsible.svelte';
      const baseRequire = createRequire(new URL('./packages/base/package.json', import.meta.url));
      const require = createRequire(new URL('./apps/fixtures/package.json', import.meta.url));
      assert.equal(require('@base-ui/react/package.json').version, '1.8.0');
      const React = require('react');
      const { renderToString } = require('react-dom/server');
      const { Collapsible } = require('@base-ui/react/collapsible');
      const { JSDOM } = baseRequire('jsdom');
      const { render } = baseRequire('svelte/server');
      const inline = ${scenario === 'inline'};
      const panelProps = { 'data-testid': 'panel', className: 'animation-test-panel', ...(inline ? { style: { animationDuration: '100ms', animationName: 'panel-slide-down', animationTimingFunction: 'linear' } } : {}) };
      const css = '@keyframes panel-slide-down { from { height:0; } to { height:var(--collapsible-panel-height); } } .animation-test-panel[data-open] { animation:panel-slide-down 100ms linear; }';
      const react = renderToString(React.createElement(React.Fragment, null, React.createElement('style', null, css),
        React.createElement(Collapsible.Root, { defaultOpen: true }, React.createElement(Collapsible.Trigger, null, 'Trigger'), React.createElement(Collapsible.Panel, panelProps, 'This is panel content'))));
      const svelte = '<style>' + css + '</style>' + render(Fixture, { props: { scenario: '${scenario}' } }).body;
      for (const [framework, body] of [['React', react], ['Svelte', svelte]]) {
        const panel = new JSDOM(body).window.document.querySelector('[data-testid=panel]');
        assert.equal(panel.style.animationName, 'none', framework);
        if (inline) assert.equal(panel.style.animationDuration, '100ms', framework);
      }
    `;
    execFileSync(process.execPath, ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script], { cwd: new URL('../../', import.meta.url), stdio: 'pipe' });
  });
}
