// Original Base UI v1.8.0 ClosePart business body, native state/context lifetime.
// MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
export interface ClosePartContextValue {
  register: () => () => void;
}

export const ClosePartContext = Symbol('Base UI ClosePartContext');

export class ClosePartCount {
  #count = $state(0);

  readonly context: ClosePartContextValue = { register: () => {
    this.#count += 1;

    return () => {
      this.#count = Math.max(0, this.#count - 1);
    };
  } };

  get hasClosePart() {
    return this.#count > 0;
  }
}
