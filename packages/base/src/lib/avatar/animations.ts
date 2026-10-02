// Derived from useAnimationsFinished/useOpenChangeComplete at mui/base-ui
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: parity/avatar/UPSTREAM_LICENSE.
import { flushSync } from 'svelte';
export function finishExit(element: HTMLElement | null | undefined, complete: () => void): () => void {
  const controller = new AbortController();
  if (!element) return () => controller.abort();
  const disabled = (globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean }).BASE_UI_ANIMATIONS_DISABLED;
  if (typeof element.getAnimations !== 'function' || disabled) { complete(); return () => controller.abort(); }
  const done = () => { if (!controller.signal.aborted) flushSync(complete); };
  function observe() {
    if (controller.signal.aborted || !element) return;
    Promise.all(element.getAnimations().map(animation => animation.finished)).then(done, () => {
      if (controller.signal.aborted || !element) return;
      if (element.getAnimations().some(animation => animation.pending || animation.playState !== 'finished')) observe();
      else done();
    });
  }
  const view = element.ownerDocument.defaultView;
  const frame = view?.requestAnimationFrame(observe);
  return () => { controller.abort(); if (frame !== undefined) view?.cancelAnimationFrame(frame); };
}
