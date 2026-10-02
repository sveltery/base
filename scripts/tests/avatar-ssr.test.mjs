// Paired supplemental server witnesses at Base UI v1.8.0 (MIT).
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
for (const keepMounted of [false, true]) {
  test(`Avatar paired SSR keepMounted=${keepMounted} runs without browser globals`, () => {
    const script = `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      import Fixture from './packages/base/tests/dom/avatar-fixture.svelte';
      const require = createRequire(new URL('./apps/fixtures/package.json', import.meta.url));
      const baseRequire = createRequire(new URL('./packages/base/package.json', import.meta.url));
      assert.equal(typeof window, 'undefined'); assert.equal(typeof document, 'undefined');
      assert.equal(require('@base-ui/react/package.json').version, '1.8.0');
      const React = require('react'), { renderToString } = require('react-dom/server');
      const { Avatar } = require('@base-ui/react/avatar');
      const { render } = baseRequire('svelte/server'), { JSDOM } = baseRequire('jsdom');
      const react = renderToString(React.createElement(Avatar.Root, null,
        React.createElement(Avatar.Image, { src: 'avatar.png', alt: 'Jane Doe', keepMounted: ${keepMounted} }),
        React.createElement(Avatar.Fallback, null, 'JD')));
      const svelte = render(Fixture, { props: { imageProps: { src: 'avatar.png', alt: 'Jane Doe', keepMounted: ${keepMounted} } } }).body;
      for (const [framework, body] of [['React', react], ['Svelte', svelte]]) {
        const document = new JSDOM(body).window.document;
        assert.equal(document.querySelector('img') !== null, ${keepMounted}, framework);
        assert.equal(document.querySelector('span span').textContent, 'JD', framework);
        if (${keepMounted}) {
          const image = document.querySelector('img'); assert.equal(image.getAttribute('src'), 'avatar.png', framework);
          assert.equal(image.getAttribute('aria-hidden'), 'true', framework); assert.equal(image.hasAttribute('data-starting-style'), false, framework);
        }
      }
    `;
    execFileSync(process.execPath, ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script], { cwd: new URL('../../', import.meta.url), stdio: 'pipe' });
  });
}
