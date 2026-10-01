// Derived from Base UI v1.8.0 useAnimationsFinished; MIT, see ../../../THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';

/** Exit observation owns its frame and aborts stale/replaced lifecycle completions. */
export function afterAnimations(node: HTMLElement, complete: () => void): () => void {
  const ownerWindow = node.ownerDocument.defaultView;
  let canceled = false;
  let frame: number | undefined;
  const done = () => { if (!canceled) flushSync(complete); };
  function observe() {
    if (canceled) return;
    Promise.all(node.getAnimations().map(animation => animation.finished)).then(done, () => {
      if (canceled) return;
      const current = node.getAnimations();
      if (current.some(animation => animation.pending || animation.playState !== 'finished')) observe();
      else done();
    });
  }
  if (typeof node.getAnimations !== 'function' || !ownerWindow) {
    complete();
  } else {
    frame = ownerWindow.requestAnimationFrame(observe);
  }
  return () => { canceled = true; if (frame !== undefined) ownerWindow?.cancelAnimationFrame(frame); };
}
