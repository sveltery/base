// Ported from Base UI v1.8.0 utils/useRegisteredLabelId.ts; MIT: THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import { useBaseUiId } from '../internals/useBaseUiId.js';

export function useRegisteredLabelId(
  getIdProp: () => string | undefined,
  setLabelId: (
    value: string | undefined | ((previous: string | undefined) => string | undefined),
  ) => void,
  nativeId: string,
) {
  const id = $derived(useBaseUiId(getIdProp(), nativeId));
  $effect(() => {
    const installedId = id;
    // Publishing the registration must not subscribe to the receiver's label state.
    untrack(() => setLabelId(installedId));
    return () => {
      setLabelId((currentId) => (currentId === installedId ? undefined : currentId));
    };
  });
  return () => id;
}
