// Ported from Base UI v1.8.0 LabelableProvider.tsx at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.

import {
  setLabelableContext,
  useLabelableContext,
  type LabelableContext,
} from './LabelableContext.js';

// The component owns the SSR-stable Svelte id; this class owns the source provider state.
export class LabelableProviderOwner implements LabelableContext {
  #defaultId: string;
  #controlIdState = $state<string | null | undefined>();
  #labelId = $state<string>();
  // Effect cleanup updates the live resource array; native state publishes its current value.
  #currentMessageIds: string[] = [];
  #messageIds = $state.raw<string[]>(this.#currentMessageIds);
  #controlId = $derived.by(() =>
    this.#controlIdState === undefined ? this.#defaultId : this.#controlIdState,
  );
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- Source control registry is imperative; selected control state owns reactive updates.
  #registrations = new Map<symbol, string | null>();
  #parent: LabelableContext;

  constructor(defaultId: string) {
    this.#defaultId = defaultId;
    this.#controlIdState = defaultId;
    this.#parent = useLabelableContext();
    setLabelableContext(this);
  }

  registerControlId = (source: symbol, nextId: string | null | undefined) => {
    const registrations = this.#registrations;
    if (nextId === undefined) registrations.delete(source);
    else registrations.set(source, nextId);
    if (registrations.size === 0) return;

    let nextControlId: string | null | undefined;
    for (const id of registrations.values()) {
      if (id === this.#controlIdState) return;
      if (nextControlId === undefined) nextControlId = id;
    }
    this.#controlIdState = nextControlId;
  };
  resetControlId = () => {
    if (this.#registrations.size === 0) this.#controlIdState = this.#defaultId;
  };
  getDescriptionProps = (externalProps: Record<string, unknown>) => {
    const description = externalProps['aria-describedby'] as string | undefined;
    const ids = description ? description.split(' ') : [];
    ids.push(...this.#parent.messageIds, ...this.#messageIds);
    return {
      ...externalProps,
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- This temporary Set only deduplicates the current derived message array.
      'aria-describedby': Array.from(new Set(ids)).join(' ') || undefined,
    };
  };
  get controlId() {
    return this.#controlId;
  }
  get labelId() {
    return this.#labelId;
  }
  setLabelId: LabelableContext['setLabelId'] = (value) => {
    this.#labelId = typeof value === 'function' ? value(this.#labelId) : value;
  };
  get messageIds() {
    return this.#messageIds;
  }
  setMessageIds: LabelableContext['setMessageIds'] = (value) => {
    this.#currentMessageIds = typeof value === 'function' ? value(this.#currentMessageIds) : value;
    this.#messageIds = this.#currentMessageIds;
  };
}
