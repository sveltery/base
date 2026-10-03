// Base UI v1.8.0 useBaseUiId.ts; MIT: THIRD_PARTY_NOTICES.md.
import { useId } from '../utils/useId.js';
export function useBaseUiId(idOverride: string | undefined, nativeId: string): string {
  return useId(idOverride, 'base-ui', nativeId);
}
