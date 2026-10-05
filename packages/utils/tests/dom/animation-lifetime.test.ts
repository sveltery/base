// Supplemental native rendered ownership witness; integration is through real package exports.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { AnimationFrame, resetAnimationFrameScheduler } from '@sveltery/utils/useAnimationFrame';
import Fixture from './AnimationLifetime.svelte';

afterEach(() => { resetAnimationFrameScheduler(); vi.useRealTimers(); vi.unstubAllGlobals(); document.body.replaceChildren(); });
it('unmount cancels native hook work while preserving another shared-frame owner', async () => {
  vi.useFakeTimers(); const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; });
  resetAnimationFrameScheduler(); const events: string[] = [];
  const target = document.createElement('div'); document.body.append(target);
  const component = mount(Fixture, { target, props: { events } }); await tick();
  target.querySelector('button')!.click();
  AnimationFrame.request(() => events.push('peer'));
  expect(component.pending().frame).not.toBeNull(); expect(component.pending().timeout).toBe(true);
  await unmount(component);
  frames[0](16); vi.advanceTimersByTime(20);
  expect(events).toEqual(['peer']);
  expect(component.pending()).toEqual({ frame: null, timeout: false });
});
