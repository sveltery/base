import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './SharedSourceUtilsFixture.svelte';
import { reset } from '../../src/lib/utils/error.js';
import { createLogOnce } from '../../src/lib/utils/createLogOnce.js';
import { EMPTY_ARRAY, EMPTY_OBJECT } from '../../src/lib/utils/empty.js';

const mounted: ReturnType<typeof mount>[] = [];
beforeEach(() => { reset(); });
afterEach(async () => {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
  reset();
});
async function setup(initialControlled?: unknown, initialDefault?: unknown) {
  const target = document.createElement('div');
  document.body.append(target);
  const events: string[] = [];
  const component = mount(Fixture, { target, props: { initialControlled, initialDefault, events } });
  mounted.push(component);
  await tick();
  return { component, events, target };
}

it('preserves initial uncontrolled mode, default initialization and functional updates', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { component, target } = await setup(undefined, 1);
  component.setLocal((previous: unknown) => Number(previous) + 1);
  await tick();
  expect(target.querySelector('output')!.textContent).toBe('2');
  component.setControlled(3);
  await tick();
  expect(component.snapshot().value).toBe(2);
  expect(error).toHaveBeenCalledTimes(1);
  expect(error.mock.calls[0][0]).toContain('changing the uncontrolled value state of SharedUtilsFixture to be controlled');
  component.setLocal(4);
  await tick();
  expect(component.snapshot().value).toBe(4);
});

it('reads controlled updates, falls back to initial default and ignores its setter', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { component } = await setup('owner', 'seed');
  component.setLocal('ignored');
  component.setControlled('next');
  await tick();
  expect(component.snapshot().value).toBe('next');
  component.setDefault('new-seed');
  component.setControlled(undefined);
  await tick();
  expect(component.snapshot().value).toBe('seed');
  component.setLocal('still-ignored');
  await tick();
  expect(component.snapshot().value).toBe('seed');
  expect(error).toHaveBeenCalledTimes(1);
});

it('retains native function values and object identity as defaults', async () => {
  const callable = vi.fn(() => 17);
  const functionDefault = await setup(undefined, callable);
  expect(functionDefault.component.snapshot().value).toBe(callable);
  expect(callable).not.toHaveBeenCalled();
  const object = { item: 'original' };
  const objectDefault = await setup(undefined, object);
  expect(objectDefault.component.snapshot().value).toBe(object);
});

it('retains the development serializer and default-only warning dependency', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const cyclic: { value: bigint; self?: unknown } = { value: 1n };
  cyclic.self = cyclic;
  const { component } = await setup(undefined, cyclic);
  const equivalent: { value: bigint; self?: unknown } = { value: 1n };
  equivalent.self = equivalent;
  component.setDefault(equivalent);
  await tick();
  expect(error).not.toHaveBeenCalled();
  component.setDefault({ value: 2n });
  await tick();
  expect(error).toHaveBeenCalledTimes(1);
  component.setName('RenamedFixture');
  await tick();
  expect(error).toHaveBeenCalledTimes(1);
});

it('uses a stable native closure during setup, attachment, effects and same-turn updates', async () => {
  const { component, events } = await setup();
  const stable = component.getStable();
  expect(events.slice(0, 2)).toEqual(['parent-setup:old', 'child-setup:old']);
  expect(events).toContain('attachment:old');
  expect(events).toContain('child-effect:old');
  expect(events).toContain('parent-effect:old');
  expect(stable()).toBe('old');
  component.setOwner('new');
  expect(stable()).toBe('new');
  await tick();
  expect(component.getStable()).toBe(stable);
  expect(component.snapshot().stableEffectRuns).toBe(1);
  component.replaceCallback();
  expect(stable()).toBe('replacement:new');
  expect(component.callOptional()).toBeUndefined();
});

it('tracks explicit effect dependencies and preserves cleanup when unrelated reads change', async () => {
  const { component } = await setup();
  expect(component.snapshot().effectRuns).toBe(1);
  component.setUnrelated(1);
  component.setCallbackRead(1);
  await tick();
  expect(component.snapshot().effectRuns).toBe(1);
  expect(component.snapshot().effectCleanups).toBe(0);
  component.setDependency(-0);
  await tick();
  expect(component.snapshot().effectRuns).toBe(2);
  expect(component.snapshot().effectCleanups).toBe(1);
  component.setDependency(1);
  await tick();
  expect(component.snapshot().effectRuns).toBe(3);
  await unmount(mounted.pop()!);
  expect(component.snapshot().effectCleanups).toBe(3);
});

it('retains -0 as previous value and calls the callback before committing the observed value', async () => {
  const { component } = await setup();
  component.setChanged(-0);
  await tick();
  expect(component.snapshot().changePrevious).toEqual([]);
  component.mutateOnChange();
  component.setChanged(1);
  await tick();
  expect(component.snapshot().changePrevious).toHaveLength(2);
  expect(Object.is(component.snapshot().changePrevious[0], -0)).toBe(true);
  expect(component.snapshot().changePrevious[1]).toBe(1);
  expect(component.snapshot().readsInsideCallback).toEqual([1, 2]);
});

it('uses the latest value-change handler and tracks previous values while a handler is absent', async () => {
  const { component } = await setup();
  const first = vi.fn();
  const second = vi.fn();
  component.setValueChangeCallback(first);
  await tick();
  expect(first).not.toHaveBeenCalled();
  component.setChanged(1);
  await tick();
  expect(first).toHaveBeenCalledExactlyOnceWith(0);

  component.setValueChangeCallback(second);
  await tick();
  expect(second).not.toHaveBeenCalled();
  component.setChanged(2);
  await tick();
  expect(second).toHaveBeenCalledExactlyOnceWith(1);
  expect(first).toHaveBeenCalledTimes(1);

  component.setValueChangeCallback(undefined);
  component.setChanged(3);
  await tick();
  expect(second).toHaveBeenCalledTimes(1);
  component.setValueChangeCallback(second);
  component.setChanged(4);
  await tick();
  expect(second).toHaveBeenLastCalledWith(3);
  expect(second).toHaveBeenCalledTimes(2);
});

it('owns refs and timeout cancellation/reset/teardown per component', async () => {
  vi.useFakeTimers();
  const { component } = await setup();
  expect(component.snapshot().initialized).toBe(1);
  component.updateRef('updated');
  component.setOwner('new');
  await tick();
  expect(component.snapshot().initialized).toBe(1);
  expect(component.snapshot().ref).toEqual({ seed: 'updated' });
  const first = vi.fn();
  const second = vi.fn(() => { expect(component.timerStarted()).toBe(false); });
  component.start(20, first);
  component.start(10, second);
  vi.advanceTimersByTime(20);
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledTimes(1);
  component.start(10, first);
  await unmount(mounted.pop()!);
  vi.advanceTimersByTime(20);
  expect(first).not.toHaveBeenCalled();
  expect(component.timerStarted()).toBe(false);
});

it('shares immutable empty fallbacks and once-only logger keys including severity', () => {
  expect(Object.isFrozen(EMPTY_ARRAY)).toBe(true);
  expect(Object.isFrozen(EMPTY_OBJECT)).toBe(true);
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const logError = createLogOnce('error', 'Base UI');
  const logWarn = createLogOnce('warn', 'Base UI');
  logError('same', 'message'); logError('same message'); logWarn('same message');
  expect(error).toHaveBeenCalledExactlyOnceWith('Base UI: same message');
  expect(warn).toHaveBeenCalledExactlyOnceWith('Base UI: same message');
  reset(); logError('same message');
  expect(error).toHaveBeenCalledTimes(2);
});
