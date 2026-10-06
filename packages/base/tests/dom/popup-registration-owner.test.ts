// Supplemental captured-registration lifetime witnesses; zero unchanged Original credit.
import { expect, it } from 'vitest';
import { PopoverStore } from '../../src/lib/popover/store/PopoverStore.svelte.js';
import { TriggerRegistration } from '../../src/lib/utils/popups/popupStoreUtils.svelte.js';

it('migrates a stable detached callback and releases the captured previous owner', () => {
  const oldStore = new PopoverStore({ open: true }, undefined, false);
  const newStore = new PopoverStore({ open: true }, undefined, false);
  let store = oldStore;
  let id: string | undefined = undefined;
  const owner = new TriggerRegistration(
    () => id,
    () => store,
  );
  const { register } = owner;
  const host = document.createElement('button');
  register(host);
  expect(oldStore.context.triggerElements.size).toBe(0);
  id = 'old';
  register(host);
  register(host);
  expect(oldStore.context.triggerElements.size).toBe(1);
  expect(oldStore.state.triggerCount).toBe(1);
  store = newStore;
  id = 'new';
  register(host);
  expect(oldStore.context.triggerElements.size).toBe(0);
  expect(oldStore.state.triggerCount).toBe(0);
  expect(newStore.context.triggerElements.getById('new')).toBe(host);
  store = oldStore;
  register(null);
  expect(newStore.context.triggerElements.size).toBe(0);
  expect(newStore.state.triggerCount).toBe(0);
});

it('outgoing cleanup preserves a newer same-ID registration', () => {
  const store = new PopoverStore({ open: true }, undefined, false);
  const oldOwner = new TriggerRegistration(
    () => 'shared',
    () => store,
  );
  const newOwner = new TriggerRegistration(
    () => 'shared',
    () => store,
  );
  const oldHost = document.createElement('button');
  const newHost = document.createElement('button');
  oldOwner.register(oldHost);
  newOwner.register(newHost);
  oldOwner.register(null);
  expect(store.context.triggerElements.getById('shared')).toBe(newHost);
  expect(store.state.triggerCount).toBe(1);
  newOwner.register(null);
  expect(store.context.triggerElements.size).toBe(0);
  expect(store.state.triggerCount).toBe(0);
});
