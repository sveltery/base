// Authored immutable Original ordinary-host comparator; zero unchanged assertion credit.
// Native actual outro overlap belongs to canonical secured Menu Playwright acceptance.
import { expect, it } from 'vitest';
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
