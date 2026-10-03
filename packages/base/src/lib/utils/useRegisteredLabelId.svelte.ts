// Ported from Base UI v1.8.0 utils/useRegisteredLabelId.ts; MIT: THIRD_PARTY_NOTICES.md.
import { useIsoLayoutEffect } from './useIsoLayoutEffect.svelte.js';
import { useBaseUiId } from '../internals/useBaseUiId.js';

export function useRegisteredLabelId(
  getIdProp: () => string | undefined,
  setLabelId: (value: string | undefined | ((previous: string | undefined) => string | undefined)) => void,
  nativeId: string,
) {
  const id = $derived(useBaseUiId(getIdProp(), nativeId));
  useIsoLayoutEffect(() => {
    setLabelId(id);
    return () => {
      setLabelId((currentId) => currentId === id ? undefined : currentId);
    };
  }, () => [id, setLabelId]);
  return () => id;
}
