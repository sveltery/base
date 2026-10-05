// Ported from Base UI v1.8.0 utils/useRegisteredLabelId.ts; MIT: THIRD_PARTY_NOTICES.md.
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
import { useBaseUiId } from '../internals/useBaseUiId.js';

export function useRegisteredLabelId(
  getIdProp: () => string | undefined,
  setLabelId: (value: string | undefined | ((previous: string | undefined) => string | undefined)) => void,
  nativeId: string,
) {
  const id = $derived(useBaseUiId(getIdProp(), nativeId));
  useIsoLayoutEffect(() => {
    const installedId = id;
    setLabelId(installedId);
    return () => {
      setLabelId((currentId) => currentId === installedId ? undefined : currentId);
    };
  }, () => [id, setLabelId]);
  return () => id;
}
