// Ported from Base UI v1.8.0 useAnimationsFinished.ts; MIT: THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';
import { useAnimationFrame } from '@sveltery/utils/useAnimationFrame';

import { resolveRef } from '../utils/resolveRef.js';
import * as TransitionStatusDataAttributes from './TransitionStatusDataAttributes.js';

let pendingCallbacks: Array<() => void> | null = null;

// Original same-microtask completion batching, using Svelte's native commit primitive.
function flushBeforePaint(fn: () => void) {
  if (!pendingCallbacks) {
    const callbacks: Array<() => void> = [];
    pendingCallbacks = callbacks;
    queueMicrotask(() => {
      pendingCallbacks = null;
      flushSync(() => {
        for (const callback of callbacks) callback();
      });
    });
  }
  pendingCallbacks.push(fn);
}

export function useAnimationsFinished(
  elementOrRef: { current: HTMLElement | null } | HTMLElement | null,
  getWaitForStartingStyleRemoved: () => boolean = () => false,
  getBatch: () => boolean = () => false,
) {
  const frame = useAnimationFrame();
  return (fnToExecute: () => void, signal: AbortSignal | null = null) => {
    const batch = getBatch();
    frame.cancel();
    const element = resolveRef(elementOrRef);
    if (element == null) return;
    const resolvedElement = element;
    const done = () => {
      if (!batch) {
        // Later completions observe the native commit and its effect cleanups.
        flushSync(fnToExecute);
        return;
      }
      flushBeforePaint(() => {
        // The signal can abort between queueing and the shared flush.
        if (!signal?.aborted) fnToExecute();
      });
    };
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
  };
}
