// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { useRefWithInit } from './useRefWithInit.js';
import { useOnMount } from './useOnMount.js';
import { Timeout } from './useTimeout.js';

type IntervalId = number;

const EMPTY = 0 as IntervalId;

export class Interval extends Timeout {
  static create() {
    return new Interval();
  }

  /**
   * Executes `fn` at `delay` interval, clearing any previously scheduled call.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- original no-argument callback contract
  start(delay: number, fn: Function) {
    this.clear();
    this.currentId = setInterval(() => {
      fn();
    }, delay) as unknown as number;
  }

  clear = () => {
    if (this.currentId !== EMPTY) {
      clearInterval(this.currentId as IntervalId);
      this.currentId = EMPTY;
    }
  };
}

/**
 * A `setInterval` with automatic cleanup and guard.
 */
export function useInterval() {
  const timeout = useRefWithInit(Interval.create).current;

  useOnMount(timeout.disposeEffect);

  return timeout;
}
