// Paired pinned nested Composite contracts and native lifecycle supplements; MIT, zero ordinary credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './CompositeNestedFixture.svelte';
import RefsFixture from './NativePlainCompositeRefs.svelte';
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
// Plain native expectations measured independently at43; hydrated browser evidence is separate.
// Full acquisition and failed predecessor provenance: parity/native-snippets/plain-composite-native-evidence.json.
for (const framework of ['react', 'svelte', 'svelte-refs']) {
  const title =
    framework === 'react'
      ? `${framework} source nested items keep outer metadata through inner updates and navigate to the shared host`
      : framework === 'svelte'
        ? 'svelte native nested items refresh metadata through independent attachment lifetimes'
        : 'svelte native plain nested items publish current host refs and clear them on teardown';
  it(title, async () => {
    const host = document.createElement('div');
    document.body.append(host);
    let map = new Map<Element, Record<string, unknown>>();
    let api: {
      updateInner(): void;
      setVisible(value: boolean): void;
      replaceHost(): void;
      getRefs?(): Record<string, HTMLElement | null | undefined>;
    };
    let disposeNative: (() => Promise<void>) | undefined;
    if (framework === 'react') {
      const reference = mountNestedComposite(host, (next) => {
        map = next;
      });
      expect(reference.version).toBe('19.2.8');
      expect(reference.reactDomVersion).toBe('19.2.8');
      api = reference;
      cleanups.push(reference.unmount);
    } else {
      const component = mount(framework === 'svelte-refs' ? RefsFixture : Fixture, {
        target: host,
        props: {
          onMap: (next: Map<Element, Record<string, unknown>>) => {
            map = next;
          },
        },
      });
      api = component;
      let disposed = false;
      disposeNative = async () => {
        if (disposed) return;
        disposed = true;
        await unmount(component);
      };
      cleanups.push(disposeNative);
    }
    await settle();
    await vi.waitFor(() => expect(map.size).toBe(3));
    const shared = () => host.querySelector<HTMLElement>('[data-testid="shared"]')!;
    const first = host.querySelector<HTMLElement>('[data-testid="first"]')!;
    const last = host.querySelector<HTMLElement>('[data-testid="last"]')!;
    const root = host.firstElementChild!;
    const expectNativeRefs = () => {
      if (framework !== 'svelte-refs') return;
      const refs = api.getRefs!();
      const expected = {
        root: host.firstElementChild,
        first: host.querySelector('[data-testid="first"]'),
        outer: host.querySelector('[data-testid="shared"]'),
        inner: host.querySelector('[data-testid="shared"]'),
        last: host.querySelector('[data-testid="last"]'),
      };
      for (const [name, node] of Object.entries(expected)) expect(refs[name]).toBe(node);
    };
    const expectOuter = () => {
      expect(map.get(shared())).toMatchObject({
        disabled: true,
        focusableWhenDisabled: true,
        owner: 'outer',
        index: 1,
      });
      expect(map.size).toBe(3);
    };
    const expectInner = (revision: number) => {
      expect([...map.values()]).toEqual([
        { disabled: true, focusableWhenDisabled: true, owner: 'outer', index: 0 },
        { disabled: true, focusableWhenDisabled: false, owner: 'inner', revision, index: 1 },
        { disabled: true, focusableWhenDisabled: true, owner: 'outer', index: 2 },
      ]);
      expect(map.size).toBe(3);
      if (framework === 'svelte-refs') expect(host.firstElementChild).toBe(root);
      const nodes = [first, shared(), last];
      for (const [index, node] of [...map.keys()].entries()) {
        expect(node).toBe(nodes[index]);
        expect(node.isConnected).toBe(true);
        expect(host.contains(node)).toBe(true);
      }
      expectNativeRefs();
    };
    const navigate = async (destination: 'shared' | 'last' = 'shared', revision = 0) => {
      const first = host.querySelector<HTMLElement>('[data-testid="first"]')!;
      if (framework === 'react') flushNestedComposite(() => first.focus());
      else first.focus();
      await settle();
      if (framework !== 'react') {
        expect(document.activeElement).toBe(first);
        expect([first.tabIndex, shared().tabIndex, last.tabIndex]).toEqual([0, -1, -1]);
        expectInner(revision);
      }
      first.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        }),
      );
      await settle();
      expect(document.activeElement).toBe(
        destination === 'shared' ? shared() : host.querySelector('[data-testid="last"]'),
      );
      if (framework !== 'react') {
        expect([first.tabIndex, shared().tabIndex, last.tabIndex]).toEqual([-1, -1, 0]);
        expectInner(revision);
      }
    };
    const original = shared();
    if (framework === 'react') {
      expectOuter();
      await navigate();
    } else {
      expectInner(0);
      expect(document.activeElement).toBe(document.body);
      expect([first.tabIndex, shared().tabIndex, last.tabIndex]).toEqual([0, -1, -1]);
      await navigate('last');
    }
    for (let revision = 1; revision <= 3; revision += 1) {
      api.updateInner();
      await settle();
      expect(shared()).toBe(original);
      if (framework === 'react') {
        expectOuter();
        await navigate();
      } else {
        expectInner(revision);
        expect(document.activeElement).toBe(last);
        expect([first.tabIndex, shared().tabIndex, last.tabIndex]).toEqual([-1, -1, 0]);
        await navigate('last', revision);
      }
    }
    api.setVisible(false);
    await settle();
    expect(map.size).toBe(2);
    expect(map.has(original)).toBe(false);
    if (framework !== 'react') {
      expect(host.querySelector('[data-testid="shared"]')).toBeNull();
      expect(original.isConnected).toBe(false);
      expect([...map.values()]).toEqual([
        { disabled: true, focusableWhenDisabled: true, owner: 'outer', index: 0 },
        { disabled: true, focusableWhenDisabled: true, owner: 'outer', index: 1 },
      ]);
      expect([...map.keys()][0]).toBe(first);
      expect([...map.keys()][1]).toBe(last);
      expect(document.activeElement).toBe(last);
      expect([first.tabIndex, last.tabIndex]).toEqual([-1, 0]);
      expectNativeRefs();
    }
    api.setVisible(true);
    await settle();
    const replacement = shared();
    expect(replacement).not.toBe(original);
    if (framework === 'react') {
      expectOuter();
      await navigate();
    } else {
      expect(replacement.tagName).toBe('BUTTON');
      expectInner(3);
      expect(document.activeElement).toBe(last);
      expect([first.tabIndex, shared().tabIndex, last.tabIndex]).toEqual([-1, -1, 0]);
      await navigate('last', 3);
    }
    api.replaceHost();
    await settle();
    expect(shared()).not.toBe(replacement);
    expect(shared().tagName).toBe('SPAN');
    expect(map.has(replacement)).toBe(false);
    if (framework === 'react') {
      expectOuter();
      await navigate();
    } else {
      expect(replacement.isConnected).toBe(false);
      expectInner(3);
      expect(document.activeElement).toBe(last);
      expect([first.tabIndex, shared().tabIndex, last.tabIndex]).toEqual([-1, -1, 0]);
      await navigate('last', 3);
      const retained = [...map].map(([node, metadata]) => [node, { ...metadata }] as const);
      await disposeNative!();
      await settle();
      expect(host.childNodes).toHaveLength(0);
      expect([...map]).toEqual(retained);
      for (const [index, node] of [...map.keys()].entries()) expect(node).toBe(retained[index][0]);
      expect(map.size).toBe(3);
      for (const node of [...retained.map(([node]) => node), original, replacement]) {
        expect(node.isConnected).toBe(false);
      }
      expect(document.activeElement).toBe(document.body);
      expectNativeRefs();
    }
  });
}
