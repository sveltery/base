// Original Base UI v1.8.0 ClosePart business body, native state/context lifetime.
// MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { getContext } from 'svelte';
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
import { useStableCallback } from '@sveltery/utils/useStableCallback';

export interface ClosePartContextValue {
  register: () => () => void;
}

export const ClosePartContext = Symbol('Base UI ClosePartContext');

export function useClosePartCount() {
  let closePartCount = $state(0);

  const register = useStableCallback(() => {
    closePartCount += 1;

    return () => {
      closePartCount = Math.max(0, closePartCount - 1);
    };
  });

  const context: ClosePartContextValue = { register };

  return {
    context,
    get hasClosePart() {
      return closePartCount > 0;
    },
  };
}

export function useClosePartRegistration() {
  const context = getContext<ClosePartContextValue | undefined>(ClosePartContext);

  useIsoLayoutEffect(
    () => context?.register(),
    () => [context],
  );
}
