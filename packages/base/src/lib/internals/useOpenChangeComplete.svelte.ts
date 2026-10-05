// Ported from Base UI v1.8.0 useOpenChangeComplete.tsx; MIT: THIRD_PARTY_NOTICES.md.


import { useAnimationsFinished } from './useAnimationsFinished.js';
export interface UseOpenChangeCompleteParameters {
  enabled?: boolean;
  open?: boolean;
  ref: { current: HTMLElement | null };
  batch?: boolean;
  onComplete: () => void;
}
export function useOpenChangeComplete(parameters: UseOpenChangeCompleteParameters) {
  const onComplete = () => parameters.onComplete();
  const runOnceAnimationsFinish = useAnimationsFinished(parameters.ref, () => parameters.open ?? false, () => parameters.batch ?? false);
  $effect(() => {
    if (parameters.enabled === false) return;
    // A new open state or rendered host cancels the previous completion watcher.
    void parameters.open;
    void parameters.ref.current;
    const abortController = new AbortController();
    runOnceAnimationsFinish(onComplete, abortController.signal);
    return () => { abortController.abort(); };
  });
}
