// I:429/1065/1100 from AvatarImage.test.tsx, Base UI v1.8.0
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c (MIT).
// SSR is real; DOM descriptors model the cached decoded browser boundary.
// These ports preserve synchronous post-hydration expectations. Native caching evidence is separate.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, it, vi } from 'vitest';
import { flushSync, hydrate, unmount } from 'svelte';
import Fixture from './avatar-fixture.svelte';
import {
  cleanupWith,
  fallback,
  image,
  mockImageLoading,
  renderedCompleteness,
} from './avatar-test-utils.js';
const DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
function serverHTML(keepMounted: boolean) {
  const script = `import { createRequire } from 'node:module'; import Fixture from './packages/base/tests/dom/avatar-fixture.svelte'; const require = createRequire(new URL('./packages/base/package.json', import.meta.url)); const { render } = require('svelte/server'); process.stdout.write(render(Fixture, { props: { imageProps: { keepMounted: ${keepMounted}, src: '${DATA_URI}', alt: 'Jane Doe' } } }).body);`;
  return execFileSync(
    process.execPath,
    ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script],
    { cwd: resolve(process.cwd(), '../..'), encoding: 'utf8' },
  );
}
function hydrationHost(keepMounted: boolean) {
  const host = document.createElement('main');
  host.innerHTML = serverHTML(keepMounted);
  document.body.append(host);
  return {
    host,
    hydrate() {
      const component = hydrate(Fixture, {
        target: host,
        props: { imageProps: { keepMounted, src: DATA_URI, alt: 'Jane Doe' } },
      });
      cleanupWith(() => unmount(component));
      flushSync();
      return component;
    },
  };
}
it('I:429 renders image in server HTML and resolves cached images on hydration (DOM cached model)', () => {
  renderedCompleteness(() => ({ complete: true, naturalWidth: 1 }));
  const fixture = hydrationHost(true);
  expect(image()!.getAttribute('src')).toBe(DATA_URI);
  expect(image()!.getAttribute('aria-hidden')).toBe('true');
  expect(document.querySelector('img:not([aria-hidden=true])')).toBe(null);
  expect(fallback()).not.toBe(null);
  expect(image()!.complete).toBe(true);
  fixture.hydrate();
  expect(image()!.getAttribute('src')).toBe(DATA_URI);
  expect(image()!.alt).toBe('Jane Doe');
  expect(image()!.hasAttribute('aria-hidden')).toBe(false);
  expect(fallback()).toBe(null);
});
it('I:1065 does not replay enter animation for a cached image on hydration (DOM cached model)', () => {
  renderedCompleteness(() => ({ complete: true, naturalWidth: 1 }));
  const fixture = hydrationHost(true);
  expect(image()!.complete).toBe(true);
  fixture.hydrate();
  expect(image()!.hasAttribute('data-starting-style')).toBe(false);
});
it('I:1100 does not flash fallback for a cached image during SSR hydration (DOM probe cache model)', () => {
  mockImageLoading({ completeOnSet: true });
  const fixture = hydrationHost(false);
  expect(fallback()).not.toBe(null);
  expect(image()).toBe(null);
  fixture.hydrate();
  expect(image()!.getAttribute('src')).toBe(DATA_URI);
  expect(fallback()).toBe(null);
});

// Native supplement: the pinned detached probe resolves after hook initialization,
// so its cached first hydrated commit enters through the shared starting phase.
// This adds no ordinary declaration credit and leaves the three ports above intact.
it('supplement cached detached hydration enters after initial idle transition setup', async () => {
  mockImageLoading({ completeOnSet: true });
  const fixture = hydrationHost(false);
  fixture.hydrate();
  expect(image()!.hasAttribute('data-starting-style')).toBe(true);
  expect(image()!.hasAttribute('aria-hidden')).toBe(false);
  expect(fallback()).toBe(null);
  await vi.waitFor(() => expect(image()!.hasAttribute('data-starting-style')).toBe(false));
  expect(fallback()).toBe(null);
});
