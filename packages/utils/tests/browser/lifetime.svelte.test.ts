import { expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { resetAnimationFrameScheduler } from '@sveltery/utils/useAnimationFrame';
import Fixture from '../dom/AnimationLifetime.svelte';

it('cancels a rendered utility owner before the real browser frame and timer fire', async () => {
  resetAnimationFrameScheduler(); const events: string[] = [];
  const target = document.createElement('div'); document.body.append(target);
  const component = mount(Fixture, { target, props: { events } });
  try {
    await tick(); component.schedule(); await unmount(component);
    await vi.waitFor(() => expect(component.pending()).toEqual({ frame: null, timeout: false }));
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(events).toEqual([]);
  } finally { target.remove(); resetAnimationFrameScheduler(); }
});
