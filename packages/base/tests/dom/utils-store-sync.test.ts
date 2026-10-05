// Actual Original/native synchronization comparison; zero Original ordinary declaration credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { SvelteStore } from '@sveltery/utils/store';
import Fixture from './fixtures/UtilsStoreSync.svelte';
import { mountUtilsStoreReference } from '../../../../apps/fixtures/src/lib/utils-store-reference.js';
const owners: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const stop of owners.splice(0)) await stop();
  document.body.replaceChildren();
});
async function setup(original: boolean, cleanup: boolean, initialValue: number) {
  const target = document.createElement('section');
  document.body.append(target);
  if (original) {
    const owner = mountUtilsStoreReference(target, initialValue, cleanup);
    owners.push(() => owner.stop());
    await tick();
    return owner;
  }
  const store = new SvelteStore<{ value: number | undefined }, undefined, Record<string, never>>(
    { value: 0 },
    undefined,
    {},
  );
  const notifications: (number | undefined)[] = [];
  const unsubscribe = store.subscribe((state) => notifications.push(state.value));
  const component = mount(Fixture, { target, props: { store, initialValue, cleanup } });
  const stop = async () => {
    await unmount(component);
    unsubscribe();
  };
  owners.push(stop);
  await tick();
  return { store, notifications, updateValue: component.updateValue, stop };
}
for (const original of [true, false]) {
  const framework = original ? 'Original' : 'Svelte';
  it(`${framework}: strict synchronization guard retains positive zero without notifying for negative zero`, async () => {
    const owner = await setup(original, false, -0);
    expect(Object.is(owner.store.state.value, 0)).toBe(true);
    expect(owner.notifications).toEqual([]);
    owner.updateValue(1);
    await tick();
    expect(owner.notifications).toEqual([1]);
    owner.updateValue(0);
    await tick();
    expect(owner.notifications).toEqual([1, 0]);
    owner.updateValue(-0);
    await tick();
    expect(Object.is(owner.store.state.value, 0)).toBe(true);
    expect(owner.notifications).toEqual([1, 0]);
  });
  it(`${framework}: cleanup synchronization keeps the same signed-zero guard and clears its owned key on unmount`, async () => {
    const owner = await setup(original, true, -0);
    expect(Object.is(owner.store.state.value, 0)).toBe(true);
    expect(owner.notifications).toEqual([]);
    await owners.pop()!();
    expect(owner.store.state.value).toBeUndefined();
    expect(owner.notifications).toEqual([undefined]);
  });
}
