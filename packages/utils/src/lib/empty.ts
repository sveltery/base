// Adapted from Base UI v1.8.0 packages/utils/src/empty.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
export function NOOP() {}

// Typed as mutable `never[]` so it is assignable to any `T[]` fallback (for example
// `defaultValue ?? EMPTY_ARRAY` in `useControlled` callers) without widening `T`.
// Frozen so a write through a widened alias throws instead of mutating the shared singleton.
export const EMPTY_ARRAY: never[] = Object.freeze([]) as never[];

export const EMPTY_OBJECT = Object.freeze({});
