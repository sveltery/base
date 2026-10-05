// Ported business state from Base UI v1.8.0 useTransitionStatus.ts; MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import { useIsoLayoutEffect } from '../utils/useIsoLayoutEffect.svelte.js';
import { AnimationFrame } from '../utils/useAnimationFrame.js';
export type TransitionStatus = 'starting' | 'ending' | 'idle' | undefined;

export function useTransitionStatus(
  getOpen: () => boolean,
  enableIdleState = false,
  deferEndingState = false,
  animateInitialOpen = false,
) {
  let phase = $state<TransitionStatus>(
    untrack(() => (getOpen() && enableIdleState ? 'idle' : undefined)),
  );
  let retainedMounted = $state(untrack(() => getOpen() && !animateInitialOpen));
  const mounted = $derived(getOpen() || retainedMounted);
  const transitionStatus = $derived(
    getOpen() && !retainedMounted
      ? 'starting'
      : !getOpen() && retainedMounted && phase !== 'ending' && !deferEndingState
        ? 'ending'
        : !getOpen() && !retainedMounted && phase === 'ending'
          ? undefined
          : phase,
  );
  // Source render-time retained mount/status branches become native pre-DOM state transitions.
  $effect.pre(() => {
    const open = getOpen();
    if (open && !retainedMounted) {
      retainedMounted = true;
      phase = 'starting';
    }
    if (!open && retainedMounted && phase !== 'ending' && !deferEndingState) phase = 'ending';
    if (!open && !retainedMounted && phase === 'ending') phase = undefined;
  });
  useIsoLayoutEffect(
    () => {
      if (!getOpen() && mounted && transitionStatus !== 'ending' && deferEndingState) {
        const frame = AnimationFrame.request(() => {
          phase = 'ending';
        });
        return () => AnimationFrame.cancel(frame);
      }
    },
    () => [getOpen(), mounted, transitionStatus, deferEndingState],
  );
  useIsoLayoutEffect(
    () => {
      if (!getOpen() || enableIdleState) return;
      const frame = AnimationFrame.request(() => {
        phase = undefined;
      });
      return () => AnimationFrame.cancel(frame);
    },
    () => [enableIdleState, getOpen()],
  );
  useIsoLayoutEffect(
    () => {
      if (!getOpen() || !enableIdleState) return;
      if (getOpen() && mounted && transitionStatus !== 'idle') phase = 'starting';
      const frame = AnimationFrame.request(() => {
        phase = 'idle';
      });
      return () => AnimationFrame.cancel(frame);
    },
    () => [enableIdleState, getOpen(), mounted, transitionStatus],
  );
  return {
    get mounted() {
      return mounted;
    },
    setMounted(value: boolean) {
      retainedMounted = value;
    },
    get transitionStatus() {
      return transitionStatus;
    },
  };
}
