// Adapted from Base UI v1.8.0 packages/utils/src/useTimeout.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { onMount } from 'svelte';

type TimeoutId = number;

const EMPTY = 0 as TimeoutId;

export class Timeout {
  static create() {
    return new Timeout();
  }

  currentId: TimeoutId = EMPTY;

  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  // The pinned callback accepts any function and invokes it without arguments.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  start(delay: number, fn: Function) {
    this.clear();
    this.currentId = setTimeout(() => {
      this.currentId = EMPTY;
      fn();
    }, delay) as unknown as number; /* Node.js types are enabled in development */
  }

  isStarted() {
    return this.currentId !== EMPTY;
  }

  clear = () => {
    if (this.currentId !== EMPTY) {
      clearTimeout(this.currentId as TimeoutId);
      this.currentId = EMPTY;
    }
  };

  disposeEffect = () => {
    return this.clear;
  };
}

/**
 * A `setTimeout` with automatic cleanup and guard.
 */
export function useTimeout() {
  const timeout = new Timeout();

  onMount(timeout.disposeEffect);

  return timeout;
}
