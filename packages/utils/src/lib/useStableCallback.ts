// Adapted from Base UI v1.8.0 packages/utils/src/useStableCallback.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: parity/shared-utils/UPSTREAM_LICENSE.
import { untrack } from 'svelte';

type Callback = (...args: never[]) => unknown;

/**
 * Stabilizes a caller-owned closure during component initialization.
 * Captured native live reads do not subscribe the calling effect.
 * Caller closures read native live props. Svelte setup supplies identity without
 * React render-phase guards or insertion-effect commit emulation.
 */
export function useStableCallback<T extends Callback>(callback: T | undefined): T {
  return createStableCallback(callback);
}

function createStableCallback<T extends Callback>(callback: T | undefined): T {
  return ((...args: Parameters<T>) => untrack(() => callback?.(...args))) as T;
}
