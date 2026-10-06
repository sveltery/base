import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import FocusGuard from '../../src/lib/utils/FocusGuard.svelte';
import InternalBackdrop from '../../src/lib/utils/InternalBackdrop.svelte';
import TreeFixture from './DialogFloatingTree.svelte';
import { FloatingTreeStore } from '../../src/lib/floating-ui/components/FloatingTreeStore.js';
import { getNodeAncestors, getNodeChildren } from '../../src/lib/floating-ui/utils/nodes.js';

// Used shared business/native boundaries, separate from ordinary public Dialog assertions.
const stop: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of stop.splice(0)) await cleanup();
  document.body.replaceChildren();
});
it('guard attachment clears the actual object ref on teardown', async () => {
  const ref = { current: null as HTMLSpanElement | null };
  const component = mount(FocusGuard, { target: document.body, props: { ref } });
  flushSync();
  expect(ref.current?.hasAttribute('data-base-ui-focus-guard')).toBe(true);
  await unmount(component);
  expect(ref.current).toBeNull();
});
it('guard callback cleanup follows the shared ref contract once', async () => {
  const cleanup = vi.fn();
  const ref = vi.fn(() => cleanup);
  const component = mount(FocusGuard, { target: document.body, props: { ref } });
  flushSync();
  expect(ref).toHaveBeenCalledTimes(1);
  expect(ref.mock.calls[0]).toEqual([document.querySelector('span')]);
  await unmount(component);
  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(ref).toHaveBeenCalledTimes(1);
});
it('backdrop preserves source cutout and overwrites otherProps style while clearing refs', async () => {
  const cutout = document.createElement('button');
  cutout.getBoundingClientRect = () => ({ left: 1, top: 2, right: 3, bottom: 4 }) as DOMRect;
  const ref = { current: null as HTMLDivElement | null };
  const component = mount(InternalBackdrop, {
    target: document.body,
    props: { ref, cutout, style: 'color: red' },
  });
  flushSync();
  expect(ref.current?.style.clipPath).toBe(
    'polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,1px 2px,1px 4px,3px 4px,3px 2px,1px 2px)',
  );
  expect(ref.current?.style.position).toBe('fixed');
  expect(ref.current?.style.color).toBe('');
  await unmount(component);
  expect(ref.current).toBeNull();
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
