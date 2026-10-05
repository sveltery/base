// Native framework expectations only; divergent React renderer credit is zero.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { flushSync, hydrate, unmount } from 'svelte';
import Fixture from './NativeClassComparisonFixture.svelte';

it('hydrates the actual Separator using native empty-class normalization and stable updates', async () => {
  const script = `import { createRequire } from 'node:module'; import Fixture from './packages/base/tests/dom/NativeClassComparisonFixture.svelte'; const require = createRequire(new URL('./packages/base/package.json', import.meta.url)); const { render } = require('svelte/server'); process.stdout.write(render(Fixture, { props: { value: '' } }).body);`;
  const markup = execFileSync(process.execPath, ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script], { cwd: resolve(process.cwd(), '../..'), encoding: 'utf8' });
  const target = document.createElement('main'); target.innerHTML = markup; document.body.append(target);
  const native = target.querySelector('[data-native]')!; const host = target.querySelector('[data-shared]')!;
  expect(host.getAttribute('class')).toBe('');
  const app = hydrate(Fixture, { target, props: { value: '' } }); flushSync();
  try {
    expect(host.getAttribute('class')).toBe(native.getAttribute('class'));
    app.setValue('active'); flushSync(); expect(host.getAttribute('class')).toBe('active');
    app.setValue(''); flushSync(); expect(host.getAttribute('class')).toBe(native.getAttribute('class'));
    expect(target.querySelector('[data-shared]')).toBe(host);
  } finally { await unmount(app); target.remove(); }
});
