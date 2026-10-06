// Authored immutable Original ordinary-host comparator; zero unchanged assertion credit.
// Native actual outro overlap belongs to canonical secured Menu Playwright acceptance.
import { expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import CurrentHostRelease from './fixtures/MenuTriggerCurrentHostRelease.svelte';
import { mountMenuTriggerHostOverlapReference } from '../../../../apps/fixtures/src/lib/menu-trigger-host-overlap-reference.js';

it('Original ordinary render-host swap retains current ref/registration and cleans up on removal', () => {
  const target = document.createElement('div');
  document.body.append(target);
  const reference = mountMenuTriggerHostOverlapReference(target);
  try {
    const map = reference.triggerMap();
    const before = target.querySelector('[data-host="before"]')!;
    expect(reference.boundHost()).toBe(before);
    expect(map.getById('host-overlap-trigger')).toBe(before);
    reference.swapHost();
    const after = target.querySelector('[data-host="after"]')!;
    console.log(JSON.stringify({ phase: 'Original-host-replaced', ...reference.snapshot() }));
    expect(after).not.toBe(before);
    expect(before.isConnected).toBe(false);
    expect(reference.boundHost()).toBe(after);
    expect(map.getById('host-overlap-trigger')).toBe(after);
    reference.removeTrigger();
    console.log(JSON.stringify({ phase: 'Original-trigger-removed', ...reference.snapshot() }));
    expect(reference.boundHost()).toBeNull();
    expect(map.getById('host-overlap-trigger')).toBeUndefined();
  } finally {
    reference.stop();
    target.remove();
  }
});

it('native captured-host guard still releases the current intrinsic Trigger ref and registration', async () => {
  const target = document.createElement('div');
  document.body.append(target);
  const instance = mount(CurrentHostRelease, { target });
  try {
    await tick();
    const current = target.querySelector<HTMLButtonElement>('#current-host-release')!;
    expect(current).toBeInstanceOf(HTMLButtonElement);
    expect(current.type).toBe('button');
    expect(instance.snapshot()).toEqual({ host: current, registered: current });
    instance.removeTrigger();
    await tick();
    expect(current.isConnected).toBe(false);
    expect(target.querySelector('#current-host-release')).toBeNull();
    expect(instance.snapshot()).toEqual({ host: null, registered: undefined });
  } finally {
    await unmount(instance);
    target.remove();
  }
});
