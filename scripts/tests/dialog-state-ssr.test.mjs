import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
// Supplemental SSR execution, not an upstream declaration credit.
test('SSR roots and successive requests isolate defaultOpen and generated relationships', () => {
  const result = spawnSync(process.execPath, ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { createRequire } from 'node:module';
    import Fixture from './packages/base/tests/ssr/StateIsolation.svelte';
    const require = createRequire(new URL('./packages/base/package.json', import.meta.url));
    const { render } = await import(require.resolve('svelte/server'));
    for (const [firstOpen, secondOpen] of [[true, false], [false, true], [false, false], [true, true], [false, false]]) {
      const { body } = render(Fixture, { props: { firstOpen, secondOpen } });
      assert.equal(body.includes('role="dialog"'), false, 'Portal emits no server DOM');
      const buttons = [...body.matchAll(/<button[^>]*>/g)].map(match => match[0]);
      assert.equal(buttons.length, 2);
      const controls = [];
      for (const [index, open] of [firstOpen, secondOpen].entries()) {
        assert.ok(buttons[index].includes('aria-expanded="' + open + '"'));
        const control = /aria-controls="([^"]+)"/.exec(buttons[index])?.[1];
        assert.equal(Boolean(control), open);
        if (control) controls.push(control);
      }
      assert.equal(new Set(controls).size, controls.length);
      const titleIds = [...body.matchAll(/<h2[^>]*id="([^"]+)"/g)].map(match => match[1]);
      assert.equal(titleIds.length, 2);
      assert.equal(new Set(titleIds).size, 2);
    }
  `], { cwd: new URL('../../', import.meta.url), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
