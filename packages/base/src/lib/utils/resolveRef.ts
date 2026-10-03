// Ported from Base UI v1.8.0 utils/resolveRef.ts; MIT: THIRD_PARTY_NOTICES.md.
export function resolveRef<T extends HTMLElement | null | undefined>(maybeRef: T | { current: T }): T {
  if (maybeRef == null) return maybeRef;
  return 'current' in maybeRef ? maybeRef.current : maybeRef;
}
