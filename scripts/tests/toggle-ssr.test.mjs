import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
test('standalone Toggle renders SSR state and strips form/type/value without browser globals', () => {
  const script = `
    import assert from 'node:assert/strict';
    import { createRequire } from 'node:module';
    const require = createRequire(new URL('./packages/base/package.json', import.meta.url));
    const { render } = await import(require.resolve('svelte/server'));
    import Toggle from './packages/base/src/lib/toggle/Toggle.svelte';
    const initial = render(Toggle, { props: {} }).body;
    assert.match(initial, /aria-pressed="false"/); assert.match(initial, /type="button"/);
    assert(!initial.includes('data-pressed')); assert(!initial.includes('data-disabled'));
    const pressed = render(Toggle, { props: { defaultPressed: true, disabled: true, form: 'external', type: 'submit', value: 'sent' } }).body;
    assert.match(pressed, /aria-pressed="true"/); assert.match(pressed, /data-pressed/); assert.match(pressed, /data-disabled/); assert.match(pressed, / disabled/);
    assert.match(pressed, /type="button"/); assert(!pressed.includes('form=')); assert(!pressed.includes('value='));
    const controlled = render(Toggle, { props: { pressed: false, defaultPressed: true } }).body;
    assert.match(controlled, /aria-pressed="false"/); assert(!controlled.includes('data-pressed'));
    for (const props of [{ nativeButton: false }, { nativeButton: false, form: 'external', type: 'reset', value: 'sent' }]) {
      const nonNative = render(Toggle, { props }).body;
      assert.match(nonNative, /<button/); assert.match(nonNative, /type="button"/); assert.match(nonNative, /role="button"/);
      assert(!nonNative.includes('form=')); assert(!nonNative.includes('value='));
    }
  `;
  execFileSync(process.execPath, ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script], { cwd: new URL('../../', import.meta.url), stdio: 'pipe' });
});
