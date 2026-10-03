// Ported from Base UI v1.8.0 useAnimationsFinished.ts; MIT: THIRD_PARTY_NOTICES.md.
import { useAnimationFrame } from '../utils/useAnimationFrame.js';
import { useStableCallback } from '../utils/useStableCallback.js';
import { resolveRef } from '../utils/resolveRef.js';
import * as TransitionStatusDataAttributes from './TransitionStatusDataAttributes.js';

export function useAnimationsFinished(
  elementOrRef: { current: HTMLElement | null } | HTMLElement | null,
  getWaitForStartingStyleRemoved: () => boolean = () => false,
  _batch = false,
) {
  const frame = useAnimationFrame();
  return useStableCallback((fnToExecute: () => void, signal: AbortSignal | null = null) => {
    frame.cancel();
    const element = resolveRef(elementOrRef);
    if (element == null) return;
    const resolvedElement = element;
    // Native Svelte owns the callback's rendering batch; no ReactDOM flush/commit queue.
    const done = () => fnToExecute();
    const animationsDisabled = (globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean }).BASE_UI_ANIMATIONS_DISABLED;
    if (typeof resolvedElement.getAnimations !== 'function' || animationsDisabled) { fnToExecute(); return; }
    function exec() {
      Promise.all(resolvedElement.getAnimations().map(animation => animation.finished)).then(() => {
        if (!signal?.aborted) done();
      }, () => {
        if (signal?.aborted) return;
        const currentAnimations = resolvedElement.getAnimations();
        if (currentAnimations.some(animation => animation.pending || animation.playState !== 'finished')) { exec(); return; }
        done();
      });
    }
    if (getWaitForStartingStyleRemoved()) {
      const startingStyleAttribute = TransitionStatusDataAttributes.startingStyle;
      if (!resolvedElement.hasAttribute(startingStyleAttribute)) { frame.request(exec); return; }
      const attributeObserver = new MutationObserver(() => {
        if (!resolvedElement.hasAttribute(startingStyleAttribute)) { attributeObserver.disconnect(); exec(); }
      });
      attributeObserver.observe(resolvedElement, { attributes: true, attributeFilter: [startingStyleAttribute] });
      signal?.addEventListener('abort', () => attributeObserver.disconnect(), { once: true });
      return;
    }
    frame.request(exec);
  });
}
