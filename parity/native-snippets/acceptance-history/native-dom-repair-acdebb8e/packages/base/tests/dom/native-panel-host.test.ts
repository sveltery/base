// Explicit native hidden/style/listener semantics; zero unchanged React renderer credit.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NativePanelFixture.svelte';

for (const family of ['collapsible', 'accordion'] as const) {
  it(`SSR renders ${family} hidden='until-found' directly on its native snippet host`, () => {
    const script = `import { createRequire } from 'node:module'; import Fixture from './packages/base/tests/dom/NativePanelFixture.svelte'; const require = createRequire(new URL('./packages/base/package.json', import.meta.url)); const { render } = require('svelte/server'); process.stdout.write(render(Fixture, { props: { family: ${JSON.stringify(family)} } }).body);`;
    const markup = execFileSync(
      process.execPath,
      ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script],
      { cwd: resolve(process.cwd(), '../..'), encoding: 'utf8' },
    );
    const target = document.createElement('main');
    target.innerHTML = markup;
    expect(target.querySelector('#native-panel')?.getAttribute('hidden')).toBe('until-found');
    expect(target.querySelector('#native-panel-trigger')?.getAttribute('aria-expanded')).toBe(
      'false',
    );
  });
  it(`moves ${family} beforematch ownership to the actual replacement host and tracks disabled state`, async () => {
    const target = document.createElement('main');
    document.body.append(target);
    const app = mount(Fixture, { target, props: { family } });
    flushSync();
    await tick();
    try {
      const original = app.snapshot().panel!;
      expect(original.getAttribute('hidden')).toBe('until-found');
      app.replaceHost();
      flushSync();
      await tick();
      const current = app.snapshot().panel!;
      expect(current).not.toBe(original);
      expect(current.tagName).toBe('ARTICLE');
      original.dispatchEvent(new Event('beforematch'));
      await tick();
      expect(app.snapshot().requests).toEqual([]);
      app.setDisabled(true);
      flushSync();
      await tick();
      current.dispatchEvent(new Event('beforematch'));
      await tick();
      expect(app.snapshot().requests).toEqual([]);
      app.setDisabled(false);
      flushSync();
      await tick();
      current.dispatchEvent(new Event('beforematch'));
      flushSync();
      await tick();
      expect(app.snapshot().requests).toEqual([{ open: true, reason: 'none' }]);
      expect(current.hasAttribute('data-open')).toBe(true);
      expect(current.hasAttribute('hidden')).toBe(false);
      expect(target.querySelector('#native-panel-trigger')?.getAttribute('aria-controls')).toBe(
        'native-panel',
      );
    } finally {
      await unmount(app);
      target.remove();
    }
  });
  it(`honors canceled ${family} beforematch while the following trigger can open`, async () => {
    const target = document.createElement('main');
    document.body.append(target);
    const app = mount(Fixture, { target, props: { family, cancel: true } });
    flushSync();
    await tick();
    try {
      const panel = app.snapshot().panel!;
      panel.dispatchEvent(new Event('beforematch'));
      flushSync();
      await tick();
      expect(panel.getAttribute('hidden')).toBe('until-found');
      expect(panel.hasAttribute('data-open')).toBe(false);
      target.querySelector<HTMLButtonElement>('#native-panel-trigger')!.click();
      flushSync();
      await tick();
      expect(app.snapshot().requests).toEqual([
        { open: true, reason: 'none' },
        { open: true, reason: 'trigger-press' },
      ]);
      expect(panel.hasAttribute('data-open')).toBe(true);
    } finally {
      await unmount(app);
      target.remove();
    }
  });
  it(`lets authored ${family} height follow bare Svelte spread/directive precedence`, async () => {
    const target = document.createElement('main');
    document.body.append(target);
    const app = mount(Fixture, { target, props: { family } });
    flushSync();
    await tick();
    try {
      const bare = target.querySelector<HTMLElement>('[data-bare]')!;
      const panel = app.snapshot().panel!;
      for (const height of ['auto', '73px', undefined]) {
        app.setHeight(height);
        flushSync();
        await tick();
        expect(panel.style.height).toBe(bare.style.height);
        if (height !== undefined) expect(panel.style.height).toBe(height);
      }
    } finally {
      await unmount(app);
      target.remove();
    }
  });
}
