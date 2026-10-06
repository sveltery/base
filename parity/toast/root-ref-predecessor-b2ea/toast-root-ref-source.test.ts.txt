// Supplemental actual pinned/native Root lifetime witness; zero unchanged Original credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './ToastRootFixture.svelte';
import type { ToastProviderContext } from '../../src/lib/toast/context.js';
import { mountToastRootRefReference } from '../../../../apps/fixtures/src/lib/toast-root-ref-reference.js';

const cleanups: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

for (const reference of [true, false]) {
  it(`${reference ? 'Original' : 'native'} Root retains its live host ref across initial measurement, same-ID updates and close`, async () => {
    const target = document.createElement('section');
    document.body.append(target);
    let native!: ToastProviderContext;
    const original = reference ? mountToastRootRefReference(target) : undefined;
    if (original) cleanups.push(() => original.unmount());
    else {
      const component = mount(Fixture, {
        target,
        props: {
          withContent: false,
          capture: (context) => {
            native = context;
          },
        },
      });
      flushSync();
      cleanups.push(() => unmount(component));
    }
    const commit = (action: () => void) => (original ? original.commit(action) : flushSync(action));
    const liveRef = () =>
      original
        ? original.manager.toasts.find((toast) => toast.id === 'live-ref')?.ref?.current
        : native.manager.toasts.find((toast) => toast.id === 'live-ref')?.ref;
    commit(() => {
      if (original) original.manager.add({ id: 'live-ref', title: 'Initial', timeout: 0 });
      else native.manager.add({ id: 'live-ref', title: 'Initial', timeout: 0 });
    });
    const host = target.querySelector<HTMLElement>('[data-toast="live-ref"]')!;
    expect(host.textContent).toContain('Initial');
    expect(liveRef()).toBe(host);
    commit(() => {
      if (original) original.manager.update('live-ref', { title: 'Updated' });
      else native.manager.update('live-ref', { title: 'Updated' });
    });
    expect(target.querySelector('[data-toast="live-ref"]')).toBe(host);
    expect(host.textContent).toContain('Updated');
    expect(liveRef()).toBe(host);
    commit(() => {
      if (original) original.manager.add({ id: 'live-ref', title: 'Upsert', timeout: 0 });
      else native.manager.add({ id: 'live-ref', title: 'Upsert', timeout: 0 });
    });
    expect(host.textContent).toContain('Upsert');
    expect(liveRef()).toBe(host);
    Object.defineProperty(host, 'getAnimations', {
      value: () => [
        { finished: new Promise<void>(() => {}), pending: false, playState: 'running' },
      ],
    });
    host.focus();
    commit(() => {
      if (original) original.manager.close('live-ref');
      else native.manager.close('live-ref');
    });
    expect(host.hasAttribute('data-ending-style')).toBe(true);
    expect(liveRef()).toBe(host);
  });
}
