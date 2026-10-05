// Adapted from Base UI v1.8.0 packages/utils/src/useRefWithInit.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: parity/shared-utils/UPSTREAM_LICENSE.
export interface InitializedRef<T> {
  current: T;
}

/**
 * A component-owned ref initialized with a function. It accepts an optional
 * initialization argument, so the initialization function doesn't need to be an inline closure.
 *
 * @usage
 *   const ref = useRefWithInit(sortColumns, columns)
 */
export function useRefWithInit<T>(init: () => T): InitializedRef<T>;
export function useRefWithInit<T, U>(init: (arg: U) => T, initArg: U): InitializedRef<T>;
export function useRefWithInit(init: (arg?: unknown) => unknown, initArg?: unknown) {
  // Svelte component setup calls this once; callers retain the returned ref.
  return { current: init(initArg) };
}
