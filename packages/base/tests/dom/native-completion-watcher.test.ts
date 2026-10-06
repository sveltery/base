// Native effect tracking/cancellation witnesses; zero unchanged Original assertion credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NativeCompletionWatcherFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  document.body.replaceChildren();
});
async function setup() {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Fixture, { target });
  mounted.push(component);
  flushSync();
  await vi.waitFor(() => expect(component.snapshot().hosts).toEqual([0]));
  return { component, target };
}
async function finish(component: Awaited<ReturnType<typeof setup>>['component'], index: number) {
  component.finish(index);
  await tick();
  await Promise.resolve();
  flushSync();
}

it('aborts a pending watcher when native open tracking re-arms the same host', async () => {
  const { component } = await setup();
  component.setOpen(true);
  flushSync();
  await vi.waitFor(() => expect(component.snapshot().hosts).toEqual([0, 0]));
  await finish(component, 0);
  expect(component.snapshot().requests).toEqual([]);
  await finish(component, 1);
  expect(component.snapshot().requests).toEqual([{ open: true, batch: false, host: 0 }]);
});

it('uses dynamic enabled tracking and abandons the old host before a later enable', async () => {
  const { component, target } = await setup();
  const previous = target.querySelector('[data-watcher-host]');
  component.setEnabled(false);
  flushSync();
  component.setOpen(true);
  component.replaceHost();
  flushSync();
  await tick();
  expect(target.querySelector('[data-watcher-host]')).not.toBe(previous);
  expect(component.snapshot().hosts).toEqual([0]);
  component.setEnabled(true);
  flushSync();
  await vi.waitFor(() => expect(component.snapshot().hosts).toEqual([0, 1]));
  await finish(component, 0);
  expect(component.snapshot().requests).toEqual([]);
  await finish(component, 1);
  expect(component.snapshot().requests).toEqual([{ open: true, batch: false, host: 1 }]);
});

it('re-arms the native batch read and rejects completion from its aborted invocation', async () => {
  const { component } = await setup();
  component.setBatch(true);
  flushSync();
  await vi.waitFor(() => expect(component.snapshot().hosts).toEqual([0, 0]));
  await finish(component, 0);
  expect(component.snapshot().requests).toEqual([]);
  await finish(component, 1);
  expect(component.snapshot().requests).toEqual([{ open: false, batch: true, host: 0 }]);
});

it('cancels its pending watcher on teardown before the animation promise settles', async () => {
  const { component } = await setup();
  await unmount(mounted.pop()!);
  await finish(component, 0);
  expect(component.snapshot().requests).toEqual([]);
});
