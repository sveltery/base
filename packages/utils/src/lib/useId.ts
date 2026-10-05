// Base UI v1.8.0 utils/useId.ts, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Native Svelte $props.id() supplies the framework id.
// Svelte's required version always has SSR-stable ids, so the React 17 fallback is inapplicable.
export function useId(idOverride: string | undefined, prefix: string | undefined, nativeId: string): string {
  return idOverride ?? (prefix ? `${prefix}-${nativeId}` : nativeId);
}
