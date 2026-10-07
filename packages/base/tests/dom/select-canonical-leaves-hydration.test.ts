// Native same-node lifetime supplements; zero unchanged React assertion credit.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { flushSync, hydrate, unmount } from 'svelte';
import Fixture from './SelectCanonicalLeavesFixture.svelte';

for (const custom of [false, true]) {
  it(`hydrates the private ${custom ? 'snippet' : 'intrinsic'} separator without replacing its server host`, async () => {
    const script = `import Fixture from './packages/base/tests/dom/SelectCanonicalLeavesFixture.svelte'; import { render } from 'svelte/server'; process.stdout.write(render(Fixture, { props: { custom: ${custom} } }).body);`;
    const markup = execFileSync(
      process.execPath,
      ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script],
      { cwd: resolve(process.cwd(), '../..'), encoding: 'utf8' },
    );
    const target = document.createElement('main');
    target.innerHTML = markup;
    document.body.append(target);
    const host = target.querySelector<HTMLElement>('[data-testid="listbox-separator"]')!;
    const component = hydrate(Fixture, { target, props: { custom } });
    flushSync();
    try {
      expect(target.querySelector('[data-testid="listbox-separator"]')).toBe(host);
      expect(component.getRefs()[0]).toBe(host);
      expect(host.getAttribute('role')).toBe('presentation');
      expect(host.hasAttribute('aria-orientation')).toBe(false);
      component.setOrientation('vertical');
      flushSync();
      expect(target.querySelector('[data-testid="listbox-separator"]')).toBe(host);
      expect(host.dataset.orientation).toBe('vertical');
      expect(host.style.color).toBe('red');
      component.remove();
      flushSync();
      expect(host.isConnected).toBe(false);
      expect(component.getRefs()[0]).toBe(null);
    } finally {
      await unmount(component);
      target.remove();
    }
  });
}
