import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './NativeSharedPrimitivesFixture.svelte';
import TreeFixture from './DialogFloatingTree.svelte';
import { FloatingTreeStore } from '../../src/lib/floating-ui/components/FloatingTreeStore.js';
import { getNodeAncestors, getNodeChildren } from '../../src/lib/floating-ui/utils/nodes.js';

// Used shared business/native boundaries, separate from ordinary public Dialog assertions.
const stop: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of stop.splice(0)) await cleanup();
  document.body.replaceChildren();
});
it('guard native binding publishes its actual host and clears on teardown', async () => {
  const component = mount(Fixture, { target: document.body });
  stop.push(() => unmount(component));
  flushSync();
  expect(component.getRef()?.hasAttribute('data-base-ui-focus-guard')).toBe(true);
  await unmount(component);
  stop.pop();
  expect(component.getRef()).toBeNull();
});
it('guard authored native attachment cleanup follows its independent host lifetime once', async () => {
  const cleanup = vi.fn();
  const attachment = vi.fn(() => cleanup);
  const component = mount(Fixture, { target: document.body, props: { attachment } });
  stop.push(() => unmount(component));
  flushSync();
  expect(attachment).toHaveBeenCalledTimes(1);
  expect(attachment.mock.calls[0]).toEqual([document.querySelector('span')]);
  expect(component.getRef()).toBe(document.querySelector('span'));
  await unmount(component);
  stop.pop();
  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(attachment).toHaveBeenCalledTimes(1);
  expect(component.getRef()).toBeNull();
});
it('backdrop preserves source cutout and overwrites otherProps style while clearing refs', async () => {
  const cutout = document.createElement('button');
  cutout.getBoundingClientRect = () => ({ left: 1, top: 2, right: 3, bottom: 4 }) as DOMRect;
  const component = mount(Fixture, {
    target: document.body,
    props: { kind: 'backdrop', cutout },
  });
  stop.push(() => unmount(component));
  flushSync();
  expect(component.getRef()?.style.clipPath).toBe(
    'polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,1px 2px,1px 4px,3px 4px,3px 2px,1px 2px)',
  );
  expect(component.getRef()?.style.position).toBe('fixed');
  expect(component.getRef()?.style.color).toBe('');
  await unmount(component);
  stop.pop();
  expect(component.getRef()).toBeNull();
});
it('original tree node registration preserves parent links and identity-owned cleanup', async () => {
  const tree = new FloatingTreeStore();
  const component = mount(TreeFixture, { target: document.body, props: { tree } });
  stop.push(() => unmount(component));
  flushSync();
  expect(tree.nodesRef.current.map((node) => [node.id, node.parentId])).toEqual([
    ['child', 'parent'],
    ['parent', null],
  ]);
  expect(getNodeChildren(tree.nodesRef.current, 'parent', false).map((node) => node.id)).toEqual([
    'child',
  ]);
  expect(getNodeAncestors(tree.nodesRef.current, 'child').map((node) => node.id)).toEqual([
    'parent',
  ]);
  component.removeChild();
  flushSync();
  expect(tree.nodesRef.current.map((node) => node.id)).toEqual(['parent']);
  await unmount(component);
  stop.pop();
  expect(tree.nodesRef.current).toEqual([]);
});
