// Original Base UI v1.8.0 useAnimationFrame.test.ts (MIT), immutable 47b40521.
// Original assertion body retained; package import and native jsdom harness only.
import { expect, vi, describe, beforeEach, afterEach, it } from 'vitest';
import { AnimationFrame, resetAnimationFrameScheduler } from '@sveltery/utils/useAnimationFrame';

describe('AnimationFrame', () => {
  beforeEach(() => {
    resetAnimationFrameScheduler();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetAnimationFrameScheduler();
  });

  it('keeps callback accounting correct when a frame is canceled more than once', () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
      callbacks.push(callback);
      return callbacks.length;
    });

    const firstId = AnimationFrame.request(() => {});
    AnimationFrame.cancel(firstId);
    AnimationFrame.cancel(firstId);

    const secondCallback = vi.fn();
    AnimationFrame.request(secondCallback);

    callbacks[0]?.(0);

    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});
