// Base UI v1.8.0 usePreviousValue retained current/previous/Object.is business.
// Immutable 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';

export class PreviousValue<T> {
  #getValue: () => T;
  #current: T;
  #previous: T | null = null;
  #value = $derived.by(() => {
    const value = this.#getValue();
    if (!Object.is(value, this.#current)) {
      this.#previous = this.#current;
      this.#current = value;
    }
    return this.#previous;
  });

  constructor(getValue: () => T) {
    this.#getValue = getValue;
    this.#current = untrack(getValue);
  }

  get value(): T | null {
    return this.#value;
  }
}
