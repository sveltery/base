// Native lifetime adapter of Base UI v1.8.0 useAnimationFrame.ts; MIT: THIRD_PARTY_NOTICES.md.
import { useRefWithInit } from './useRefWithInit.js';
import { useOnMount } from './useOnMount.js';

// Svelte's native scheduler owns rendering. Browser rAF owns this component's motion callbacks;
// the source process-global React scheduler/test-reset queue is not recreated.
export class AnimationFrame {
  static create() { return new AnimationFrame(); }
  static request(fn: FrameRequestCallback) { return requestAnimationFrame(fn); }
  static cancel(id: number) { cancelAnimationFrame(id); }
  currentId: number | null = null;
  request(fn: () => void) {
    this.cancel();
    this.currentId = requestAnimationFrame(() => { this.currentId = null; fn(); });
  }
  cancel = () => {
    if (this.currentId !== null) { cancelAnimationFrame(this.currentId); this.currentId = null; }
  };
  disposeEffect = () => this.cancel;
}
export function useAnimationFrame() {
  const frame = useRefWithInit(AnimationFrame.create).current;
  useOnMount(frame.disposeEffect);
  return frame;
}
