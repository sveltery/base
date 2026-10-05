// Ported from Base UI v1.8.0 useOpenChangeComplete.tsx; MIT: THIRD_PARTY_NOTICES.md.
import { useStableCallback } from '@sveltery/utils/useStableCallback';
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
import { useAnimationsFinished } from './useAnimationsFinished.js';
export interface UseOpenChangeCompleteParameters {
  enabled?: boolean;
  open?: boolean;
  ref: { current: HTMLElement | null };
  batch?: boolean;
  onComplete: () => void;
}
export function useOpenChangeComplete(parameters: UseOpenChangeCompleteParameters) {
  const onComplete = useStableCallback(() => parameters.onComplete());
  const runOnceAnimationsFinish = useAnimationsFinished(parameters.ref, () => parameters.open ?? false, () => parameters.batch ?? false);
  useIsoLayoutEffect(() => {
    if (parameters.enabled === false) return;
    const abortController = new AbortController();
    runOnceAnimationsFinish(onComplete, abortController.signal);
    return () => { abortController.abort(); };
  }, () => [parameters.enabled ?? true, parameters.open, onComplete, runOnceAnimationsFinish]);
}
