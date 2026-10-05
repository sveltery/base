// Supplemental scheduler business witnesses; zero upstream ordinary declaration credit.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AnimationFrame, resetAnimationFrameScheduler } from '@sveltery/utils/useAnimationFrame';

let callbacks: FrameRequestCallback[];
beforeEach(() => {
  callbacks = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return callbacks.length;
  }));
  resetAnimationFrameScheduler();
});
afterEach(() => { resetAnimationFrameScheduler(); vi.unstubAllGlobals(); });

it('batches owners in one native frame, preserves order and forwards the timestamp', () => {
  const first = vi.fn(); const second = vi.fn();
  AnimationFrame.request(first); AnimationFrame.request(second);
  expect(callbacks).toHaveLength(1);
  callbacks[0](41);
  expect(first).toHaveBeenCalledExactlyOnceWith(41);
  expect(second).toHaveBeenCalledExactlyOnceWith(41);
  expect(first.mock.invocationCallOrder[0]).toBeLessThan(second.mock.invocationCallOrder[0]);
});

it('cancels queued owners without canceling the shared native frame', () => {
  const canceled = vi.fn(); const live = vi.fn();
  const id = AnimationFrame.request(canceled);
  AnimationFrame.request(live);
  AnimationFrame.cancel(id); AnimationFrame.cancel(id);
  AnimationFrame.cancel(-1); AnimationFrame.cancel(Number.MAX_SAFE_INTEGER);
  callbacks[0](0);
  expect(canceled).not.toHaveBeenCalled(); expect(live).toHaveBeenCalledTimes(1);
});

it('clears an instance before invoking its callback and schedules reentrant work in the next frame', () => {
  const frame = AnimationFrame.create(); const events: string[] = [];
  frame.request(() => {
    expect(frame.currentId).toBeNull(); events.push('first');
    frame.request(() => events.push('next'));
  });
  AnimationFrame.request(() => events.push('peer'));
  callbacks[0](0);
  expect(events).toEqual(['first', 'peer']); expect(callbacks).toHaveLength(2);
  callbacks[1](16);
  expect(events).toEqual(['first', 'peer', 'next']); expect(frame.currentId).toBeNull();
});

it('retains the pinned in-frame cancellation boundary for an already captured callback batch', () => {
  const events: string[] = []; let peer = 0;
  AnimationFrame.request(() => { events.push('first'); AnimationFrame.cancel(peer); });
  peer = AnimationFrame.request(() => events.push('peer'));
  callbacks[0](0);
  expect(events).toEqual(['first', 'peer']);
});

it('reset drops pending work and continues IDs so a stale owner cannot cancel new work', () => {
  const stale = AnimationFrame.create(); const discarded = vi.fn(); const live = vi.fn();
  stale.request(discarded); const oldId = stale.currentId!;
  resetAnimationFrameScheduler();
  const newId = AnimationFrame.request(live); stale.cancel();
  expect(newId).toBeGreaterThan(oldId);
  callbacks[0](0); expect(discarded).not.toHaveBeenCalled(); expect(live).not.toHaveBeenCalled();
  callbacks[1](16); expect(live).toHaveBeenCalledTimes(1);
});

it('reschedules after fake-rAF replacement even when the previous fake never delivered its frame', () => {
  const first = vi.fn(); const second = vi.fn(); const replacement: FrameRequestCallback[] = [];
  AnimationFrame.request(first);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { replacement.push(callback); return 20; });
  AnimationFrame.request(second);
  expect(replacement).toHaveLength(1); replacement[0](32);
  expect(first).toHaveBeenCalledExactlyOnceWith(32); expect(second).toHaveBeenCalledExactlyOnceWith(32);
  callbacks[0](48); expect(first).toHaveBeenCalledTimes(1); expect(second).toHaveBeenCalledTimes(1);
});
