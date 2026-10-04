// Native helper witnesses. Original DelayGroup's six declarations and their
// separate legacy hover/React fixture remain explicit unported obligations.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './PopupDelayGroupFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];

beforeEach(() => { vi.useFakeTimers(); });
afterEach(async () => {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  vi.useRealTimers();
  document.body.replaceChildren();
});

async function setup(props: { timeoutMs?: number; withProvider?: boolean } = {}) {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Fixture, { target, props });
  mounted.push(component);
  await tick();
  return component;
}

async function advance(time: number) {
  vi.advanceTimersByTime(time);
  await tick();
}

it('provides separate initial delay references before any consumer opens', async () => {
  const group = await setup();
  expect(group.readState('one')).toEqual({
    open: false,
    activeId: null,
    delay: { open: 1000, close: 200 },
    isInstantPhase: false,
    hasProvider: true,
  });
  expect(group.readState('two')?.delay).toEqual({ open: 1000, close: 200 });
});

it('takes over the group, closes the previous context with none and resets with timeout zero', async () => {
  const group = await setup();
  group.setOpen('one', true);
  await tick();
  expect(group.readState('one')).toMatchObject({ open: true, activeId: 'one', isInstantPhase: false });
  expect(group.readState('one')?.delay).toEqual({ open: 0, close: 200 });

  group.setOpen('two', true);
  await tick();
  expect(group.readState('one')).toMatchObject({ open: false, activeId: 'two', isInstantPhase: true });
  expect(group.readState('two')).toMatchObject({ open: true, activeId: 'two', isInstantPhase: true });
  expect(group.readRequests()).toEqual([
    { label: 'one', open: true, reason: 'none' },
    { label: 'two', open: true, reason: 'none' },
    { label: 'one', open: false, reason: 'none' },
  ]);

  group.setOpen('two', false);
  await tick();
  expect(group.readState('two')).toMatchObject({ open: false, activeId: null, isInstantPhase: false });
  expect(group.readState('two')?.delay).toEqual({ open: 1000, close: 200 });
});

it('keeps the instant delay until the complete group timeout expires', async () => {
  const group = await setup({ timeoutMs: 500 });
  group.setOpen('one', true);
  await tick();
  group.setOpen('one', false);
  await tick();
  await advance(499);
  expect(group.readState('two')).toMatchObject({ activeId: 'one', delay: { open: 0, close: 200 } });
  await advance(1);
  expect(group.readState('two')).toMatchObject({ activeId: null, delay: { open: 1000, close: 200 } });
});

it('cancels a closing context timeout when another consumer takes over', async () => {
  const group = await setup({ timeoutMs: 500 });
  group.setOpen('one', true);
  await tick();
  group.setOpen('one', false);
  await tick();
  await advance(400);
  group.setOpen('two', true);
  await tick();
  await advance(500);
  expect(group.readState('two')).toMatchObject({ open: true, activeId: 'two', isInstantPhase: true });
  expect(group.readState('two')?.delay).toEqual({ open: 0, close: 200 });
});

it('cancels its pending reset when the same consumer reopens', async () => {
  const group = await setup({ timeoutMs: 500 });
  group.setOpen('one', true);
  await tick();
  group.setOpen('one', false);
  await tick();
  await advance(250);
  group.setOpen('one', true);
  await tick();
  await advance(500);
  expect(group.readState('one')).toMatchObject({ open: true, activeId: 'one', isInstantPhase: false });
});

it('preserves the active context when an inactive consumer unmounts', async () => {
  const group = await setup({ timeoutMs: 500 });
  group.setOpen('one', true);
  await tick();
  group.show('two', false);
  await tick();
  group.setOpen('three', true);
  await tick();
  expect(group.readState('one')).toMatchObject({ open: false, activeId: 'three' });
  expect(group.readState('three')).toMatchObject({ open: true, activeId: 'three', isInstantPhase: true });
});

it('preserves the closing timeout across closed-consumer removal and permits takeover', async () => {
  const group = await setup({ timeoutMs: 500 });
  group.setOpen('one', true);
  await tick();
  group.setOpen('one', false);
  await tick();
  group.show('one', false);
  await tick();
  expect(group.readState('two')?.activeId).toBe('one');
  group.setOpen('two', true);
  await tick();
  await advance(500);
  expect(group.readState('two')).toMatchObject({ open: true, activeId: 'two', isInstantPhase: true });
});

it('resets after the last closed consumer unmounts when nobody takes over', async () => {
  const group = await setup({ timeoutMs: 500 });
  group.setOpen('one', true);
  await tick();
  group.setOpen('one', false);
  await tick();
  group.show('one', false);
  await tick();
  await advance(500);
  expect(group.readState('two')).toMatchObject({ activeId: null, delay: { open: 1000, close: 200 } });
});

it('clears the active group when its open consumer unmounts', async () => {
  const group = await setup({ timeoutMs: 500 });
  group.setOpen('one', true);
  await tick();
  group.show('one', false);
  await tick();
  expect(group.readState('two')).toMatchObject({ activeId: null, delay: { open: 1000, close: 200 } });
  group.setOpen('two', true);
  await tick();
  expect(group.readState('two')?.isInstantPhase).toBe(false);
});

it('keeps the active open delay while updating close and initial delays', async () => {
  const group = await setup();
  group.setOpen('one', true);
  await tick();
  group.setDelay({ open: 400, close: 75 });
  await tick();
  expect(group.readState('one')?.delay).toEqual({ open: 0, close: 75 });
  group.setOpen('one', false);
  await tick();
  expect(group.readState('one')?.delay).toEqual({ open: 400, close: 75 });
});

it('updates the complete initial delay when no consumer is active', async () => {
  const group = await setup();
  group.setDelay({ open: 800, close: 12 });
  await tick();
  expect(group.readState('two')?.delay).toEqual({ open: 800, close: 12 });
});

it('keeps native provider contexts independent even with equal consumer ids', async () => {
  const first = await setup();
  const second = await setup();
  first.setOpen('one', true);
  await tick();
  expect(second.readState('one')).toMatchObject({ open: false, activeId: null });
  second.setOpen('two', true);
  await tick();
  expect(first.readState('one')).toMatchObject({ open: true, activeId: 'one' });
  expect(second.readState('two')).toMatchObject({ open: true, activeId: 'two' });
});

it('retains the actual Source default context without inventing a provider', async () => {
  const group = await setup({ withProvider: false });
  expect(group.readState('one')).toMatchObject({ hasProvider: false, delay: 0 });
  group.setOpen('one', true);
  await tick();
  expect(group.readState('one')).toMatchObject({ open: true, activeId: 'one', delay: { open: 0, close: 0 } });
  group.setOpen('one', false);
  await tick();
  expect(group.readState('one')).toMatchObject({ open: false, activeId: null, delay: 0 });
});

it('clears the provider timer during native teardown', async () => {
  const group = await setup({ timeoutMs: 500 });
  group.setOpen('one', true);
  await tick();
  group.setOpen('one', false);
  await tick();
  expect(vi.getTimerCount()).toBe(1);
  mounted.splice(mounted.indexOf(group), 1);
  await unmount(group);
  expect(vi.getTimerCount()).toBe(0);
});

it('observes a live timeout prop and clears the pending reset when it becomes zero', async () => {
  const group = await setup({ timeoutMs: 500 });
  group.setOpen('one', true);
  await tick();
  group.setOpen('one', false);
  await tick();
  group.setTimeoutMs(0);
  await tick();
  expect(group.readState('two')).toMatchObject({ activeId: null, delay: { open: 1000, close: 200 } });
  expect(vi.getTimerCount()).toBe(0);
});
