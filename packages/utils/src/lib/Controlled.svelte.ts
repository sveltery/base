// Initial-mode and controlled/default fallback business from Base UI v1.8.0
// packages/utils/src/useControlled.ts at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Svelte owns state and live reads directly.
export class Controlled<T> {
  #getControlled: () => T | undefined;
  #isControlled: boolean;
  #internalValue: T;

  constructor(getControlled: () => T | undefined, defaultValue: T) {
    this.#getControlled = getControlled;
    this.#isControlled = getControlled() !== undefined;
    this.#internalValue = $state.raw(defaultValue);
  }

  get value(): T {
    const controlled = this.#getControlled();
    return this.#isControlled && controlled !== undefined ? controlled : this.#internalValue;
  }

  set(next: T) {
    if (!this.#isControlled) this.#internalValue = next;
  }
}
