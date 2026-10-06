// Ported from Base UI v1.8.0 LabelableProvider.tsx at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.

import {
  setLabelableContext,
  useLabelableContext,
  type LabelableContext,
} from './LabelableContext.js';

// The component owns the SSR-stable Svelte id; this body owns the source provider state.
export function createLabelableProvider(defaultId: string): LabelableContext {
  let controlIdState = $state<string | null | undefined>(defaultId);
  let labelId = $state<string>();
  // Effect cleanup updates the live resource array; native state publishes its current value.
  let currentMessageIds: string[] = [];
  let messageIds = $state.raw<string[]>(currentMessageIds);
  const controlId = $derived(controlIdState === undefined ? defaultId : controlIdState);
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- Source control registry is imperative; selected control state owns reactive updates.
  const registrations = new Map<symbol, string | null>();
  const parent = useLabelableContext();

  const registerControlId = (source: symbol, nextId: string | null | undefined) => {
    if (nextId === undefined) registrations.delete(source);
    else registrations.set(source, nextId);
    if (registrations.size === 0) return;

    let nextControlId: string | null | undefined;
    for (const id of registrations.values()) {
      if (id === controlIdState) return;
      if (nextControlId === undefined) nextControlId = id;
    }
    controlIdState = nextControlId;
  };
  const resetControlId = () => {
    if (registrations.size === 0) controlIdState = defaultId;
  };
  function getDescriptionProps(externalProps: Record<string, unknown>) {
    const description = externalProps['aria-describedby'] as string | undefined;
    const ids = description ? description.split(' ') : [];
    ids.push(...parent.messageIds, ...messageIds);
    return {
      ...externalProps,
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- This temporary Set only deduplicates the current derived message array.
      'aria-describedby': Array.from(new Set(ids)).join(' ') || undefined,
    };
  }
  const contextValue: LabelableContext = {
    get controlId() {
      return controlId;
    },
    registerControlId,
    resetControlId,
    get labelId() {
      return labelId;
    },
    setLabelId(value) {
      labelId = typeof value === 'function' ? value(labelId) : value;
    },
    get messageIds() {
      return messageIds;
    },
    setMessageIds(value) {
      currentMessageIds = typeof value === 'function' ? value(currentMessageIds) : value;
      messageIds = currentMessageIds;
    },
    getDescriptionProps,
  };
  setLabelableContext(contextValue);
  return contextValue;
}
