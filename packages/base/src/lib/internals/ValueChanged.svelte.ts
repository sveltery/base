// Base UI v1.8.0 useValueChanged previous-value/notification ordering business.
// Immutable 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';

export class ValueChanged<T> {
  #previous: T;

  constructor(getValue: () => T, getOnChange: () => ((previousValue: T) => void) | undefined) {
    this.#previous = untrack(getValue);
    $effect(() => {
      const value = getValue();
      if (this.#previous !== value) {
        // Notify the business observer without subscribing to its writes or reads.
        untrack(() => getOnChange()?.(this.#previous));
      }
      this.#previous = value;
    });
  }
}
