// Native framework characterization only; no unchanged upstream assertion credit.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { flushSync, hydrate, unmount } from 'svelte';
import Fixture from './UseRenderFixture.svelte';

it('characterizes native empty-class normalization across SSR, hydration and updates', async () => {
  const script = `import { createRequire } from 'node:module'; import Fixture from './packages/base/tests/dom/UseRenderFixture.svelte'; const require = createRequire(new URL('./packages/base/package.json', import.meta.url)); const { render } = require('svelte/server'); process.stdout.write(render(Fixture, { props: { options: { props: { class: '' } } } }).body);`;
  const markup = execFileSync(process.execPath, ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script], { cwd: resolve(process.cwd(), '../..'), encoding: 'utf8' });
  const target = document.createElement('main'); target.innerHTML = markup; document.body.append(target);
  const host = target.querySelector('div')!;
  expect(host.getAttribute('class')).toBe('');
  const ref = { current: null as Element | null };
  const app = hydrate(Fixture, { target, props: { options: { props: { class: '' }, ref } } }); flushSync();
  try {
    expect(ref.current).toBe(host);
    expect(host.getAttribute('class')).toBeNull();
    app.setOptions({ props: { class: 'active' }, ref }); flushSync(); expect(host.getAttribute('class')).toBe('active');
    app.setOptions({ props: { class: '' }, ref }); flushSync(); expect(host.getAttribute('class')).toBeNull();
  } finally { await unmount(app); target.remove(); }
});
