// Paired pinned nested Composite contracts and native lifecycle supplements; MIT, zero ordinary credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './CompositeNestedFixture.svelte';
import {
  flushNestedComposite,
  mountNestedComposite,
} from '../../../../apps/fixtures/src/lib/composite-nested-reference.js';
const cleanups: (() => unknown)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
async function settle() {
  flushSync();
  await tick();
  await Promise.resolve();
  flushSync();
  await tick();
}
for (const framework of ['react', 'svelte']) {
  it(`${framework} source nested items keep outer metadata through inner updates and navigate to the shared host`, async () => {
    const host = document.createElement('div');
    document.body.append(host);
    let map = new Map<Element, Record<string, unknown>>();
    let api: {
      updateInner(): void;
      setVisible(value: boolean): void;
      replaceHost(): void;
    };
    if (framework === 'react') {
      const reference = mountNestedComposite(host, (next) => {
        map = next;
      });
      expect(reference.version).toBe('19.2.8');
      expect(reference.reactDomVersion).toBe('19.2.8');
      api = reference;
      cleanups.push(reference.unmount);
    } else {
      const component = mount(Fixture, {
        target: host,
        props: {
          onMap: (next: Map<Element, Record<string, unknown>>) => {
            map = next;
          },
        },
      });
      api = component;
      cleanups.push(() => unmount(component));
    }
    await settle();
    await vi.waitFor(() => expect(map.size).toBe(3));
    const shared = () =>
      host.querySelector<HTMLElement>('[data-testid="shared"]')!;
    const expectOuter = () => {
      expect(map.get(shared())).toMatchObject({
        disabled: true,
        focusableWhenDisabled: true,
        owner: 'outer',
        index: 1,
      });
      expect(map.size).toBe(3);
    };
    const navigate = async () => {
      const first = host.querySelector<HTMLElement>('[data-testid="first"]')!;
      if (framework === 'react') flushNestedComposite(() => first.focus());
      else first.focus();
      await settle();
      first.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        }),
      );
      await settle();
      expect(document.activeElement).toBe(shared());
    };
    const original = shared();
    expectOuter();
    await navigate();
    for (let revision = 1; revision <= 3; revision += 1) {
      api.updateInner();
      await settle();
      expect(shared()).toBe(original);
      expectOuter();
      await navigate();
    }
    api.setVisible(false);
    await settle();
    expect(map.size).toBe(2);
    expect(map.has(original)).toBe(false);
    api.setVisible(true);
    await settle();
    const replacement = shared();
    expect(replacement).not.toBe(original);
    expectOuter();
    await navigate();
    api.replaceHost();
    await settle();
    expect(shared()).not.toBe(replacement);
    expect(shared().tagName).toBe('SPAN');
    expect(map.has(replacement)).toBe(false);
    expectOuter();
    await navigate();
  });
}
