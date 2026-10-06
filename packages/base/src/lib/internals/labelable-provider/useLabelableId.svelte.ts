// Ported from Base UI v1.8.0 useLabelableId.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';

import { NOOP } from '@sveltery/utils/empty';
import { useLabelableContext, type LabelableContext } from './LabelableContext.js';
export interface UseLabelableIdParameters {
  id?: string | null;
  enabled?: boolean;
}
export class LabelableIdOwner {
  #params: () => UseLabelableIdParameters;
  #defaultId: string;
  #context: LabelableContext;
  #controlSource = Symbol();
  #hasRegistered = false;
  #hadExplicitId = false;

  constructor(params: () => UseLabelableIdParameters, defaultId: string) {
    this.#params = params;
    this.#defaultId = defaultId;
    this.#context = useLabelableContext();
    $effect(() => {
      const { id, enabled = true } = params();
      untrack(() => {
        if (!enabled || this.#context.registerControlId === NOOP) {
          this.#unregisterControlId();
          return;
        }
        let nextId: string | null | undefined;
        if (id !== undefined) {
          this.#hadExplicitId = true;
          nextId = id;
        } else if (this.#hadExplicitId) nextId = defaultId;
        else {
          this.#context.resetControlId();
          return;
        }
        if (nextId === undefined) {
          this.#unregisterControlId();
          return;
        }
        this.#hasRegistered = true;
        this.#context.registerControlId(this.#controlSource, nextId);
      });
    });
    $effect(() => this.#unregisterControlId);
  }

  #unregisterControlId = () => {
    if (!this.#hasRegistered || this.#context.registerControlId === NOOP) return;
    this.#hasRegistered = false;
    this.#context.registerControlId(this.#controlSource, undefined);
  };

  getId = () =>
    ((this.#params().enabled ?? true) ? this.#context.controlId : undefined) ??
    this.#params().id ??
    this.#defaultId;
}
