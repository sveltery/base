// Supplemental native rendered attachment lifetime; zero Original declaration credit.
import { expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './fixtures/MenuPositionerRef.svelte';

it('keeps the real Menu positioner ref attached across option changes and detaches on teardown', async () => {
  const target = document.createElement('section');
  document.body.append(target);
  const events: (HTMLElement | null)[] = [];
  const component = mount(Fixture, { target, props: { events } });
  try {
    await tick();
    const host = events.at(-1)!;
    expect(host).toBeInstanceOf(HTMLElement);
    const initial = events.length;
    component.updateOptions();
    await tick();
    expect(events).toHaveLength(initial);
    expect(host.classList.contains('updated')).toBe(true);
    await unmount(component);
    expect(events.at(-1)).toBeNull();
  } finally {
    target.remove();
  }
});
