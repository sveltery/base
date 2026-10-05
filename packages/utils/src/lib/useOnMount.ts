// Adapted from Base UI v1.8.0 packages/utils/src/useOnMount.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: parity/shared-utils/UPSTREAM_LICENSE.
import { onMount } from 'svelte';

/**
 * Runs once when the component mounts, retaining its optional teardown.
 */
export function useOnMount(fn: () => void | (() => void)) {
  onMount(fn);
}
